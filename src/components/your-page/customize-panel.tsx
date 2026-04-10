"use client";

import { useState } from "react";
import { ChevronDown, Sliders, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field } from "./editors/field";
import {
  FONT_OPTIONS,
  type PageOverrides,
  type RadiusChoice,
  type DecorationsLevel,
  type AnimationSpeed,
  type FontChoice,
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
  const [open, setOpen] = useState(false);
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
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-purple-50/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
            <Sliders className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <div className="font-display text-lg font-semibold text-gray-800">Customize</div>
            <div className="text-xs text-gray-400">
              {overridden ? "Overrides active — click to expand" : "Override fonts, colors & feel"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {overridden && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetAll();
              }}
              className="text-xs text-gray-400 hover:text-purple-600 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-gray-100 pt-5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {/* Fonts */}
          <div className="grid sm:grid-cols-2 gap-4">
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

          {/* Colors */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Primary color" hint="Buttons, accents, hover states">
              <ColorPicker
                value={overrides.primary_color}
                onChange={(v) => set("primary_color", v)}
              />
            </Field>
            <Field label="Accent color" hint="Secondary highlights">
              <ColorPicker
                value={overrides.accent_color}
                onChange={(v) => set("accent_color", v)}
              />
            </Field>
          </div>

          <Field label="Background color" hint="Leave empty for the template default">
            <ColorPicker
              value={overrides.background_color}
              onChange={(v) => set("background_color", v)}
            />
          </Field>

          {/* Radius */}
          <Field label="Corner roundness">
            <SegmentedControl
              options={RADIUS_OPTIONS}
              value={overrides.radius || "default"}
              onChange={(v) => set("radius", v)}
            />
          </Field>

          {/* Decorations */}
          <Field label="Background decorations" hint="Orbs, grids, confetti, shimmer">
            <SegmentedControl
              options={DECORATIONS_OPTIONS}
              value={overrides.decorations || "default"}
              onChange={(v) => set("decorations", v)}
            />
          </Field>

          {/* Animation */}
          <Field label="Animation speed">
            <SegmentedControl
              options={ANIMATION_OPTIONS}
              value={overrides.animation || "default"}
              onChange={(v) => set("animation", v)}
            />
          </Field>
        </div>
      )}
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
      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm text-gray-900"
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
          className="h-9 w-12 rounded-lg border border-gray-200 cursor-pointer p-0"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="Template default"
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-sm text-gray-900 font-mono"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-gray-400 hover:text-purple-600 px-2 py-1 transition-colors"
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
              "w-9 h-9 rounded-full transition-all hover:scale-110 relative",
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
    <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
            value === opt.id
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105"
              : "text-gray-500 hover:text-gray-900 hover:bg-white"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
