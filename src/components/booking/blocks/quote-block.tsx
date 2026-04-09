"use client";

import { Quote } from "lucide-react";
import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { ThemedCard } from "../themed-card";
import { cn } from "@/lib/utils";
import type { QuoteBlock } from "@/lib/page-builder/types";

interface Props {
  block: QuoteBlock;
  index: number;
}

export function QuoteBlockView({ block, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const { quote, author_name, author_role, author_photo_url } = block.config;
  if (!quote) return null;

  return (
    <section
      className="max-w-3xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      <ThemedCard className="p-10 md:p-14 text-center">
        <Quote
          className="h-10 w-10 mx-auto mb-6 opacity-30"
          style={{ color: "var(--template-accent)" }}
        />
        <blockquote
          className={cn(template.classes.heading, "text-2xl md:text-3xl leading-relaxed mb-8")}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>
        {(author_name || author_photo_url) && (
          <div className="flex items-center justify-center gap-4">
            {author_photo_url && (
              <img
                src={author_photo_url}
                alt={author_name || ""}
                className="w-12 h-12 rounded-full object-cover shadow-md"
              />
            )}
            <div className="text-left">
              {author_name && (
                <div className={cn(template.classes.body, "font-semibold")}>
                  {author_name}
                </div>
              )}
              {author_role && (
                <div className="text-sm opacity-60">{author_role}</div>
              )}
            </div>
          </div>
        )}
      </ThemedCard>
    </section>
  );
}
