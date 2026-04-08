export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign } from "lucide-react";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!provider) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("is_active", true)
    .order("sort_order");

  const branding = (provider.branding as Record<string, string>) || {};
  const primaryColor = branding.primary_color || "#6366f1";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50"
      style={
        {
          "--brand-primary": primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Business Header */}
        <div className="text-center mb-10">
          {provider.logo_url && (
            <img
              src={provider.logo_url}
              alt={provider.business_name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight">
            {provider.business_name}
          </h1>
          {provider.description && (
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {provider.description}
            </p>
          )}
        </div>

        {/* Services */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-center mb-6">
            Choose a service to book
          </h2>

          {!services || services.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No services available at the moment. Check back soon!
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Link
                key={service.id}
                href={`/book/${slug}/${service.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 w-1 h-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <CardContent className="flex items-center justify-between py-5 pl-6">
                    <div className="flex items-center gap-3">
                      {service.emoji && (
                        <span className="text-2xl">{service.emoji}</span>
                      )}
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">
                        {formatPrice(service.price_cents)}
                      </span>
                      {service.deposit_cents > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(service.deposit_cents)} deposit
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
