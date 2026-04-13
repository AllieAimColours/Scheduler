/**
 * Cron job: pull busy times from all connected calendars.
 *
 * Runs every 15 minutes via Vercel Cron (see vercel.json). For each
 * read-enabled connection, fetches events in the next 90 days and
 * replaces the corresponding rows in external_busy_times.
 *
 * The booking availability algorithm already consumes external_busy_times
 * — so once this cron runs, availability correctly blocks slots that
 * conflict with the provider's external calendars.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/encryption";
import * as google from "@/lib/calendar/google";
import * as microsoft from "@/lib/calendar/microsoft";
import * as caldav from "@/lib/calendar/caldav";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch all read-enabled connections
  const { data: connections } = await supabase
    .from("calendar_connections")
    .select("*")
    .eq("is_read_enabled", true);

  if (!connections) {
    return NextResponse.json({ synced: 0 });
  }

  const now = new Date();
  const startIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // yesterday
  const endIso = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days out

  let successCount = 0;
  let failCount = 0;

  for (const rawConn of connections) {
    const conn = rawConn as Record<string, unknown> & {
      id: string;
      provider_id: string;
      calendar_type: "google" | "microsoft" | "caldav";
      access_token: string | null;
      refresh_token: string | null;
      token_expires_at: string | null;
      external_calendar_id: string | null;
      account_email: string | null;
      caldav_url: string | null;
      caldav_username: string | null;
      caldav_password: string | null;
    };

    try {
      let intervals: Array<{ start: string; end: string }> = [];

      if (conn.calendar_type === "google") {
        // Refresh token if needed
        let accessToken = conn.access_token;
        const expires = conn.token_expires_at
          ? new Date(conn.token_expires_at).getTime()
          : 0;
        if (expires - 5 * 60 * 1000 < Date.now() && conn.refresh_token) {
          const refreshed = await google.refreshAccessToken(conn.refresh_token);
          accessToken = refreshed.access_token;
          await supabase
            .from("calendar_connections")
            .update({
              access_token: accessToken,
              token_expires_at: new Date(
                Date.now() + refreshed.expires_in * 1000
              ).toISOString(),
            })
            .eq("id", conn.id);
        }
        if (!accessToken || !conn.external_calendar_id) continue;
        intervals = await google.getBusyTimes(
          accessToken,
          conn.external_calendar_id,
          startIso,
          endIso
        );
      } else if (conn.calendar_type === "microsoft") {
        let accessToken = conn.access_token;
        const expires = conn.token_expires_at
          ? new Date(conn.token_expires_at).getTime()
          : 0;
        if (expires - 5 * 60 * 1000 < Date.now() && conn.refresh_token) {
          const refreshed = await microsoft.refreshAccessToken(conn.refresh_token);
          accessToken = refreshed.access_token;
          await supabase
            .from("calendar_connections")
            .update({
              access_token: accessToken,
              refresh_token: refreshed.refresh_token || conn.refresh_token,
              token_expires_at: new Date(
                Date.now() + refreshed.expires_in * 1000
              ).toISOString(),
            })
            .eq("id", conn.id);
        }
        if (!accessToken || !conn.account_email) continue;
        intervals = await microsoft.getBusyTimes(
          accessToken,
          conn.account_email,
          startIso,
          endIso
        );
      } else if (conn.calendar_type === "caldav") {
        if (
          !conn.caldav_url ||
          !conn.caldav_username ||
          !conn.caldav_password ||
          !conn.external_calendar_id
        ) {
          continue;
        }
        const password = decryptSecret(conn.caldav_password);
        intervals = await caldav.getBusyTimes(
          conn.caldav_url,
          conn.caldav_username,
          password,
          conn.external_calendar_id,
          startIso,
          endIso
        );
      }

      // Replace external_busy_times rows for this connection
      await supabase
        .from("external_busy_times")
        .delete()
        .eq("connection_id", conn.id);

      if (intervals.length > 0) {
        await supabase.from("external_busy_times").insert(
          intervals.map((i) => ({
            provider_id: conn.provider_id,
            connection_id: conn.id,
            starts_at: i.start,
            ends_at: i.end,
            title: "External",
          }))
        );
      }

      await supabase
        .from("calendar_connections")
        .update({
          last_synced_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq("id", conn.id);

      successCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Sync failed for ${conn.id}:`, msg);
      await supabase
        .from("calendar_connections")
        .update({ sync_error: msg })
        .eq("id", conn.id);
      failCount++;
    }
  }

  return NextResponse.json({
    synced: successCount,
    failed: failCount,
    total: connections.length,
  });
}
