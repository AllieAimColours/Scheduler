import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";
import {
  parseCancellationPolicy,
  getEffectiveDeposit,
  generateCancellationToken,
} from "@/lib/cancellation";
import { sendBookingConfirmation } from "@/lib/resend";
import { logNotification } from "@/lib/notifications";
import type { Booking } from "@/types/database";

const checkoutSchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  slotStart: z.string(),
  slotEnd: z.string(),
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email(),
  clientPhone: z.string().max(30).optional().default(""),
  clientNotes: z.string().max(1000).optional().default(""),
  timezone: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const supabase = createAdminClient();

    // Fetch service and provider
    const [serviceResult, providerResult] = await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("id", data.serviceId)
        .eq("provider_id", data.providerId)
        .eq("is_active", true)
        .single(),
      supabase
        .from("providers")
        .select("*")
        .eq("id", data.providerId)
        .single(),
    ]);

    if (!serviceResult.data || !providerResult.data) {
      return NextResponse.json(
        { error: "Service or provider not found" },
        { status: 404 }
      );
    }

    const service = serviceResult.data;
    const provider = providerResult.data;

    // Check for double-booking by verifying slot is still available
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("provider_id", data.providerId)
      .neq("status", "cancelled")
      .lt("starts_at", data.slotEnd)
      .gt("ends_at", data.slotStart);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    const policy = parseCancellationPolicy(provider.cancellation_policy);
    const effectiveDepositCents = getEffectiveDeposit(service, policy);
    const branding = (provider.branding as Record<string, unknown>) || {};
    const paymentMode = branding.payment_mode === "full_upfront"
      ? "full_upfront"
      : branding.payment_mode === "at_appointment"
      ? "at_appointment"
      : "deposit_only";

    // Determine what to charge based on the provider's payment mode:
    // - deposit_only: charge the deposit, rest at appointment (default)
    // - full_upfront: charge the full service price online
    // - at_appointment: never charge online, always pay in person
    let chargeAmount: number;
    if (paymentMode === "full_upfront") {
      chargeAmount = effectiveDepositCents > 0 ? effectiveDepositCents : service.price_cents;
    } else if (paymentMode === "at_appointment") {
      chargeAmount = 0;
    } else {
      chargeAmount = effectiveDepositCents;
    }

    // No deposit (including free services): create booking directly
    if (chargeAmount === 0) {
      const cancellationToken = generateCancellationToken();

      const { data: bookingData, error: insertError } = await supabase
        .from("bookings")
        .insert({
          provider_id: data.providerId,
          service_id: data.serviceId,
          client_name: data.clientName,
          client_email: data.clientEmail,
          client_phone: data.clientPhone || null,
          starts_at: data.slotStart,
          ends_at: data.slotEnd,
          status: "confirmed",
          client_notes: data.clientNotes,
          payment_status: service.price_cents === 0 ? "paid" : "unpaid",
          payment_amount_cents: 0,
          timezone: data.timezone,
          cancellation_token: cancellationToken,
        })
        .select()
        .single();

      if (insertError || !bookingData) {
        console.error("Free booking insert failed:", insertError);
        return NextResponse.json(
          { error: "Failed to create booking" },
          { status: 500 }
        );
      }

      const booking = bookingData as unknown as Booking;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const cancellationUrl = policy.allow_online_cancellation && appUrl
        ? `${appUrl}/cancel/${cancellationToken}`
        : undefined;
      const providerBranding = (provider.branding as Record<string, unknown>) || {};
      const customMessage = typeof providerBranding.confirmation_message === "string" && providerBranding.confirmation_message.trim()
        ? providerBranding.confirmation_message.trim()
        : undefined;

      const result = await sendBookingConfirmation({
        to: booking.client_email,
        clientName: booking.client_name,
        serviceName: service.name,
        serviceEmoji: service.emoji || "✨",
        providerName: provider.business_name,
        dateTime: booking.starts_at,
        duration: service.duration_minutes,
        priceCents: 0,
        servicePriceCents: service.price_cents,
        customMessage,
        currency: provider.currency || "USD",
        cancellationUrl,
      });

      await logNotification(supabase, {
        bookingId: booking.id,
        channel: "email",
        recipient: booking.client_email,
        template: "booking_confirmation",
        status: result.ok ? "sent" : "failed",
        errorMessage: result.error,
      });

      return NextResponse.json({ url: null }); // Signals direct confirmation
    }

    // Create Stripe Checkout Session
    const sessionConfig: Record<string, unknown> = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: provider.currency.toLowerCase(),
            product_data: {
              name: `${service.emoji} ${service.name}`.trim(),
              description: `${service.duration_minutes} min appointment with ${provider.business_name}`,
            },
            unit_amount: chargeAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: data.clientEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${provider.slug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${provider.slug}/${data.serviceId}`,
      metadata: {
        provider_id: data.providerId,
        service_id: data.serviceId,
        slot_start: data.slotStart,
        slot_end: data.slotEnd,
        client_name: data.clientName,
        client_email: data.clientEmail,
        client_phone: data.clientPhone || "",
        client_notes: data.clientNotes || "",
        timezone: data.timezone,
      },
    };

    // If provider has Stripe Connect, use destination charges.
    // 0% platform fee — providers keep 100% (minus Stripe's own processing fee).
    if (provider.stripe_account_id && provider.stripe_onboarding_complete) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: provider.stripe_account_id,
        },
      };
    }

    const session = await getStripe().checkout.sessions.create(
      sessionConfig as Parameters<ReturnType<typeof getStripe>["checkout"]["sessions"]["create"]>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
