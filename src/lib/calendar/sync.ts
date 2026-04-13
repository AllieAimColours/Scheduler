/**
 * Unified calendar sync engine.
 *
 * Handles:
 * - Refreshing expired OAuth tokens transparently
 * - Pushing a new booking to all write-enabled connections (Google/Microsoft
 *   push to primary; iCloud pushes to its selected calendar)
 * - Deleting an external event when a booking is cancelled
 *
 * This is the single entry point from booking create/cancel code.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { decryptSecret } from "@/lib/encryption";
import * as google from "./google";
import * as microsoft from "./microsoft";
import * as caldav from "./caldav";

type CalendarConnection = Database["public"]["Tables"]["calendar_connections"]["Row"];

/**
 * Return a valid access token for an OAuth connection, refreshing it
 * if expired. Writes the new token back to the database.
 */
async function getFreshAccessToken(
  supabase: SupabaseClient<Database>,
  connection: CalendarConnection
): Promise<string | null> {
  if (!connection.access_token || !connection.refresh_token) return null;

  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at).getTime()
    : 0;
  const nowMs = Date.now();
  const bufferMs = 5 * 60 * 1000; // refresh if < 5 min left

  if (expiresAt - bufferMs > nowMs) {
    return connection.access_token;
  }

  // Refresh
  try {
    let refreshed: { access_token: string; refresh_token?: string; expires_in: number };
    if (connection.calendar_type === "google") {
      refreshed = await google.refreshAccessToken(connection.refresh_token);
    } else if (connection.calendar_type === "microsoft") {
      refreshed = await microsoft.refreshAccessToken(connection.refresh_token);
    } else {
      return null;
    }

    const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    await supabase
      .from("calendar_connections")
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token || connection.refresh_token,
        token_expires_at: newExpiry,
        sync_error: null,
      })
      .eq("id", connection.id);

    return refreshed.access_token;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Token refresh failed for ${connection.id}:`, msg);
    await supabase
      .from("calendar_connections")
      .update({ sync_error: msg })
      .eq("id", connection.id);
    return null;
  }
}

export interface PushableBooking {
  id: string;
  client_name: string;
  client_email: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
}

export interface PushContext {
  serviceName: string;
  providerName: string;
  address?: string;
  clientPhone?: string;
  notes?: string;
}

/**
 * Push a new booking to all write-enabled primary calendars.
 * Best-effort — errors are logged but don't fail the caller.
 *
 * Returns a map of connection_id → external event id, so the caller
 * can store them in the booking row for later cancellation.
 */
export async function pushBookingToPrimary(
  supabase: SupabaseClient<Database>,
  providerId: string,
  booking: PushableBooking,
  context: PushContext
): Promise<{ connectionId: string; eventId: string; calendarType: string } | null> {
  // Find the primary connection for this provider
  const { data } = await supabase
    .from("calendar_connections")
    .select("*")
    .eq("provider_id", providerId)
    .eq("is_primary", true)
    .eq("is_write_enabled", true)
    .maybeSingle();

  if (!data) return null;
  const connection = data as unknown as CalendarConnection;

  const summary = `${context.serviceName} — ${booking.client_name}`;
  const description = buildDescription(booking, context);

  try {
    let eventId: string;

    if (connection.calendar_type === "google") {
      const token = await getFreshAccessToken(supabase, connection);
      if (!token || !connection.external_calendar_id) return null;
      eventId = await google.createEvent(token, connection.external_calendar_id, {
        summary,
        description,
        location: context.address,
        startsAt: booking.starts_at,
        endsAt: booking.ends_at,
        attendees: [{ email: booking.client_email, name: booking.client_name }],
      });
    } else if (connection.calendar_type === "microsoft") {
      const token = await getFreshAccessToken(supabase, connection);
      if (!token || !connection.external_calendar_id) return null;
      eventId = await microsoft.createEvent(token, connection.external_calendar_id, {
        subject: summary,
        body: description.replace(/\n/g, "<br>"),
        location: context.address,
        startsAt: booking.starts_at,
        endsAt: booking.ends_at,
        timeZone: booking.timezone,
        attendees: [{ email: booking.client_email, name: booking.client_name }],
      });
    } else if (connection.calendar_type === "caldav") {
      if (
        !connection.caldav_url ||
        !connection.caldav_username ||
        !connection.caldav_password ||
        !connection.external_calendar_id
      ) {
        return null;
      }
      const password = decryptSecret(connection.caldav_password);
      eventId = await caldav.createEvent(
        connection.caldav_url,
        connection.caldav_username,
        password,
        connection.external_calendar_id,
        {
          summary,
          description,
          location: context.address,
          startsAt: booking.starts_at,
          endsAt: booking.ends_at,
        }
      );
    } else {
      return null;
    }

    // Clear any previous sync error
    await supabase
      .from("calendar_connections")
      .update({ sync_error: null, last_synced_at: new Date().toISOString() })
      .eq("id", connection.id);

    return { connectionId: connection.id, eventId, calendarType: connection.calendar_type };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`pushBookingToPrimary failed for connection ${connection.id}:`, msg);
    await supabase
      .from("calendar_connections")
      .update({ sync_error: msg })
      .eq("id", connection.id);
    return null;
  }
}

/**
 * Delete an external event when a booking is cancelled.
 */
export async function deleteBookingFromCalendar(
  supabase: SupabaseClient<Database>,
  connectionId: string,
  eventId: string
): Promise<void> {
  const { data } = await supabase
    .from("calendar_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle();

  if (!data) return;
  const connection = data as unknown as CalendarConnection;

  try {
    if (connection.calendar_type === "google") {
      const token = await getFreshAccessToken(supabase, connection);
      if (!token || !connection.external_calendar_id) return;
      await google.deleteEvent(token, connection.external_calendar_id, eventId);
    } else if (connection.calendar_type === "microsoft") {
      const token = await getFreshAccessToken(supabase, connection);
      if (!token) return;
      await microsoft.deleteEvent(token, eventId);
    } else if (connection.calendar_type === "caldav") {
      if (
        !connection.caldav_url ||
        !connection.caldav_username ||
        !connection.caldav_password ||
        !connection.external_calendar_id
      ) {
        return;
      }
      const password = decryptSecret(connection.caldav_password);
      await caldav.deleteEvent(
        connection.caldav_url,
        connection.caldav_username,
        password,
        connection.external_calendar_id,
        eventId
      );
    }
  } catch (err) {
    console.error(`deleteBookingFromCalendar failed for ${connectionId}:`, err);
  }
}

function buildDescription(booking: PushableBooking, context: PushContext): string {
  const lines = [
    `${context.serviceName} with ${context.providerName}`,
    "",
    `Client: ${booking.client_name}`,
    `Email: ${booking.client_email}`,
  ];
  if (context.clientPhone) lines.push(`Phone: ${context.clientPhone}`);
  if (context.notes) {
    lines.push("", "Notes:", context.notes);
  }
  lines.push("", "Booked via Bloom · bloomrdv.com");
  return lines.join("\n");
}
