"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const { title, images, columns = 3, layout = "grid" } = block.config;
  if (!images || images.length === 0) return null;

  return (
    <section
      className="max-w-6xl mx-auto px-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      {title && (
        <div className="text-center mb-10">
          <h2 className={cn(template.classes.heading, "text-3xl md:text-4xl")}>{title}</h2>
          <div className={cn(template.classes.accentBar, "mx-auto mt-4")} />
        </div>
      )}

      {layout === "grid" && <GridLayout images={images} columns={columns} />}
      {layout === "carousel" && <CarouselLayout images={images} />}
      {layout === "masonry" && <MasonryLayout images={images} columns={columns} />}
      {layout === "mosaic" && <MosaicLayout images={images} />}
    </section>
  );
}

// ─── Shared image card ───
function ImageCard({
  url,
  caption,
  className,
}: {
  url: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
        className
      )}
    >
      <img
        src={url}
        alt={caption || ""}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {caption && (
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-medium">{caption}</p>
        </div>
      )}
    </div>
  );
}

// ─── 1. Grid (uniform squares) ───
function GridLayout({
  images,
  columns,
}: {
  images: { url: string; caption?: string }[];
  columns: number;
}) {
  const colClass =
    columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:gap-4", colClass)}>
      {images.map((img, i) => (
        <ImageCard key={i} url={img.url} caption={img.caption} className="aspect-square" />
      ))}
    </div>
  );
}

// ─── 2. Carousel (horizontal scroll with arrows) ───
function CarouselLayout({ images }: { images: { url: string; caption?: string }[] }) {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function go(direction: 1 | -1) {
    const next = Math.max(0, Math.min(images.length - 1, idx + direction));
    setIdx(next);
  }

  useEffect(() => {
    if (!trackRef.current) return;
    const child = trackRef.current.children[idx] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [idx]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-[85%] sm:w-[60%] md:w-[55%] lg:w-[50%] aspect-[4/3]"
          >
            <ImageCard url={img.url} caption={img.caption} className="h-full" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            disabled={idx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-black/5 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            disabled={idx === images.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-black/5 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === idx ? "w-8 bg-current opacity-90" : "w-1.5 bg-current opacity-30"
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 3. Masonry (Pinterest-style varying heights via CSS columns) ───
function MasonryLayout({
  images,
  columns,
}: {
  images: { url: string; caption?: string }[];
  columns: number;
}) {
  const colClass =
    columns === 2 ? "md:columns-2" : columns === 4 ? "md:columns-4" : "md:columns-3";
  return (
    <div className={cn("columns-2 gap-3 md:gap-4 [column-fill:_balance]", colClass)}>
      {images.map((img, i) => (
        <div key={i} className="mb-3 md:mb-4 break-inside-avoid">
          <ImageCard url={img.url} caption={img.caption} />
        </div>
      ))}
    </div>
  );
}

// ─── 4. Mosaic (asymmetric featured layout — first image big, rest smaller) ───
function MosaicLayout({ images }: { images: { url: string; caption?: string }[] }) {
  if (images.length === 1) {
    return (
      <div className="aspect-[16/9]">
        <ImageCard url={images[0].url} caption={images[0].caption} className="h-full" />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {images.map((img, i) => (
          <ImageCard key={i} url={img.url} caption={img.caption} className="aspect-[4/5]" />
        ))}
      </div>
    );
  }

  // 3+ images: featured + grid
  const [first, ...rest] = images;
  return (
    <div className="grid md:grid-cols-2 gap-3 md:gap-4">
      <div className="md:row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[500px]">
        <ImageCard url={first.url} caption={first.caption} className="h-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {rest.slice(0, 4).map((img, i) => (
          <ImageCard key={i} url={img.url} caption={img.caption} className="aspect-square" />
        ))}
      </div>
      {rest.length > 4 && (
        <div className="grid grid-cols-3 gap-3 md:gap-4 md:col-span-2">
          {rest.slice(4).map((img, i) => (
            <ImageCard key={i} url={img.url} caption={img.caption} className="aspect-square" />
          ))}
        </div>
      )}
    </div>
  );
}
