"use client";

import { useEffect, useRef, useState } from "react";
import type {
  PageSection,
  SectionLayout,
  SectionBackground,
  SectionDivider,
  RevealAnimation,
} from "@/lib/page-builder/types";
import { BlockRenderer } from "./block-renderer";
import { StickyNav } from "../sticky-nav";
import type { Service, DigitalProduct } from "@/types/database";
import { cn } from "@/lib/utils";

interface Props {
  sections: PageSection[];
  provider: {
    business_name: string;
    description: string;
    logo_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    slug: string;
  };
  services: Service[];
  digitalProducts: DigitalProduct[];
}

export function SectionsRenderer({ sections, provider, services, digitalProducts }: Props) {
  return (
    <div id="top">
      <StickyNav sections={sections} provider={provider} />
      {sections.map((section, i) => (
        <SectionView
          key={section.id}
          section={section}
          index={i}
          provider={provider}
          services={services}
          digitalProducts={digitalProducts}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Single section
// ─────────────────────────────────────────────────────────────

function SectionView({
  section,
  index,
  provider,
  services,
  digitalProducts,
}: {
  section: PageSection;
  index: number;
} & Omit<Props, "sections">) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(section.reveal === "none" || !section.reveal);

  useEffect(() => {
    if (revealed || !section.reveal || section.reveal === "none") return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, section.reveal]);

  const bg = section.background;
  const bgStyle = backgroundStyle(bg);
  const colCount = section.columns.length;
  const gridClass = layoutToGrid(section.layout);

  return (
    <section
      ref={ref}
      id={section.title ? slugify(section.title) : undefined}
      className={cn(
        "relative",
        bg && bg.type !== "none" ? "py-16 md:py-24" : "py-8 md:py-12",
        revealAnimationClass(section.reveal, revealed)
      )}
      style={bgStyle}
    >
      {/* Optional dark/light overlay for image backgrounds */}
      {bg?.type === "image" && bg.overlay !== undefined && bg.overlay > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `rgba(0, 0, 0, ${bg.overlay / 100})` }}
        />
      )}

      <div className={cn("relative max-w-6xl mx-auto px-6", gridClass)}>
        {section.columns.map((col, ci) => (
          <div key={ci} className="min-w-0">
            <BlockRenderer
              blocks={col}
              provider={provider}
              services={services}
              digitalProducts={digitalProducts}
            />
          </div>
        ))}
      </div>

      {/* Divider rendered at the bottom of the section */}
      {section.divider && section.divider !== "none" && (
        <SectionDividerSvg type={section.divider} />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function layoutToGrid(layout: SectionLayout): string {
  switch (layout) {
    case "single":
      return "grid grid-cols-1 gap-6";
    case "two-col":
      return "grid grid-cols-1 md:grid-cols-2 gap-8";
    case "two-col-60-40":
      return "grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8";
    case "two-col-40-60":
      return "grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8";
    case "three-col":
      return "grid grid-cols-1 md:grid-cols-3 gap-6";
    case "asymmetric":
      return "grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10";
  }
}

function backgroundStyle(bg: SectionBackground | undefined): React.CSSProperties {
  if (!bg || bg.type === "none") return {};
  if (bg.type === "solid") {
    return { backgroundColor: bg.color };
  }
  if (bg.type === "gradient") {
    const angle = bg.angle ?? 135;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${bg.from}, ${bg.to})`,
    };
  }
  if (bg.type === "mesh") {
    // Stripe-style flowing radial gradients
    const colors = bg.colors.length > 0 ? bg.colors : ["#a855f7", "#ec4899", "#f59e0b"];
    return {
      backgroundColor: colors[0],
      backgroundImage: [
        `radial-gradient(at 20% 25%, ${colors[1] || colors[0]} 0px, transparent 50%)`,
        `radial-gradient(at 80% 20%, ${colors[2] || colors[0]} 0px, transparent 50%)`,
        `radial-gradient(at 40% 80%, ${colors[1] || colors[0]} 0px, transparent 50%)`,
        `radial-gradient(at 90% 90%, ${colors[2] || colors[0]} 0px, transparent 50%)`,
      ].join(", "),
    };
  }
  if (bg.type === "image") {
    return {
      backgroundImage: `url(${bg.url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: bg.parallax ? "fixed" : "scroll",
    };
  }
  return {};
}

function revealAnimationClass(
  reveal: RevealAnimation | undefined,
  isVisible: boolean
): string {
  if (!reveal || reveal === "none") return "";
  if (!isVisible) {
    switch (reveal) {
      case "fade":
        return "opacity-0";
      case "slide-up":
        return "opacity-0 translate-y-12";
      case "slide-left":
        return "opacity-0 -translate-x-12";
      case "slide-right":
        return "opacity-0 translate-x-12";
      case "zoom":
        return "opacity-0 scale-95";
    }
  }
  return "opacity-100 translate-y-0 translate-x-0 scale-100 transition-all duration-1000 ease-out";
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─────────────────────────────────────────────────────────────
//  Section divider SVGs — placed at the bottom of a section
// ─────────────────────────────────────────────────────────────

function SectionDividerSvg({ type }: { type: SectionDivider }) {
  if (type === "none") return null;

  const common = "absolute bottom-0 left-0 right-0 w-full h-16 md:h-24 pointer-events-none";

  if (type === "wave") {
    return (
      <svg className={common} viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,50 C320,100 480,0 720,40 C960,80 1120,20 1440,60 L1440,100 L0,100 Z"
          fill="var(--background, #ffffff)"
        />
      </svg>
    );
  }

  if (type === "wave-soft") {
    return (
      <svg className={common} viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path
          d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z"
          fill="var(--background, #ffffff)"
        />
      </svg>
    );
  }

  if (type === "zigzag") {
    return (
      <svg className={common} viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path
          d="M0,0 L120,40 L240,0 L360,40 L480,0 L600,40 L720,0 L840,40 L960,0 L1080,40 L1200,0 L1320,40 L1440,0 L1440,60 L0,60 Z"
          fill="var(--background, #ffffff)"
        />
      </svg>
    );
  }

  if (type === "blob") {
    return (
      <svg className={common} viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,60 C200,20 400,80 600,50 C800,20 1000,90 1200,40 C1300,20 1400,60 1440,40 L1440,100 L0,100 Z"
          fill="var(--background, #ffffff)"
        />
      </svg>
    );
  }

  if (type === "dots") {
    return (
      <div className={cn(common, "flex items-end justify-center gap-2 pb-4")}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full opacity-50"
            style={{ backgroundColor: "var(--template-accent, #a855f7)" }}
          />
        ))}
      </div>
    );
  }

  if (type === "fade") {
    return (
      <div
        className={common}
        style={{
          background: "linear-gradient(to bottom, transparent, var(--background, #ffffff))",
        }}
      />
    );
  }

  return null;
}
