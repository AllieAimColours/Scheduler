import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateCancellationToken } from "@/lib/cancellation";
import { sendBookingConfirmation } from "@/lib/resend";
import { logNotification } from "@/lib/notifications";
import { pushBookingToPrimary } from "@/lib/calendar/sync";
import type { Booking, Service, Provider } from "@/types/database";

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

    // ─── Digital product purchase ───
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

      // TODO: Send download email via Resend
      return NextResponse.json({ received: true });
    }

    // ─── Booking purchase ───
    if (!metadata?.provider_id) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();
    const cancellationToken = generateCancellationToken();

    // Create the booking and get the inserted row back so we have the id
    const { data: bookingData, error: insertError } = await supabase
      .from("bookings")
      .insert({
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
        cancellation_token: cancellationToken,
      })
      .select()
      .single();

    if (insertError || !bookingData) {
      console.error("Failed to create booking:", insertError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    const booking = bookingData as unknown as Booking;

    // Fetch service + provider so we can build a useful confirmation email
    const [serviceRes, providerRes] = await Promise.all([
      supabase
        .from("services")
        .select("name, emoji, duration_minutes, price_cents")
        .eq("id", metadata.service_id)
        .single(),
      supabase
        .from("providers")
        .select("business_name, currency, slug, branding")
        .eq("id", metadata.provider_id)
        .single(),
    ]);

    const service = serviceRes.data as unknown as Pick<Service, "name" | "emoji" | "duration_minutes" | "price_cents"> | null;
    const provider = providerRes.data as unknown as Pick<Provider, "business_name" | "currency" | "slug" | "branding"> | null;
    const providerBranding = (provider?.branding as Record<string, unknown>) || {};
    const customHeading = typeof providerBranding.confirmation_heading === "string" && providerBranding.confirmation_heading.trim()
      ? providerBranding.confirmation_heading.trim()
      : undefined;
    const customMessage = typeof providerBranding.confirmation_message === "string" && providerBranding.confirmation_message.trim()
      ? providerBranding.confirmation_message.trim()
      : undefined;

    // Send the confirmation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const cancellationUrl = appUrl ? `${appUrl}/cancel/${cancellationToken}` : undefined;

    const result = await sendBookingConfirmation({
      to: booking.client_email,
      clientName: booking.client_name,
      serviceName: service?.name || "Appointment",
      serviceEmoji: service?.emoji || "✨",
      providerName: provider?.business_name || "Your provider",
      dateTime: booking.starts_at,
      duration: service?.duration_minutes || 60,
      priceCents: booking.payment_amount_cents,
      servicePriceCents: service?.price_cents || 0,
      currency: provider?.currency || "USD",
      cancellationUrl,
      customHeading,
      customMessage,
    });

    await logNotification(supabase, {
      bookingId: booking.id,
      channel: "email",
      recipient: booking.client_email,
      template: "booking_confirmation",
      status: result.ok ? "sent" : "failed",
      errorMessage: result.error,
    });

    // Push to the provider's primary calendar (Google/Microsoft/iCloud)
    try {
      const pushResult = await pushBookingToPrimary(
        supabase,
        booking.provider_id,
        {
          id: booking.id,
          client_name: booking.client_name,
          client_email: booking.client_email,
          starts_at: booking.starts_at,
          ends_at: booking.ends_at,
          timezone: booking.timezone,
        },
        {
          serviceName: service?.name || "Appointment",
          providerName: provider?.business_name || "Your provider",
          clientPhone: booking.client_phone || undefined,
          notes: booking.client_notes || undefined,
        }
      );
      if (pushResult) {
        await supabase
          .from("bookings")
          .update({
            calendar_event_id: pushResult.eventId,
            calendar_provider: pushResult.calendarType,
          })
          .eq("id", booking.id);
      }
    } catch (e) {
      console.error("Calendar push failed (non-fatal):", e);
    }
  }

  // ─── Stripe Connect: account onboarding complete ───
  if (event.type === "account.updated") {
    const account = event.data.object;
    // An Express account is ready to receive payments when
    // charges_enabled flips to true (identity verified, bank added).
    if (account.charges_enabled) {
      const supabase = createAdminClient();
      await supabase
        .from("providers")
        .update({ stripe_onboarding_complete: true })
        .eq("stripe_account_id", account.id);
    }
  }

  return NextResponse.json({ received: true });
}
