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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Palette, Globe } from "lucide-react";
import { toast } from "sonner";
import type { Provider } from "@/types/database";

const BRAND_COLORS = [
  "#ec4899", "#f43f5e", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
];

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    description: "",
    phone: "",
    website: "",
    primary_color: "#6366f1",
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
        const branding = (data.branding as Record<string, string>) || {};
        setForm({
          business_name: data.business_name,
          description: data.description,
          phone: data.phone || "",
          website: data.website || "",
          primary_color: branding.primary_color || "#6366f1",
        });
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
          ...(provider.branding as Record<string, string>),
          primary_color: form.primary_color,
        },
      })
      .eq("id", provider.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved!");
    }
    setSaving(false);
  }

  if (!provider) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business profile and branding
        </p>
      </div>

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
                scheduler.app/book/{provider.slug}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding
          </CardTitle>
          <CardDescription>
            Customize how your booking page looks to clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, primary_color: c })}
                  className={`w-10 h-10 rounded-full transition-all ${
                    form.primary_color === c
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
