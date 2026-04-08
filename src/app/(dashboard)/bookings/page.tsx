import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User } from "lucide-react";
import Link from "next/link";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
};

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

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, services(name, emoji, color, duration_minutes)")
    .eq("provider_id", provider.id)
    .order("starts_at", { ascending: false })
    .limit(50) as { data: any[] | null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          View and manage all your appointments
        </p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">
              Share your booking link to start receiving appointments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const service = booking.services as {
              name: string;
              emoji: string;
              color: string;
              duration_minutes: number;
            } | null;

            return (
              <Link key={booking.id} href={`/bookings/${booking.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                  {service && (
                    <div
                      className="absolute left-0 top-0 w-1 h-full"
                      style={{ backgroundColor: service.color }}
                    />
                  )}
                  <CardContent className="flex items-center justify-between py-4 pl-6">
                    <div className="flex items-center gap-4">
                      {service?.emoji && (
                        <span className="text-2xl">{service.emoji}</span>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {service?.name || "Unknown Service"}
                          </span>
                          <Badge
                            className={statusColors[booking.status] || ""}
                            variant="secondary"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {booking.client_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(booking.starts_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}{" "}
                            at{" "}
                            {new Date(booking.starts_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">
                        {formatPrice(booking.payment_amount_cents)}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {booking.payment_status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
