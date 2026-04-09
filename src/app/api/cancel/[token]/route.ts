import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateRefund,
  parseCancellationPolicy,
} from "@/lib/cancellation";
import type { Booking, Service, Provider } from "@/types/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cancellation_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  const booking = data as unknown as Booking;

  const [serviceResult, providerResult] = await Promise.all([
    supabase.from("services").select("*").eq("id", booking.service_id).single(),
    supabase.from("providers").select("*").eq("id", booking.provider_id).single(),
  ]);

  const service = serviceResult.data as unknown as Service | null;
  const provider = providerResult.data as unknown as Provider | null;

  if (booking.status === "cancelled") {
    return NextResponse.json({
      booking: {
        id: booking.id,
        client_name: booking.client_name,
        starts_at: booking.starts_at,
        ends_at: booking.ends_at,
        status: booking.status,
        cancelled_at: booking.cancelled_at,
        refund_amount_cents: booking.refund_amount_cents,
        payment_amount_cents: booking.payment_amount_cents,
      },
      service,
      already_cancelled: true,
    });
  }

  const policy = parseCancellationPolicy(provider?.cancellation_policy);

  const now = new Date();
  const refundAmount = calculateRefund(
    policy,
    new Date(booking.starts_at),
    now,
    booking.payment_amount_cents
  );

  return NextResponse.json({
    booking: {
      id: booking.id,
      client_name: booking.client_name,
      starts_at: booking.starts_at,
      ends_at: booking.ends_at,
      status: booking.status,
      payment_amount_cents: booking.payment_amount_cents,
    },
    service,
    provider: {
      business_name: provider?.business_name,
    },
    policy,
    estimated_refund_cents: refundAmount,
    already_cancelled: false,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cancellation_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  const booking = data as unknown as Booking;

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "Booking is already cancelled" },
      { status: 400 }
    );
  }

  const { data: providerData } = await supabase
    .from("providers")
    .select("cancellation_policy")
    .eq("id", booking.provider_id)
    .single();

  const provider = providerData as unknown as Pick<Provider, "cancellation_policy"> | null;
  const policy = parseCancellationPolicy(provider?.cancellation_policy);

  const now = new Date();
  const refundAmountCents = calculateRefund(
    policy,
    new Date(booking.starts_at),
    now,
    booking.payment_amount_cents
  );

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // No body is fine
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled" as const,
      cancelled_at: now.toISOString(),
      cancellation_reason: (body.reason as string) || "",
      refund_amount_cents: refundAmountCents,
      payment_status: refundAmountCents > 0 ? ("refunded" as const) : booking.payment_status,
    })
    .eq("id", booking.id);

  if (updateError) {
    console.error("Failed to cancel booking:", updateError);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }

  // TODO: Process Stripe refund when Stripe is connected
  // if (booking.stripe_payment_intent_id && refundAmountCents > 0) {
  //   const stripe = getStripe();
  //   await stripe.refunds.create({
  //     payment_intent: booking.stripe_payment_intent_id,
  //     amount: refundAmountCents,
  //   });
  // }

  return NextResponse.json({
    success: true,
    refund_amount_cents: refundAmountCents,
  });
}