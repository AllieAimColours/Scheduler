"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LayoutGrid, Sliders } from "lucide-react";
import type { Provider } from "@/types/database";
import { getTemplateId, type TemplateId } from "@/lib/templates/index";
import type { PageBlock } from "@/lib/page-builder/types";
import { defaultStarterPage } from "@/lib/page-builder/defaults";
import { TemplateBar } from "@/components/your-page/template-bar";
import { BlockListEditor } from "@/components/your-page/block-list-editor";
import { PreviewPane } from "@/components/your-page/preview-pane";
import { CustomizePanel } from "@/components/your-page/customize-panel";
import { parseOverrides, type PageOverrides } from "@/lib/page-builder/overrides";
import { cn } from "@/lib/utils";

type Tab = "blocks" | "customize";

export default function YourPageBuilder() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [template, setTemplate] = useState<TemplateId>("studio");
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
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
        const existingBlocks = Array.isArray(branding.page_blocks)
          ? (branding.page_blocks as PageBlock[])
          : defaultStarterPage();
        setBlocks(existingBlocks);
        setOverrides(parseOverrides(branding.overrides));
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!provider) return;
    setSaving(true);
    const supabase = createClient();
    const newBranding = {
      ...((provider.branding as Record<string, unknown>) || {}),
      template,
      page_blocks: JSON.parse(JSON.stringify(blocks)),
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

  function handleBlocksChange(next: PageBlock[]) {
    setBlocks(next);
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
              Blocks
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  tab === "blocks" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                )}
              >
                {blocks.length}
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
            <BlockListEditor
              blocks={blocks}
              onChange={handleBlocksChange}
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
            blocks={blocks}
            overrides={overrides}
          />
        </div>
      </div>
    </div>
  );
}
