"use client";

import type { HeroBlock } from "@/lib/page-builder/types";
import { Field, TextInput, TextArea, Toggle } from "./field";
import { ImageUpload } from "../image-upload";

export function HeroEditor({
  block,
  onUpdate,
}: {
  block: HeroBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  return (
    <div className="space-y-4">
      <ImageUpload
        value={c.image_url || ""}
        onChange={(v) => onUpdate({ image_url: v })}
        label="Hero image"
        hint="Square image works best. Falls back to your logo if empty."
        folder="hero"
      />
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
