import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Heart, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function ClientsPage() {
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

  // Include ALL bookings (including cancelled and no_show) so we can count them
  const { data: bookings } = await supabase
    .from("bookings")
    .select("client_name, client_email, client_phone, payment_amount_cents, status, starts_at, created_at, services(price_cents)")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false }) as { data: Array<{
      client_name: string;
      client_email: string;
      client_phone: string | null;
      payment_amount_cents: number;
      status: string;
      starts_at: string;
      created_at: string;
      services: { price_cents: number } | null;
    }> | null };

  // Group by email
  const clientMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string | null;
      bookingCount: number;
      noShowCount: number;
      cancelledCount: number;
      totalSpent: number;
      totalOwed: number;
      lastVisit: string;
    }
  >();

  for (const b of bookings || []) {
    const servicePriceCents = b.services?.price_cents || 0;
    const owedThisBooking = b.status === "completed" || b.status === "confirmed"
      ? Math.max(0, servicePriceCents - b.payment_amount_cents)
      : 0;
    const existing = clientMap.get(b.client_email);
    if (existing) {
      existing.bookingCount++;
      if (b.status === "no_show") existing.noShowCount++;
      if (b.status === "cancelled") existing.cancelledCount++;
      existing.totalSpent += b.payment_amount_cents;
      existing.totalOwed += owedThisBooking;
    } else {
      clientMap.set(b.client_email, {
        name: b.client_name,
        email: b.client_email,
        phone: b.client_phone,
        bookingCount: 1,
        noShowCount: b.status === "no_show" ? 1 : 0,
        cancelledCount: b.status === "cancelled" ? 1 : 0,
        totalSpent: b.payment_amount_cents,
        totalOwed: owedThisBooking,
        lastVisit: b.starts_at,
      });
    }
  }

  const clients = Array.from(clientMap.values()).sort((a, b) => {
    // Flagged clients (3+ no-shows) bubble to the top
    const aFlagged = a.noShowCount >= 3;
    const bFlagged = b.noShowCount >= 3;
    if (aFlagged && !bFlagged) return -1;
    if (!aFlagged && bFlagged) return 1;
    return b.totalSpent - a.totalSpent;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Clients
        </h1>
        <p className="text-gray-400">
          Click a client to see their full history, notes, and attendance
        </p>
      </div>

      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span>Clients</span>
            <Badge className="rounded-full bg-purple-50 text-purple-600 border-0 ml-1">
              {clients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your future regulars are out there</h3>
              <p className="text-gray-400 max-w-sm">
                Clients will appear here automatically after their first booking. Share your link and watch the list grow!
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-x-auto border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="text-gray-400 font-medium">Name</TableHead>
                    <TableHead className="text-gray-400 font-medium">Email</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">Visits</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">No-shows</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">Deposits Paid</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">Due at Appt</TableHead>
                    <TableHead className="text-gray-400 font-medium">Last Visit</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const flagged = client.noShowCount >= 3;
                    return (
                      <TableRow
                        key={client.email}
                        className="hover:bg-purple-50/30 transition-colors cursor-pointer"
                      >
                        <TableCell className="font-medium text-gray-800">
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="flex items-center gap-2"
                          >
                            {flagged && (
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                            )}
                            {client.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="block"
                          >
                            {client.email}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="block"
                          >
                            <Badge className="rounded-full bg-blue-50 text-blue-600 border-0">
                              {client.bookingCount}
                            </Badge>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="block"
                          >
                            {client.noShowCount > 0 ? (
                              <Badge
                                className={`rounded-full border-0 font-semibold ${
                                  flagged
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {client.noShowCount}
                              </Badge>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-800">
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="block"
                          >
                            {formatPrice(client.totalSpent)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-amber-600">
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="block"
                          >
                            {client.totalOwed > 0 ? formatPrice(client.totalOwed) : "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="block"
                          >
                            {new Date(client.lastVisit).toLocaleDateString()}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/clients/${encodeURIComponent(client.email)}`}
                            className="block text-gray-300 hover:text-purple-600 transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
