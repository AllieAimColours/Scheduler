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
import { Users, Heart } from "lucide-react";

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

  // Aggregate clients from bookings — join service price to calculate owed
  const { data: bookings } = await supabase
    .from("bookings")
    .select("client_name, client_email, client_phone, payment_amount_cents, created_at, services(price_cents)")
    .eq("provider_id", provider.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false }) as { data: Array<{
      client_name: string;
      client_email: string;
      client_phone: string | null;
      payment_amount_cents: number;
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
      totalSpent: number;
      totalOwed: number;
      lastVisit: string;
    }
  >();

  for (const b of bookings || []) {
    const servicePriceCents = b.services?.price_cents || 0;
    const owedThisBooking = Math.max(0, servicePriceCents - b.payment_amount_cents);
    const existing = clientMap.get(b.client_email);
    if (existing) {
      existing.bookingCount++;
      existing.totalSpent += b.payment_amount_cents;
      existing.totalOwed += owedThisBooking;
    } else {
      clientMap.set(b.client_email, {
        name: b.client_name,
        email: b.client_email,
        phone: b.client_phone,
        bookingCount: 1,
        totalSpent: b.payment_amount_cents,
        totalOwed: owedThisBooking,
        lastVisit: b.created_at,
      });
    }
  }

  const clients = Array.from(clientMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Clients
        </h1>
        <p className="text-gray-400">
          Your client list, auto-built from bookings
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
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="text-gray-400 font-medium">Name</TableHead>
                    <TableHead className="text-gray-400 font-medium">Email</TableHead>
                    <TableHead className="text-gray-400 font-medium">Phone</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">Bookings</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">Deposits Paid</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">Due at Appt</TableHead>
                    <TableHead className="text-gray-400 font-medium">Last Visit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.email} className="hover:bg-purple-50/30 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-gray-600">{client.email}</TableCell>
                      <TableCell className="text-gray-400">{client.phone || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="rounded-full bg-blue-50 text-blue-600 border-0">
                          {client.bookingCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-800">
                        {formatPrice(client.totalSpent)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-amber-600">
                        {client.totalOwed > 0 ? formatPrice(client.totalOwed) : "—"}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(client.lastVisit).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
