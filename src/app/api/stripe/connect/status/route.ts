import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id, stripe_account_id, stripe_onboarding_complete")
    .eq("user_id", user.id)
    .single();

  if (!provider?.stripe_account_id) {
    return NextResponse.json({ charges_enabled: false });
  }

  if (provider.stripe_onboarding_complete) {
    return NextResponse.json({ charges_enabled: true });
  }

  const account = await getStripe().accounts.retrieve(
    provider.stripe_account_id
  );

  if (account.charges_enabled) {
    await supabase
      .from("providers")
      .update({ stripe_onboarding_complete: true })
      .eq("id", provider.id);

    return NextResponse.json({ charges_enabled: true });
  }

  return NextResponse.json({ charges_enabled: false });
}
