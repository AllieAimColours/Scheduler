"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Download,
} from "lucide-react";
import { PeonyMark } from "@/components/peony-mark";

// ─── Types ───

type Period = "today" | "week" | "month" | "year";

interface Booking {
  id: string;
  starts_at: string;
  ends_at: string;
  client_name: string;
  client_email: string;
  status: string;
  payment_amount_cents: number;
  services: {
    name: string;
    emoji: string;
    color: string;
    duration_minutes: number;
    price_cents: number;
  } | null;
}

// ─── Helpers ───

function startOfWeekMonday(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function getPeriodRange(period: Period, now: Date): { start: Date; end: Date; label: string } {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  switch (period) {
    case "today":
      return { start: today, end: endOfDay(today), label: fmtShort(today) };
    case "week": {
      const s = startOfWeekMonday(today);
      const e = new Date(s.getTime() + 6 * 86400000);
      return { start: s, end: endOfDay(e), label: `${fmtShort(s)}–${fmtShort(e)}` };
    }
    case "month": {
      const s = startOfMonth(today);
      const e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: s, end: endOfDay(e), label: today.toLocaleDateString("en-US", { month: "long", year: "numeric" }) };
    }
    case "year": {
      const s = startOfYear(today);
      const e = new Date(today.getFullYear(), 11, 31);
      return { start: s, end: endOfDay(e), label: String(today.getFullYear()) };
    }
  }
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function toCsv(bookings: Booking[]): string {
  const headers = ["Date", "Time", "Client", "Email", "Service", "Duration", "Service Price", "Deposit Paid", "Status"];
  const rows = bookings.map((b) => {
    const d = new Date(b.starts_at);
    return [
      d.toLocaleDateString(),
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      b.client_name,
      b.client_email,
      b.services?.name || "",
      b.services?.duration_minutes ? `${b.services.duration_minutes} min` : "",
      b.services?.price_cents ? (b.services.price_cents / 100).toFixed(2) : "0.00",
      (b.payment_amount_cents / 100).toFixed(2),
      b.status,
    ].map((c) => {
      const s = String(c);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",");
  });
  return [headers.join(","), ...rows].join("\r\n") + "\r\n";
}

// ─── Main ───

export default function DashboardPage() {
  const [provider, setProvider] = useState<{ id: string; business_name: string } | null>(null);
  const [period, setPeriod] = useState<Period>("week");
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const range = useMemo(() => getPeriodRange(period, now), [period, now]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prov } = await supabase
        .from("providers")
        .select("id, business_name")
        .eq("user_id", user.id)
        .single();
      if (!prov) return;
      setProvider(prov);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = endOfDay(todayStart);

      const [todayRes, clientRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*, services(name, emoji, color, duration_minutes, price_cents)")
          .eq("provider_id", prov.id)
          .gte("starts_at", todayStart.toISOString())
          .lte("starts_at", todayEnd.toISOString())
          .neq("status", "cancelled")
          .order("starts_at"),
        supabase
          .from("bookings")
          .select("client_email", { count: "exact", head: true })
          .eq("provider_id", prov.id)
          .neq("status", "cancelled"),
      ]);

      setTodayBookings((todayRes.data || []) as unknown as Booking[]);
      setTotalClients(clientRes.count || 0);
      setLoading(false);
    }
    load();
  }, []);

  // Fetch period bookings whenever period changes
  useEffect(() => {
    if (!provider) return;
    async function fetchPeriod() {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("*, services(name, emoji, color, duration_minutes, price_cents)")
        .eq("provider_id", provider!.id)
        .gte("starts_at", range.start.toISOString())
        .lte("starts_at", range.end.toISOString())
        .neq("status", "cancelled")
        .order("starts_at");
      setAllBookings((data || []) as unknown as Booking[]);
    }
    fetchPeriod();
  }, [provider, range]);

  // Compute stats
  const deposits = allBookings.reduce((s, b) => s + (b.payment_amount_cents || 0), 0);
  const dueAtAppt = allBookings.reduce((s, b) => {
    const svcPrice = b.services?.price_cents || 0;
    return s + Math.max(0, svcPrice - (b.payment_amount_cents || 0));
  }, 0);
  const totalRevenue = deposits + dueAtAppt;
  const uniqueEmails = new Set(allBookings.map((b) => b.client_email)).size;

  // Export
  function handleExport() {
    const csv = toCsv(allBookings);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bloom-${period}-${range.label.replace(/[^a-zA-Z0-9]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = provider?.business_name.split(" ")[0] || "";

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-20 justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight">
          {greeting},{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <p className="text-gray-400 mt-1">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          {period !== "today" && (
            <span className="ml-2 text-gray-300">·</span>
          )}
          {period !== "today" && (
            <span className="ml-2 font-medium text-purple-500">{range.label}</span>
          )}
        </p>
      </div>

      {/* Period selector + export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["today", "week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                period === p
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{range.label}</span>
          <button
            onClick={handleExport}
            disabled={allBookings.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Bookings",
            value: allBookings.length,
            icon: CalendarDays,
            gradient: "from-violet-500 to-purple-600",
            bgGlow: "bg-violet-500/10",
          },
          {
            label: "Revenue",
            value: `$${(totalRevenue / 100).toFixed(0)}`,
            subtitle: deposits > 0 || dueAtAppt > 0
              ? `$${(deposits / 100).toFixed(0)} deposits · $${(dueAtAppt / 100).toFixed(0)} at appt`
              : undefined,
            icon: DollarSign,
            gradient: "from-pink-500 to-rose-600",
            bgGlow: "bg-pink-500/10",
          },
          {
            label: "Clients",
            value: period === "today" || period === "week" || period === "month" || period === "year"
              ? uniqueEmails
              : totalClients,
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
            bgGlow: "bg-blue-500/10",
          },
          {
            label: "Avg per Booking",
            value: allBookings.length > 0
              ? `$${(totalRevenue / allBookings.length / 100).toFixed(0)}`
              : "$0",
            icon: TrendingUp,
            gradient: "from-amber-500 to-orange-500",
            bgGlow: "bg-amber-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${stat.bgGlow} blur-2xl`} />
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400 font-medium mt-0.5">
              {stat.label}
            </div>
            {"subtitle" in stat && stat.subtitle && (
              <div className="text-[10px] text-gray-400 mt-1">{stat.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <h2 className="font-bold text-gray-800">Today&apos;s Schedule</h2>
          </div>
          <a
            href="/bookings"
            className="text-sm text-purple-500 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {todayBookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 mb-4">
              <PeonyMark size={48} />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">
              Your day is wide open
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Share your booking link and watch the appointments roll in.
              You&apos;ve got this!
            </p>
            <a
              href="/preview"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-purple-500 hover:text-purple-700 transition-colors"
            >
              Preview your booking page
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayBookings.map((booking) => {
              const service = booking.services;
              const startTime = new Date(booking.starts_at).toLocaleTimeString(
                "en-US",
                { hour: "numeric", minute: "2-digit" }
              );
              const endTime = new Date(booking.ends_at).toLocaleTimeString(
                "en-US",
                { hour: "numeric", minute: "2-digit" }
              );

              return (
                <a
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="text-right w-20 shrink-0">
                    <div className="text-sm font-semibold text-gray-700">
                      {startTime}
                    </div>
                    <div className="text-[11px] text-gray-400">{endTime}</div>
                  </div>

                  <div
                    className="w-1 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: service?.color || "#6366f1" }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {service?.emoji && (
                        <span className="text-lg">{service.emoji}</span>
                      )}
                      <span className="font-medium text-gray-800 truncate">
                        {service?.name || "Appointment"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {booking.client_name}
                    </div>
                  </div>

                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-600"
                        : booking.status === "completed"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {booking.status}
                  </div>

                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-400 transition-colors shrink-0" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
