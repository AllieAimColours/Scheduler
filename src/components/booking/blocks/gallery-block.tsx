"use client";

import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";
import { cn } from "@/lib/utils";
import type { GalleryBlock } from "@/lib/page-builder/types";

interface Props {
  block: GalleryBlock;
  index: number;
}

export function GalleryBlockView({ block, index }: Props) {
  const templateId = useTemplate();
  const template = getTemplate(templateId);

  const { title, images, columns = 3 } = block.config;
  if (!images || images.length === 0) return null;

  const colClass =
    columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section
      className="max-w-6xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {title && (
        <div className="text-center mb-8">
          <h2 className={cn(template.classes.heading, "text-3xl md:text-4xl")}>{title}</h2>
          <div className={cn(template.classes.accentBar, "mx-auto mt-4")} />
        </div>
      )}
      <div className={cn("grid grid-cols-2 gap-3 md:gap-4", colClass)}>
        {images.map((img, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl aspect-square shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
          >
            <img
              src={img.url}
              alt={img.caption || ""}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-medium">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
