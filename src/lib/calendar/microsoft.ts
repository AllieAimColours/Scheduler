/**
 * Microsoft Outlook / Graph Calendar integration.
 *
 * Uses OAuth 2.0 (common tenant for both personal and work accounts) and
 * Microsoft Graph API for event CRUD.
 */

const MS_OAUTH_AUTH_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MS_OAUTH_TOKEN_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const MS_GRAPH_API = "https://graph.microsoft.com/v1.0";

const SCOPES = [
  "Calendars.ReadWrite",
  "User.Read",
  "offline_access",
  "openid",
  "profile",
  "email",
].join(" ");

function getClientId(): string {
  const id = process.env.MICROSOFT_CLIENT_ID;
  if (!id) throw new Error("MICROSOFT_CLIENT_ID not set");
  return id;
}

function getClientSecret(): string {
  const s = process.env.MICROSOFT_CLIENT_SECRET;
  if (!s) throw new Error("MICROSOFT_CLIENT_SECRET not set");
  return s;
}

function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/api/calendar/microsoft/callback`;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    response_mode: "query",
    prompt: "select_account",
    state,
  });
  return `${MS_OAUTH_AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(MS_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
      scope: SCOPES,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft token exchange failed: ${res.status} ${text}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const res = await fetch(MS_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: SCOPES,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft token refresh failed: ${res.status} ${text}`);
  }
  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

export async function getAccountEmail(accessToken: string): Promise<string> {
  const res = await fetch(`${MS_GRAPH_API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Microsoft account info");
  const data = (await res.json()) as {
    userPrincipalName: string;
    mail: string | null;
  };
  return data.mail || data.userPrincipalName;
}

export interface MicrosoftCalendar {
  id: string;
  name: string;
  canEdit: boolean;
  isDefaultCalendar: boolean;
  hexColor?: string;
}

export async function listCalendars(
  accessToken: string
): Promise<MicrosoftCalendar[]> {
  const res = await fetch(`${MS_GRAPH_API}/me/calendars`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list Microsoft calendars: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { value: MicrosoftCalendar[] };
  return (data.value || []).filter((c) => c.canEdit);
}

export interface CreateEventInput {
  subject: string;
  body?: string;
  location?: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  timeZone?: string; // IANA, e.g. "America/New_York"
  attendees?: Array<{ email: string; name?: string }>;
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  input: CreateEventInput
): Promise<string> {
  const tz = input.timeZone || "UTC";
  const body = {
    subject: input.subject,
    body: input.body
      ? { contentType: "HTML", content: input.body }
      : undefined,
    start: { dateTime: input.startsAt, timeZone: tz },
    end: { dateTime: input.endsAt, timeZone: tz },
    location: input.location ? { displayName: input.location } : undefined,
    attendees: input.attendees?.map((a) => ({
      emailAddress: { address: a.email, name: a.name },
      type: "required",
    })),
  };

  const res = await fetch(
    `${MS_GRAPH_API}/me/calendars/${calendarId}/events`,
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
    throw new Error(`Microsoft createEvent failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function deleteEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(`${MS_GRAPH_API}/me/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const text = await res.text();
    throw new Error(`Microsoft deleteEvent failed: ${res.status} ${text}`);
  }
}

export interface BusyInterval {
  start: string;
  end: string;
}

/**
 * Fetch busy intervals for a calendar using Graph's getSchedule endpoint.
 */
export async function getBusyTimes(
  accessToken: string,
  email: string,
  startDate: string,
  endDate: string
): Promise<BusyInterval[]> {
  const res = await fetch(`${MS_GRAPH_API}/me/calendar/getSchedule`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      schedules: [email],
      startTime: { dateTime: startDate, timeZone: "UTC" },
      endTime: { dateTime: endDate, timeZone: "UTC" },
      availabilityViewInterval: 15,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft getSchedule failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    value: Array<{
      scheduleItems: Array<{
        status: string;
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
      }>;
    }>;
  };
  const items = data.value[0]?.scheduleItems || [];
  return items
    .filter((i) => i.status !== "free")
    .map((i) => ({
      start: new Date(i.start.dateTime + "Z").toISOString(),
      end: new Date(i.end.dateTime + "Z").toISOString(),
    }));
}
