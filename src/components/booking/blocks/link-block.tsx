"use client";

import { ExternalLink } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { ThemedCard } from "../themed-card";
import { cn } from "@/lib/utils";
import type { LinkBlock } from "@/lib/page-builder/types";

interface Props {
  block: LinkBlock;
  index: number;
}

export function LinkBlockView({ block, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const { title, description, url, thumbnail_url } = block.config;
  if (!url || !title) return null;

  return (
    <section
      className="max-w-2xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
        <ThemedCard className="p-5 cursor-pointer">
          <div className="flex items-center gap-5">
            {thumbnail_url ? (
              <img
                src={thumbnail_url}
                alt={title}
                className="w-20 h-20 rounded-2xl object-cover shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundColor: "var(--template-accent)", opacity: 0.15 }}
              >
                <ExternalLink className="h-8 w-8" style={{ color: "var(--template-accent)" }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={cn(template.classes.heading, "text-xl mb-1")}>{title}</h3>
              {description && (
                <p className={cn(template.classes.body, "text-sm line-clamp-2")}>
                  {description}
                </p>
              )}
            </div>
            <ExternalLink className="h-5 w-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
          </div>
        </ThemedCard>
      </a>
    </section>
  );
}
