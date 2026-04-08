import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if the user already has a provider profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: provider } = await supabase
          .from("providers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (provider) {
          return NextResponse.redirect(`${origin}/dashboard`);
        }

        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
