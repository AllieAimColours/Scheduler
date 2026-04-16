import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Gate the /admin routes behind an env-controlled email allowlist.
 * Set ADMIN_EMAILS in Vercel to a comma-separated list:
 *   ADMIN_EMAILS=allie@aimcolours.com,another@admin.com
 *
 * Anyone not in the list gets silently redirected to the normal
 * dashboard. There's no UI hint that /admin exists.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !allowed.includes(user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
