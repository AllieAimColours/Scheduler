import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connectAppleAndListCalendars } from "@/lib/calendar/caldav";
import { encryptSecret } from "@/lib/encryption";
import { z } from "zod";

export const dynamic = "force-dynamic";

const APPLE_CALDAV_URL = "https://caldav.icloud.com";

const schema = z.object({
  apple_id: z.string().email(),
  app_password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    return NextResponse.json({ error: "No provider" }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid Apple ID email and app-specific password" },
      { status: 400 }
    );
  }

  const { apple_id, app_password } = parsed.data;

  // Test the connection by listing calendars
  let calendars;
  try {
    const result = await connectAppleAndListCalendars(apple_id, app_password);
    calendars = result.calendars;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Common Apple error: unauthorized = wrong password
    if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
      return NextResponse.json(
        {
          error:
            "Apple rejected those credentials. Make sure you used an app-specific password from appleid.apple.com, not your regular Apple ID password.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Couldn't connect to iCloud: ${msg}` },
      { status: 400 }
    );
  }

  if (calendars.length === 0) {
    return NextResponse.json(
      { error: "No calendars found on this Apple account." },
      { status: 400 }
    );
  }

  // Pick the first calendar by default (usually "Home" or "Calendar")
  const firstCalendar = calendars[0];

  const { data: existing } = await supabase
    .from("calendar_connections")
    .select("id")
    .eq("provider_id", provider.id);

  const isFirst = !existing || existing.length === 0;

  const { error: insertError } = await supabase
    .from("calendar_connections")
    .insert({
      provider_id: provider.id,
      calendar_type: "caldav",
      calendar_name: firstCalendar.displayName,
      caldav_url: APPLE_CALDAV_URL,
      caldav_username: apple_id,
      caldav_password: encryptSecret(app_password),
      external_calendar_id: firstCalendar.url,
      account_email: apple_id,
      is_read_enabled: true,
      is_write_enabled: true,
      is_primary: isFirst,
    });

  if (insertError) {
    console.error("Insert iCloud connection failed:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
