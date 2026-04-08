import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Mail, Phone, User, StickyNote, CalendarDays, CreditCard } from "lucide-react";
import Link from "next/link";
import { BookingActions } from "./booking-actions";

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

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, services(name, emoji, color, duration_minutes, price_cents)")
    .eq("id", id)
    .single() as { data: any };

  if (!booking) notFound();

  const service = booking.services as {
    name: string;
    emoji: string;
    color: string;
    duration_minutes: number;
    price_cents: number;
  } | null;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/bookings"
        className="inline-flex items-center text-sm text-gray-400 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to bookings
      </Link>

      <div className="flex items-center gap-4">
        {service?.emoji && (
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-3xl shadow-sm"
            style={{ backgroundColor: `${service.color}15` }}
          >
            {service.emoji}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {service?.name || "Booking"}
          </h1>
          <p className="text-gray-400">
            {new Date(booking.starts_at).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(booking.starts_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Client Info */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2.5">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
            Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Name</span>
            <span className="font-medium text-gray-800 ml-auto">{booking.client_name}</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Email</span>
            <span className="text-gray-800 ml-auto">{booking.client_email}</span>
          </div>
          {booking.client_phone && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Phone</span>
                <span className="text-gray-800 ml-auto">{booking.client_phone}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2.5">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Status</span>
            <Badge className={`${statusColors[booking.status] || ""} rounded-full border-0 font-medium`}>
              {booking.status}
            </Badge>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Payment</span>
            <span className="text-gray-800 font-medium">
              {formatPrice(booking.payment_amount_cents)}{" "}
              <span className="text-gray-400 font-normal">({booking.payment_status})</span>
            </span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Duration</span>
            <span className="text-gray-800">{service?.duration_minutes || "—"} min</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Booked on</span>
            <span className="text-gray-800">{new Date(booking.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-lg text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <StickyNote className="h-4 w-4 text-white" />
            </div>
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1.5">
              Client Notes
            </h4>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-xl p-3">
              {booking.client_notes || "No notes from client"}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <BookingActions
            bookingId={booking.id}
            currentStatus={booking.status}
            currentNotes={booking.provider_notes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
