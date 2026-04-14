import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  completed: { label: "Completed", className: "bg-blue-50 text-blue-700", icon: CheckCircle2 },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700", icon: Calendar },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600", icon: XCircle },
  no_show: { label: "No-show", className: "bg-rose-50 text-rose-700", icon: UserX },
};

interface BookingRow {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  payment_amount_cents: number;
  payment_status: string;
  client_notes: string;
  provider_notes: string;
  services: {
    name: string;
    emoji: string;
    color: string;
    duration_minutes: number;
    price_cents: number;
  } | null;
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!provider) redirect("/onboarding");

  // Fetch all of this client's bookings
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, client_name, client_email, client_phone, starts_at, ends_at, status, payment_amount_cents, payment_status, client_notes, provider_notes, services(name, emoji, color, duration_minutes, price_cents)"
    )
    .eq("provider_id", provider.id)
    .eq("client_email", email)
    .order("starts_at", { ascending: false });

  const bookings = (data || []) as unknown as BookingRow[];

  if (bookings.length === 0) {
    notFound();
  }

  // Aggregate stats
  const latest = bookings[0];
  const totalBookings = bookings.length;
  const completedCount = bookings.filter(
    (b) => b.status === "completed" || b.status === "confirmed"
  ).length;
  const noShowCount = bookings.filter((b) => b.status === "no_show").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const totalSpent = bookings.reduce((s, b) => s + b.payment_amount_cents, 0);
  const totalOwed = bookings.reduce((s, b) => {
    if (b.status !== "completed" && b.status !== "confirmed") return s;
    const svcPrice = b.services?.price_cents || 0;
    return s + Math.max(0, svcPrice - b.payment_amount_cents);
  }, 0);

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => new Date(b.starts_at) > now && b.status !== "cancelled"
  );
  const past = bookings.filter(
    (b) => new Date(b.starts_at) <= now || b.status === "cancelled"
  );

  const flagged = noShowCount >= 3;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All clients
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {latest.client_name}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              {email}
            </a>
            {latest.client_phone && (
              <a
                href={`tel:${latest.client_phone}`}
                className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {latest.client_phone}
              </a>
            )}
          </div>
        </div>

        {flagged && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 border-2 border-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700">
              {noShowCount} no-shows — review
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Visits"
          value={totalBookings}
          icon={Calendar}
          gradient="from-violet-500 to-purple-600"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          gradient="from-emerald-500 to-green-600"
        />
        <StatCard
          label="No-shows"
          value={noShowCount}
          icon={UserX}
          gradient={flagged ? "from-rose-500 to-red-600" : "from-amber-500 to-orange-500"}
          warning={flagged}
        />
        <StatCard
          label="Cancelled"
          value={cancelledCount}
          icon={XCircle}
          gradient="from-gray-400 to-gray-600"
        />
      </div>

      {/* Payment summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Total spent online
          </div>
          <div className="text-2xl font-bold text-gray-800">{formatPrice(totalSpent)}</div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-4">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            Owes at appointments
          </div>
          <div className={`text-2xl font-bold ${totalOwed > 0 ? "text-amber-600" : "text-gray-800"}`}>
            {totalOwed > 0 ? formatPrice(totalOwed) : "—"}
          </div>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-2">
            {upcoming.map((b) => (
              <BookingListItem key={b.id} booking={b} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            History ({past.length})
          </h2>
          <div className="space-y-2">
            {past.map((b) => (
              <BookingListItem key={b.id} booking={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  warning,
}: {
  label: string;
  value: number;
  icon: typeof Calendar;
  gradient: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl bg-white border p-4 overflow-hidden ${
        warning ? "border-rose-200 shadow-md shadow-rose-100" : "border-gray-100"
      }`}
    >
      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-2`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className={`text-3xl font-bold ${warning ? "text-rose-700" : "text-gray-800"}`}>
        {value}
      </div>
      <div className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</div>
    </div>
  );
}

function BookingListItem({ booking }: { booking: BookingRow }) {
  const service = booking.services;
  const meta = STATUS_META[booking.status] || STATUS_META.confirmed;
  const StatusIcon = meta.icon;
  const date = new Date(booking.starts_at);

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-purple-200 transition-all"
    >
      <div className="shrink-0 w-20 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {date.toLocaleDateString("en-US", { month: "short" })}
        </div>
        <div className="font-display text-2xl font-bold text-gray-800 leading-none">
          {date.getDate()}
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>

      <div className="h-12 w-px bg-gray-100 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {service?.emoji && <span className="text-lg">{service.emoji}</span>}
          <span className="font-semibold text-gray-800 truncate">
            {service?.name || "Unknown service"}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {service?.duration_minutes && `${service.duration_minutes} min · `}
          {formatPrice(booking.payment_amount_cents)}{" "}
          <span className="text-gray-300">·</span> {booking.payment_status}
        </div>
      </div>

      <Badge
        className={`${meta.className} rounded-full border-0 font-medium text-[10px] shrink-0 inline-flex items-center gap-1`}
      >
        <StatusIcon className="h-3 w-3" />
        {meta.label}
      </Badge>
    </Link>
  );
}
