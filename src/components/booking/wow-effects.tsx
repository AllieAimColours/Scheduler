"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  CursorEffect,
  AmbientParticles,
  ParticleColorMode,
  ClickBurstStyle,
} from "@/lib/page-builder/overrides";

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

  const handleMove = useCallback(
    (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (effect === "sparkle") {
        const maxParticles = Math.round(5 + (intensity / 100) * 30);
        particleId++;
        setParticles((prev) => [
          ...prev.slice(-maxParticles),
          { id: particleId, x: e.clientX, y: e.clientY, born: Date.now() },
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
              className="fixed rounded-full blur-3xl transition-transform duration-75"
              style={{
                width: `${glowSize * 2}px`,
                height: `${glowSize * 2}px`,
                opacity: glowOpacity,
                background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
                transform: `translate(${mousePos.x - glowSize}px, ${mousePos.y - glowSize}px)`,
              }}
            />
          );
        })()}

      {effect === "sparkle" &&
        particles.map((p, idx) => {
          const age = (Date.now() - p.born) / 800;
          const c = colorForIndex(p.id + idx, colorMode, baseColor, customColor);
          return (
            <div
              key={p.id}
              className="fixed"
              style={{
                left: p.x - 6,
                top: p.y - 6 - age * 30,
                opacity: 1 - age,
                transform: `scale(${1 - age * 0.5}) rotate(${age * 180}deg)`,
                transition: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0L7.3 4.7L12 6L7.3 7.3L6 12L4.7 7.3L0 6L4.7 4.7Z"
                  fill={c}
                />
              </svg>
            </div>
          );
        })}

      {effect === "emoji" && emoji && (
        <div
          className="fixed text-2xl transition-transform duration-75"
          style={{
            transform: `translate(${mousePos.x + 12}px, ${mousePos.y + 12}px)`,
          }}
        >
          {emoji}
        </div>
      )}
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

  useEffect(() => {
    if (style === "none") return;

    function handleClick(e: MouseEvent) {
      // Skip if clicking on a button/link/input — they have their own behavior
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select")
      ) {
        // Still trigger the burst, but don't interfere
      }
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

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {bursts.map((b) => {
        const particleCount = 12;
        return Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const distance = 60 + Math.random() * 40;
          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance;
          const c = colorForIndex(i + b.id, colorMode, baseColor, customColor);
          const size = 8 + Math.random() * 8;
          const age = (Date.now() - b.born) / 1500;

          const sharedStyle: React.CSSProperties = {
            position: "absolute",
            left: b.x,
            top: b.y,
            transform: `translate(-50%, -50%) translate(${dx * Math.min(age * 2, 1)}px, ${
              dy * Math.min(age * 2, 1) + age * age * 80
            }px) scale(${1 - age})`,
            opacity: 1 - age,
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
