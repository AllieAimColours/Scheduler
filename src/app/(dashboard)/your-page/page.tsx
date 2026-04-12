"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LayoutGrid, Sliders } from "lucide-react";
import type { Provider } from "@/types/database";
import { getTemplateId, type TemplateId } from "@/lib/templates/index";
import {
  isSectionsFormat,
  migrateBlocksToSections,
  type PageBlock,
  type PageSection,
} from "@/lib/page-builder/types";
import { defaultStarterSections } from "@/lib/page-builder/defaults";
import { TemplateBar } from "@/components/your-page/template-bar";
import { SectionListEditor } from "@/components/your-page/section-list-editor";
import { PreviewPane } from "@/components/your-page/preview-pane";
import { CustomizePanel } from "@/components/your-page/customize-panel";
import { parseOverrides, type PageOverrides } from "@/lib/page-builder/overrides";
import { cn } from "@/lib/utils";

type Tab = "blocks" | "customize";

export default function YourPageBuilder() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [template, setTemplate] = useState<TemplateId>("studio");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [overrides, setOverrides] = useState<PageOverrides>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<Tab>("blocks");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProvider(data);
        const branding = (data.branding as Record<string, unknown>) || {};
        setTemplate(getTemplateId(branding));
        let existingSections: PageSection[];
        if (isSectionsFormat(branding.page_sections)) {
          existingSections = branding.page_sections as PageSection[];
        } else if (Array.isArray(branding.page_blocks)) {
          existingSections = migrateBlocksToSections(branding.page_blocks as PageBlock[]);
        } else {
          existingSections = defaultStarterSections();
        }
        setSections(existingSections);
        setOverrides(parseOverrides(branding.overrides));
      }
    }
    load();
  }, []);

  // Warn before leaving with unsaved changes (browser tab close / navigate away)
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Intercept sidebar navigation when dirty
  useEffect(() => {
    if (!dirty) return;
    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href === "/your-page") return;
      if (!confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  async function handleSave() {
    if (!provider) return;
    setSaving(true);
    const supabase = createClient();
    const existingBranding = (provider.branding as Record<string, unknown>) || {};
    // Drop the old page_blocks key — sections is the source of truth now
    const { page_blocks: _legacy, ...rest } = existingBranding;
    void _legacy;
    const newBranding = {
      ...rest,
      template,
      page_sections: JSON.parse(JSON.stringify(sections)),
      overrides: JSON.parse(JSON.stringify(overrides)),
    };
    const { error } = await supabase
      .from("providers")
      .update({ branding: newBranding })
      .eq("id", provider.id);

    if (error) {
      console.error("Save failed:", error);
      toast.error(`Save failed: ${error.message}`);
    } else {
      toast.success("Your page is live");
      setDirty(false);
      setProvider({ ...provider, branding: newBranding });
    }
    setSaving(false);
  }

  function handleTemplateChange(t: TemplateId) {
    setTemplate(t);
    setDirty(true);
  }

  function handleSectionsChange(next: PageSection[]) {
    setSections(next);
    setDirty(true);
  }

  function handleOverridesChange(next: PageOverrides) {
    setOverrides(next);
    setDirty(true);
  }

  if (!provider) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        Loading your page...
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Your Page
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pick a vibe, drop in widgets, make it yours.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 cursor-pointer"
        >
          {saving ? "Publishing..." : dirty ? "Publish changes" : "Published"}
        </button>
      </div>

      {/* Template bar */}
      <TemplateBar selected={template} onSelect={handleTemplateChange} />

      {/* Editor + Preview — left column has tabs (Blocks | Customize) */}
      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(520px,640px)] gap-5">
        {/* Left column: tabs + content */}
        <div className="min-w-0">
          {/* Tab bar */}
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm mb-4 w-fit">
            <button
              type="button"
              onClick={() => setTab("blocks")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                tab === "blocks"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900 hover:bg-purple-50"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Sections
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  tab === "blocks" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                )}
              >
                {sections.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("customize")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                tab === "customize"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900 hover:bg-purple-50"
              )}
            >
              <Sliders className="h-4 w-4" />
              Customize
            </button>
          </div>

          {/* Tab content */}
          {tab === "blocks" && (
            <SectionListEditor
              sections={sections}
              onChange={handleSectionsChange}
              provider={provider}
            />
          )}
          {tab === "customize" && (
            <CustomizePanel overrides={overrides} onUpdate={handleOverridesChange} />
          )}
        </div>

        {/* Right column: preview, always visible */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <PreviewPane
            slug={provider.slug}
            template={template}
            sections={sections}
            overrides={overrides}
          />
        </div>
      </div>
    </div>
  );
}
