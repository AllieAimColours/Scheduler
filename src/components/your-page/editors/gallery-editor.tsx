"use client";

import type { GalleryBlock } from "@/lib/page-builder/types";
import { Field, TextInput } from "./field";
import { Plus, X } from "lucide-react";

export function GalleryEditor({
  block,
  onUpdate,
}: {
  block: GalleryBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  const images = c.images || [];

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
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Section title">
          <TextInput
            value={c.title || ""}
            onChange={(v) => onUpdate({ title: v })}
            placeholder="My work"
          />
        </Field>
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
      </div>
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
          <p className="text-xs text-gray-400 italic">No images yet. Add some to show off your work.</p>
        )}
        {images.map((img, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white border border-gray-100">
            {img.url && (
              <img src={img.url} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" />
            )}
            <div className="flex-1 space-y-2">
              <TextInput
                value={img.url}
                onChange={(v) => updateImage(i, { url: v })}
                placeholder="Image URL"
              />
              <TextInput
                value={img.caption || ""}
                onChange={(v) => updateImage(i, { caption: v })}
                placeholder="Caption (optional)"
              />
            </div>
            <button
              onClick={() => removeImage(i)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
