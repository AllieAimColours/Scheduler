"use client";

import type { LinkBlock } from "@/lib/page-builder/types";
import { Field, TextInput } from "./field";
import { ImageUpload } from "../image-upload";

export function LinkEditor({
  block,
  onUpdate,
}: {
  block: LinkBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  return (
    <div className="space-y-4">
      <Field label="Title">
        <TextInput
          value={c.title || ""}
          onChange={(v) => onUpdate({ title: v })}
          placeholder="Follow me on Instagram"
        />
      </Field>
      <Field label="URL">
        <TextInput
          value={c.url || ""}
          onChange={(v) => onUpdate({ url: v })}
          placeholder="https://instagram.com/yourhandle"
        />
      </Field>
      <Field label="Description (optional)">
        <TextInput
          value={c.description || ""}
          onChange={(v) => onUpdate({ description: v })}
          placeholder="See my latest work and behind-the-scenes"
        />
      </Field>
      <ImageUpload
        value={c.thumbnail_url || ""}
        onChange={(v) => onUpdate({ thumbnail_url: v })}
        label="Thumbnail (optional)"
        folder="links"
      />
    </div>
  );
}
