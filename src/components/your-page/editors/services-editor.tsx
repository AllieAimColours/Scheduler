"use client";

import type { ServicesBlock } from "@/lib/page-builder/types";
import { Field, TextInput } from "./field";

export function ServicesEditor({
  block,
  onUpdate,
}: {
  block: ServicesBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  return (
    <div className="space-y-4">
      <Field label="Section title">
        <TextInput
          value={c.title || ""}
          onChange={(v) => onUpdate({ title: v })}
          placeholder="Services"
        />
      </Field>
      <Field label="Subtitle">
        <TextInput
          value={c.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          placeholder="Choose what you're looking for"
        />
      </Field>
      <p className="text-xs text-gray-500 bg-purple-50 border border-purple-100 rounded-lg p-3">
        💡 This block automatically pulls all your active services from the Services page.
        Add or edit services there.
      </p>
    </div>
  );
}
