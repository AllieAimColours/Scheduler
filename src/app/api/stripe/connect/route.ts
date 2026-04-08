import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id, stripe_account_id, business_name, email")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    return NextResponse.json({ error: "No provider" }, { status: 404 });
  }

  let accountId = provider.stripe_account_id;

  // Create Stripe Connect account if not exists
  if (!accountId) {
    const account = await getStripe().accounts.create({
      type: "express",
      email: provider.email || user.email,
      business_profile: {
        name: provider.business_name,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    accountId = account.id;

    await supabase
      .from("providers")
      .update({ stripe_account_id: accountId })
      .eq("id", provider.id);
  }

  // Create onboarding link
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments?onboarding=complete`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
