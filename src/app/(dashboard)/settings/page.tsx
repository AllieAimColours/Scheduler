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
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business profile and booking page design
        </p>
      </div>

      {/* Template Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Booking Page Template
          </CardTitle>
          <CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <Globe className="h-4 w-4 inline mr-1" />
              Your booking page:{" "}
              <span className="font-mono font-medium text-foreground">
                /book/{provider.slug}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}