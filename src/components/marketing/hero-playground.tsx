"use client";

/**
 * Hero playground for the marketing landing page.
 *
 * Minimal "try the magic" rail anchored to the left side of the screen.
 * Only two controls: which particle effect is falling, and one color
 * toggle (pink vs pastel). Cursor sparkle and confetti click bursts are
 * always on so visitors discover them organically.
 *
 * Goal: show the magic without competing with the marketing copy.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AmbientParticlesEffect,
  CursorEffects,
  ClickBurst,
} from "@/components/booking/wow-effects";
import type {
  AmbientParticles,
  ParticleColorMode,
} from "@/lib/page-builder/overrides";

const PARTICLE_OPTIONS: Array<{ id: AmbientParticles; emoji: string; label: string }> = [
  { id: "petals", emoji: "🌸", label: "Petals" },
  { id: "stars", emoji: "⭐", label: "Stars" },
  { id: "sparkles", emoji: "✨", label: "Sparkles" },
  { id: "fireflies", emoji: "🪲", label: "Fireflies" },
  { id: "bubbles", emoji: "🫧", label: "Bubbles" },
  { id: "hearts", emoji: "💖", label: "Hearts" },
  { id: "snow", emoji: "❄️", label: "Snow" },
];

const COLOR_OPTIONS: Array<{ id: ParticleColorMode; label: string; preview: string }> = [
  { id: "theme", label: "Pink", preview: "🌷" },
  { id: "pastel", label: "Pastel", preview: "🎨" },
];

const ACCENT = "#ec4899"; // peony pink

export function HeroPlayground() {
  const [particles, setParticles] = useState<AmbientParticles>("petals");
  const [colorMode, setColorMode] = useState<ParticleColorMode>("theme");

  return (
    <>
      {/* Always-on effects layered behind the page */}
      <AmbientParticlesEffect
        type={particles}
        accentColor={ACCENT}
        intensity={60}
        colorMode={colorMode}
      />
      <CursorEffects
        effect="sparkle"
        accentColor={ACCENT}
        intensity={50}
        colorMode={colorMode}
      />
      <ClickBurst
        style="confetti"
        accentColor={ACCENT}
        colorMode={colorMode}
      />

      {/* Always-visible left rail. Hidden on small screens because it
          would crowd the hero. */}
      <div className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 max-w-[180px]">
        {/* Header */}
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-pink-600 px-1">
          ✨ Try the magic
        </div>

        {/* Particle picker */}
        <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-pink-100 shadow-xl p-2 space-y-1">
          {PARTICLE_OPTIONS.map((opt) => {
            const active = particles === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParticles(opt.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left",
                  active
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-pink-50/60 hover:text-pink-600"
                )}
              >
                <span className="text-base">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Color toggle */}
        <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-pink-100 shadow-xl p-2 flex gap-1">
          {COLOR_OPTIONS.map((opt) => {
            const active = colorMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setColorMode(opt.id)}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  active
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-pink-50/60"
                )}
              >
                <span>{opt.preview}</span>
                {opt.label}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-gray-400 text-center px-1 leading-relaxed">
          Click anywhere<br />to see the burst
        </p>
      </div>
    </>
  );
}
