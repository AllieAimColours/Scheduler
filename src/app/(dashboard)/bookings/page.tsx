"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CalendarHeart } from "lucide-react";
import Link from "next/link";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-50 text-green-600",
  pending: "bg-amber-50 text-amber-600",
  completed: "bg-blue-50 text-blue-600",
  cancelled: "bg-red-50 text-red-600",
  no_show: "bg-gray-50 text-gray-600",
};

interface BookingRow {
  id: string;
  client_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
  payment_amount_cents: number;
  amount_collected_in_person_cents: number;
  payment_status: string;
  services: {
    name: string;
    emoji: string;
    color: string;
    duration_minutes: number;
    price_cents: number;
  } | null;
}

function groupByDate(bookings: BookingRow[]): Array<{ date: string; items: BookingRow[] }> {
  const groups = new Map<string, BookingRow[]>();
  for (const b of bookings) {
    const key = new Date(b.starts_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const list = groups.get(key) || [];
    list.push(b);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}

function formatDateLabel(isoString: string): { main: string; sub: string } {
  const d = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  if (diffDays === 0) return { main: "Today", sub: `${dayName}, ${monthDay}` };
  if (diffDays === 1) return { main: "Tomorrow", sub: `${dayName}, ${monthDay}` };
  if (diffDays === -1) return { main: "Yesterday", sub: `${dayName}, ${monthDay}` };
  if (diffDays > 1 && diffDays < 7) return { main: dayName, sub: monthDay };
  if (diffDays < -1 && diffDays > -7) return { main: `Last ${dayName}`, sub: monthDay };
  return {
    main: monthDay,
    sub: d.toLocaleDateString("en-US", { year: "numeric", weekday: "long" }),
  };
}

type Tab = "upcoming" | "past";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: provider } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!provider) return;

      const { data } = await supabase
        .from("bookings")
        .select("*, services(name, emoji, color, duration_minutes, price_cents)")
        .eq("provider_id", provider.id)
        .order("starts_at", { ascending: true });

      setBookings((data || []) as unknown as BookingRow[]);
      setLoading(false);
    }
    load();
  }, []);

  // Split into upcoming (today and future) and past.
  // "Today" includes bookings that haven't ended yet — so a booking
  // happening right now still shows under Upcoming until it ends.
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingItems: BookingRow[] = [];
    const pastItems: BookingRow[] = [];
    for (const b of bookings) {
      const endsAt = new Date(b.ends_at);
      if (endsAt >= now && b.status !== "cancelled") {
        upcomingItems.push(b);
      } else {
        pastItems.push(b);
      }
    }
    // Upcoming: ascending (today first, then tomorrow, then later)
    upcomingItems.sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
    // Past: descending (most recent first, oldest last)
    pastItems.sort(
      (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );
    return { upcoming: upcomingItems, past: pastItems };
  }, [bookings]);

  const activeList = tab === "upcoming" ? upcoming : past;
  const groups = groupByDate(activeList);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Bookings
        </h1>
        <p className="text-gray-400">
          View and manage all your appointments
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            tab === "upcoming"
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upcoming
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              tab === "upcoming" ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-500"
            }`}
          >
            {upcoming.length}
          </span>
        </button>
        <button
          onClick={() => setTab("past")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            tab === "past"
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Past
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              tab === "past" ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-500"
            }`}
          >
            {past.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          Loading…
        </div>
      ) : activeList.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg mb-6">
            <CalendarHeart className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {tab === "upcoming" ? "Your schedule is wide open" : "No past bookings yet"}
          </h3>
          <p className="text-gray-400 max-w-sm">
            {tab === "upcoming"
              ? "Share your booking link with clients and watch the appointments roll in!"
              : "Once you have completed appointments, they'll show up here."}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const label = formatDateLabel(group.items[0].starts_at);
            return (
              <section key={group.date}>
                {/* Big date header */}
                <div className="mb-4 pb-3 border-b-2 border-gray-100">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-800 leading-none">
                    {label.main}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">{label.sub}</p>
                </div>

                <div className="space-y-2">
                  {group.items.map((booking) => {
                    const service = booking.services;
                    const startTime = new Date(booking.starts_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    const endTime = new Date(booking.ends_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    return (
                      <Link
                        key={booking.id}
                        href={`/bookings/${booking.id}`}
                        className="block group"
                      >
                        <div className="relative flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-200 transition-all duration-300 overflow-hidden">
                          {service && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ background: service.color }}
                            />
                          )}

                          <div className="shrink-0 w-28 text-right pl-2">
                            <div className="font-display text-2xl md:text-3xl font-bold text-gray-800 leading-none tracking-tight">
                              {startTime}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">
                              to {endTime}
                            </div>
                          </div>

                          <div className="h-14 w-px bg-gray-100 shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg text-gray-800 truncate">
                                {booking.client_name}
                              </span>
                              <Badge
                                className={`${statusColors[booking.status] || ""} rounded-full border-0 font-medium text-[10px] shrink-0`}
                                variant="secondary"
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                              {service?.emoji && <span className="text-base">{service.emoji}</span>}
                              <span className="truncate">
                                {service?.name || "Unknown service"}
                                {service?.duration_minutes && ` · ${service.duration_minutes} min`}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right space-y-0.5 min-w-[140px]">
                            {(() => {
                              const svcPrice = service?.price_cents || 0;
                              const online = booking.payment_amount_cents;
                              const inPerson = booking.amount_collected_in_person_cents || 0;
                              const collected = online + inPerson;
                              const owed = Math.max(0, svcPrice - collected);
                              if (svcPrice === 0 && collected === 0) {
                                return <div className="text-xs text-gray-400 italic">Free</div>;
                              }
                              return (
                                <>
                                  {collected > 0 && (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Paid</span>
                                      <span className="font-semibold text-emerald-700 text-sm">
                                        {formatPrice(collected)}
                                      </span>
                                    </div>
                                  )}
                                  {owed > 0 && (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">Due</span>
                                      <span className="font-semibold text-amber-700 text-sm">
                                        {formatPrice(owed)}
                                      </span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
