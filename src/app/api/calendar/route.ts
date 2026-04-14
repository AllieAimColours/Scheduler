import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Booking, PersonalEvent, Service } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id, timezone")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    return NextResponse.json({ error: "No provider profile" }, { status: 404 });
  }

  const start = request.nextUrl.searchParams.get("start");
  const end = request.nextUrl.searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end query params required (ISO datetime)" },
      { status: 400 }
    );
  }

  const [bookingsRes, eventsRes, servicesRes, rulesRes, overridesRes] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .eq("provider_id", provider.id)
        .not("status", "in", '("cancelled")')
        .gte("starts_at", start)
        .lte("starts_at", end)
        .order("starts_at"),
      supabase
        .from("personal_events")
        .select("*")
        .eq("provider_id", provider.id)
        .gte("starts_at", start)
        .lte("starts_at", end)
        .order("starts_at"),
      supabase
        .from("services")
        .select("id, name, emoji, color, duration_minutes, price_cents")
        .eq("provider_id", provider.id),
      supabase
        .from("availability_rules")
        .select("day_of_week, start_time, end_time")
        .eq("provider_id", provider.id)
        .eq("is_active", true),
      supabase
        .from("availability_overrides")
        .select("date, start_time, end_time, is_blocked, reason")
        .eq("provider_id", provider.id)
        .gte("date", start.slice(0, 10))
        .lte("date", end.slice(0, 10)),
    ]);

  const bookings = (bookingsRes.data || []) as unknown as Booking[];
  const personalEvents = (eventsRes.data || []) as unknown as PersonalEvent[];
  const services = (servicesRes.data || []) as unknown as Pick<
    Service,
    "id" | "name" | "emoji" | "color" | "duration_minutes" | "price_cents"
  >[];

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      starts_at: b.starts_at,
      ends_at: b.ends_at,
      client_name: b.client_name,
      client_email: b.client_email,
      client_phone: b.client_phone,
      status: b.status,
      payment_status: b.payment_status,
      payment_amount_cents: b.payment_amount_cents,
      client_notes: b.client_notes,
      provider_notes: b.provider_notes,
      service: serviceMap[b.service_id] || null,
    })),
    personalEvents: personalEvents.map((e) => ({
      id: e.id,
      title: e.title,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      is_all_day: e.is_all_day,
      color: e.color,
      notes: e.notes,
    })),
    availabilityRules: rulesRes.data || [],
    availabilityOverrides: overridesRes.data || [],
    timezone: provider.timezone,
  });
}
