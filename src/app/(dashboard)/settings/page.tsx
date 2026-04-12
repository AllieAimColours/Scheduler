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
import { Settings, Globe, Wand2, Download, FileText, FileJson, CalendarDays, Timer } from "lucide-react";
import { toast } from "sonner";
import type { Provider } from "@/types/database";
import { CancellationPolicyEditor } from "./cancellation-policy-editor";

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    description: "",
    phone: "",
    website: "",
    address: "",
    booking_calendar_range: "month" as "week" | "2weeks" | "month" | "3months",
    default_slot_minutes: 15 as 15 | 30 | 60,
    default_buffer_before_minutes: 0,
    default_buffer_after_minutes: 0,
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
        const branding = (data.branding as Record<string, unknown>) || {};
        const rawRange = branding.booking_calendar_range;
        const calendarRange =
          rawRange === "week" ||
          rawRange === "2weeks" ||
          rawRange === "month" ||
          rawRange === "3months"
            ? rawRange
            : "month";
        const rawSlot = branding.default_slot_minutes;
        const slotInterval: 15 | 30 | 60 =
          rawSlot === 15 || rawSlot === 30 || rawSlot === 60 ? rawSlot : 15;
        const clampBuffer = (v: unknown): number => {
          if (typeof v !== "number" || !Number.isFinite(v)) return 0;
          return Math.max(0, Math.min(120, Math.round(v)));
        };
        setForm({
          business_name: data.business_name,
          description: data.description,
          phone: data.phone || "",
          website: data.website || "",
          address: typeof branding.address === "string" ? branding.address : "",
          booking_calendar_range: calendarRange,
          default_slot_minutes: slotInterval,
          default_buffer_before_minutes: clampBuffer(branding.default_buffer_before_minutes),
          default_buffer_after_minutes: clampBuffer(branding.default_buffer_after_minutes),
        });
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
      address: form.address || undefined,
      booking_calendar_range: form.booking_calendar_range,
      default_slot_minutes: form.default_slot_minutes,
      default_buffer_before_minutes: form.default_buffer_before_minutes,
      default_buffer_after_minutes: form.default_buffer_after_minutes,
    };
    const { error } = await supabase
      .from("providers")
      .update({
        business_name: form.business_name,
        description: form.description,
        phone: form.phone || null,
        website: form.website || null,
        branding: newBranding,
      })
      .eq("id", provider.id);

    if (error) {
      console.error("Settings save error:", error);
      toast.error(`Failed to save: ${error.message}`);
    } else {
      toast.success("Settings saved!");
      setProvider({
        ...provider,
        business_name: form.business_name,
        description: form.description,
        phone: form.phone || null,
        website: form.website || null,
        branding: newBranding,
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
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Your business info and policies. Looking for templates and the page builder?{" "}
          <a href="/your-page" className="text-purple-600 font-medium hover:underline inline-flex items-center gap-1">
            <Wand2 className="h-3.5 w-3.5" />
            Open Your Page
          </a>
        </p>
      </div>

      {/* Cancellation Policy */}
      <CancellationPolicyEditor provider={provider} onUpdate={setProvider} />

      {/* Data Export */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Download className="h-4 w-4 text-white" />
            </div>
            Data Export
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your data is yours. Download it any time — no questions asked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <ExportButton type="bookings" label="Bookings" description="All appointments with client + payment details" icon={<FileText className="h-4 w-4" />} />
            <ExportButton type="clients" label="Clients" description="Aggregated by email with visit history" icon={<FileText className="h-4 w-4" />} />
            <ExportButton type="services" label="Services" description="Your service catalog" icon={<FileText className="h-4 w-4" />} />
            <ExportButton type="payments" label="Payments" description="All paid + refunded transactions" icon={<FileText className="h-4 w-4" />} />
          </div>

          <div className="pt-2">
            <ExportButton
              type="all"
              label="Everything (JSON)"
              description="Full combined export — bookings, clients, services, payments — in one JSON file"
              icon={<FileJson className="h-4 w-4" />}
              prominent
            />
          </div>

          <p className="text-xs text-gray-400 pt-2">
            Files are generated on demand from your live data. CSV files work with Excel, Numbers, and Google Sheets.
          </p>
        </CardContent>
      </Card>

      {/* Booking calendar range */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            Booking Calendar
          </CardTitle>
          <CardDescription className="text-gray-400">
            How much of your calendar do clients see when they pick a date?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(
              [
                { id: "week", label: "1 week", hint: "For high-turnover stylists" },
                { id: "2weeks", label: "2 weeks", hint: "Balanced" },
                { id: "month", label: "1 month", hint: "Most common" },
                { id: "3months", label: "3 months", hint: "For therapy, IVF, consultants" },
              ] as const
            ).map((opt) => {
              const active = form.booking_calendar_range === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({ ...form, booking_calendar_range: opt.id })}
                  className={
                    active
                      ? "p-4 rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md text-left transition-all cursor-pointer"
                      : "p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 text-left transition-all cursor-pointer"
                  }
                >
                  <div className={active ? "font-display text-lg font-bold text-purple-700" : "font-display text-lg font-bold text-gray-700"}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Days are color-coded for clients: <span className="text-green-600 font-medium">green</span> means lots free,
            <span className="text-yellow-600 font-medium"> yellow</span> some free,
            <span className="text-orange-600 font-medium"> orange</span> filling up,
            <span className="text-red-600 font-medium"> red</span> last slots.
          </p>
        </CardContent>
      </Card>

      {/* Booking Defaults — slot interval + buffer times */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Timer className="h-4 w-4 text-white" />
            </div>
            Booking Defaults
          </CardTitle>
          <CardDescription className="text-gray-400">
            Control how often slots appear and how much breathing room between appointments. Individual services can override buffers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Slot interval</Label>
            <div className="grid grid-cols-3 gap-3">
              {([15, 30, 60] as const).map((n) => {
                const active = form.default_slot_minutes === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, default_slot_minutes: n })}
                    className={
                      active
                        ? "p-4 rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md text-left transition-all cursor-pointer"
                        : "p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 text-left transition-all cursor-pointer"
                    }
                  >
                    <div className={active ? "font-display text-lg font-bold text-purple-700" : "font-display text-lg font-bold text-gray-700"}>
                      {n === 60 ? "1 hour" : `${n} min`}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      {n === 15 && "Tight scheduling"}
                      {n === 30 && "Most common"}
                      {n === 60 && "Therapy / consults"}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400">
              Clients only see bookable start times on this interval.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buffer_before" className="text-gray-800 font-medium">Default buffer before (min)</Label>
              <Input
                id="buffer_before"
                type="number"
                min={0}
                max={120}
                step={5}
                value={form.default_buffer_before_minutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    default_buffer_before_minutes: Math.max(
                      0,
                      Math.min(120, Number(e.target.value) || 0)
                    ),
                  })
                }
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
              <p className="text-[11px] text-gray-400">
                Prep time reserved before every appointment.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer_after" className="text-gray-800 font-medium">Default buffer after (min)</Label>
              <Input
                id="buffer_after"
                type="number"
                min={0}
                max={120}
                step={5}
                value={form.default_buffer_after_minutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    default_buffer_after_minutes: Math.max(
                      0,
                      Math.min(120, Number(e.target.value) || 0)
                    ),
                  })
                }
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
              <p className="text-[11px] text-gray-400">
                Cleanup / turnover time after every appointment.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/50 rounded-xl p-4 border border-amber-100/60">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-800">Tip:</span> buffers here apply to <em>every</em> service.
              Need a hair color to have a 30-minute buffer after while a blowout only needs 5?
              Open that service from the Services page and set a per-service override.
            </p>
          </div>
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
          <CardDescription className="text-gray-400">
            The core info clients will see throughout your booking flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Business Name</Label>
            <Input
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main St, City, State"
              className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
            />
            <p className="text-xs text-gray-400">
              Shown on your booking page and in &quot;Get directions&quot; on the confirmation page
            </p>
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

// ─── Data export button ───

function ExportButton({
  type,
  label,
  description,
  icon,
  prominent = false,
}: {
  type: "bookings" | "clients" | "services" | "payments" | "all";
  label: string;
  description: string;
  icon: React.ReactNode;
  prominent?: boolean;
}) {
  return (
    <a
      href={`/api/export?type=${type}`}
      download
      className={
        prominent
          ? "group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all"
          : "group flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
      }
    >
      <div
        className={
          prominent
            ? "shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md"
            : "shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors"
        }
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
          {label}
        </div>
        <div className="text-[11px] text-gray-500 leading-snug line-clamp-2">
          {description}
        </div>
      </div>
      <Download className="shrink-0 h-4 w-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-y-0.5 transition-all" />
    </a>
  );
}
