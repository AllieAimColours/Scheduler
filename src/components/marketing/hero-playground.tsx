"use client";

/**
 * Hero playground for the marketing landing page.
 *
 * Two layouts:
 *
 * Desktop (lg+):
 * - Drawer pinned to the left side of the screen
 * - Starts EXPANDED on page load with a hand-drawn loop arrow doodle
 *   pointing at it ("← try this!" label)
 * - When user scrolls past 80vh, drawer collapses to a small "✨ Magic" tab
 * - Tab can be clicked any time to re-expand
 * - Scroll back to top → auto-re-expands (without doodle)
 * - Doodle fades on first interaction OR first scroll past 100px
 *
 * Mobile (under lg):
 * - Inline pill rendered between the brand title and the hero pill
 * - Always visible there, doesn't move, doesn't collapse
 * - Hero playground component returns null on mobile; <HeroPlaygroundInline />
 *   is rendered separately by the marketing page in the right slot
 *
 * The actual wow effects (cursor sparkle, falling particles, click bursts)
 * render fixed across the whole viewport regardless of which UI is shown.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft } from "lucide-react";
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

// ─────────────────────────────────────────────────────────────
//  Shared state hook so the inline mobile picker and the desktop
//  drawer drive the same particle/color values
// ─────────────────────────────────────────────────────────────

interface PlaygroundState {
  particles: AmbientParticles;
  setParticles: (v: AmbientParticles) => void;
  colorMode: ParticleColorMode;
  setColorMode: (v: ParticleColorMode) => void;
}

// ─────────────────────────────────────────────────────────────
//  Top-level export — renders effects + desktop drawer
// ─────────────────────────────────────────────────────────────

export function HeroPlayground() {
  const [particles, setParticles] = useSharedSignal<AmbientParticles>(
    "playground.particles",
    "petals"
  );
  const [colorMode, setColorMode] = useSharedSignal<ParticleColorMode>(
    "playground.colorMode",
    "theme"
  );

  const state: PlaygroundState = { particles, setParticles, colorMode, setColorMode };

  return (
    <>
      {/* Always-on effects (apply across the entire page) */}
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
        style="hearts"
        accentColor={ACCENT}
        colorMode={colorMode}
      />

      {/* Desktop drawer (hidden on mobile — mobile uses HeroPlaygroundInline) */}
      <DesktopDrawer state={state} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  Inline mobile playground — sits between hero title and pill
// ─────────────────────────────────────────────────────────────

export function HeroPlaygroundInline() {
  // This component does NOT own state — that lives in HeroPlayground above.
  // We use a tiny hidden trick: the inline picker reads/writes shared state
  // via window events.
  // For simplicity, the inline picker keeps its OWN state and the effects
  // listen via a postMessage-style event pattern. To avoid that complexity
  // we instead lift state into a module-level signal.
  const [particles, setParticles] = useSharedSignal<AmbientParticles>(
    "playground.particles",
    "petals"
  );
  const [colorMode, setColorMode] = useSharedSignal<ParticleColorMode>(
    "playground.colorMode",
    "theme"
  );

  return (
    <div className="lg:hidden flex flex-col items-center gap-2 my-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-pink-600">
        ✨ Try the magic
      </div>
      <div className="rounded-2xl bg-white border border-pink-100 shadow-lg p-2 max-w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {PARTICLE_OPTIONS.map((opt) => {
            const active = particles === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setParticles(opt.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                  active
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-pink-50/60"
                )}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-1.5">
        {COLOR_OPTIONS.map((opt) => {
          const active = colorMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setColorMode(opt.id)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border",
                active
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200"
              )}
            >
              <span>{opt.preview}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Tiny shared signal — module-level state with React subscribers
// ─────────────────────────────────────────────────────────────

const signalStore: Record<string, unknown> = {};
const signalSubs: Record<string, Set<() => void>> = {};

function useSharedSignal<T>(key: string, initial: T): [T, (v: T) => void] {
  const [, force] = useState(0);

  // Initialize on first read
  if (!(key in signalStore)) {
    signalStore[key] = initial;
  }

  useEffect(() => {
    if (!signalSubs[key]) signalSubs[key] = new Set();
    const cb = () => force((n) => n + 1);
    signalSubs[key].add(cb);
    return () => {
      signalSubs[key]?.delete(cb);
    };
  }, [key]);

  const value = signalStore[key] as T;
  const setValue = (v: T) => {
    signalStore[key] = v;
    signalSubs[key]?.forEach((cb) => cb());
  };

  return [value, setValue];
}

// Also re-wire the top-level HeroPlayground to use the same signals so
// desktop drawer and mobile inline both control the same effects.

// ─────────────────────────────────────────────────────────────
//  Desktop drawer with hand-drawn doodle and scroll-collapse
// ─────────────────────────────────────────────────────────────

function DesktopDrawer({ state }: { state: PlaygroundState }) {
  const [collapsed, setCollapsed] = useState(false);
  const [doodleVisible, setDoodleVisible] = useState(true);
  const userInteracted = useRef(false);

  // Auto-collapse on scroll past 80vh, auto-expand on scroll back to top.
  useEffect(() => {
    function onScroll() {
      const threshold = window.innerHeight * 0.8;
      const past = window.scrollY > threshold;

      // Hide the doodle on any scroll past 100px
      if (window.scrollY > 100 && doodleVisible) {
        setDoodleVisible(false);
      }

      setCollapsed(past);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [doodleVisible]);

  function handleInteract() {
    if (!userInteracted.current) {
      userInteracted.current = true;
      setDoodleVisible(false);
    }
  }

  return (
    <div className="hidden lg:block">
      {/* Collapsed tab — slides in from the left edge when collapsed */}
      <button
        onClick={() => setCollapsed(false)}
        aria-label="Open the magic playground"
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 px-2.5 py-4 rounded-r-2xl bg-gradient-to-b from-pink-500 to-rose-500 text-white shadow-2xl hover:px-3 transition-all duration-500 cursor-pointer",
          collapsed ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
        )}
      >
        <Sparkles className="h-4 w-4" />
        <div
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Magic
        </div>
      </button>

      {/* Expanded drawer */}
      <div
        className={cn(
          "fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 max-w-[200px] transition-all duration-500",
          collapsed
            ? "-translate-x-[120%] opacity-0 pointer-events-none"
            : "translate-x-0 opacity-100"
        )}
        onMouseDown={handleInteract}
      >
        {/* Header with collapse button */}
        <div className="flex items-center justify-between px-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-pink-600">
            ✨ Try the magic
          </div>
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Close playground"
            className="p-1 -mr-1 text-pink-400 hover:text-pink-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Particle picker */}
        <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-pink-100 shadow-xl p-2 space-y-1">
          {PARTICLE_OPTIONS.map((opt) => {
            const active = state.particles === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => state.setParticles(opt.id)}
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
            const active = state.colorMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => state.setColorMode(opt.id)}
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

        {/* Signup CTA */}
        <Link
          href="/signup"
          className="group relative block rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-3 shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-[10px] font-bold uppercase tracking-wider text-pink-100 mb-1">
              ✨ Want more?
            </div>
            <div className="text-[13px] font-bold text-white leading-tight mb-2">
              Create an account to unlock everything you can do
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-white">
              Get started free
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Hand-drawn doodle pointing at the drawer header.
            Anchored to the TOP-right of the drawer so the arrow tip lands
            right next to the < close button. Wiggles after drawing in. */}
        {doodleVisible && (
          <div
            className={cn(
              "absolute -right-48 top-0 pointer-events-none transition-opacity duration-500",
              doodleVisible ? "opacity-100" : "opacity-0"
            )}
            aria-hidden="true"
          >
            <div className="animate-doodle-wiggle">
              <svg
                width="200"
                height="100"
                viewBox="0 0 200 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Loop arrow — starts from the right where "try this!" lives,
                    swoops down into a loop, and points up-left at the drawer header.
                    Tip ends at (12, 12), pointing toward the < button. */}
                <path
                  d="M190 20 C 160 5, 130 50, 160 65 C 175 72, 165 35, 120 35 C 85 35, 55 30, 30 22 C 22 19, 16 16, 12 12"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  pathLength={1}
                  className="animate-doodle-draw"
                />
                {/* Arrowhead — tip at (12, 12) pointing up-left */}
                <path
                  d="M12 12 L 22 14 M 12 12 L 16 22"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  pathLength={1}
                  className="animate-doodle-draw"
                  style={{ animationDelay: "1.6s" }}
                />
              </svg>
              {/* "try this!" text in cursive script — sits to the right of the loop,
                  near where the loop starts (rightmost end of the arrow path) */}
              <div
                className="absolute top-8 right-2 font-script text-2xl text-pink-500 -rotate-6 select-none animate-in fade-in-0 slide-in-from-right-2 duration-700"
                style={{ animationDelay: "1.8s", animationFillMode: "both" }}
              >
                try this!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
