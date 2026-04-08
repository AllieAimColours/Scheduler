import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";

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

    const chargeAmount =
      service.deposit_cents > 0 ? service.deposit_cents : service.price_cents;

    // Free service: create booking directly
    if (chargeAmount === 0) {
      await supabase.from("bookings").insert({
        provider_id: data.providerId,
        service_id: data.serviceId,
        client_name: data.clientName,
        client_email: data.clientEmail,
        client_phone: data.clientPhone || null,
        starts_at: data.slotStart,
        ends_at: data.slotEnd,
        status: "confirmed",
        client_notes: data.clientNotes,
        payment_status: "paid",
        payment_amount_cents: 0,
        timezone: data.timezone,
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

    // If provider has Stripe Connect, use destination charges
    if (provider.stripe_account_id && provider.stripe_onboarding_complete) {
      const feePercent = Number(
        process.env.STRIPE_PLATFORM_FEE_PERCENT || "5"
      );
      const applicationFee = Math.round(chargeAmount * (feePercent / 100));

      sessionConfig.payment_intent_data = {
        application_fee_amount: applicationFee,
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
