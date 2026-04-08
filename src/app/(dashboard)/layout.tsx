export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar provider={provider} userEmail={user.email} />
      <main className="flex-1 p-6 pt-20 md:pt-8 bg-gradient-to-br from-gray-50/80 via-white to-purple-50/20 min-h-screen">{children}</main>
    </div>
  );
}
