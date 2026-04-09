"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Calendar, MapPin, Phone, Mail, Globe } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

interface LandingHeroProps {
  provider: {
    business_name: string;
    description: string;
    logo_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    slug: string;
  };
  hero: {
    image_url?: string;
    welcome_message?: string;
    tagline?: string;
    cta_label?: string;
  };
}

export function LandingHero({ provider, hero }: LandingHeroProps) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(t);
  }, []);

  const heroImage = hero.image_url || provider.logo_url;
  const tagline = hero.tagline || "";
  const welcomeMessage = hero.welcome_message || provider.description;
  const ctaLabel = hero.cta_label || "Book an appointment";

  return (
    <div className="relative min-h-[calc(100vh-2rem)] flex flex-col">
      {/* Magical entrance overlay — fades out on reveal */}
      <div
        className={cn(
          "fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ease-out",
          revealed ? "opacity-0" : "opacity-100"
        )}
        style={{
          background: `radial-gradient(circle at center, var(--background) 0%, var(--background) 60%, transparent 100%)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Sparkles
              className="h-12 w-12 animate-pulse"
              style={{ color: "var(--template-accent)" }}
            />
            <div
              className="absolute inset-0 blur-2xl opacity-60"
              style={{ background: "var(--template-glow)" }}
            />
          </div>
        </div>
      </div>

      {/* Hero content */}
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center px-6 py-16 text-center transition-all duration-1000 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Hero image / logo */}
        {heroImage && (
          <div
            className={cn(
              "mb-8 transition-all duration-1000 delay-200 ease-out",
              revealed ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
          >
            <div className="relative">
              <img
                src={heroImage}
                alt={provider.business_name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl ring-4 ring-white/20"
              />
              <div
                className="absolute -inset-4 rounded-full blur-2xl opacity-40 -z-10"
                style={{ background: "var(--template-glow)" }}
              />
            </div>
          </div>
        )}

        {/* Tagline above name */}
        {tagline && (
          <p
            className={cn(
              "text-sm uppercase tracking-[0.25em] mb-3 opacity-60 transition-all duration-1000 delay-300",
              revealed ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {tagline}
          </p>
        )}

        {/* Business name in template heading font */}
        <h1
          className={cn(
            template.classes.heading,
            "text-5xl md:text-7xl mb-6 transition-all duration-1000 delay-400 ease-out",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          {provider.business_name}
        </h1>

        {/* Welcome message / bio */}
        {welcomeMessage && (
          <p
            className={cn(
              template.classes.body,
              "text-lg md:text-xl max-w-xl mx-auto mb-10 transition-all duration-1000 delay-500",
              revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {welcomeMessage}
          </p>
        )}

        {/* Decorative accent bar */}
        <div
          className={cn(
            template.classes.accentBar,
            "mb-10 transition-all duration-1000 delay-600",
            revealed ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          )}
        />

        {/* CTA Button */}
        <Link
          href={`/book/${provider.slug}/services`}
          className={cn(
            "transition-all duration-1000 delay-700",
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <button
            className={cn(
              template.classes.button,
              template.animations.buttonHover,
              "inline-flex items-center gap-2 text-base md:text-lg"
            )}
          >
            <Calendar className="h-5 w-5" />
            {ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>

        {/* Contact info row */}
        {(provider.phone || provider.email || provider.website) && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-6 mt-12 text-sm transition-all duration-1000 delay-1000",
              revealed ? "opacity-70 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {provider.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity"
              >
                <Phone className="h-4 w-4" />
                {provider.phone}
              </a>
            )}
            {provider.email && (
              <a
                href={`mailto:${provider.email}`}
                className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity"
              >
                <Mail className="h-4 w-4" />
                {provider.email}
              </a>
            )}
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
