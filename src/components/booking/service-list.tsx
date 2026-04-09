"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ThemedCard } from "./themed-card";

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
  if (!services || services.length === 0) {
    return (
      <ThemedCard>
        <div className="py-8 text-center opacity-60">
          No services available at the moment. Check back soon!
        </div>
      </ThemedCard>
    );
  }

  return (
    <>
      {services.map((service, i) => (
        <Link
          key={service.id}
          href={`/book/${slug}/${service.id}`}
          className="block"
        >
          <ThemedCard index={i} className="relative overflow-hidden cursor-pointer">
            <div
              className="absolute left-0 top-0 w-1 h-full"
              style={{ backgroundColor: service.color }}
            />
            <div className="flex items-center justify-between pl-4">
              <div className="flex items-center gap-3">
                {service.emoji && (
                  <span className="text-2xl">{service.emoji}</span>
                )}
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm opacity-60 line-clamp-1">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-sm opacity-60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {service.duration_minutes} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">
                  {formatPrice(service.price_cents)}
                </span>
                {service.deposit_cents > 0 && (
                  <p className="text-xs opacity-60">
                    {formatPrice(service.deposit_cents)} deposit
                  </p>
                )}
              </div>
            </div>
          </ThemedCard>
        </Link>
      ))}
    </>
  );
}
