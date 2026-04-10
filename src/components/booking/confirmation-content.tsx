"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  Check,
  Download,
  Share2,
  X,
} from "lucide-react";
import { ThemedCard } from "./themed-card";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";
import {
  downloadIcs,
  googleCalendarUrl,
  outlookCalendarUrl,
  mapsUrl,
} from "@/lib/calendar-export";
import type { Booking, Service, Provider } from "@/types/database";

interface Props {
  booking: Booking | null;
  service: Service | null;
  provider: Provider | null;
}

export function ConfirmationContent({ booking, service, provider }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(true);

  // Auto-hide confetti after the entrance animation
  useEffect(() => {
    const t = setTimeout(() => setConfettiVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Fallback view: no booking found (e.g. user navigated here directly)
  if (!booking || !service || !provider) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <ThemedCard className="w-full max-w-md text-center p-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-5"
            style={{
              background: "var(--template-glow)",
            }}
          >
            <Sparkles className="h-10 w-10" style={{ color: "var(--template-accent)" }} />
          </div>
          <h1 className={cn(template.classes.heading, "text-3xl mb-3")}>
            Booking confirmed!
          </h1>
          <p className={cn(template.classes.body, "text-base")}>
            Check your email for the details. We&apos;ll see you soon.
          </p>
        </ThemedCard>
      </div>
    );
  }

  const startsAt = new Date(booking.starts_at);
  const endsAt = new Date(booking.ends_at);

  const dateStr = startsAt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const startTimeStr = startsAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTimeStr = endsAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Address: pull from branding JSON if set, else null
  const branding = (provider.branding as Record<string, unknown>) || {};
  const address =
    typeof branding.address === "string" && branding.address.trim()
      ? branding.address
      : null;

  const event = {
    title: `${service.emoji || "✨"} ${service.name} with ${provider.business_name}`,
    description: `Your appointment with ${provider.business_name}.${
      booking.cancellation_token
        ? ` Manage: ${process.env.NEXT_PUBLIC_APP_URL || ""}/cancel/${booking.cancellation_token}`
        : ""
    }`,
    location: address || provider.business_name,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
  };

  function handleAppleCalendar() {
    downloadIcs(event);
    setShowCalendarMenu(false);
  }

  function handleGoogleCalendar() {
    window.open(googleCalendarUrl(event), "_blank", "noopener,noreferrer");
    setShowCalendarMenu(false);
  }

  function handleOutlookCalendar() {
    window.open(outlookCalendarUrl(event), "_blank", "noopener,noreferrer");
    setShowCalendarMenu(false);
  }

  async function handleShare() {
    if (!provider || !service) return;
    const shareData = {
      title: provider.business_name,
      text: `Just booked ${service.name} with ${provider.business_name}!`,
      url: `${window.location.origin}/book/${provider.slug}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link copied!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Confetti burst — themed accent dots that scatter */}
      {confettiVisible && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.6;
            const size = 6 + Math.random() * 10;
            const colors = [
              "var(--template-accent)",
              "var(--primary)",
              "var(--accent)",
            ];
            const color = colors[i % colors.length];
            return (
              <div
                key={i}
                className="absolute top-0 rounded-full animate-confetti-fall"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="w-full max-w-lg relative z-10">
        <ThemedCard className="p-8 md:p-10 text-center">
          {/* Success icon with halo */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-60 -z-10"
              style={{ background: "var(--template-glow)" }}
            />
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, var(--template-accent), var(--primary))`,
              }}
            >
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
          </div>

          <h1 className={cn(template.classes.heading, "text-4xl md:text-5xl mb-3")}>
            You&apos;re booked!
          </h1>
          <p className={cn(template.classes.body, "text-base md:text-lg mb-8")}>
            We&apos;ll see you soon, {booking.client_name}.
          </p>

          <div className={cn(template.classes.accentBar, "mx-auto mb-8")} />

          {/* Booking details card */}
          <div
            className="rounded-2xl p-6 mb-8 text-left"
            style={{
              background: "var(--template-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-start gap-4">
              {service.emoji && (
                <div className="text-4xl shrink-0">{service.emoji}</div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className={cn(template.classes.heading, "text-xl mb-1")}>
                  {service.name}
                </h2>
                <p className={cn(template.classes.body, "text-sm opacity-80")}>
                  with {provider.business_name}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-5 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-4 w-4 shrink-0" style={{ color: "var(--template-accent)" }} />
                <span className={cn(template.classes.body, "text-sm")}>
                  {dateStr}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 shrink-0 inline-block rounded-full"
                  style={{ background: "var(--template-accent)", opacity: 0.4 }}
                />
                <span className={cn(template.classes.body, "text-sm")}>
                  {startTimeStr} – {endTimeStr}
                </span>
              </div>
              {address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--template-accent)" }} />
                  <span className={cn(template.classes.body, "text-sm")}>{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Add to calendar — opens menu */}
            <div className="relative">
              <button
                onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                className={cn(
                  template.classes.button,
                  template.animations.buttonHover,
                  "w-full inline-flex items-center justify-center gap-2"
                )}
              >
                <CalendarIcon className="h-5 w-5" />
                Add to calendar
              </button>

              {showCalendarMenu && (
                <div
                  className="absolute left-0 right-0 mt-2 rounded-2xl p-2 shadow-2xl z-20 animate-in slide-in-from-top-2 duration-200"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    onClick={handleAppleCalendar}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 transition-colors text-left"
                  >
                    <Download className="h-4 w-4 shrink-0" style={{ color: "var(--template-accent)" }} />
                    <div className={cn(template.classes.body)}>
                      <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        Apple Calendar
                      </div>
                      <div className="text-xs opacity-60">Downloads .ics file</div>
                    </div>
                  </button>
                  <button
                    onClick={handleGoogleCalendar}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 transition-colors text-left"
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0" style={{ color: "var(--template-accent)" }} />
                    <div className={cn(template.classes.body)}>
                      <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        Google Calendar
                      </div>
                      <div className="text-xs opacity-60">Opens in new tab</div>
                    </div>
                  </button>
                  <button
                    onClick={handleOutlookCalendar}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 transition-colors text-left"
                  >
                    <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--template-accent)" }} />
                    <div className={cn(template.classes.body)}>
                      <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        Outlook
                      </div>
                      <div className="text-xs opacity-60">Opens in new tab</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowCalendarMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs opacity-60 hover:opacity-100 transition-opacity mt-1"
                  >
                    <X className="h-3 w-3" />
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Get directions */}
            {address && (
              <a
                href={mapsUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  template.classes.buttonOutline,
                  "w-full inline-flex items-center justify-center gap-2"
                )}
              >
                <MapPin className="h-5 w-5" />
                Get directions
              </a>
            )}

            {/* Contact provider */}
            {(provider.phone || provider.email) && (
              <div className="flex gap-3">
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className={cn(
                      template.classes.buttonOutline,
                      "flex-1 inline-flex items-center justify-center gap-2"
                    )}
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                {provider.email && (
                  <a
                    href={`mailto:${provider.email}`}
                    className={cn(
                      template.classes.buttonOutline,
                      "flex-1 inline-flex items-center justify-center gap-2"
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={handleShare}
              className={cn(
                template.classes.body,
                "inline-flex items-center gap-2 text-xs hover:opacity-100 opacity-60 transition-opacity"
              )}
            >
              <Share2 className="h-3 w-3" />
              Share with a friend
            </button>
            {booking.cancellation_token && (
              <div>
                <a
                  href={`/cancel/${booking.cancellation_token}`}
                  className={cn(
                    template.classes.body,
                    "text-xs underline hover:opacity-100 opacity-50 transition-opacity"
                  )}
                >
                  Need to cancel or reschedule?
                </a>
              </div>
            )}
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}
