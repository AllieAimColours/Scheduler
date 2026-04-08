import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    if (!metadata?.provider_id) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    // Create the booking
    const { error } = await supabase.from("bookings").insert({
      provider_id: metadata.provider_id,
      service_id: metadata.service_id,
      client_name: metadata.client_name,
      client_email: metadata.client_email,
      client_phone: metadata.client_phone || null,
      starts_at: metadata.slot_start,
      ends_at: metadata.slot_end,
      status: "confirmed",
      client_notes: metadata.client_notes || "",
      payment_status: "paid",
      payment_amount_cents: session.amount_total || 0,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      timezone: metadata.timezone,
    });

    if (error) {
      console.error("Failed to create booking:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // TODO: Send confirmation notification (Phase 3)
  }

  return NextResponse.json({ received: true });
}
