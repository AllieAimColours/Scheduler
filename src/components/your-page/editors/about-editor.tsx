"use client";

import type { AboutBlock } from "@/lib/page-builder/types";
import { Field, TextInput, TextArea } from "./field";
import { ImageUpload } from "../image-upload";
import { Plus, X } from "lucide-react";

export function AboutEditor({
  block,
  onUpdate,
}: {
  block: AboutBlock;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const c = block.config;
  const credentials = c.credentials || [];

  function addCredential() {
    onUpdate({ credentials: [...credentials, ""] });
  }

  function updateCredential(i: number, value: string) {
    const next = [...credentials];
    next[i] = value;
    onUpdate({ credentials: next });
  }

  function removeCredential(i: number) {
    onUpdate({ credentials: credentials.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-[200px_1fr] gap-4">
        <ImageUpload
          value={c.photo_url || ""}
          onChange={(v) => onUpdate({ photo_url: v })}
          label="Photo"
          folder="about"
        />
        <Field label="Section title">
          <TextInput
            value={c.title || ""}
            onChange={(v) => onUpdate({ title: v })}
            placeholder="About me"
          />
        </Field>
      </div>
      <Field label="Body" hint="Tell your story. Multiple paragraphs are fine.">
        <TextArea
          value={c.body || ""}
          onChange={(v) => onUpdate({ body: v })}
          placeholder="I started cutting hair when I was 15..."
          rows={5}
        />
      </Field>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Credentials & badges</label>
          <button
            onClick={addCredential}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add one
          </button>
        </div>
        {credentials.length === 0 && (
          <p className="text-xs text-gray-400 italic">No credentials yet. Add things like &quot;Licensed colorist&quot; or &quot;10 years experience&quot;.</p>
        )}
        {credentials.map((cred, i) => (
          <div key={i} className="flex items-center gap-2">
            <TextInput
              value={cred}
              onChange={(v) => updateCredential(i, v)}
              placeholder="e.g. Licensed colorist"
            />
            <button
              onClick={() => removeCredential(i)}
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
