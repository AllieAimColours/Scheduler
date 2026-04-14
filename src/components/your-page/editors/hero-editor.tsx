"use client";

import type { HeroBlock, HeroImageShape, HeroImageSize } from "@/lib/page-builder/types";
import { Field, TextInput, TextArea, Toggle } from "./field";
import { ImageUpload } from "../image-upload";
import { Circle, Square, RectangleHorizontal, RectangleVertical } from "lucide-react";

const SHAPES: Array<{ id: HeroImageShape; label: string; icon: typeof Circle; hint: string }> = [
  { id: "circle", label: "Circle", icon: Circle, hint: "Avatar style" },
  { id: "square", label: "Square", icon: Square, hint: "Rounded square" },
  { id: "landscape", label: "Wide", icon: RectangleHorizontal, hint: "Banner (16:9)" },
  { id: "portrait", label: "Tall", icon: RectangleVertical, hint: "Editorial (3:4)" },
];

const SIZES: HeroImageSize[] = ["S", "M", "L", "XL"];

export function HeroEditor({
  block,
  onUpdate,
}: {
  block: HeroBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  const shape = c.image_shape || "circle";
  const size = c.image_size || "M";

  return (
    <div className="space-y-4">
      <ImageUpload
        value={c.image_url || ""}
        onChange={(v) => onUpdate({ image_url: v })}
        label="Hero image"
        hint="Falls back to your logo if empty. Aspect ratio is controlled by the shape you pick below."
        folder="hero"
      />

      {/* Shape picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Shape</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SHAPES.map((s) => {
            const active = shape === s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdate({ image_shape: s.id })}
                className={
                  active
                    ? "p-3 rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                    : "p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                }
              >
                <Icon className={`h-5 w-5 ${active ? "text-purple-600" : "text-gray-400"}`} />
                <div className={`text-xs font-semibold ${active ? "text-purple-700" : "text-gray-700"}`}>
                  {s.label}
                </div>
                <div className="text-[10px] text-gray-400">{s.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Size</label>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((s) => {
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate({ image_size: s })}
                className={
                  active
                    ? "py-2.5 rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm font-display font-bold text-purple-700 cursor-pointer transition-all"
                    : "py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 font-display font-bold text-gray-700 cursor-pointer transition-all"
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Headline" hint="Falls back to your business name">
          <TextInput
            value={c.headline || ""}
            onChange={(v) => onUpdate({ headline: v })}
            placeholder="Your business name"
          />
        </Field>
        <Field label="Tagline" hint="Small uppercase text above the headline">
          <TextInput
            value={c.tagline || ""}
            onChange={(v) => onUpdate({ tagline: v })}
            placeholder="Color Specialist · Est. 2018"
          />
        </Field>
      </div>
      <Field label="Welcome message" hint="A line or two to greet your clients">
        <TextArea
          value={c.welcome_message || ""}
          onChange={(v) => onUpdate({ welcome_message: v })}
          placeholder="Tell clients what makes you special"
          rows={3}
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Field label="Button label">
          <TextInput
            value={c.cta_label || ""}
            onChange={(v) => onUpdate({ cta_label: v })}
            placeholder="Book an appointment"
          />
        </Field>
        <div className="pb-2">
          <Toggle
            checked={c.show_cta !== false}
            onChange={(v) => onUpdate({ show_cta: v })}
            label="Show booking button"
          />
        </div>
      </div>
    </div>
  );
}
