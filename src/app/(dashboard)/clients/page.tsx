import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";

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

  // Aggregate clients from bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("client_name, client_email, client_phone, payment_amount_cents, created_at")
    .eq("provider_id", provider.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  // Group by email
  const clientMap = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string | null;
      bookingCount: number;
      totalSpent: number;
      lastVisit: string;
    }
  >();

  for (const b of bookings || []) {
    const existing = clientMap.get(b.client_email);
    if (existing) {
      existing.bookingCount++;
      existing.totalSpent += b.payment_amount_cents;
    } else {
      clientMap.set(b.client_email, {
        name: b.client_name,
        email: b.client_email,
        phone: b.client_phone,
        bookingCount: 1,
        totalSpent: b.payment_amount_cents,
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
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Your client list, auto-built from bookings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {clients.length} Client{clients.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No clients yet. They&apos;ll appear here after their first booking.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.email}>
                    <TableCell className="font-medium">
                      {client.name}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || "—"}</TableCell>
                    <TableCell className="text-right">
                      {client.bookingCount}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice(client.totalSpent)}
                    </TableCell>
                    <TableCell>
                      {new Date(client.lastVisit).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
