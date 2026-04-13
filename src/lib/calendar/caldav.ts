/**
 * CalDAV integration (primarily for Apple iCloud Calendar).
 *
 * Uses the tsdav library for CalDAV protocol handling. Apple requires an
 * app-specific password (generated at appleid.apple.com) instead of the
 * regular Apple ID password.
 */

import { createDAVClient } from "tsdav";

const APPLE_CALDAV_URL = "https://caldav.icloud.com";

export interface CalDAVCalendar {
  url: string;
  displayName: string;
  description?: string;
  color?: string;
}

/**
 * Test credentials and list available calendars. Throws if auth fails.
 */
export async function connectAppleAndListCalendars(
  appleId: string,
  appPassword: string
): Promise<{ calendars: CalDAVCalendar[] }> {
  const client = await createDAVClient({
    serverUrl: APPLE_CALDAV_URL,
    credentials: {
      username: appleId,
      password: appPassword,
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  const calendars = await client.fetchCalendars();

  const mapped = calendars
    .filter((c) => c.components?.includes("VEVENT"))
    .map((c) => ({
      url: c.url,
      displayName:
        typeof c.displayName === "string"
          ? c.displayName
          : c.displayName?.toString() || "Calendar",
      description: typeof c.description === "string" ? c.description : undefined,
      color: typeof c.calendarColor === "string" ? c.calendarColor : undefined,
    }));

  return { calendars: mapped };
}

async function buildClient(
  serverUrl: string,
  username: string,
  password: string
) {
  return createDAVClient({
    serverUrl,
    credentials: { username, password },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  location?: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
}

function formatIcsDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildIcs(uid: string, input: CreateEventInput): string {
  const now = formatIcsDate(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bloom//Calendar Sync//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsDate(input.startsAt)}`,
    `DTEND:${formatIcsDate(input.endsAt)}`,
    `SUMMARY:${escapeIcs(input.summary)}`,
  ];
  if (input.description) lines.push(`DESCRIPTION:${escapeIcs(input.description)}`);
  if (input.location) lines.push(`LOCATION:${escapeIcs(input.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Create an event in a CalDAV calendar. Returns the generated UID
 * (which doubles as the event identifier for deletion).
 */
export async function createEvent(
  serverUrl: string,
  username: string,
  password: string,
  calendarUrl: string,
  input: CreateEventInput
): Promise<string> {
  const client = await buildClient(serverUrl, username, password);
  const uid = `bloom-${crypto.randomUUID()}@bloomrdv.com`;
  const ics = buildIcs(uid, input);
  const filename = `${uid}.ics`;

  await client.createCalendarObject({
    calendar: { url: calendarUrl },
    filename,
    iCalString: ics,
  });

  return uid;
}

/**
 * Delete an event from a CalDAV calendar by UID.
 */
export async function deleteEvent(
  serverUrl: string,
  username: string,
  password: string,
  calendarUrl: string,
  uid: string
): Promise<void> {
  const client = await buildClient(serverUrl, username, password);
  const filename = `${uid}.ics`;

  try {
    await client.deleteCalendarObject({
      calendarObject: {
        url: `${calendarUrl}${filename}`,
        etag: "",
      },
    });
  } catch (err) {
    // Silently swallow 404s
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("404") && !msg.includes("not found")) {
      throw err;
    }
  }
}

export interface BusyInterval {
  start: string;
  end: string;
}

/**
 * Fetch busy intervals for a CalDAV calendar in a time range.
 */
export async function getBusyTimes(
  serverUrl: string,
  username: string,
  password: string,
  calendarUrl: string,
  timeRangeStart: string,
  timeRangeEnd: string
): Promise<BusyInterval[]> {
  const client = await buildClient(serverUrl, username, password);
  const objects = await client.fetchCalendarObjects({
    calendar: { url: calendarUrl },
    timeRange: {
      start: timeRangeStart,
      end: timeRangeEnd,
    },
  });

  const intervals: BusyInterval[] = [];
  for (const obj of objects) {
    if (!obj.data) continue;
    const ics = typeof obj.data === "string" ? obj.data : String(obj.data);
    // Simple parser — extract DTSTART and DTEND from each VEVENT
    const events = ics.split("BEGIN:VEVENT").slice(1);
    for (const ev of events) {
      const start = ev.match(/DTSTART[^:]*:(\d{8}T\d{6}Z?)/)?.[1];
      const end = ev.match(/DTEND[^:]*:(\d{8}T\d{6}Z?)/)?.[1];
      if (start && end) {
        intervals.push({
          start: parseIcsDate(start),
          end: parseIcsDate(end),
        });
      }
    }
  }
  return intervals;
}

function parseIcsDate(ics: string): string {
  // Format: YYYYMMDDTHHMMSSZ
  const year = ics.slice(0, 4);
  const month = ics.slice(4, 6);
  const day = ics.slice(6, 8);
  const hour = ics.slice(9, 11);
  const minute = ics.slice(11, 13);
  const second = ics.slice(13, 15);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}
