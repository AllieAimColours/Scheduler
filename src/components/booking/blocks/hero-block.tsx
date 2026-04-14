"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";
import type { HeroBlock, HeroImageShape, HeroImageSize } from "@/lib/page-builder/types";

// ─── Hero image sizing lookup ────────────────────────────────
//
//  Each (shape, size) combo maps to concrete Tailwind classes.
//  Shapes:
//    circle     → square aspect, fully rounded (avatar style)
//    square     → square aspect with rounded corners (polaroid)
//    landscape  → 16:9 aspect (banner / wide promo shot)
//    portrait   → 3:4 aspect (editorial / full-body)
//
//  Sizes stack responsively: base = mobile, md: = tablet/desktop.

const SHAPE_CLASSES: Record<HeroImageShape, string> = {
  circle: "rounded-full",
  square: "rounded-[2rem]",
  landscape: "rounded-[2rem]",
  portrait: "rounded-[2rem]",
};

const SIZE_CLASSES: Record<HeroImageShape, Record<HeroImageSize, string>> = {
  circle: {
    S: "w-24 h-24 md:w-32 md:h-32",
    M: "w-32 h-32 md:w-44 md:h-44",
    L: "w-40 h-40 md:w-56 md:h-56",
    XL: "w-48 h-48 md:w-72 md:h-72",
  },
  square: {
    S: "w-32 h-32 md:w-40 md:h-40",
    M: "w-44 h-44 md:w-56 md:h-56",
    L: "w-56 h-56 md:w-72 md:h-72",
    XL: "w-64 h-64 md:w-96 md:h-96",
  },
  landscape: {
    // 16:9 aspect — width + auto height via aspect-video
    S: "w-64 aspect-video md:w-80",
    M: "w-80 aspect-video md:w-[28rem]",
    L: "w-full max-w-lg aspect-video md:max-w-2xl",
    XL: "w-full max-w-xl aspect-video md:max-w-4xl",
  },
  portrait: {
    // 3:4 aspect
    S: "w-36 aspect-[3/4] md:w-48",
    M: "w-44 aspect-[3/4] md:w-60",
    L: "w-56 aspect-[3/4] md:w-72",
    XL: "w-64 aspect-[3/4] md:w-96",
  },
};

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
  const imageShape: HeroImageShape = block.config.image_shape || "circle";
  const imageSize: HeroImageSize = block.config.image_size || "M";
  const shapeClass = SHAPE_CLASSES[imageShape];
  const sizeClass = SIZE_CLASSES[imageShape][imageSize];
  // Glow halo should match the image shape so it looks right
  const glowRadius = imageShape === "circle" ? "rounded-full" : "rounded-[2rem]";

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-14 md:pt-28 md:pb-20"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {/* Hero image with double-layer glow halo */}
      {heroImage && (
        <div
          className="mb-10 relative animate-in fade-in-0 zoom-in-95 duration-1000"
          style={{ animationDelay: `${index * 100 + 100}ms`, animationFillMode: "both" }}
        >
          {/* Outer soft glow */}
          <div
            className={cn("absolute -inset-8 blur-3xl opacity-40 -z-10 animate-pulse", glowRadius)}
            style={{ background: "var(--template-glow)" }}
          />
          {/* Inner tighter glow */}
          <div
            className={cn("absolute -inset-3 blur-xl opacity-60 -z-10", glowRadius)}
            style={{ background: "var(--template-glow)" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={headline}
            className={cn(
              sizeClass,
              shapeClass,
              "object-cover shadow-2xl ring-4 ring-white/40 mx-auto"
            )}
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
