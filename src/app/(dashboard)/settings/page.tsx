"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Palette, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Provider } from "@/types/database";
import { TemplatePicker } from "@/components/settings/template-picker";
import { getTemplateId, type TemplateId } from "@/lib/templates/index";

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("studio");
  const [form, setForm] = useState({
    business_name: "",
    description: "",
    phone: "",
    website: "",
  });

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
        const branding = (data.branding as Record<string, any>) || {};
        setForm({
          business_name: data.business_name,
          description: data.description,
          phone: data.phone || "",
          website: data.website || "",
        });
        setSelectedTemplate(getTemplateId(branding));
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!provider) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("providers")
      .update({
        business_name: form.business_name,
        description: form.description,
        phone: form.phone || null,
        website: form.website || null,
        branding: {
          ...(provider.branding as Record<string, any>),
          template: selectedTemplate,
        },
      })
      .eq("id", provider.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved!");
      // Update local provider state
      setProvider({
        ...provider,
        business_name: form.business_name,
        description: form.description,
        phone: form.phone || null,
        website: form.website || null,
        branding: {
          ...(provider.branding as Record<string, any>),
          template: selectedTemplate,
        },
      });
    }
    setSaving(false);
  }

  if (!provider) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-400">
          Manage your business profile and booking page design
        </p>
      </div>

      {/* Template Picker */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Booking Page Template
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose a vibe that matches your brand. This transforms your entire
            booking page — fonts, colors, animations, everything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplatePicker
            currentTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Business Name</Label>
            <Input
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
              className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/50 rounded-xl p-4 border border-purple-100/60">
            <p className="text-sm text-gray-600">
              <Globe className="h-4 w-4 inline mr-1.5 text-purple-500" />
              Your booking page:{" "}
              <span className="font-mono font-medium text-gray-800">
                /book/{provider.slug}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
      >
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
