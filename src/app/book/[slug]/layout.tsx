export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
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
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("branding")
    .eq("slug", slug)
    .single();

  if (!provider) notFound();

  const templateId = getTemplateId(
    provider.branding as Record<string, any> | null
  );
  const template = getTemplate(templateId);
  const fonts = getTemplateFonts(templateId);
  const fontClasses = `${fonts.heading.variable} ${fonts.body.variable}`;

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
