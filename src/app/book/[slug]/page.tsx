import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { LandingHero } from "@/components/booking/landing-hero";

interface BrandingHero {
  hero_image_url?: string;
  welcome_message?: string;
  tagline?: string;
  cta_label?: string;
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

  const branding = (provider.branding as Record<string, unknown>) || {};
  const hero: BrandingHero = {
    hero_image_url: typeof branding.hero_image_url === "string" ? branding.hero_image_url : undefined,
    welcome_message: typeof branding.welcome_message === "string" ? branding.welcome_message : undefined,
    tagline: typeof branding.tagline === "string" ? branding.tagline : undefined,
    cta_label: typeof branding.cta_label === "string" ? branding.cta_label : undefined,
  };

  return (
    <LandingHero
      provider={{
        business_name: provider.business_name,
        description: provider.description,
        logo_url: provider.logo_url,
        phone: provider.phone,
        email: provider.email,
        website: provider.website,
        slug: provider.slug,
      }}
      hero={{
        image_url: hero.hero_image_url,
        welcome_message: hero.welcome_message,
        tagline: hero.tagline,
        cta_label: hero.cta_label,
      }}
    />
  );
}
