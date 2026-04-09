"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Clock, Calendar, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface BookingInfo {
  id: string;
  client_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
  payment_amount_cents: number;
  cancelled_at?: string;
  refund_amount_cents?: number;
}

interface ServiceInfo {
  name: string;
  emoji: string;
  duration_minutes: number;
}

interface PolicyRule {
  hours_before: number;
  refund_percent: number;
}

interface CancelPageData {
  booking: BookingInfo;
  service: ServiceInfo;
  provider?: { business_name: string };
  policy?: {
    enabled: boolean;
    rules: PolicyRule[];
    policy_text: string;
  };
  estimated_refund_cents?: number;
  already_cancelled: boolean;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CancelBookingPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<CancelPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [refundResult, setRefundResult] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/cancel/${token}`);
      if (!res.ok) {
        setError("This cancellation link is invalid or has expired.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      if (json.already_cancelled) {
        setCancelled(true);
        setRefundResult(json.booking.refund_amount_cents || 0);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch(`/api/cancel/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    if (res.ok) {
      const result = await res.json();
      setCancelled(true);
      setRefundResult(result.refund_amount_cents);
    } else {
      setError("Something went wrong. Please try again or contact your provider.");
    }
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="inline-flex p-4 rounded-full bg-red-50 mb-4">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Link Not Found
          </h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { booking, service, provider, policy, estimated_refund_cents } = data;

  // Already cancelled / confirmation state
  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="inline-flex p-4 rounded-full bg-green-50 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Appointment Cancelled
          </h1>
          <p className="text-gray-500 mb-4">
            Your appointment for{" "}
            <span className="font-medium text-gray-700">{service.name}</span> on{" "}
            <span className="font-medium text-gray-700">
              {formatDate(booking.starts_at)}
            </span>{" "}
            has been cancelled.
          </p>
          {refundResult > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-green-700 font-medium">
                Refund of {formatPrice(refundResult)} will be processed
              </p>
              <p className="text-green-600 text-sm mt-1">
                Please allow 5-10 business days for the refund to appear.
              </p>
            </div>
          )}
          {refundResult === 0 && booking.payment_amount_cents > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-amber-700 text-sm">
                Based on the cancellation policy, no refund is available for this cancellation.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const sortedRules = policy?.rules
    ? [...policy.rules].sort((a, b) => b.hours_before - a.hours_before)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-amber-50 mb-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Cancel Your Appointment?
          </h1>
          {provider && (
            <p className="text-gray-400 mt-1">
              with {provider.business_name}
            </p>
          )}
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
          <div className="flex items-center gap-3">
            {service.emoji && (
              <span className="text-2xl">{service.emoji}</span>
            )}
            <div>
              <p className="font-semibold text-gray-800">{service.name}</p>
              <p className="text-sm text-gray-400">
                {service.duration_minutes} minutes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-purple-400" />
            {formatDate(booking.starts_at)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-purple-400" />
            {formatTime(booking.starts_at)} &ndash; {formatTime(booking.ends_at)}
          </div>
        </div>

        {/* Cancellation policy */}
        {policy?.enabled && sortedRules.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-3">
              Cancellation Policy
            </h2>
            <div className="space-y-2">
              {sortedRules.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      rule.refund_percent === 100
                        ? "bg-green-400"
                        : rule.refund_percent > 0
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  />
                  <span className="text-gray-600">
                    {rule.hours_before === 0
                      ? "Less than the minimum notice"
                      : `${rule.hours_before}+ hours before`}
                  </span>
                  <span className="ml-auto font-medium text-gray-800">
                    {rule.refund_percent}% refund
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refund estimate */}
        {booking.payment_amount_cents > 0 && (
          <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/50 rounded-2xl p-5 border border-purple-100/60">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount paid</span>
              <span className="font-medium text-gray-800">
                {formatPrice(booking.payment_amount_cents)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-purple-100/60">
              <span className="font-semibold text-gray-800">
                Estimated refund
              </span>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {formatPrice(estimated_refund_cents ?? 0)}
              </span>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let your provider know why you need to cancel..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
          />
        </div>

        {/* Cancel button */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full py-3 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel Appointment"}
        </button>
        <p className="text-xs text-center text-gray-400">
          This action cannot be undone.
        </p>
      </div>
    </div>
  );
}
