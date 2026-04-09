import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateCancellationToken } from "@/lib/cancellation";

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

    // Digital product purchase
    if (metadata?.type === "digital_product" && metadata.sale_id) {
      const supabase = createAdminClient();
      await supabase
        .from("digital_product_sales")
        .update({
          stripe_payment_intent_id:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
        })
        .eq("id", metadata.sale_id);

      // Bump sales count on the product
      if (metadata.product_id) {
        const { data: prod } = await supabase
          .from("digital_products")
          .select("sales_count")
          .eq("id", metadata.product_id)
          .single();
        if (prod) {
          await supabase
            .from("digital_products")
            .update({ sales_count: ((prod as { sales_count: number }).sales_count || 0) + 1 })
            .eq("id", metadata.product_id);
        }
      }

      // TODO: Send download email via Resend (Phase 3)
      return NextResponse.json({ received: true });
    }

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
