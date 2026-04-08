"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

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

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"date" | "time" | "details">("date");
  const [providerId, setProviderId] = useState("");

  // Fetch service info
  useEffect(() => {
    async function fetchService() {
      const res = await fetch(
        `/api/bookings?action=service-info&slug=${slug}&serviceId=${serviceId}`
      );
      if (res.ok) {
        const data = await res.json();
        setService(data.service);
        setProviderId(data.providerId);
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

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href={`/book/${slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to services
        </Link>

        {/* Service Header */}
        <Card className="mb-6 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ backgroundColor: service.color }}
          />
          <CardContent className="flex items-center gap-4 py-5">
            {service.emoji && (
              <span className="text-3xl">{service.emoji}</span>
            )}
            <div>
              <h1 className="text-xl font-bold">{service.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.duration_minutes} min
                </span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <DollarSign className="h-4 w-4" />
                  {formatPrice(service.price_cents)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Select a Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              min={minDate}
              max={maxDateStr}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setStep("time");
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        {selectedDate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Available Times</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSlots ? (
                <div className="text-center py-6 text-muted-foreground">
                  Loading available times...
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No available times for this date. Try another day.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.start}
                      variant={
                        selectedSlot?.start === slot.start
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep("details");
                      }}
                    >
                      {formatTime(slot.start)}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Details Form */}
        {selectedSlot && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Full Name</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    placeholder="Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    name="client_email"
                    type="email"
                    placeholder="jane@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Phone (optional)</Label>
                  <Input
                    id="client_phone"
                    name="client_phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_notes">
                    Notes for your provider (optional)
                  </Label>
                  <Textarea
                    id="client_notes"
                    name="client_notes"
                    placeholder="Any special requests, reference photos you'll bring, etc."
                    rows={3}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
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
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>
                      {service.deposit_cents > 0 ? "Deposit due now" : "Total"}
                    </span>
                    <span>
                      {formatPrice(
                        service.deposit_cents > 0
                          ? service.deposit_cents
                          : service.price_cents
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting
                    ? "Processing..."
                    : service.price_cents === 0
                    ? "Confirm Booking"
                    : `Book & Pay ${formatPrice(
                        service.deposit_cents > 0
                          ? service.deposit_cents
                          : service.price_cents
                      )}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
