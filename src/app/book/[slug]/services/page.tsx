import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ServicesView } from "@/components/booking/services-view";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!provider) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("is_active", true)
    .order("sort_order");

  return <ServicesView slug={slug} services={services ?? []} />;
}
