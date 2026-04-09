"use client";

import type { ContactBlock } from "@/lib/page-builder/types";
import { Field, TextInput, Toggle } from "./field";

export function ContactEditor({
  block,
  onUpdate,
}: {
  block: ContactBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  return (
    <div className="space-y-4">
      <Field label="Section title">
        <TextInput
          value={c.title || ""}
          onChange={(v) => onUpdate({ title: v })}
          placeholder="Get in touch"
        />
      </Field>
      <div className="space-y-2">
        <Toggle
          checked={c.show_phone !== false}
          onChange={(v) => onUpdate({ show_phone: v })}
          label="Show phone number"
        />
        <Toggle
          checked={c.show_email !== false}
          onChange={(v) => onUpdate({ show_email: v })}
          label="Show email"
        />
        <Toggle
          checked={c.show_address === true}
          onChange={(v) => onUpdate({ show_address: v })}
          label="Show address"
        />
      </div>
      {c.show_address && (
        <Field label="Address" hint="Will link to Google Maps">
          <TextInput
            value={c.address || ""}
            onChange={(v) => onUpdate({ address: v })}
            placeholder="123 Main St, City, State"
          />
        </Field>
      )}
      <p className="text-xs text-gray-500 bg-purple-50 border border-purple-100 rounded-lg p-3">
        💡 Phone and email come from your business info in Settings.
      </p>
    </div>
  );
}
