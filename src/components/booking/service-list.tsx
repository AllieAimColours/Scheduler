"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { ThemedCard } from "./themed-card";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  color: string;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
}

interface ServiceListProps {
  services: Service[];
  slug: string;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function ServiceList({ services, slug }: ServiceListProps) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  if (!services || services.length === 0) {
    return (
      <ThemedCard>
        <div className={cn(template.classes.body, "py-12 text-center opacity-70")}>
          No services available at the moment. Check back soon!
        </div>
      </ThemedCard>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service, i) => (
        <Link
          key={service.id}
          href={`/book/${slug}/${service.id}`}
          className="block group animate-in fade-in-0 slide-in-from-bottom-3 duration-700"
          style={{
            animationDelay: `${i * 120}ms`,
            animationFillMode: "both",
          }}
        >
          <ThemedCard
            index={i}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-500",
              // Lift + shadow glow on hover (in addition to whatever the template does)
              "group-hover:-translate-y-1 group-hover:shadow-2xl"
            )}
          >
            {/* Color accent stripe */}
            <div
              className="absolute left-0 top-0 w-1.5 h-full transition-all duration-500 group-hover:w-2"
              style={{ backgroundColor: service.color }}
            />

            {/* Sweeping gradient on hover — appears from the top-left and fades out */}
            <div
              className="absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 20% 0%, ${service.color}22 0%, transparent 60%)`,
              }}
            />

            {/* Slightly-brighter edge highlight on hover */}
            <div
              className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: `inset 0 1px 0 0 ${service.color}30`,
              }}
            />

            <div className="relative flex items-center gap-5 pl-5 py-2">
              {/* Emoji bubble */}
              {service.emoji && (
                <div
                  className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl text-3xl md:text-4xl shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${service.color}15`,
                    boxShadow: `0 4px 16px ${service.color}20`,
                  }}
                >
                  {service.emoji}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    template.classes.heading,
                    "text-xl md:text-2xl mb-1 transition-colors duration-300"
                  )}
                >
                  {service.name}
                </h3>
                {service.description && (
                  <p
                    className={cn(
                      template.classes.body,
                      "text-sm line-clamp-2 mb-2"
                    )}
                  >
                    {service.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm opacity-70">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration_minutes} min
                  </span>
                </div>
              </div>

              {/* Price + arrow */}
              <div className="text-right shrink-0 flex items-center gap-3">
                <div>
                  <div
                    className={cn(
                      template.classes.heading,
                      "text-2xl md:text-3xl transition-transform duration-500 group-hover:scale-105"
                    )}
                  >
                    {formatPrice(service.price_cents)}
                  </div>
                  {service.deposit_cents > 0 && (
                    <p className="text-xs opacity-60 mt-0.5">
                      {formatPrice(service.deposit_cents)} deposit
                    </p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          </ThemedCard>
        </Link>
      ))}
    </div>
  );
}
