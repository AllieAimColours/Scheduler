import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, CalendarHeart } from "lucide-react";
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
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Bookings
        </h1>
        <p className="text-gray-400">
          View and manage all your appointments
        </p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg mb-6">
              <CalendarHeart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your schedule is wide open</h3>
            <p className="text-gray-400 max-w-sm">
              Share your booking link with clients and watch the appointments roll in!
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
                <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden rounded-2xl border-gray-100 group">
                  {service && (
                    <div
                      className="absolute left-0 top-0 w-1.5 h-full rounded-l-2xl"
                      style={{
                        background: `linear-gradient(to bottom, ${service.color}, ${service.color}88)`,
                      }}
                    />
                  )}
                  <CardContent className="flex items-center justify-between py-4 pl-7">
                    <div className="flex items-center gap-4">
                      {service?.emoji && (
                        <div
                          className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-xl shadow-sm"
                          style={{ backgroundColor: `${service.color}15` }}
                        >
                          {service.emoji}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-gray-800">
                            {service?.name || "Unknown Service"}
                          </span>
                          <Badge
                            className={`${statusColors[booking.status] || ""} rounded-full border-0 font-medium`}
                            variant="secondary"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
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
                      <span className="font-semibold text-gray-800">
                        {formatPrice(booking.payment_amount_cents)}
                      </span>
                      <div className="text-xs text-gray-400">
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
