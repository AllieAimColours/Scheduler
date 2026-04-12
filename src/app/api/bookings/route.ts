import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseCancellationPolicy, getEffectiveDeposit } from "@/lib/cancellation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "service-info") {
    const slug = searchParams.get("slug");
    const serviceId = searchParams.get("serviceId");

    if (!slug || !serviceId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: provider } = await supabase
      .from("providers")
      .select("id, cancellation_policy, branding, stripe_account_id, stripe_onboarding_complete")
      .eq("slug", slug)
      .single();

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Provider's preferred availability calendar range — stored in
    // branding.booking_calendar_range. Default "month".
    const branding = (provider.branding as Record<string, unknown>) || {};
    const rawRange = branding.booking_calendar_range;
    const calendarRange =
      rawRange === "week" ||
      rawRange === "2weeks" ||
      rawRange === "month" ||
      rawRange === "3months"
        ? rawRange
        : "month";

    const { data: service } = await supabase
      .from("services")
      .select("name, emoji, duration_minutes, price_cents, deposit_cents, color")
      .eq("id", serviceId)
      .eq("provider_id", provider.id)
      .eq("is_active", true)
      .single();

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const policy = parseCancellationPolicy(provider.cancellation_policy);
    const depositCents = getEffectiveDeposit(service, policy);

    const rawPaymentMode = branding.payment_mode;
    const paymentMode =
      rawPaymentMode === "full_upfront" || rawPaymentMode === "at_appointment"
        ? rawPaymentMode
        : "deposit_only";

    return NextResponse.json({
      service,
      providerId: provider.id,
      calendarRange,
      paymentMode,
      paymentsEnabled: !!(provider.stripe_account_id && provider.stripe_onboarding_complete),
      cancellationPolicy: policy.enabled
        ? { enabled: true, rules: policy.rules, policy_text: policy.policy_text }
        : null,
      effectiveDeposit: depositCents > 0
        ? {
            deposit_cents: depositCents,
            source: service.deposit_cents > 0 ? "service" : "policy",
          }
        : null,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
