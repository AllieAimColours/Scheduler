"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  CursorEffect,
  AmbientParticles,
  ParticleColorMode,
  ClickBurstStyle,
} from "@/lib/page-builder/overrides";

// ─────────────────────────────────────────────────────────────
//  useAnimationTick — drives 60fps re-renders while `active`.
//  Only runs the rAF loop while needed; stops as soon as active is false.
// ─────────────────────────────────────────────────────────────
function useAnimationTick(active: boolean): number {
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    function loop() {
      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active]);

  return tick;
}

// ─────────────────────────────────────────────────────────────
//  Color helpers — make particles either themed, rainbow, or pastel
// ─────────────────────────────────────────────────────────────

const PASTEL_PALETTE = [
  "#FFB5E8", // pink
  "#B5DEFF", // blue
  "#FFE5B4", // peach
  "#C7CEEA", // lavender
  "#B5EAD7", // mint
  "#FFDAC1", // coral
  "#E2F0CB", // sage
  "#FFC8DD", // rose
];

function colorForIndex(
  i: number,
  mode: ParticleColorMode | undefined,
  themeColor: string,
  customColor?: string
): string {
  if (mode === "rainbow") {
    // HSL rotation across the full hue wheel
    const hue = (i * 37) % 360;
    return `hsl(${hue}, 80%, 65%)`;
  }
  if (mode === "pastel") {
    return PASTEL_PALETTE[i % PASTEL_PALETTE.length];
  }
  if (mode === "custom" && customColor) {
    return customColor;
  }
  return themeColor;
}

// ─────────────────────────────────────────────────────────────
//  1. Cursor Effects
// ─────────────────────────────────────────────────────────────

interface CursorProps {
  effect: CursorEffect;
  emoji?: string;
  accentColor?: string;
  intensity?: number;
  colorMode?: ParticleColorMode;
  customColor?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  born: number;
  hue?: number;
}

let particleId = 0;

export function CursorEffects({
  effect,
  emoji,
  accentColor,
  intensity = 50,
  colorMode,
  customColor,
}: CursorProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const lastSparkleRef = useRef<number>(0);

  // Drive 60fps re-renders while there are sparkle particles in flight,
  // so the floating-up animation looks smooth between mousemoves.
  useAnimationTick(effect === "sparkle" && particles.length > 0);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (effect === "sparkle") {
        // Throttle sparkle spawn so a fast mouse doesn't dump 200 particles/sec.
        // Higher intensity → more frequent spawns.
        const now = Date.now();
        const minIntervalMs = Math.max(8, 50 - intensity / 3);
        if (now - lastSparkleRef.current < minIntervalMs) return;
        lastSparkleRef.current = now;

        const maxParticles = Math.round(5 + (intensity / 100) * 30);
        particleId++;
        setParticles((prev) => [
          ...prev.slice(-maxParticles),
          { id: particleId, x: e.clientX, y: e.clientY, born: now },
        ]);
      }
    },
    [effect, intensity]
  );

  // Clean up old sparkle particles
  useEffect(() => {
    if (effect !== "sparkle") return;
    const interval = setInterval(() => {
      const now = Date.now();
      setParticles((prev) => prev.filter((p) => now - p.born < 800));
    }, 100);
    return () => clearInterval(interval);
  }, [effect]);

  useEffect(() => {
    if (effect === "none") return;
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [effect, handleMove]);

  if (effect === "none") return null;

  const baseColor = accentColor || "var(--template-accent, #a855f7)";

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {effect === "glow" &&
        (() => {
          const glowSize = 128 + Math.round((intensity / 100) * 256);
          const glowOpacity = 0.1 + (intensity / 100) * 0.4;
          const c = colorMode === "custom" && customColor ? customColor : baseColor;
          return (
            <div
              className="fixed top-0 left-0 rounded-full blur-3xl"
              style={{
                width: `${glowSize * 2}px`,
                height: `${glowSize * 2}px`,
                opacity: glowOpacity,
                background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
                transform: `translate3d(${mousePos.x - glowSize}px, ${mousePos.y - glowSize}px, 0)`,
                willChange: "transform",
              }}
            />
          );
        })()}

      {effect === "sparkle" &&
        (() => {
          // Particle size scales with intensity: 8px at 0% → 32px at 100%
          const particleSize = 8 + Math.round((intensity / 100) * 24);
          const now = Date.now();
          return particles.map((p, idx) => {
            const age = Math.min(1, (now - p.born) / 800);
            const c = colorForIndex(p.id + idx, colorMode, baseColor, customColor);
            // GPU-accelerated transform: translate + scale + rotate in one
            const tx = p.x - particleSize / 2;
            const ty = p.y - particleSize / 2 - age * 30;
            const scale = 1 - age * 0.5;
            const rotation = age * 180;
            return (
              <div
                key={p.id}
                className="fixed top-0 left-0"
                style={{
                  width: particleSize,
                  height: particleSize,
                  opacity: 1 - age,
                  transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale}) rotate(${rotation}deg)`,
                  willChange: "transform, opacity",
                  transition: "none",
                }}
              >
                <svg
                  width={particleSize}
                  height={particleSize}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M6 0L7.3 4.7L12 6L7.3 7.3L6 12L4.7 7.3L0 6L4.7 4.7Z"
                    fill={c}
                  />
                </svg>
              </div>
            );
          });
        })()}

      {effect === "emoji" && emoji && (() => {
        // Font size scales with intensity: 16px at 0% → 56px at 100%
        const fontSize = 16 + Math.round((intensity / 100) * 40);
        return (
          <div
            className="fixed transition-transform duration-75"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1,
              transform: `translate(${mousePos.x + fontSize / 4}px, ${mousePos.y + fontSize / 4}px)`,
            }}
          >
            {emoji}
          </div>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  2. Ambient Particles — float behind content
// ─────────────────────────────────────────────────────────────

interface AmbientProps {
  type: AmbientParticles;
  accentColor?: string;
  intensity?: number;
  colorMode?: ParticleColorMode;
  customColor?: string;
}

export function AmbientParticlesEffect({
  type,
  accentColor,
  intensity = 50,
  colorMode,
  customColor,
}: AmbientProps) {
  if (type === "none" || intensity === 0) return null;

  const baseColor = accentColor || "var(--template-accent, #a855f7)";
  const scale = intensity / 50;
  const baseCount =
    type === "stars" ? 15 :
    type === "sparkles" ? 20 :
    type === "fireflies" ? 10 :
    type === "bubbles" ? 8 :
    type === "petals" ? 12 :
    type === "hearts" ? 10 :
    type === "snow" ? 25 : 0;
  const count = Math.round(baseCount * scale);
  const baseOpacity = 0.15 + (intensity / 100) * 0.55;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 6 + Math.random() * 10;
        const size = 4 + Math.random() * 8;
        const c = colorForIndex(i, colorMode, baseColor, customColor);

        if (type === "stars") {
          return (
            <div
              key={i}
              className="absolute animate-ambient-float"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <svg width={size * 2.5} height={size * 2.5} viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0L7.3 4.7L12 6L7.3 7.3L6 12L4.7 7.3L0 6L4.7 4.7Z"
                  fill={c}
                  opacity={baseOpacity}
                />
              </svg>
            </div>
          );
        }

        if (type === "sparkles") {
          return (
            <div
              key={i}
              className="absolute rounded-full animate-ambient-twinkle"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: c,
                opacity: baseOpacity,
                boxShadow: `0 0 ${size * 2}px ${c}`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        }

        if (type === "fireflies") {
          const fireflyColor = colorMode && colorMode !== "theme" ? c : "#fbbf24";
          return (
            <div
              key={i}
              className="absolute rounded-full animate-ambient-firefly"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: fireflyColor,
                boxShadow: `0 0 ${size * 4}px ${size}px ${fireflyColor}`,
                opacity: baseOpacity,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        }

        if (type === "bubbles") {
          const bubbleSize = 8 + Math.random() * 24;
          return (
            <div
              key={i}
              className="absolute rounded-full animate-ambient-rise"
              style={{
                left: `${left}%`,
                bottom: `-${bubbleSize}px`,
                width: `${bubbleSize}px`,
                height: `${bubbleSize}px`,
                border: `1.5px solid ${c}`,
                opacity: baseOpacity * 0.7,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        }

        if (type === "petals") {
          // Soft falling peony petals — curved, asymmetric, drift as they fall
          const petalSize = 14 + Math.random() * 18;
          return (
            <div
              key={i}
              className="absolute animate-ambient-fall"
              style={{
                left: `${left}%`,
                top: `-${petalSize}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration + 6}s`,
                opacity: baseOpacity,
              }}
            >
              <svg
                width={petalSize}
                height={petalSize}
                viewBox="0 0 40 40"
                fill="none"
              >
                {/* A curled peony petal — wider on one side, gently tapered */}
                <path
                  d="M20 4
                     C 28 6, 34 14, 33 22
                     C 32 30, 26 36, 20 36
                     C 14 36, 8 30, 7 22
                     C 6 14, 12 6, 20 4 Z"
                  fill={c}
                />
                {/* Inner highlight for depth */}
                <path
                  d="M20 8
                     C 25 10, 28 16, 27 22
                     C 26 28, 23 32, 20 32"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        }

        if (type === "hearts") {
          const heartSize = 10 + Math.random() * 10;
          return (
            <div
              key={i}
              className="absolute animate-ambient-rise"
              style={{
                left: `${left}%`,
                bottom: `-${heartSize}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration + 4}s`,
                opacity: baseOpacity,
              }}
            >
              <svg
                width={heartSize}
                height={heartSize}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8C19 16.5 12 21 12 21z"
                  fill={c}
                />
              </svg>
            </div>
          );
        }

        if (type === "snow") {
          const snowSize = 4 + Math.random() * 6;
          const snowColor = colorMode && colorMode !== "theme" ? c : "#ffffff";
          return (
            <div
              key={i}
              className="absolute rounded-full animate-ambient-fall"
              style={{
                left: `${left}%`,
                top: `-${snowSize}px`,
                width: `${snowSize}px`,
                height: `${snowSize}px`,
                backgroundColor: snowColor,
                boxShadow: `0 0 ${snowSize * 2}px ${snowColor}`,
                opacity: baseOpacity,
                animationDelay: `${delay}s`,
                animationDuration: `${duration + 8}s`,
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  3. Confetti burst on load
// ─────────────────────────────────────────────────────────────

export function ConfettiBurst({
  accentColor,
  colorMode,
  customColor,
}: {
  accentColor?: string;
  colorMode?: ParticleColorMode;
  customColor?: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {Array.from({ length: 60 }).map((_, i) => {
        const left = 30 + Math.random() * 40;
        const delay = Math.random() * 0.5;
        const size = 6 + Math.random() * 10;
        const c = colorForIndex(i, colorMode, accentColor || "#a855f7", customColor);
        const rotation = Math.random() * 360;
        const spread = (Math.random() - 0.5) * 80;
        return (
          <div
            key={i}
            className="absolute rounded-sm animate-confetti-burst"
            style={{
              left: `${left}%`,
              top: "30%",
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: c,
              animationDelay: `${delay}s`,
              transform: `rotate(${rotation}deg)`,
              ["--spread" as string]: `${spread}vw`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  4. Click Burst — particles explode from where you click
// ─────────────────────────────────────────────────────────────

interface ClickBurstProps {
  style: ClickBurstStyle;
  emoji?: string;
  accentColor?: string;
  colorMode?: ParticleColorMode;
  customColor?: string;
}

interface BurstInstance {
  id: number;
  x: number;
  y: number;
  born: number;
}

let burstId = 0;

export function ClickBurst({
  style,
  emoji,
  accentColor,
  colorMode,
  customColor,
}: ClickBurstProps) {
  const [bursts, setBursts] = useState<BurstInstance[]>([]);

  // Drive 60fps re-renders while bursts are in flight
  useAnimationTick(style !== "none" && bursts.length > 0);

  useEffect(() => {
    if (style === "none") return;

    function handleClick(e: MouseEvent) {
      burstId++;
      setBursts((prev) => [
        ...prev.slice(-5),
        { id: burstId, x: e.clientX, y: e.clientY, born: Date.now() },
      ]);
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [style]);

  // Clean up old bursts
  useEffect(() => {
    if (style === "none") return;
    const interval = setInterval(() => {
      const now = Date.now();
      setBursts((prev) => prev.filter((b) => now - b.born < 1500));
    }, 200);
    return () => clearInterval(interval);
  }, [style]);

  if (style === "none") return null;

  const baseColor = accentColor || "#a855f7";

  // Capture "now" once per render so all particles in the same frame are
  // computed against the same timestamp (no per-particle drift).
  const renderTime = Date.now();

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {bursts.map((b) => {
        const particleCount = 16;
        return Array.from({ length: particleCount }).map((_, i) => {
          // Deterministic pseudo-random per (b.id, i) so particles stay
          // stable across re-renders. Five independent streams for:
          // angle jitter, distance, size, rotation, gravity coefficient.
          const seed = (b.id * 31 + i) * 9301 + 49297;
          const r1 = ((seed % 233280) / 233280 + 1) % 1;
          const r2 = (((seed * 7) % 233280) / 233280 + 1) % 1;
          const r3 = (((seed * 13) % 233280) / 233280 + 1) % 1;
          const r4 = (((seed * 23) % 233280) / 233280 + 1) % 1;
          const r5 = (((seed * 41) % 233280) / 233280 + 1) % 1;

          // Base angle starts perfectly even, then gets ±60° of jitter so
          // particles fan out in uneven clusters instead of a perfect wheel.
          const baseAngle = (i / particleCount) * Math.PI * 2;
          const angleJitter = (r1 - 0.5) * (Math.PI / 1.5); // ±60°
          const angle = baseAngle + angleJitter;

          // Variable distance — some particles travel 2-3x further than
          // others, so the explosion has a ragged silhouette.
          const distance = 40 + r2 * 120; // 40-160px

          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance;

          const c = colorForIndex(i + b.id, colorMode, baseColor, customColor);
          const size = 6 + r3 * 12; // 6-18px, wider spread
          const age = Math.min(1, (renderTime - b.born) / 1500);

          // Per-particle rotation: full spin over the life, with random start
          const startRotation = r4 * 360;
          const spinAmount = (r4 - 0.5) * 1080; // -540° to +540°
          const rotation = startRotation + spinAmount * age;

          // Per-particle gravity: some fall fast, some drift
          const gravityStrength = 60 + r5 * 100; // 60-160

          // Ease-out for the outward burst — fast at first, slows down
          const eased = 1 - Math.pow(1 - Math.min(age * 2, 1), 2);
          const tx = b.x - size / 2 + dx * eased;
          const ty = b.y - size / 2 + dy * eased + age * age * gravityStrength;

          const sharedStyle: React.CSSProperties = {
            position: "fixed",
            top: 0,
            left: 0,
            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${1 - age}) rotate(${rotation}deg)`,
            opacity: 1 - age,
            willChange: "transform, opacity",
            transition: "none",
          };

          if (style === "confetti") {
            return (
              <div
                key={`${b.id}-${i}`}
                className="rounded-sm"
                style={{
                  ...sharedStyle,
                  width: `${size}px`,
                  height: `${size * 0.6}px`,
                  backgroundColor: c,
                }}
              />
            );
          }

          if (style === "sparkles") {
            return (
              <svg
                key={`${b.id}-${i}`}
                width={size * 1.5}
                height={size * 1.5}
                viewBox="0 0 12 12"
                style={sharedStyle}
              >
                <path
                  d="M6 0L7.3 4.7L12 6L7.3 7.3L6 12L4.7 7.3L0 6L4.7 4.7Z"
                  fill={c}
                />
              </svg>
            );
          }

          if (style === "hearts") {
            return (
              <svg
                key={`${b.id}-${i}`}
                width={size * 1.5}
                height={size * 1.5}
                viewBox="0 0 24 24"
                style={sharedStyle}
              >
                <path
                  d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8C19 16.5 12 21 12 21z"
                  fill={c}
                />
              </svg>
            );
          }

          if (style === "stars") {
            return (
              <div
                key={`${b.id}-${i}`}
                style={{
                  ...sharedStyle,
                  fontSize: `${size + 4}px`,
                  color: c,
                }}
              >
                ⭐
              </div>
            );
          }

          if (style === "emoji" && emoji) {
            return (
              <div
                key={`${b.id}-${i}`}
                style={{
                  ...sharedStyle,
                  fontSize: `${size + 8}px`,
                }}
              >
                {emoji}
              </div>
            );
          }

          return null;
        });
      })}
    </div>
  );
}
