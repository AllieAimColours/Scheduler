"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";
import type { HeroBlock } from "@/lib/page-builder/types";

interface Props {
  block: HeroBlock;
  provider: {
    business_name: string;
    description: string;
    logo_url: string | null;
    slug: string;
  };
  index: number;
}

export function HeroBlockView({ block, provider, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const heroImage = block.config.image_url || provider.logo_url;
  const headline = block.config.headline || provider.business_name;
  const tagline = block.config.tagline;
  const welcomeMessage = block.config.welcome_message || provider.description;
  const ctaLabel = block.config.cta_label || "Book an appointment";
  const showCta = block.config.show_cta !== false;

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-14 md:pt-28 md:pb-20"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {/* Avatar with double-layer glow halo */}
      {heroImage && (
        <div
          className="mb-10 relative animate-in fade-in-0 zoom-in-95 duration-1000"
          style={{ animationDelay: `${index * 100 + 100}ms`, animationFillMode: "both" }}
        >
          {/* Outer soft glow */}
          <div
            className="absolute -inset-8 rounded-full blur-3xl opacity-40 -z-10 animate-pulse"
            style={{ background: "var(--template-glow)" }}
          />
          {/* Inner tighter glow */}
          <div
            className="absolute -inset-3 rounded-full blur-xl opacity-60 -z-10"
            style={{ background: "var(--template-glow)" }}
          />
          <img
            src={heroImage}
            alt={headline}
            className="w-36 h-36 md:w-52 md:h-52 rounded-full object-cover shadow-2xl ring-4 ring-white/40"
          />
        </div>
      )}

      {/* Cursive tagline sits above the name, in the Caveat script font */}
      {tagline && (
        <p
          className="font-script text-2xl md:text-3xl mb-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
          style={{
            animationDelay: `${index * 100 + 300}ms`,
            animationFillMode: "both",
            color: "var(--template-accent)",
          }}
        >
          {tagline}
        </p>
      )}

      {/* Business name — big, dramatic, with a faint text shadow glow */}
      <h1
        className={cn(
          template.classes.heading,
          "text-6xl md:text-8xl mb-6 relative animate-in fade-in-0 slide-in-from-bottom-4 duration-1000"
        )}
        style={{
          animationDelay: `${index * 100 + 400}ms`,
          animationFillMode: "both",
          textShadow: "0 0 60px var(--template-glow)",
        }}
      >
        {headline}
      </h1>

      {/* Welcome message */}
      {welcomeMessage && (
        <p
          className={cn(
            template.classes.body,
            "text-lg md:text-xl max-w-xl mx-auto mb-10 animate-in fade-in-0 slide-in-from-bottom-3 duration-1000"
          )}
          style={{ animationDelay: `${index * 100 + 600}ms`, animationFillMode: "both" }}
        >
          {welcomeMessage}
        </p>
      )}

      {/* Accent bar + decorative dot row */}
      <div
        className="flex items-center gap-2 mb-10 animate-in fade-in-0 duration-1000"
        style={{ animationDelay: `${index * 100 + 800}ms`, animationFillMode: "both" }}
      >
        <div className={cn(template.classes.accentBar, "opacity-60")} />
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: "var(--template-accent)" }}
        />
        <div className={cn(template.classes.accentBar, "opacity-60")} />
      </div>

      {/* CTA button */}
      {showCta && (
        <div
          className="animate-in fade-in-0 zoom-in-95 duration-1000"
          style={{ animationDelay: `${index * 100 + 900}ms`, animationFillMode: "both" }}
        >
          <Link href={`/book/${provider.slug}/services`}>
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
        </div>
      )}
    </section>
  );
}
