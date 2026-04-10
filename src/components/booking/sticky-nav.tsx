"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";
import type { PageSection } from "@/lib/page-builder/types";

interface Props {
  sections: PageSection[];
  provider: {
    business_name: string;
    logo_url: string | null;
    slug: string;
  };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Sticky top nav that auto-builds from section titles. Hidden until the
 * user scrolls past the first section, then slides in from the top.
 */
export function StickyNav({ sections, provider }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only sections with titles get an anchor link
  const linkedSections = sections.filter((s) => s.title && s.title.trim());
  if (linkedSections.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div
        className="backdrop-blur-xl border-b shadow-lg"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
          {/* Brand */}
          <a href="#top" className="flex items-center gap-2 shrink-0">
            {provider.logo_url ? (
              <img
                src={provider.logo_url}
                alt={provider.business_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : null}
            <span
              className={cn(template.classes.heading, "text-lg font-semibold whitespace-nowrap")}
            >
              {provider.business_name}
            </span>
          </a>

          {/* Anchor links — hide on mobile */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {linkedSections.map((s) => (
              <a
                key={s.id}
                href={`#${slugify(s.title!)}`}
                className={cn(
                  template.classes.body,
                  "px-3 py-1.5 rounded-full text-sm hover:opacity-100 opacity-70 transition-opacity"
                )}
              >
                {s.title}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href={`/book/${provider.slug}/services`}
            className={cn(
              template.classes.button,
              "shrink-0 inline-flex items-center gap-1.5 px-5 py-2 text-sm"
            )}
          >
            <Calendar className="h-4 w-4" />
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}
