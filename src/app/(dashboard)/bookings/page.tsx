import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
  payment_status: string;
  services: {
    name: string;
    emoji: string;
    color: string;
    duration_minutes: number;
  } | null;
}

/**
 * Group bookings by calendar date (YYYY-MM-DD) preserving the order they
 * came in (which is chronological desc from the query).
 */
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

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: provider } = await supabase
    .from("providers")
    .select("id, timezone")
    .eq("user_id", user.id)
    .single();
  if (!provider) redirect("/onboarding");

  const { data } = await supabase
    .from("bookings")
    .select("*, services(name, emoji, color, duration_minutes)")
    .eq("provider_id", provider.id)
    .order("starts_at", { ascending: false })
    .limit(100);

  const bookings = (data || []) as unknown as BookingRow[];
  const groups = groupByDate(bookings);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Bookings
        </h1>
        <p className="text-gray-400">
          View and manage all your appointments
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg mb-6">
            <CalendarHeart className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Your schedule is wide open</h3>
          <p className="text-gray-400 max-w-sm">
            Share your booking link with clients and watch the appointments roll in!
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

                {/* Bookings for this date */}
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
                        <div
                          className="relative flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-200 transition-all duration-300 overflow-hidden"
                        >
                          {/* Colored left accent */}
                          {service && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ background: service.color }}
                            />
                          )}

                          {/* BIG time */}
                          <div className="shrink-0 w-28 text-right pl-2">
                            <div className="font-display text-2xl md:text-3xl font-bold text-gray-800 leading-none tracking-tight">
                              {startTime}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">
                              to {endTime}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="h-14 w-px bg-gray-100 shrink-0" />

                          {/* Client (primary) + service (secondary) */}
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

                          {/* Payment */}
                          <div className="shrink-0 text-right">
                            <div className="font-semibold text-gray-800">
                              {formatPrice(booking.payment_amount_cents)}
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                              {booking.payment_status}
                            </div>
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
