import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  getAccountEmail,
  listCalendars,
} from "@/lib/calendar/microsoft";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/integrations?error=missing_code", request.url)
    );
  }

  const [stateUserId] = state.split(":");
  if (stateUserId !== user.id) {
    return NextResponse.redirect(
      new URL("/integrations?error=state_mismatch", request.url)
    );
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const accessToken = tokens.access_token;
    const accountEmail = await getAccountEmail(accessToken);
    const calendars = await listCalendars(accessToken);

    const primary = calendars.find((c) => c.isDefaultCalendar) || calendars[0];
    if (!primary) {
      return NextResponse.redirect(
        new URL("/integrations?error=no_calendars", request.url)
      );
    }

    const { data: existingConnections } = await supabase
      .from("calendar_connections")
      .select("id")
      .eq("provider_id", provider.id);

    const isFirst = !existingConnections || existingConnections.length === 0;

    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    const { error: insertError } = await supabase
      .from("calendar_connections")
      .insert({
        provider_id: provider.id,
        calendar_type: "microsoft",
        calendar_name: primary.name,
        access_token: accessToken,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: expiresAt,
        external_calendar_id: primary.id,
        account_email: accountEmail,
        is_read_enabled: true,
        is_write_enabled: true,
        is_primary: isFirst,
      });

    if (insertError) {
      console.error("Insert Microsoft calendar connection failed:", insertError);
      return NextResponse.redirect(
        new URL(
          `/integrations?error=${encodeURIComponent(insertError.message)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/integrations?connected=microsoft", request.url)
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Microsoft OAuth callback error:", msg);
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(msg)}`, request.url)
    );
  }
}
