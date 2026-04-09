"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { ThemedCard } from "../themed-card";
import { cn } from "@/lib/utils";
import type { ContactBlock } from "@/lib/page-builder/types";

interface Props {
  block: ContactBlock;
  provider: {
    phone: string | null;
    email: string | null;
  };
  index: number;
}

export function ContactBlockView({ block, provider, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const { title, show_phone, show_email, show_address, address } = block.config;

  const items = [
    show_phone && provider.phone
      ? { icon: Phone, label: provider.phone, href: `tel:${provider.phone}` }
      : null,
    show_email && provider.email
      ? { icon: Mail, label: provider.email, href: `mailto:${provider.email}` }
      : null,
    show_address && address
      ? {
          icon: MapPin,
          label: address,
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        }
      : null,
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string }[];

  if (items.length === 0) return null;

  return (
    <section
      className="max-w-3xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      <ThemedCard className="p-8 md:p-10 text-center">
        {title && (
          <h2 className={cn(template.classes.heading, "text-3xl md:text-4xl mb-6")}>
            {title}
          </h2>
        )}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={cn(
                template.classes.body,
                "inline-flex items-center gap-2 hover:opacity-100 opacity-80 transition-opacity"
              )}
            >
              <item.icon className="h-5 w-5" style={{ color: "var(--template-accent)" }} />
              {item.label}
            </a>
          ))}
        </div>
      </ThemedCard>
    </section>
  );
}
