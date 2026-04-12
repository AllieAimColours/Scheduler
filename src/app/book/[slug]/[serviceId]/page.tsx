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
import {
  ThemedAvailabilityCalendar,
  type CalendarRange,
} from "@/components/booking/themed-availability-calendar";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

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
  const [calendarRange, setCalendarRange] = useState<CalendarRange>("month");
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
          if (data.calendarRange) {
            setCalendarRange(data.calendarRange as CalendarRange);
          }
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

  // Visual stepper — highlights whichever step the user is currently on
  const stepperSteps: Array<{ id: typeof step; label: string; done: boolean }> = [
    { id: "date", label: "Date", done: !!selectedDate },
    { id: "time", label: "Time", done: !!selectedSlot },
    { id: "details", label: "Details", done: false },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <Link
        href={`/book/${slug}`}
        className="inline-flex items-center text-sm opacity-60 hover:opacity-100 mb-6 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to services
      </Link>

      {/* Service Header — premium, full-bleed accent stripe, larger heading */}
      <ThemedCard className="mb-6 relative overflow-hidden p-6 md:p-8">
        <div
          className="absolute top-0 left-0 w-full h-1.5"
          style={{ backgroundColor: service.color }}
        />
        <div className="flex items-start gap-5 pt-2">
          {service.emoji && (
            <div
              className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl md:text-5xl shadow-lg"
              style={{
                backgroundColor: `${service.color}15`,
                boxShadow: `0 8px 32px ${service.color}25`,
              }}
            >
              {service.emoji}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className={cn(template.classes.heading, "text-3xl md:text-4xl leading-tight mb-2")}>
              {service.name}
            </h1>
            <div className="flex items-center gap-5 text-sm md:text-base opacity-75">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {service.duration_minutes} min
              </span>
              <span className={cn("flex items-center gap-1.5 font-bold", template.classes.heading)}>
                <DollarSign className="h-4 w-4" />
                {formatPrice(service.price_cents)}
              </span>
            </div>
          </div>
        </div>
      </ThemedCard>

      {/* Visual stepper — shows progress through Date → Time → Details */}
      <div className="flex items-center gap-2 md:gap-3 mb-6 px-1">
        {stepperSteps.map((s, i) => {
          const isActive = step === s.id;
          const isDone = s.done && !isActive;
          return (
            <div key={s.id} className="flex items-center gap-2 md:gap-3 flex-1">
              <div
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-xs font-bold shrink-0 transition-all duration-300",
                  isActive && "shadow-lg scale-110",
                  !isActive && !isDone && "opacity-40"
                )}
                style={{
                  backgroundColor: isActive || isDone ? "var(--template-accent)" : "var(--template-surface)",
                  color: isActive || isDone ? "var(--primary-foreground, #fff)" : "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <div className={cn("text-xs md:text-sm font-semibold", !isActive && !isDone && "opacity-50")}>
                {s.label}
              </div>
              {i < stepperSteps.length - 1 && (
                <div className="flex-1 h-px opacity-20" style={{ backgroundColor: "var(--foreground)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Date Selection — themed availability calendar with color-coded days */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <ThemedAvailabilityCalendar
          providerId={providerId}
          serviceId={serviceId}
          value={selectedDate}
          range={calendarRange}
          onSelect={(date) => {
            setSelectedDate(date);
            setStep("time");
          }}
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <ThemedCard index={2} className="mb-6 p-6">
          <div className={cn("text-xl font-bold mb-5", template.classes.heading)}>
            Pick a time
          </div>
          {loadingSlots ? (
            <div className="text-center py-8 opacity-60">
              <div className="inline-block w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin mb-2" />
              <div className="text-sm">Loading available times…</div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 opacity-60 text-sm">
              No available times for this date. Try another day.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
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
                {(() => {
                  // Resolve what the client actually owes now vs at the appointment.
                  // effectiveDeposit (from the policy) wins over the service's own
                  // deposit_cents. If neither is set, there's no deposit.
                  const depositCents =
                    effectiveDeposit && effectiveDeposit.deposit_cents > 0
                      ? effectiveDeposit.deposit_cents
                      : service.deposit_cents > 0
                      ? service.deposit_cents
                      : 0;
                  const totalCents = service.price_cents;
                  const remainderCents = Math.max(0, totalCents - depositCents);
                  const hasDeposit = depositCents > 0 && depositCents < totalCents;

                  return (
                    <>
                      <div className={`flex justify-between pt-2 border-t ${template.classes.heading}`}>
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">{formatPrice(totalCents)}</span>
                      </div>
                      {hasDeposit && (
                        <>
                          <div className="flex justify-between text-xs pt-1">
                            <span className="opacity-70">Due now (deposit)</span>
                            <span className="font-medium">{formatPrice(depositCents)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="opacity-70">Due at appointment</span>
                            <span className="font-medium">{formatPrice(remainderCents)}</span>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Cancellation policy notice */}
            {cancellationPolicy?.enabled && (
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent-color,#a78bfa)]" />
                  Cancellation Policy
                </div>
                {cancellationPolicy.policy_text ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cancellationPolicy.policy_text}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {[...cancellationPolicy.rules]
                      .sort((a, b) => b.hours_before - a.hours_before)
                      .map((rule, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              rule.refund_percent === 100
                                ? "bg-emerald-500"
                                : rule.refund_percent > 0
                                ? "bg-amber-500"
                                : "bg-rose-500"
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
                <p className="text-[11px] text-muted-foreground/80">
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
