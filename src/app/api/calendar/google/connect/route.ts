import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAuthUrl } from "@/lib/calendar/google";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Generate a state token that embeds the user ID so the callback can
  // verify the request originated from a logged-in session.
  const nonce = randomBytes(16).toString("hex");
  const state = `${user.id}:${nonce}`;

  try {
    const url = buildAuthUrl(state);
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
