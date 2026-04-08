"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, CheckCircle } from "lucide-react";

export default function PaymentsPage() {
  const [provider, setProvider] = useState<{
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProvider() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("providers")
        .select("stripe_account_id, stripe_onboarding_complete")
        .eq("user_id", user.id)
        .single();

      setProvider(data);
    }
    fetchProvider();
  }, []);

  async function handleConnect() {
    setLoading(true);
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Manage your payment setup and view earnings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments from bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!provider ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : provider.stripe_onboarding_complete ? (
            <div className="flex items-center gap-3">
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <span className="text-sm text-muted-foreground">
                Your Stripe account is set up and ready to receive payments
              </span>
            </div>
          ) : provider.stripe_account_id ? (
            <div className="space-y-3">
              <Badge variant="secondary">Setup Incomplete</Badge>
              <p className="text-sm text-muted-foreground">
                You started connecting Stripe but didn&apos;t finish. Complete
                the setup to start receiving payments.
              </p>
              <Button onClick={handleConnect} disabled={loading}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Complete Stripe Setup"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to accept credit card payments from
                clients. Funds are deposited directly to your bank account.
              </p>
              <Button onClick={handleConnect} disabled={loading}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Connect with Stripe"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
