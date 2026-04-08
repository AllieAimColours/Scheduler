export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { getTemplateId, getTemplate } from "@/lib/templates/index";
import { getTemplateFonts } from "@/lib/templates/fonts";
import { TemplateWrapper } from "@/components/booking/template-wrapper";

export default async function BookingLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  let templateId = "studio" as const;
  let template = getTemplate(templateId);
  let fontClasses = "";

  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: provider } = await supabase
      .from("providers")
      .select("branding")
      .eq("slug", slug)
      .single();

    if (provider) {
      templateId = getTemplateId(
        provider.branding as Record<string, any> | null
      );
      template = getTemplate(templateId);
      const fonts = getTemplateFonts(templateId);
      fontClasses = `${fonts.heading.variable} ${fonts.body.variable}`;
    }
  } catch {
    // Fall back to studio template if anything fails
  }

  return (
    <TemplateWrapper
      templateId={templateId}
      cssVars={template.cssVars}
      fontClasses={fontClasses}
    >
      {children}
    </TemplateWrapper>
  );
}
