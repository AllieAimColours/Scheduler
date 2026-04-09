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
      className="relative flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 md:pt-24 md:pb-16 animate-in fade-in-0 slide-in-from-bottom-6 duration-1000"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {heroImage && (
        <div className="mb-8 relative">
          <img
            src={heroImage}
            alt={headline}
            className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover shadow-2xl ring-4 ring-white/30"
          />
          <div
            className="absolute -inset-4 rounded-full blur-2xl opacity-40 -z-10"
            style={{ background: "var(--template-glow)" }}
          />
        </div>
      )}

      {tagline && (
        <p className="text-xs md:text-sm uppercase tracking-[0.25em] mb-4 opacity-60">
          {tagline}
        </p>
      )}

      <h1 className={cn(template.classes.heading, "text-5xl md:text-7xl mb-6")}>
        {headline}
      </h1>

      {welcomeMessage && (
        <p className={cn(template.classes.body, "text-lg md:text-xl max-w-xl mx-auto mb-10")}>
          {welcomeMessage}
        </p>
      )}

      <div className={cn(template.classes.accentBar, "mb-10")} />

      {showCta && (
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
      )}
    </section>
  );
}
