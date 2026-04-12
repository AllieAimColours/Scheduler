import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PeonyMark } from "@/components/peony-mark";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: provider } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!provider) redirect("/onboarding");

  // Fetch today's bookings
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: todayBookings } = await supabase
    .from("bookings")
    .select("*, services(name, emoji, color, duration_minutes)")
    .eq("provider_id", provider.id)
    .gte("starts_at", startOfDay.toISOString())
    .lte("starts_at", endOfDay.toISOString())
    .neq("status", "cancelled")
    .order("starts_at") as { data: any[] | null };

  // Fetch this week's stats (Monday-based week)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const { data: weekBookings } = await supabase
    .from("bookings")
    .select("payment_amount_cents, services(price_cents)")
    .eq("provider_id", provider.id)
    .gte("starts_at", startOfWeek.toISOString())
    .neq("status", "cancelled") as { data: Array<{
      payment_amount_cents: number;
      services: { price_cents: number } | null;
    }> | null };

  const { count: totalClients } = await supabase
    .from("bookings")
    .select("client_email", { count: "exact", head: true })
    .eq("provider_id", provider.id)
    .neq("status", "cancelled");

  const weekDeposits = (weekBookings || []).reduce(
    (sum, b) => sum + (b.payment_amount_cents || 0),
    0
  );
  const weekDueAtAppt = (weekBookings || []).reduce(
    (sum, b) => {
      const svcPrice = b.services?.price_cents || 0;
      return sum + Math.max(0, svcPrice - (b.payment_amount_cents || 0));
    },
    0
  );
  const weekTotalRevenue = weekDeposits + weekDueAtAppt;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = provider.business_name.split(" ")[0];

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
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Bookings",
            value: todayBookings?.length || 0,
            icon: CalendarDays,
            gradient: "from-violet-500 to-purple-600",
            bgGlow: "bg-violet-500/10",
          },
          {
            label: `Revenue · ${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${new Date(startOfWeek.getTime() + 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            value: `$${(weekTotalRevenue / 100).toFixed(0)}`,
            subtitle: weekDeposits > 0 || weekDueAtAppt > 0
              ? `$${(weekDeposits / 100).toFixed(0)} deposits · $${(weekDueAtAppt / 100).toFixed(0)} at appt`
              : undefined,
            icon: DollarSign,
            gradient: "from-pink-500 to-rose-600",
            bgGlow: "bg-pink-500/10",
          },
          {
            label: "Total Clients",
            value: totalClients || 0,
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
            bgGlow: "bg-blue-500/10",
          },
          {
            label: "Bookings This Week",
            value: weekBookings?.length || 0,
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

        {!todayBookings || todayBookings.length === 0 ? (
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
            {todayBookings.map((booking: any) => {
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
