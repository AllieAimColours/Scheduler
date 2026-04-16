import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  Users,
  DollarSign,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface ProviderRow {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  email: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  created_at: string;
}

interface BookingRow {
  id: string;
  provider_id: string;
  client_name: string;
  client_email: string;
  starts_at: string;
  status: string;
  payment_amount_cents: number;
  amount_collected_in_person_cents: number;
  created_at: string;
}

interface NotificationRow {
  id: string;
  booking_id: string | null;
  channel: string;
  recipient: string;
  template: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface CalendarConnRow {
  id: string;
  provider_id: string;
  calendar_type: string;
  account_email: string | null;
  sync_error: string | null;
  created_at: string;
}

export default async function AdminPage() {
  const supabase = createAdminClient();

  // Fetch everything in parallel
  const [
    providersRes,
    servicesRes,
    bookingsRes,
    failedNotificationsRes,
    calConnErrorsRes,
  ] = await Promise.all([
    supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("services")
      .select("id, provider_id, is_active"),
    supabase
      .from("bookings")
      .select(
        "id, provider_id, client_name, client_email, starts_at, status, payment_amount_cents, amount_collected_in_person_cents, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("notifications")
      .select("*")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("calendar_connections")
      .select("id, provider_id, calendar_type, account_email, sync_error, created_at")
      .not("sync_error", "is", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const providers = (providersRes.data || []) as unknown as ProviderRow[];
  const services = (servicesRes.data || []) as unknown as { id: string; provider_id: string; is_active: boolean }[];
  const bookings = (bookingsRes.data || []) as unknown as BookingRow[];
  const failedNotifications = (failedNotificationsRes.data || []) as unknown as NotificationRow[];
  const calConnErrors = (calConnErrorsRes.data || []) as unknown as CalendarConnRow[];

  // Derived stats
  const totalProviders = providers.length;
  const providersWithStripe = providers.filter((p) => p.stripe_onboarding_complete).length;

  const servicesByProvider = new Map<string, number>();
  for (const s of services) {
    if (s.is_active) {
      servicesByProvider.set(s.provider_id, (servicesByProvider.get(s.provider_id) || 0) + 1);
    }
  }
  const providersWithServices = Array.from(servicesByProvider.values()).length;

  const bookingsByProvider = new Map<string, BookingRow[]>();
  for (const b of bookings) {
    const list = bookingsByProvider.get(b.provider_id) || [];
    list.push(b);
    bookingsByProvider.set(b.provider_id, list);
  }

  // Last 30 days activity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentBookings = bookings.filter((b) => b.created_at >= thirtyDaysAgo);
  const recentRevenue = recentBookings.reduce(
    (s, b) => s + (b.payment_amount_cents || 0) + (b.amount_collected_in_person_cents || 0),
    0
  );
  const recentSignups = providers.filter((p) => p.created_at >= thirtyDaysAgo).length;

  // Look up provider name for rendering
  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));

  const totalErrors = failedNotifications.length + calConnErrors.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-purple-700">
                Bloom · Operator
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Platform-wide view. Only you can see this page.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            ← Provider view
          </Link>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Providers"
            value={totalProviders}
            subtitle={`${recentSignups} in last 30d`}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            label="With Services"
            value={providersWithServices}
            subtitle={`${totalProviders > 0 ? Math.round((providersWithServices / totalProviders) * 100) : 0}% activated`}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            label="Bookings (30d)"
            value={recentBookings.length}
            subtitle={`Across all providers`}
            icon={CalendarDays}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatCard
            label="Volume (30d)"
            value={formatPrice(recentRevenue)}
            subtitle={`Gross collected`}
            icon={DollarSign}
            gradient="from-pink-500 to-rose-600"
          />
        </div>

        {/* Errors */}
        {totalErrors > 0 && (
          <section>
            <SectionHeader
              icon={AlertTriangle}
              iconColor="text-rose-600"
              title="Errors"
              count={totalErrors}
            />
            <div className="space-y-2">
              {failedNotifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-rose-100 shadow-sm"
                >
                  <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-rose-50 text-rose-600">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">
                        Email send failed
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium uppercase tracking-wider">
                        {n.template}
                      </span>
                      <span className="text-xs text-gray-400">· {timeAgo(n.created_at)}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      To: {n.recipient}
                    </div>
                    {n.error_message && (
                      <div className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2 mt-2 font-mono">
                        {n.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {calConnErrors.slice(0, 10).map((c) => {
                const prov = providerById[c.provider_id];
                return (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-amber-100 shadow-sm"
                  >
                    <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {c.calendar_type} calendar sync failing
                        </span>
                        <span className="text-xs text-gray-500">
                          · {prov?.business_name || "Unknown"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {c.account_email}
                      </div>
                      {c.sync_error && (
                        <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2 font-mono">
                          {c.sync_error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Providers */}
        <section>
          <SectionHeader
            icon={Users}
            iconColor="text-purple-600"
            title="All Providers"
            count={totalProviders}
          />
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-400">
                  <th className="text-left px-4 py-3 font-medium">Business</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="text-right px-4 py-3 font-medium">Services</th>
                  <th className="text-right px-4 py-3 font-medium">Bookings</th>
                  <th className="text-center px-4 py-3 font-medium">Stripe</th>
                  <th className="text-left px-4 py-3 font-medium">Signed up</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {providers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No providers yet
                    </td>
                  </tr>
                ) : (
                  providers.map((p) => {
                    const serviceCount = servicesByProvider.get(p.id) || 0;
                    const bookingCount = bookingsByProvider.get(p.id)?.length || 0;
                    const stripeState = p.stripe_onboarding_complete
                      ? "connected"
                      : p.stripe_account_id
                      ? "incomplete"
                      : "none";
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-gray-50 hover:bg-purple-50/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {p.business_name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.email || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                          /{p.slug}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {serviceCount === 0 ? (
                            <span className="text-rose-500">0</span>
                          ) : (
                            serviceCount
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{bookingCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              stripeState === "connected"
                                ? "bg-emerald-50 text-emerald-700"
                                : stripeState === "incomplete"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {stripeState}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {timeAgo(p.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`/book/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-purple-600 transition-colors"
                            title="View booking page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent bookings */}
        <section>
          <SectionHeader
            icon={TrendingUp}
            iconColor="text-emerald-600"
            title="Recent Bookings"
            count={bookings.length}
          />
          <div className="space-y-2">
            {bookings.slice(0, 15).map((b) => {
              const prov = providerById[b.provider_id];
              const collected = (b.payment_amount_cents || 0) + (b.amount_collected_in_person_cents || 0);
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div className="shrink-0 w-20 text-[11px] text-gray-400">
                    {timeAgo(b.created_at)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-800 truncate">
                        {b.client_name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {b.client_email}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {prov?.business_name || "Unknown"}
                      <ArrowUpRight className="inline h-2.5 w-2.5 mx-1 text-gray-300" />
                      {new Date(b.starts_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-semibold text-emerald-700 text-sm">
                      {collected > 0 ? formatPrice(collected) : "—"}
                    </div>
                    <div
                      className={`text-[10px] uppercase tracking-wider font-medium ${
                        b.status === "confirmed"
                          ? "text-emerald-600"
                          : b.status === "cancelled"
                          ? "text-rose-500"
                          : b.status === "no_show"
                          ? "text-rose-500"
                          : "text-gray-400"
                      }`}
                    >
                      {b.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: typeof Users;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-3`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
      {subtitle && <div className="text-[10px] text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  iconColor,
  title,
  count,
}: {
  icon: typeof Users;
  iconColor: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
        {title}
      </h2>
      {count !== undefined && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
          {count}
        </span>
      )}
    </div>
  );
}
