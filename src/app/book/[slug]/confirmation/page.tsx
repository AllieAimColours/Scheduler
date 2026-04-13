import { createAdminClient } from "@/lib/supabase/admin";
import { ConfirmationContent } from "@/components/booking/confirmation-content";
import type { Booking, Service, Provider } from "@/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string; token?: string }>;
}

export default async function ConfirmationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { session_id, token } = await searchParams;
  const supabase = createAdminClient();

  // Always fetch the provider so we can show their name + address
  const { data: providerData } = await supabase
    .from("providers")
    .select("*")
    .eq("slug", slug)
    .single();

  const provider = providerData as unknown as Provider | null;

  // Try to find the booking by:
  // 1. Stripe session_id (paid path — set by Stripe's success redirect)
  // 2. Cancellation token (free path — passed as ?token= by the checkout route)
  let booking: Booking | null = null;
  let service: Service | null = null;

  if (provider) {
    if (session_id) {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("stripe_checkout_session_id", session_id)
        .single();
      booking = (data as unknown as Booking) || null;
    } else if (token) {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("cancellation_token", token)
        .single();
      booking = (data as unknown as Booking) || null;
    }

    if (booking) {
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("id", booking.service_id)
        .single();
      service = (serviceData as unknown as Service) || null;
    }
  }

  return (
    <ConfirmationContent
      booking={booking}
      service={service}
      provider={provider}
    />
  );
}
