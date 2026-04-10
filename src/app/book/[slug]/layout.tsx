export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { getTemplateId, getTemplate, type TemplateId } from "@/lib/templates/index";
import { getTemplateFonts } from "@/lib/templates/fonts";
import { TemplateWrapper } from "@/components/booking/template-wrapper";
import { mergeOverrides, parseOverrides, type PageOverrides } from "@/lib/page-builder/overrides";

export default async function BookingLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  let templateId: TemplateId = "studio";
  let template = getTemplate(templateId);
  let fontClasses = "";
  let overrides: PageOverrides = {};

  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: provider, error } = await supabase
      .from("providers")
      .select("branding")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Booking layout Supabase error:", error.message, error.code);
    }

    if (provider) {
      const branding = (provider.branding as Record<string, unknown>) || {};
      templateId = getTemplateId(branding);
      template = getTemplate(templateId);
      const fonts = getTemplateFonts(templateId);
      fontClasses = `${fonts.heading.variable} ${fonts.body.variable}`;
      overrides = parseOverrides(branding.overrides);
    }
  } catch (e) {
    console.error("Booking layout error:", e instanceof Error ? e.message : e);
    // Fall back to studio template if anything fails
  }

  const mergedVars = mergeOverrides(template.cssVars, overrides);

  return (
    <TemplateWrapper
      templateId={templateId}
      cssVars={mergedVars}
      fontClasses={fontClasses}
      overrides={overrides}
    >
      {children}
    </TemplateWrapper>
  );
}
