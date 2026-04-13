/**
 * Google Calendar integration.
 *
 * Uses OAuth 2.0 for authorization and the Calendar API v3 for event CRUD
 * and freebusy lookups. We use direct fetch() calls instead of the full
 * googleapis SDK to keep the bundle small and edge-friendly.
 */

const GOOGLE_OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_OAUTH_USERINFO = "https://www.googleapis.com/oauth2/v2/userinfo";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");

function getClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error("GOOGLE_CLIENT_ID not set");
  return id;
}

function getClientSecret(): string {
  const s = process.env.GOOGLE_CLIENT_SECRET;
  if (!s) throw new Error("GOOGLE_CLIENT_SECRET not set");
  return s;
}

function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/api/calendar/google/callback`;
}

/**
 * Build the URL to redirect the user to for OAuth consent.
 */
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline", // needed for refresh token
    prompt: "consent", // force refresh token every time
    state,
    include_granted_scopes: "true",
  });
  return `${GOOGLE_OAUTH_AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  return (await res.json()) as TokenResponse;
}

/**
 * Refresh an access token using a stored refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { access_token: string; expires_in: number };
}

/**
 * Fetch the authenticated user's email from their Google account.
 */
export async function getAccountEmail(accessToken: string): Promise<string> {
  const res = await fetch(GOOGLE_OAUTH_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google account info");
  const data = (await res.json()) as { email: string };
  return data.email;
}

export interface GoogleCalendarListItem {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole: string;
  backgroundColor?: string;
}

/**
 * List all calendars the user has access to.
 */
export async function listCalendars(
  accessToken: string
): Promise<GoogleCalendarListItem[]> {
  const res = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list Google calendars: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { items: GoogleCalendarListItem[] };
  // Filter to calendars the user can write to (owner or writer)
  return (data.items || []).filter(
    (c) => c.accessRole === "owner" || c.accessRole === "writer"
  );
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  location?: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  attendees?: Array<{ email: string; name?: string }>;
}

/**
 * Create an event in the given calendar. Returns the new event ID.
 */
export async function createEvent(
  accessToken: string,
  calendarId: string,
  input: CreateEventInput
): Promise<string> {
  const body = {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: { dateTime: input.startsAt },
    end: { dateTime: input.endsAt },
    attendees: input.attendees?.map((a) => ({
      email: a.email,
      displayName: a.name,
    })),
    // Send invitations to attendees
    sendUpdates: "all",
  };

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google createEvent failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Delete an event from the given calendar.
 */
export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  // 404 is fine — event was already deleted
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const text = await res.text();
    throw new Error(`Google deleteEvent failed: ${res.status} ${text}`);
  }
}

export interface BusyInterval {
  start: string; // ISO
  end: string; // ISO
}

/**
 * Fetch busy intervals for a calendar in a time range. Used for
 * conflict detection on the read side.
 */
export async function getBusyTimes(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<BusyInterval[]> {
  const res = await fetch(`${GOOGLE_CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google freeBusy failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    calendars: Record<string, { busy: BusyInterval[] }>;
  };
  return data.calendars[calendarId]?.busy || [];
}
