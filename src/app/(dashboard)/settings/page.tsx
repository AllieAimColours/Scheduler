"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Settings, Globe, Wand2, Download, FileText, FileJson, CalendarDays, Timer, Upload, DollarSign, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import type { Provider } from "@/types/database";
import { CancellationPolicyEditor } from "./cancellation-policy-editor";

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    description: "",
    phone: "",
    website: "",
    address: "",
    booking_calendar_range: "month" as "week" | "2weeks" | "month" | "3months",
    default_slot_minutes: 0 as 0 | 15 | 30 | 60,
    default_buffer_before_minutes: 0,
    default_buffer_after_minutes: 0,
    min_booking_notice_hours: 0,
    currency: "USD",
    payment_mode: "deposit_only" as "deposit_only" | "full_upfront" | "at_appointment",
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
        const slotInterval: 0 | 15 | 30 | 60 =
          rawSlot === 0 || rawSlot === 15 || rawSlot === 30 || rawSlot === 60 ? rawSlot : 0;
        const clampBuffer = (v: unknown): number => {
          if (typeof v !== "number" || !Number.isFinite(v)) return 0;
          return Math.max(0, Math.min(120, Math.round(v)));
        };
        const clampNotice = (v: unknown): number => {
          if (typeof v !== "number" || !Number.isFinite(v)) return 0;
          return Math.max(0, Math.min(720, Math.round(v)));
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
          min_booking_notice_hours: clampNotice(branding.min_booking_notice_hours),
          currency: data.currency || "USD",
          payment_mode: (branding.payment_mode === "full_upfront" || branding.payment_mode === "at_appointment")
            ? branding.payment_mode as "full_upfront" | "at_appointment"
            : "deposit_only",
        });
        lastSaved.current = JSON.stringify({
          business_name: data.business_name,
          description: data.description,
          phone: data.phone || "",
          website: data.website || "",
          address: typeof branding.address === "string" ? branding.address : "",
          booking_calendar_range: calendarRange,
          default_slot_minutes: slotInterval,
          default_buffer_before_minutes: clampBuffer(branding.default_buffer_before_minutes),
          default_buffer_after_minutes: clampBuffer(branding.default_buffer_after_minutes),
          min_booking_notice_hours: clampNotice(branding.min_booking_notice_hours),
          currency: data.currency || "USD",
          payment_mode: (branding.payment_mode === "full_upfront" || branding.payment_mode === "at_appointment")
            ? branding.payment_mode as "full_upfront" | "at_appointment"
            : "deposit_only",
        });
        setTimeout(() => { loaded.current = true; }, 0);
      }
    }
    load();
  }, []);

  const doSave = useCallback(async (currentForm: typeof form, currentProvider: Provider) => {
    const supabase = createClient();
    const newBranding = {
      ...((currentProvider.branding as Record<string, unknown>) || {}),
      address: currentForm.address || undefined,
      booking_calendar_range: currentForm.booking_calendar_range,
      default_slot_minutes: currentForm.default_slot_minutes,
      default_buffer_before_minutes: currentForm.default_buffer_before_minutes,
      default_buffer_after_minutes: currentForm.default_buffer_after_minutes,
      min_booking_notice_hours: currentForm.min_booking_notice_hours,
      payment_mode: currentForm.payment_mode,
    };
    const { error } = await supabase
      .from("providers")
      .update({
        business_name: currentForm.business_name,
        description: currentForm.description,
        phone: currentForm.phone || null,
        website: currentForm.website || null,
        currency: currentForm.currency,
        branding: newBranding,
      })
      .eq("id", currentProvider.id);

    if (error) {
      console.error("Settings save error:", error);
      toast.error(`Failed to save: ${error.message}`);
    } else {
      lastSaved.current = JSON.stringify(currentForm);
      toast.success("Settings saved");
      setProvider({
        ...currentProvider,
        business_name: currentForm.business_name,
        description: currentForm.description,
        phone: currentForm.phone || null,
        website: currentForm.website || null,
        currency: currentForm.currency,
        branding: newBranding,
      });
    }
  }, []);

  // Autosave: debounce 1.5s, but ONLY when form values actually changed
  useEffect(() => {
    if (!loaded.current || !provider) return;
    const currentSnapshot = JSON.stringify(form);
    if (currentSnapshot === lastSaved.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      doSave(form, provider);
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form, provider, doSave]);

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

      {/* Booking link — most important thing to copy/share */}
      {(() => {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://bloomrdv.com";
        const fullUrl = `${origin}/book/${provider.slug}`;
        async function copyLink() {
          try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast.success("Booking link copied");
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast.error("Could not copy — try manually selecting");
          }
        }
        return (
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-pink-50/60 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
                <Globe className="h-3.5 w-3.5 text-white" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Your booking link
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 min-w-0 rounded-xl bg-white border border-gray-200 px-4 py-3 font-mono text-sm text-gray-800 truncate select-all">
                {fullUrl}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 text-sm font-medium transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Share this link anywhere — Instagram bio, business card, WhatsApp. Clients click it and book directly.
            </p>
          </div>
        );
      })()}

      {/* Business Info — identity first */}
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
          <div className="grid grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">Currency</Label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="USD">USD ($)</option>
                <option value="CAD">CAD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD ($)</option>
                <option value="MXN">MXN ($)</option>
                <option value="BRL">BRL (R$)</option>
                <option value="CHF">CHF</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
              </select>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { id: 0, label: "Automatic", hint: "Adapts to each service" },
                { id: 15, label: "15 min", hint: "Tight scheduling" },
                { id: 30, label: "30 min", hint: "Balanced" },
                { id: 60, label: "1 hour", hint: "Therapy / consults" },
              ] as const).map((opt) => {
                const active = form.default_slot_minutes === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, default_slot_minutes: opt.id })}
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
            <p className="text-xs text-gray-400">
              {form.default_slot_minutes === 0
                ? "A 60-min service shows hourly slots, a 30-min shows half-hour slots, etc."
                : "Clients only see bookable start times on this interval."}
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

          <div className="space-y-2">
            <Label htmlFor="min_notice" className="text-gray-800 font-medium">
              Minimum booking notice
            </Label>
            <select
              id="min_notice"
              value={form.min_booking_notice_hours}
              onChange={(e) =>
                setForm({
                  ...form,
                  min_booking_notice_hours: Number(e.target.value),
                })
              }
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
            >
              <option value={0}>No minimum — clients can book anytime</option>
              <option value={1}>1 hour before</option>
              <option value={2}>2 hours before</option>
              <option value={4}>4 hours before</option>
              <option value={12}>12 hours before</option>
              <option value={24}>24 hours before (1 day)</option>
              <option value={48}>48 hours before (2 days)</option>
              <option value={72}>72 hours before (3 days)</option>
              <option value={168}>1 week before</option>
            </select>
            <p className="text-[11px] text-gray-400">
              How much advance notice clients need to book. Slots starting sooner than this won&apos;t appear on your booking page.
            </p>
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

      {/* Payment Mode */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            Payment Mode
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose how clients pay for your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {([
              {
                id: "deposit_only" as const,
                label: "Deposits only",
                description: "Charge the deposit online, client pays the rest at the appointment. No deposit = no online payment.",
              },
              {
                id: "full_upfront" as const,
                label: "Full payment upfront",
                description: "Charge the full service price at checkout. If a deposit is set, charge just the deposit instead.",
              },
              {
                id: "at_appointment" as const,
                label: "Always pay at appointment",
                description: "Never charge online. Clients book freely, pay in person with cash, tap, or card.",
              },
            ]).map((opt) => {
              const active = form.payment_mode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({ ...form, payment_mode: opt.id })}
                  className={
                    active
                      ? "p-4 rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md text-left transition-all cursor-pointer"
                      : "p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 text-left transition-all cursor-pointer"
                  }
                >
                  <div className={active ? "font-display font-bold text-purple-700" : "font-display font-bold text-gray-700"}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    {opt.description}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
        <CardContent className="space-y-4">
          {/* Primary action — one spreadsheet-ready file with everything */}
          <ExportButton
            type="all-csv"
            label="Everything (CSV, spreadsheet-ready)"
            description="Bookings, clients, services, and payments in one file — opens in Excel, Numbers, and Google Sheets"
            icon={<FileText className="h-4 w-4" />}
            prominent
          />

          {/* Per-table CSVs for when you only want one slice */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Or download individual tables</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <ExportButton type="bookings" label="Bookings" description="All appointments with client + payment details" icon={<FileText className="h-4 w-4" />} />
              <ExportButton type="clients" label="Clients" description="Aggregated by email with visit history" icon={<FileText className="h-4 w-4" />} />
              <ExportButton type="services" label="Services" description="Your service catalog" icon={<FileText className="h-4 w-4" />} />
              <ExportButton type="payments" label="Payments" description="All paid + refunded transactions" icon={<FileText className="h-4 w-4" />} />
            </div>
          </div>

          {/* Developer option — JSON */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-2 pt-2">Developer option</p>
            <a
              href="/api/export?type=all"
              download
              className="group inline-flex items-center gap-2 text-xs text-gray-500 hover:text-purple-600 transition-colors"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span className="underline underline-offset-2">Download everything as JSON</span>
              <span className="text-gray-400">— structured format for importing back into Bloom or your own tools</span>
            </a>
          </div>

          <p className="text-xs text-gray-400 pt-1">
            Files are generated on demand from your live data.
          </p>
        </CardContent>
      </Card>

      {/* Import from Bloom JSON export */}
      <ImportCard />

      {/* Autosave status — no manual save button needed */}
    </div>
  );
}

// ─── Import card — upload a Bloom JSON export ───

function ImportCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Import failed");
      } else {
        const imported = json.imported ?? 0;
        const skipped = json.skipped ?? 0;
        if (imported > 0) {
          toast.success(
            skipped > 0
              ? `Imported ${imported} service${imported === 1 ? "" : "s"} · ${skipped} skipped`
              : `Imported ${imported} service${imported === 1 ? "" : "s"}`
          );
        } else {
          toast.error(json.message || "Nothing imported");
        }
      }
    } catch {
      toast.error("Upload failed. Is the file under 5 MB?");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-gray-800">
          <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
            <Upload className="h-4 w-4 text-white" />
          </div>
          Import from Bloom
        </CardTitle>
        <CardDescription className="text-gray-400">
          Already have a Bloom JSON export? Upload it here and we&apos;ll recreate your services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="group w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 hover:border-sky-400 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-md">
            <Upload className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-semibold text-gray-800 group-hover:text-sky-700 transition-colors">
              {uploading ? "Uploading..." : "Upload bloom-export-*.json"}
            </div>
            <div className="text-[11px] text-gray-500 leading-snug">
              Recreates your services from the file. Existing services are kept as-is.
            </div>
          </div>
        </button>
        <p className="text-xs text-gray-400">
          Only Bloom JSON exports for now. Switching from Acuity, Vagaro, or Calendly?
          Let us know and we&apos;ll build an importer.
        </p>
      </CardContent>
    </Card>
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
  type: "bookings" | "clients" | "services" | "payments" | "all" | "all-csv";
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
