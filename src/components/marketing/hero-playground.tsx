"use client";

/**
 * Hero playground for the marketing landing page.
 *
 * Visitors can play with ambient particles + cursor effects live as a
 * "try before you buy" demo. Defaults to falling peony petals (the brand
 * vibe) and lets them switch to fireflies, sparkles, hearts, etc.
 *
 * Renders the same wow-effects components as the booking pages, but
 * with explicit color props (no TemplateProvider needed).
 */

import { useState } from "react";
import {
  Sparkles as SparklesIcon,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AmbientParticlesEffect,
  CursorEffects,
  ClickBurst,
} from "@/components/booking/wow-effects";
import type {
  AmbientParticles,
  CursorEffect,
  ParticleColorMode,
  ClickBurstStyle,
} from "@/lib/page-builder/overrides";

const PARTICLE_OPTIONS: Array<{ id: AmbientParticles; label: string; emoji: string }> = [
  { id: "petals", label: "Petals", emoji: "🌸" },
  { id: "stars", label: "Stars", emoji: "⭐" },
  { id: "sparkles", label: "Sparkles", emoji: "✨" },
  { id: "fireflies", label: "Fireflies", emoji: "🪲" },
  { id: "bubbles", label: "Bubbles", emoji: "🫧" },
  { id: "hearts", label: "Hearts", emoji: "💖" },
  { id: "snow", label: "Snow", emoji: "❄️" },
  { id: "none", label: "None", emoji: "🚫" },
];

const CURSOR_OPTIONS: Array<{ id: CursorEffect; label: string; emoji: string }> = [
  { id: "sparkle", label: "Sparkle", emoji: "✨" },
  { id: "glow", label: "Glow", emoji: "💡" },
  { id: "none", label: "None", emoji: "🚫" },
];

const COLOR_OPTIONS: Array<{ id: ParticleColorMode; label: string; emoji: string }> = [
  { id: "theme", label: "Pink", emoji: "🌷" },
  { id: "pastel", label: "Pastel", emoji: "🎨" },
  { id: "rainbow", label: "Rainbow", emoji: "🌈" },
];

const BURST_OPTIONS: Array<{ id: ClickBurstStyle; label: string; emoji: string }> = [
  { id: "confetti", label: "Confetti", emoji: "🎉" },
  { id: "hearts", label: "Hearts", emoji: "💖" },
  { id: "sparkles", label: "Sparkles", emoji: "✨" },
  { id: "stars", label: "Stars", emoji: "⭐" },
  { id: "none", label: "Off", emoji: "🚫" },
];

const ACCENT = "#ec4899"; // peony pink

export function HeroPlayground() {
  const [open, setOpen] = useState(true);
  const [particles, setParticles] = useState<AmbientParticles>("petals");
  const [cursor, setCursor] = useState<CursorEffect>("sparkle");
  const [colorMode, setColorMode] = useState<ParticleColorMode>("theme");
  const [intensity, setIntensity] = useState(60);
  const [burst, setBurst] = useState<ClickBurstStyle>("confetti");

  return (
    <>
      {/* The actual effects layered behind the page */}
      <AmbientParticlesEffect
        type={particles}
        accentColor={ACCENT}
        intensity={intensity}
        colorMode={colorMode}
      />
      <CursorEffects
        effect={cursor}
        accentColor={ACCENT}
        intensity={intensity}
        colorMode={colorMode}
      />
      <ClickBurst
        style={burst}
        accentColor={ACCENT}
        colorMode={colorMode}
      />

      {/* Floating playground panel */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm">
        {open ? (
          <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-pink-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-pink-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-pink-700">
                  Try the magic
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Hide playground"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <PlaygroundField label="Falling effect">
                <ButtonGrid
                  options={PARTICLE_OPTIONS}
                  value={particles}
                  onChange={setParticles}
                />
              </PlaygroundField>

              <PlaygroundField label="Cursor">
                <ButtonGrid
                  options={CURSOR_OPTIONS}
                  value={cursor}
                  onChange={setCursor}
                />
              </PlaygroundField>

              <PlaygroundField label="Click bursts">
                <ButtonGrid
                  options={BURST_OPTIONS}
                  value={burst}
                  onChange={setBurst}
                />
              </PlaygroundField>

              <PlaygroundField label="Color">
                <ButtonGrid
                  options={COLOR_OPTIONS}
                  value={colorMode}
                  onChange={setColorMode}
                />
              </PlaygroundField>

              <PlaygroundField label={`Intensity — ${intensity}%`}>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-pink-500 bg-pink-100 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-rose-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </PlaygroundField>

              <p className="text-[11px] text-gray-400 text-center pt-2 border-t border-gray-100">
                Click anywhere to see the burst effect ✨
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xl hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all duration-300 animate-in slide-in-from-bottom-2 duration-300"
          >
            <SparklesIcon className="h-4 w-4" />
            <span className="text-sm font-bold">Try the magic</span>
            <ChevronUp className="h-3 w-3" />
          </button>
        )}
      </div>
    </>
  );
}

// ─── Subcomponents ───

function PlaygroundField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </div>
      {children}
    </div>
  );
}

function ButtonGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string; emoji: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border",
              active
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50/50"
            )}
          >
            <span>{opt.emoji}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
