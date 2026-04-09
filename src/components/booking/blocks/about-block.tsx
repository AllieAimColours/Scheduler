"use client";

import { Check } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { ThemedCard } from "../themed-card";
import { cn } from "@/lib/utils";
import type { AboutBlock } from "@/lib/page-builder/types";

interface Props {
  block: AboutBlock;
  index: number;
}

export function AboutBlockView({ block, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const { photo_url, title, body, credentials } = block.config;

  return (
    <section
      className="max-w-4xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      <ThemedCard className="p-8 md:p-12">
        <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
          {photo_url && (
            <div className="relative">
              <img
                src={photo_url}
                alt={title || "About"}
                className="w-full aspect-square rounded-2xl object-cover shadow-xl"
              />
            </div>
          )}
          <div>
            {title && (
              <h2 className={cn(template.classes.heading, "text-3xl md:text-4xl mb-4")}>
                {title}
              </h2>
            )}
            {body && (
              <p className={cn(template.classes.body, "text-base md:text-lg whitespace-pre-line")}>
                {body}
              </p>
            )}
            {credentials && credentials.length > 0 && (
              <div className="mt-6 space-y-2">
                {credentials.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm opacity-80">
                    <Check className="h-4 w-4" style={{ color: "var(--template-accent)" }} />
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ThemedCard>
    </section>
  );
}
