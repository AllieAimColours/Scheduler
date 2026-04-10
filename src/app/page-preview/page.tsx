"use client";

import { useEffect, useState } from "react";
import { TemplateWrapper } from "@/components/booking/template-wrapper";
import { SectionsRenderer } from "@/components/booking/blocks/section-renderer";
import { getTemplate, type TemplateId } from "@/lib/templates/index";
import { defaultStarterSections } from "@/lib/page-builder/defaults";
import type { PageSection } from "@/lib/page-builder/types";
import type { DigitalProduct, Service, Provider } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { mergeOverrides, type PageOverrides } from "@/lib/page-builder/overrides";

interface PreviewMessage {
  type: "preview-update";
  template?: TemplateId;
  sections?: PageSection[];
  overrides?: PageOverrides;
}

export default function PagePreview() {
  const [template, setTemplate] = useState<TemplateId>("studio");
  const [sections, setSections] = useState<PageSection[]>(defaultStarterSections());
  const [overrides, setOverrides] = useState<PageOverrides>({});
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([]);
  const [ready, setReady] = useState(false);

  // Load real provider/services/products data on mount
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setReady(true);
        return;
      }

      const { data: providerData } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (providerData) {
        setProvider(providerData as unknown as Provider);

        const [servicesRes, productsRes] = await Promise.all([
          supabase
            .from("services")
            .select("*")
            .eq("provider_id", providerData.id)
            .eq("is_active", true)
            .order("sort_order"),
          supabase
            .from("digital_products")
            .select("*")
            .eq("provider_id", providerData.id)
            .eq("is_active", true),
        ]);
        setServices((servicesRes.data as unknown as Service[]) || []);
        setDigitalProducts((productsRes.data as unknown as DigitalProduct[]) || []);
      }
      setReady(true);
    }
    load();
  }, []);

  // Listen for messages from parent dashboard
  useEffect(() => {
    function handleMessage(e: MessageEvent<PreviewMessage>) {
      if (!e.data || e.data.type !== "preview-update") return;
      if (e.data.template) setTemplate(e.data.template);
      if (Array.isArray(e.data.sections)) setSections(e.data.sections);
      if (e.data.overrides !== undefined) setOverrides(e.data.overrides || {});
    }
    window.addEventListener("message", handleMessage);
    // Signal we're ready to receive updates
    if (window.parent !== window) {
      window.parent.postMessage({ type: "preview-ready" }, "*");
    }
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Loading preview...
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Sign in to see your live preview.
      </div>
    );
  }

  const tpl = getTemplate(template);
  const mergedVars = mergeOverrides(tpl.cssVars, overrides);

  return (
    <TemplateWrapper
      templateId={template}
      cssVars={mergedVars}
      fontClasses=""
      overrides={overrides}
    >
      <SectionsRenderer
        sections={sections}
        provider={{
          business_name: provider.business_name,
          description: provider.description,
          logo_url: provider.logo_url,
          phone: provider.phone,
          email: provider.email,
          website: provider.website,
          slug: provider.slug,
        }}
        services={services}
        digitalProducts={digitalProducts}
      />
    </TemplateWrapper>
  );
}
