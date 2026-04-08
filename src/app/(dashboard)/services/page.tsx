import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ServiceList } from "./service-list";

export default async function ServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: provider } = await supabase
    .from("providers")
    .select("id, currency")
    .eq("user_id", user.id)
    .single();
  if (!provider) redirect("/onboarding");

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", provider.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Services
        </h1>
        <p className="text-gray-400">
          Manage the treatments and services you offer to clients
        </p>
      </div>
      <ServiceList
        services={services || []}
        currency={provider.currency}
      />
    </div>
  );
}
