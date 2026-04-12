"use client";

import type { QuoteBlock } from "@/lib/page-builder/types";
import { Field, TextInput, TextArea } from "./field";
import { ImageUpload } from "../image-upload";

export function QuoteEditor({
  block,
  onUpdate,
}: {
  block: QuoteBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  return (
    <div className="space-y-4">
      <Field label="Quote">
        <TextArea
          value={c.quote || ""}
          onChange={(v) => onUpdate({ quote: v })}
          placeholder="The best haircut I've ever had..."
          rows={3}
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Author name">
          <TextInput
            value={c.author_name || ""}
            onChange={(v) => onUpdate({ author_name: v })}
            placeholder="Sarah K."
          />
        </Field>
        <Field label="Author role / context">
          <TextInput
            value={c.author_role || ""}
            onChange={(v) => onUpdate({ author_role: v })}
            placeholder="Loyal client since 2022"
          />
        </Field>
      </div>
      <ImageUpload
        value={c.author_photo_url || ""}
        onChange={(v) => onUpdate({ author_photo_url: v })}
        label="Author photo (optional)"
        folder="quotes"
      />
    </div>
  );
}
