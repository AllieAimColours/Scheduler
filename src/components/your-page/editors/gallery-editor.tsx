"use client";

import type { GalleryBlock, GalleryLayout } from "@/lib/page-builder/types";
import { Field, TextInput } from "./field";
import { ImageUpload } from "../image-upload";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LAYOUTS: Array<{ id: GalleryLayout; label: string; description: string; preview: React.ReactNode }> = [
  {
    id: "grid",
    label: "Grid",
    description: "Uniform squares",
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-current rounded-sm opacity-60" />
        ))}
      </div>
    ),
  },
  {
    id: "carousel",
    label: "Carousel",
    description: "Swipeable slider",
    preview: (
      <div className="flex items-center gap-1 w-full h-full">
        <div className="w-1 h-3 bg-current opacity-30 rounded-sm" />
        <div className="flex-1 h-full bg-current rounded-sm opacity-60" />
        <div className="w-1 h-3 bg-current opacity-30 rounded-sm" />
      </div>
    ),
  },
  {
    id: "masonry",
    label: "Masonry",
    description: "Pinterest-style",
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
        <div className="row-span-2 bg-current rounded-sm opacity-60" />
        <div className="bg-current rounded-sm opacity-60" />
        <div className="row-span-2 bg-current rounded-sm opacity-60" />
        <div className="bg-current rounded-sm opacity-60" />
      </div>
    ),
  },
  {
    id: "mosaic",
    label: "Mosaic",
    description: "Featured + grid",
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
        <div className="row-span-2 col-span-2 bg-current rounded-sm opacity-60" />
        <div className="bg-current rounded-sm opacity-60" />
        <div className="bg-current rounded-sm opacity-60" />
      </div>
    ),
  },
];

export function GalleryEditor({
  block,
  onUpdate,
}: {
  block: GalleryBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  const images = c.images || [];
  const layout = c.layout || "grid";

  function addImage() {
    onUpdate({ images: [...images, { url: "", caption: "" }] });
  }

  function updateImage(i: number, patch: { url?: string; caption?: string }) {
    const next = [...images];
    next[i] = { ...next[i], ...patch };
    onUpdate({ images: next });
  }

  function removeImage(i: number) {
    onUpdate({ images: images.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <Field label="Section title">
        <TextInput
          value={c.title || ""}
          onChange={(v) => onUpdate({ title: v })}
          placeholder="My work"
        />
      </Field>

      {/* Layout picker */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Layout style</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LAYOUTS.map((l) => {
            const active = layout === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onUpdate({ layout: l.id })}
                className={cn(
                  "group p-3 rounded-xl border-2 text-left transition-all duration-200",
                  active
                    ? "border-purple-500 bg-purple-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40"
                )}
              >
                <div
                  className={cn(
                    "w-full h-12 mb-2 transition-colors",
                    active ? "text-purple-500" : "text-gray-300 group-hover:text-purple-400"
                  )}
                >
                  {l.preview}
                </div>
                <div className={cn("text-sm font-semibold", active ? "text-purple-700" : "text-gray-700")}>
                  {l.label}
                </div>
                <div className="text-[11px] text-gray-400">{l.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns (only relevant for grid + masonry) */}
      {(layout === "grid" || layout === "masonry") && (
        <Field label="Columns">
          <select
            value={c.columns || 3}
            onChange={(e) => onUpdate({ columns: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm text-gray-900"
          >
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
            <option value={4}>4 columns</option>
          </select>
        </Field>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Images ({images.length})</label>
          <button
            onClick={addImage}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add image
          </button>
        </div>
        {images.length === 0 && (
          <p className="text-xs text-gray-400">No images yet. Add some to show off your work.</p>
        )}
        {images.map((img, i) => (
          <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 space-y-2">
            <div className="flex items-start justify-between">
              <ImageUpload
                value={img.url}
                onChange={(v) => updateImage(i, { url: v })}
                folder="gallery"
              />
              <button
                onClick={() => removeImage(i)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <TextInput
              value={img.caption || ""}
              onChange={(v) => updateImage(i, { caption: v })}
              placeholder="Caption (optional)"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
