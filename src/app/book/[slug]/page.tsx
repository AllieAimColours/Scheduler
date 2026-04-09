import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/booking/blocks/block-renderer";
import { defaultStarterPage } from "@/lib/page-builder/defaults";
import type { PageBlock } from "@/lib/page-builder/types";
import type { DigitalProduct, Service } from "@/types/database";

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

  // Read page blocks from branding JSON, falling back to default starter
  const branding = (provider.branding as Record<string, unknown>) || {};
  const blocks: PageBlock[] = Array.isArray(branding.page_blocks)
    ? (branding.page_blocks as PageBlock[])
    : defaultStarterPage();

  // Fetch services (used by services block)
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("is_active", true)
    .order("sort_order");

  // Fetch active digital products (used by digital_product blocks)
  const productIds: string[] = blocks
    .filter((b) => b.type === "digital_product")
    .map((b) => (b.config as { product_id?: string }).product_id)
    .filter((id): id is string => Boolean(id));

  let digitalProducts: DigitalProduct[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase
      .from("digital_products")
      .select("*")
      .in("id", productIds)
      .eq("is_active", true);
    digitalProducts = (data as unknown as DigitalProduct[]) || [];
  }

  return (
    <div className="py-8 md:py-12">
      <BlockRenderer
        blocks={blocks}
        provider={{
          business_name: provider.business_name,
          description: provider.description,
          logo_url: provider.logo_url,
          phone: provider.phone,
          email: provider.email,
          website: provider.website,
          slug: provider.slug,
        }}
        services={(services as unknown as Service[]) || []}
        digitalProducts={digitalProducts}
      />
    </div>
  );
}
