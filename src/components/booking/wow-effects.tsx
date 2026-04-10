"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CursorEffect, AmbientParticles } from "@/lib/page-builder/overrides";

// ─────────────────────────────────────────────────────────────
//  1. Cursor Effects
// ─────────────────────────────────────────────────────────────

interface CursorProps {
  effect: CursorEffect;
  emoji?: string;
  accentColor?: string;
  intensity?: number; // 0-100, default 50
}

interface Particle {
  id: number;
  x: number;
  y: number;
  born: number;
}

let particleId = 0;

export function CursorEffects({ effect, emoji, accentColor, intensity = 50 }: CursorProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const frameRef = useRef<number>(0);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (effect === "sparkle") {
        const maxParticles = Math.round(5 + (intensity / 100) * 30); // 5 at 0% → 35 at 100%
        particleId++;
        setParticles((prev) => [
          ...prev.slice(-maxParticles),
          { id: particleId, x: e.clientX, y: e.clientY, born: Date.now() },
        ]);
      }
    },
    [effect]
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

  const color = accentColor || "var(--template-accent, #a855f7)";

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {/* Glow cursor — soft radial gradient following the mouse */}
      {effect === "glow" && (() => {
        const glowSize = 128 + Math.round((intensity / 100) * 256); // 128px at 0% → 384px at 100%
        const glowOpacity = 0.1 + (intensity / 100) * 0.4; // 0.1 → 0.5
        return (
          <div
            className="fixed rounded-full blur-3xl transition-transform duration-75"
            style={{
              width: `${glowSize * 2}px`,
              height: `${glowSize * 2}px`,
              opacity: glowOpacity,
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              transform: `translate(${mousePos.x - glowSize}px, ${mousePos.y - glowSize}px)`,
            }}
          />
        );
      })()}

      {/* Sparkle trail — tiny stars that fade out */}
      {effect === "sparkle" &&
        particles.map((p) => {
          const age = (Date.now() - p.born) / 800; // 0 → 1 over 800ms
          return (
            <div
              key={p.id}
              className="fixed"
              style={{
                left: p.x - 6,
                top: p.y - 6 - age * 30, // float upward
                opacity: 1 - age,
                transform: `scale(${1 - age * 0.5}) rotate(${age * 180}deg)`,
                transition: "none",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0L7.3 4.7L12 6L7.3 7.3L6 12L4.7 7.3L0 6L4.7 4.7Z"
                  fill={color}
                />
              </svg>
            </div>
          );
        })}

      {/* Emoji cursor — emoji follows the mouse */}
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
//  2. Ambient Particles
// ─────────────────────────────────────────────────────────────

interface AmbientProps {
  type: AmbientParticles;
  accentColor?: string;
  intensity?: number; // 0-100, default 50
}

export function AmbientParticlesEffect({ type, accentColor, intensity = 50 }: AmbientProps) {
  if (type === "none" || intensity === 0) return null;

  const color = accentColor || "var(--template-accent, #a855f7)";
  const scale = intensity / 50; // 0→0, 50→1, 100→2
  const baseCount =
    type === "stars" ? 15 :
    type === "sparkles" ? 20 :
    type === "fireflies" ? 10 :
    type === "bubbles" ? 8 : 0;
  const count = Math.round(baseCount * scale);
  const opacity = 0.15 + (intensity / 100) * 0.45; // 0.15 at 0% → 0.6 at 100%

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 6 + Math.random() * 10;
        const size = type === "bubbles" ? 8 + Math.random() * 20 : 3 + Math.random() * 6;

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
              <svg width={size * 2} height={size * 2} viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0L7.3 4.7L12 6L7.3 7.3L6 12L4.7 7.3L0 6L4.7 4.7Z"
                  fill={color}
                  opacity={opacity}
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
                backgroundColor: color,
                opacity: opacity,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        }

        if (type === "fireflies") {
          return (
            <div
              key={i}
              className="absolute rounded-full animate-ambient-firefly"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: "#fbbf24",
                boxShadow: `0 0 ${size * 3}px ${size}px rgba(251, 191, 36, ${opacity * 0.8})`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        }

        if (type === "bubbles") {
          return (
            <div
              key={i}
              className="absolute rounded-full animate-ambient-rise"
              style={{
                left: `${left}%`,
                bottom: `-${size}px`,
                width: `${size}px`,
                height: `${size}px`,
                border: `1px solid ${color}`,
                opacity: opacity * 0.5,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
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

export function ConfettiBurst({ accentColor }: { accentColor?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const colors = [
    accentColor || "var(--template-accent, #a855f7)",
    "var(--primary, #ec4899)",
    "var(--accent, #f59e0b)",
    "#10b981",
    "#3b82f6",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = 30 + Math.random() * 40;
        const delay = Math.random() * 0.5;
        const size = 6 + Math.random() * 10;
        const color = colors[i % colors.length];
        const rotation = Math.random() * 360;
        const spread = (Math.random() - 0.5) * 60;
        return (
          <div
            key={i}
            className="absolute rounded-sm animate-confetti-burst"
            style={{
              left: `${left}%`,
              top: "30%",
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: color,
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
