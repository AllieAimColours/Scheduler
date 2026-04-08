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
import { ArrowLeft, Clock, Mail, Phone, User, StickyNote } from "lucide-react";
import Link from "next/link";
import { BookingActions } from "./booking-actions";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

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
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to bookings
      </Link>

      <div className="flex items-center gap-3">
        {service?.emoji && <span className="text-3xl">{service.emoji}</span>}
        <div>
          <h1 className="text-2xl font-bold">{service?.name || "Booking"}</h1>
          <p className="text-muted-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{booking.client_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{booking.client_email}</span>
          </div>
          {booking.client_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{booking.client_phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge>{booking.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span>
              {formatPrice(booking.payment_amount_cents)} ({booking.payment_status})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span>{service?.duration_minutes || "—"} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booked on</span>
            <span>{new Date(booking.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Client Notes
            </h4>
            <p className="text-sm">
              {booking.client_notes || "No notes from client"}
            </p>
          </div>
          <Separator />
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
