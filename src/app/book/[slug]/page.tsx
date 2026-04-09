import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { ServiceList } from "@/components/booking/service-list";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    console.error("Admin client creation failed:", e instanceof Error ? e.message : e);
    throw new Error("Database connection failed: " + (e instanceof Error ? e.message : "unknown"));
  }

  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (providerError) {
    console.error("Provider fetch error:", providerError.message, providerError.code);
  }

  if (!provider) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Business Header */}
      <div className="text-center mb-10">
        {provider.logo_url && (
          <img
            src={provider.logo_url}
            alt={provider.business_name}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight">
          {provider.business_name}
        </h1>
        {provider.description && (
          <p className="mt-2 max-w-md mx-auto opacity-70">
            {provider.description}
          </p>
        )}
      </div>

      {/* Services */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-center mb-6">
          Choose a service to book
        </h2>

        <ServiceList
          services={services ?? []}
          slug={slug}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
}
