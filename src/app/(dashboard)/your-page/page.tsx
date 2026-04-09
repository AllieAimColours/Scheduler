"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Provider } from "@/types/database";
import { getTemplateId, type TemplateId } from "@/lib/templates/index";
import type { PageBlock } from "@/lib/page-builder/types";
import { defaultStarterPage } from "@/lib/page-builder/defaults";
import { TemplateBar } from "@/components/your-page/template-bar";
import { BlockListEditor } from "@/components/your-page/block-list-editor";
import { PreviewPane } from "@/components/your-page/preview-pane";

export default function YourPageBuilder() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [template, setTemplate] = useState<TemplateId>("studio");
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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

  if (!provider) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        Loading your page...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Your Page
          </h1>
          <p className="text-gray-500 mt-1">
            Build the booking experience your clients see. Pick a vibe, drop in widgets,
            make it yours.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
        >
          {saving ? "Publishing..." : dirty ? "Publish changes" : "Published"}
        </button>
      </div>

      {/* Template bar */}
      <TemplateBar selected={template} onSelect={handleTemplateChange} />

      {/* Editor + Preview */}
      <div className="grid xl:grid-cols-[1fr_500px] gap-6">
        <BlockListEditor blocks={blocks} onChange={handleBlocksChange} provider={provider} />
        <div className="xl:sticky xl:top-6 xl:self-start">
          <PreviewPane slug={provider.slug} template={template} blocks={blocks} />
        </div>
      </div>
    </div>
  );
}
