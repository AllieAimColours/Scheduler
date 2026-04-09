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
import { CreditCard, ExternalLink, CheckCircle, Sparkles } from "lucide-react";

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
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Payments
        </h1>
        <p className="text-gray-400">
          Manage your payment setup and view earnings
        </p>
      </div>

      <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-gray-800">
            <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            Stripe Connect
          </CardTitle>
          <CardDescription className="text-gray-400">
            Connect your Stripe account to receive payments from bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!provider ? (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              Loading...
            </div>
          ) : provider.stripe_onboarding_complete ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50/80 border border-green-100">
              <Badge
                className="rounded-full bg-green-100 text-green-600 border-0"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <span className="text-sm text-gray-600">
                Your Stripe account is set up and ready to receive payments
              </span>
            </div>
          ) : provider.stripe_account_id ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-100">
                <Badge className="rounded-full bg-amber-100 text-amber-600 border-0">Setup Incomplete</Badge>
                <p className="text-sm text-gray-600">
                  You started connecting Stripe but didn&apos;t finish.
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Complete Stripe Setup"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <Sparkles className="h-5 w-5 text-purple-500 shrink-0" />
                <p className="text-sm text-gray-600">
                  Connect your Stripe account to accept credit card payments from
                  clients. Funds are deposited directly to your bank account.
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
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
