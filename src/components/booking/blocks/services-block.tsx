"use client";

import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { ServiceList } from "../service-list";
import { cn } from "@/lib/utils";
import type { ServicesBlock } from "@/lib/page-builder/types";
import type { Service } from "@/types/database";

interface Props {
  block: ServicesBlock;
  services: Service[];
  slug: string;
  index: number;
}

export function ServicesBlockView({ block, services, slug, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const { title, subtitle } = block.config;

  return (
    <section
      className="max-w-3xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {(title || subtitle) && (
        <div className="text-center mb-10">
          {title && (
            <h2 className={cn(template.classes.heading, "text-4xl md:text-5xl mb-3")}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn(template.classes.body, "text-lg")}>{subtitle}</p>
          )}
          <div className={cn(template.classes.accentBar, "mx-auto mt-6")} />
        </div>
      )}
      <ServiceList services={services} slug={slug} />
    </section>
  );
}
