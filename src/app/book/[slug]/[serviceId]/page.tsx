"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, DollarSign, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ThemedCard } from "@/components/booking/themed-card";
import { ThemedButton } from "@/components/booking/themed-button";
import { ThemedTimeSlot } from "@/components/booking/themed-time-slot";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";

interface TimeSlot {
  start: string;
  end: string;
}

interface ServiceInfo {
  name: string;
  emoji: string;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
  color: string;
}

interface PolicyRule {
  hours_before: number;
  refund_percent: number;
}

interface CancellationPolicyInfo {
  enabled: boolean;
  rules: PolicyRule[];
  policy_text: string;
}

interface DepositInfo {
  deposit_cents: number;
  source: "service" | "policy" | "none";
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const serviceId = params.serviceId as string;

  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"date" | "time" | "details">("date");
  const [providerId, setProviderId] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicyInfo | null>(null);
  const [effectiveDeposit, setEffectiveDeposit] = useState<DepositInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch service info
  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(
          `/api/bookings?action=service-info&slug=${slug}&serviceId=${serviceId}`
        );
        if (res.ok) {
          const data = await res.json();
          setService(data.service);
          setProviderId(data.providerId);
          if (data.cancellationPolicy) {
            setCancellationPolicy(data.cancellationPolicy);
          }
          if (data.effectiveDeposit) {
            setEffectiveDeposit(data.effectiveDeposit);
          }
        } else {
          const errorData = await res.json().catch(() => ({}));
          setLoadError(errorData.error || `Failed to load service (${res.status})`);
          console.error("Service fetch failed:", res.status, errorData);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Network error");
        console.error("Service fetch error:", err);
      }
    }
    fetchService();
  }, [slug, serviceId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate || !providerId) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await fetch(
        `/api/availability?providerId=${providerId}&serviceId=${serviceId}&date=${selectedDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
      setLoadingSlots(false);
    }
    fetchSlots();
  }, [selectedDate, providerId, serviceId]);

  async function handleBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId,
        serviceId,
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end,
        clientName: form.get("client_name"),
        clientEmail: form.get("client_email"),
        clientPhone: form.get("client_phone"),
        clientNotes: form.get("client_notes"),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    if (res.ok) {
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        // Free service — booking created directly
        router.push(`/book/${slug}/confirmation`);
      }
    } else {
      setSubmitting(false);
    }
  }

  // Get tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Max date: 30 days out
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-2xl font-semibold mb-2">Couldn&apos;t load this service</div>
          <p className="opacity-70 mb-4">{loadError}</p>
          <Link
            href={`/book/${slug}`}
            className="inline-flex items-center text-sm underline opacity-70 hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to services
          </Link>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse opacity-60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href={`/book/${slug}`}
        className="inline-flex items-center text-sm opacity-60 hover:opacity-100 mb-6 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to services
      </Link>

      {/* Service Header */}
      <ThemedCard className="mb-6 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: service.color }}
        />
        <div className="flex items-center gap-4 pt-2">
          {service.emoji && (
            <span className="text-3xl">{service.emoji}</span>
          )}
          <div>
            <h1 className={`text-xl font-bold ${template.classes.heading}`}>
              {service.name}
            </h1>
            <div className="flex items-center gap-4 text-sm opacity-60 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {service.duration_minutes} min
              </span>
              <span className="flex items-center gap-1 font-semibold opacity-100">
                <DollarSign className="h-4 w-4" />
                {formatPrice(service.price_cents)}
              </span>
            </div>
          </div>
        </div>
      </ThemedCard>

      {/* Date Selection */}
      <ThemedCard index={1} className="mb-6">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Calendar className="h-5 w-5" />
          <span className={template.classes.heading}>Select a Date</span>
        </div>
        <input
          type="date"
          min={minDate}
          max={maxDateStr}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setStep("time");
          }}
          className={`w-full ${template.classes.input}`}
        />
      </ThemedCard>

      {/* Time Slots */}
      {selectedDate && (
        <ThemedCard index={2} className="mb-6">
          <div className={`text-lg font-semibold mb-4 ${template.classes.heading}`}>
            Available Times
          </div>
          {loadingSlots ? (
            <div className="text-center py-6 opacity-60">
              Loading available times...
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6 opacity-60">
              No available times for this date. Try another day.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <ThemedTimeSlot
                  key={slot.start}
                  isSelected={selectedSlot?.start === slot.start}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep("details");
                  }}
                >
                  {formatTime(slot.start)}
                </ThemedTimeSlot>
              ))}
            </div>
          )}
        </ThemedCard>
      )}

      {/* Booking Details Form */}
      {selectedSlot && (
        <ThemedCard index={3}>
          <div className={`text-lg font-semibold mb-4 ${template.classes.heading}`}>
            Your Details
          </div>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Full Name</Label>
              <input
                id="client_name"
                name="client_name"
                placeholder="Jane Smith"
                required
                className={`w-full ${template.classes.input}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Email</Label>
              <input
                id="client_email"
                name="client_email"
                type="email"
                placeholder="jane@example.com"
                required
                className={`w-full ${template.classes.input}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_phone">Phone (optional)</Label>
              <input
                id="client_phone"
                name="client_phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className={`w-full ${template.classes.input}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_notes">
                Notes for your provider (optional)
              </Label>
              <textarea
                id="client_notes"
                name="client_notes"
                placeholder="Any special requests, reference photos you'll bring, etc."
                rows={3}
                className={`w-full ${template.classes.input}`}
              />
            </div>

            <div className={template.classes.summaryBox}>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium">
                    {new Date(selectedDate + "T00:00").toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time</span>
                  <span className="font-medium">
                    {formatTime(selectedSlot.start)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className={`flex justify-between font-semibold pt-2 border-t ${template.classes.heading}`}>
                  <span>
                    {(effectiveDeposit && effectiveDeposit.deposit_cents > 0)
                      ? "Deposit due now"
                      : service.deposit_cents > 0
                      ? "Deposit due now"
                      : "Total"}
                  </span>
                  <span>
                    {formatPrice(
                      effectiveDeposit && effectiveDeposit.deposit_cents > 0
                        ? effectiveDeposit.deposit_cents
                        : service.deposit_cents > 0
                        ? service.deposit_cents
                        : service.price_cents
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation policy notice */}
            {cancellationPolicy?.enabled && (
              <div className="rounded-xl border border-gray-200/60 bg-gray-50/50 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  Cancellation Policy
                </div>
                {cancellationPolicy.policy_text ? (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {cancellationPolicy.policy_text}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {[...cancellationPolicy.rules]
                      .sort((a, b) => b.hours_before - a.hours_before)
                      .map((rule, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              rule.refund_percent === 100
                                ? "bg-green-400"
                                : rule.refund_percent > 0
                                ? "bg-amber-400"
                                : "bg-red-400"
                            }`}
                          />
                          {rule.hours_before === 0
                            ? "Same-day cancellation"
                            : `${rule.hours_before}+ hrs before`}
                          : {rule.refund_percent}% refund
                        </div>
                      ))}
                  </div>
                )}
                <p className="text-[11px] text-gray-400">
                  By booking, you agree to this cancellation policy.
                </p>
              </div>
            )}

            <ThemedButton
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting
                ? "Processing..."
                : service.price_cents === 0
                ? "Confirm Booking"
                : `Book & Pay ${formatPrice(
                    effectiveDeposit && effectiveDeposit.deposit_cents > 0
                      ? effectiveDeposit.deposit_cents
                      : service.deposit_cents > 0
                      ? service.deposit_cents
                      : service.price_cents
                  )}`}
            </ThemedButton>
          </form>
        </ThemedCard>
      )}
    </div>
  );
}
