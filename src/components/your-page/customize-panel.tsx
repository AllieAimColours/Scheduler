"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field } from "./editors/field";
import {
  FONT_OPTIONS,
  type PageOverrides,
  type RadiusChoice,
  type DecorationsLevel,
  type AnimationSpeed,
  type FontChoice,
  type CursorEffect,
  type AmbientParticles,
} from "@/lib/page-builder/overrides";

interface Props {
  overrides: PageOverrides;
  onUpdate: (next: PageOverrides) => void;
}

const RADIUS_OPTIONS: Array<{ id: RadiusChoice; label: string }> = [
  { id: "default", label: "Template" },
  { id: "sharp", label: "Sharp" },
  { id: "soft", label: "Soft" },
  { id: "round", label: "Round" },
  { id: "pill", label: "Pill" },
];

const DECORATIONS_OPTIONS: Array<{ id: DecorationsLevel; label: string }> = [
  { id: "default", label: "Template" },
  { id: "off", label: "Off" },
  { id: "subtle", label: "Subtle" },
  { id: "normal", label: "Normal" },
  { id: "bold", label: "Bold" },
];

const ANIMATION_OPTIONS: Array<{ id: AnimationSpeed; label: string }> = [
  { id: "default", label: "Template" },
  { id: "still", label: "Still" },
  { id: "gentle", label: "Gentle" },
  { id: "playful", label: "Playful" },
];

const CURSOR_OPTIONS: Array<{ id: CursorEffect; label: string; preview: string }> = [
  { id: "none", label: "None", preview: "🚫" },
  { id: "sparkle", label: "Sparkle trail", preview: "✨" },
  { id: "glow", label: "Glow", preview: "💡" },
  { id: "emoji", label: "Custom emoji", preview: "😎" },
];

const PARTICLE_OPTIONS: Array<{ id: AmbientParticles; label: string; preview: string }> = [
  { id: "none", label: "None", preview: "🚫" },
  { id: "stars", label: "Stars", preview: "⭐" },
  { id: "sparkles", label: "Sparkles", preview: "✨" },
  { id: "fireflies", label: "Fireflies", preview: "🔥" },
  { id: "bubbles", label: "Bubbles", preview: "🫧" },
];

const COLOR_PRESETS = [
  "#a855f7", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#ef4444", // red
  "#1a1a1a", // black
  "#d4af37", // gold
];

function hasAnyOverrides(o: PageOverrides): boolean {
  return Boolean(
    o.heading_font ||
      o.body_font ||
      o.primary_color ||
      o.accent_color ||
      o.background_color ||
      o.radius ||
      o.decorations ||
      o.animation
  );
}

export function CustomizePanel({ overrides, onUpdate }: Props) {
  const overridden = hasAnyOverrides(overrides);

  function set<K extends keyof PageOverrides>(key: K, value: PageOverrides[K]) {
    const next: PageOverrides = { ...overrides };
    if (value === undefined || value === "default" || value === "") {
      delete next[key];
    } else {
      next[key] = value;
    }
    onUpdate(next);
  }

  function resetAll() {
    onUpdate({});
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5 space-y-5">
      {/* Header with reset */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-800">
            Customize
          </h3>
          <p className="text-xs text-gray-400">
            Override fonts, colors, and feel on top of your template.
          </p>
        </div>
        {overridden && (
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-gray-400 hover:text-purple-600 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        )}
      </div>

      {/* Fonts */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Heading font">
          <FontSelect
            value={overrides.heading_font || "default"}
            onChange={(v) => set("heading_font", v)}
          />
        </Field>
        <Field label="Body font">
          <FontSelect
            value={overrides.body_font || "default"}
            onChange={(v) => set("body_font", v)}
          />
        </Field>
      </div>

      {/* Colors — stacked, each with preview swatch + presets */}
      <Field label="Primary color" hint="Buttons, accents, hover states">
        <ColorPicker
          value={overrides.primary_color}
          onChange={(v) => set("primary_color", v)}
        />
      </Field>

      <Field label="Accent color" hint="Secondary highlights and bars">
        <ColorPicker
          value={overrides.accent_color}
          onChange={(v) => set("accent_color", v)}
        />
      </Field>

      <Field label="Background color" hint="Page background">
        <ColorPicker
          value={overrides.background_color}
          onChange={(v) => set("background_color", v)}
        />
      </Field>

      {/* Visual feel */}
      <Field label="Corner roundness">
        <SegmentedControl
          options={RADIUS_OPTIONS}
          value={overrides.radius || "default"}
          onChange={(v) => set("radius", v)}
        />
      </Field>

      <Field label="Background decorations" hint="Orbs, grids, confetti, shimmer">
        <SegmentedControl
          options={DECORATIONS_OPTIONS}
          value={overrides.decorations || "default"}
          onChange={(v) => set("decorations", v)}
        />
      </Field>

      <Field label="Animation speed">
        <SegmentedControl
          options={ANIMATION_OPTIONS}
          value={overrides.animation || "default"}
          onChange={(v) => set("animation", v)}
        />
      </Field>

      {/* ── Wow Effects ── */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="font-display text-base font-semibold text-gray-800 mb-4">
          Wow effects
        </h4>

        <div className="space-y-4">
          <Field label="Cursor effect" hint="What happens when clients move their mouse">
            <div className="flex flex-wrap gap-2">
              {CURSOR_OPTIONS.map((opt) => {
                const active = (overrides.cursor_effect || "none") === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => set("cursor_effect", opt.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2",
                      active
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                    )}
                  >
                    <span>{opt.preview}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Emoji picker — only show when cursor effect is emoji */}
          {overrides.cursor_effect === "emoji" && (
            <Field label="Cursor emoji" hint="Pick an emoji that follows the cursor">
              <input
                type="text"
                value={overrides.cursor_emoji || ""}
                onChange={(e) => set("cursor_emoji", e.target.value.slice(0, 2))}
                placeholder="✨"
                maxLength={2}
                className="w-20 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-center text-2xl focus:outline-none focus:border-purple-400"
              />
            </Field>
          )}

          <Field label="Ambient particles" hint="Floating elements in the background">
            <div className="flex flex-wrap gap-2">
              {PARTICLE_OPTIONS.map((opt) => {
                const active = (overrides.ambient_particles || "none") === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => set("ambient_particles", opt.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2",
                      active
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                    )}
                  >
                    <span>{opt.preview}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Confetti burst">
            <div className="flex gap-2">
              {[
                { id: false, label: "Off" },
                { id: true, label: "On page load" },
              ].map((opt) => {
                const active = (overrides.confetti_on_load || false) === opt.id;
                return (
                  <button
                    key={String(opt.id)}
                    type="button"
                    onClick={() => set("confetti_on_load", opt.id || undefined)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2",
                      active
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                    )}
                  >
                    {opt.id ? "🎉 " : ""}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ───

function FontSelect({
  value,
  onChange,
}: {
  value: FontChoice;
  onChange: (v: FontChoice) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FontChoice)}
      className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm text-gray-900 cursor-pointer hover:border-purple-300 transition-colors"
    >
      {FONT_OPTIONS.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#a855f7"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded-lg border-2 border-gray-200 cursor-pointer p-0 hover:border-purple-300 transition-colors"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="Template default"
          className="flex-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm text-gray-900 font-mono"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-gray-400 hover:text-purple-600 px-3 py-2 transition-colors cursor-pointer"
            aria-label="Reset to template"
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              "w-9 h-9 rounded-full transition-all hover:scale-110 relative cursor-pointer",
              value === c
                ? "ring-4 ring-purple-300 scale-110 shadow-lg"
                : "ring-2 ring-white shadow-md"
            )}
            style={{ backgroundColor: c }}
            aria-label={`Use ${c}`}
          >
            {value === c && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-2",
              active
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg scale-105"
                : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
