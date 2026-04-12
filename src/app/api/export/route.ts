import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv, csvResponse, jsonDownloadResponse } from "@/lib/csv";
import type { Booking, Service, Provider } from "@/types/database";

export const dynamic = "force-dynamic";

type ExportType =
  | "bookings"
  | "clients"
  | "services"
  | "payments"
  | "all"
  | "all-csv";
const VALID_TYPES: ExportType[] = [
  "bookings",
  "clients",
  "services",
  "payments",
  "all",
  "all-csv",
];

function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ExportType | null;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Use one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Auth — must be a logged-in provider
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: providerRow } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!providerRow) {
    return NextResponse.json({ error: "No provider profile" }, { status: 404 });
  }

  const provider = providerRow as unknown as Provider;

  // Fetch the raw data — RLS already scopes to this provider but we also
  // filter by provider_id explicitly for safety.
  const [bookingsRes, servicesRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("provider_id", provider.id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("services")
      .select("*")
      .eq("provider_id", provider.id)
      .order("sort_order", { ascending: true }),
  ]);

  const bookings = (bookingsRes.data || []) as unknown as Booking[];
  const services = (servicesRes.data || []) as unknown as Service[];

  // ─── Build each export shape ───

  // Service lookup for joining names into booking rows
  const serviceById = new Map<string, Service>(services.map((s) => [s.id, s]));

  function bookingRows() {
    return bookings.map((b) => {
      const svc = serviceById.get(b.service_id);
      return {
        booking_id: b.id,
        client_name: b.client_name,
        client_email: b.client_email,
        client_phone: b.client_phone || "",
        service: svc?.name || "",
        starts_at: b.starts_at,
        ends_at: b.ends_at,
        duration_minutes: svc?.duration_minutes || "",
        status: b.status,
        payment_status: b.payment_status,
        payment_amount_cents: b.payment_amount_cents,
        currency: provider.currency,
        client_notes: b.client_notes || "",
        provider_notes: b.provider_notes || "",
        timezone: b.timezone,
        cancelled_at: b.cancelled_at || "",
        cancellation_reason: b.cancellation_reason || "",
        refund_amount_cents: b.refund_amount_cents || 0,
        created_at: b.created_at,
      };
    });
  }

  function clientRows() {
    // Aggregate bookings by email into a client list
    const byEmail = new Map<
      string,
      {
        client_email: string;
        client_name: string;
        client_phone: string;
        total_bookings: number;
        completed_bookings: number;
        cancelled_bookings: number;
        total_spent_cents: number;
        first_booking_at: string;
        last_booking_at: string;
      }
    >();

    for (const b of bookings) {
      if (!b.client_email) continue;
      const key = b.client_email.toLowerCase();
      const existing = byEmail.get(key);
      if (!existing) {
        byEmail.set(key, {
          client_email: b.client_email,
          client_name: b.client_name,
          client_phone: b.client_phone || "",
          total_bookings: 1,
          completed_bookings: b.status === "completed" ? 1 : 0,
          cancelled_bookings: b.status === "cancelled" ? 1 : 0,
          total_spent_cents:
            b.payment_status === "paid" ? b.payment_amount_cents || 0 : 0,
          first_booking_at: b.starts_at,
          last_booking_at: b.starts_at,
        });
      } else {
        existing.total_bookings += 1;
        if (b.status === "completed") existing.completed_bookings += 1;
        if (b.status === "cancelled") existing.cancelled_bookings += 1;
        if (b.payment_status === "paid") {
          existing.total_spent_cents += b.payment_amount_cents || 0;
        }
        if (b.starts_at < existing.first_booking_at) {
          existing.first_booking_at = b.starts_at;
        }
        if (b.starts_at > existing.last_booking_at) {
          existing.last_booking_at = b.starts_at;
        }
      }
    }

    return Array.from(byEmail.values()).sort((a, b) =>
      a.last_booking_at > b.last_booking_at ? -1 : 1
    );
  }

  function serviceRowsShaped() {
    return services.map((s) => ({
      service_id: s.id,
      name: s.name,
      description: s.description || "",
      duration_minutes: s.duration_minutes,
      price_cents: s.price_cents,
      deposit_cents: s.deposit_cents,
      currency: provider.currency,
      category: s.category || "",
      emoji: s.emoji || "",
      color: s.color,
      is_active: s.is_active,
      sort_order: s.sort_order,
      created_at: s.created_at,
    }));
  }

  function paymentRows() {
    return bookings
      .filter(
        (b) =>
          b.payment_status === "paid" ||
          b.payment_status === "refunded" ||
          (b.refund_amount_cents || 0) > 0
      )
      .map((b) => {
        const svc = serviceById.get(b.service_id);
        return {
          booking_id: b.id,
          client_name: b.client_name,
          client_email: b.client_email,
          service: svc?.name || "",
          amount_cents: b.payment_amount_cents || 0,
          currency: provider.currency,
          payment_status: b.payment_status,
          refund_amount_cents: b.refund_amount_cents || 0,
          stripe_payment_intent_id: b.stripe_payment_intent_id || "",
          stripe_checkout_session_id: b.stripe_checkout_session_id || "",
          paid_at: b.created_at,
          cancelled_at: b.cancelled_at || "",
        };
      });
  }

  const stamp = todayStamp();

  // ─── Return the requested format ───

  if (type === "bookings") {
    const csv = toCsv(bookingRows());
    return csvResponse(csv, `bloom-bookings-${stamp}.csv`);
  }

  if (type === "clients") {
    const csv = toCsv(clientRows());
    return csvResponse(csv, `bloom-clients-${stamp}.csv`);
  }

  if (type === "services") {
    const csv = toCsv(serviceRowsShaped());
    return csvResponse(csv, `bloom-services-${stamp}.csv`);
  }

  if (type === "payments") {
    const csv = toCsv(paymentRows());
    return csvResponse(csv, `bloom-payments-${stamp}.csv`);
  }

  // type === "all-csv" — combined spreadsheet-ready dump
  // Single CSV with section headers separating each table. Opens cleanly
  // in Excel / Numbers / Google Sheets; power users can still grab
  // individual tables from the per-table buttons.
  if (type === "all-csv") {
    const parts: string[] = [];
    const banner = (title: string) =>
      `# ${title.toUpperCase()} — ${provider.business_name} — exported ${new Date().toISOString()}\r\n`;

    parts.push(banner("Bookings"));
    parts.push(toCsv(bookingRows()));
    parts.push("\r\n");

    parts.push(banner("Clients"));
    parts.push(toCsv(clientRows()));
    parts.push("\r\n");

    parts.push(banner("Services"));
    parts.push(toCsv(serviceRowsShaped()));
    parts.push("\r\n");

    parts.push(banner("Payments"));
    parts.push(toCsv(paymentRows()));

    return csvResponse(parts.join(""), `bloom-everything-${stamp}.csv`);
  }

  // type === "all" — combined JSON dump (developer option)
  const combined = {
    export_metadata: {
      exported_at: new Date().toISOString(),
      provider: {
        id: provider.id,
        business_name: provider.business_name,
        slug: provider.slug,
        timezone: provider.timezone,
        currency: provider.currency,
      },
    },
    bookings: bookingRows(),
    clients: clientRows(),
    services: serviceRowsShaped(),
    payments: paymentRows(),
  };

  return jsonDownloadResponse(combined, `bloom-export-${stamp}.json`);
}
