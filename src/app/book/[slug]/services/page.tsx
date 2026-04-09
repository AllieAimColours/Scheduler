import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceList } from "@/components/booking/service-list";

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <Link
        href={`/book/${slug}`}
        className="inline-flex items-center text-sm opacity-60 hover:opacity-100 mb-8 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
          Choose your service
        </h1>
        <p className="opacity-60 max-w-md mx-auto">
          Select what you&apos;re looking for and we&apos;ll find the perfect time
        </p>
      </div>

      <div className="space-y-3">
        <ServiceList services={services ?? []} slug={slug} />
      </div>
    </div>
  );
}
