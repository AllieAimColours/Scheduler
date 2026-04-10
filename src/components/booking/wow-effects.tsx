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
}

interface Particle {
  id: number;
  x: number;
  y: number;
  born: number;
}

let particleId = 0;

export function CursorEffects({ effect, emoji, accentColor }: CursorProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const frameRef = useRef<number>(0);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (effect === "sparkle") {
        // Only add a sparkle every ~40px of movement
        particleId++;
        setParticles((prev) => [
          ...prev.slice(-20), // keep max 20 particles
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
      {effect === "glow" && (
        <div
          className="fixed w-64 h-64 rounded-full opacity-30 blur-3xl transition-transform duration-75"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            transform: `translate(${mousePos.x - 128}px, ${mousePos.y - 128}px)`,
          }}
        />
      )}

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
}

export function AmbientParticlesEffect({ type, accentColor }: AmbientProps) {
  if (type === "none") return null;

  const color = accentColor || "var(--template-accent, #a855f7)";
  const count =
    type === "stars" ? 30 :
    type === "sparkles" ? 40 :
    type === "fireflies" ? 20 :
    type === "bubbles" ? 15 : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden" aria-hidden="true">
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
                  opacity="0.5"
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
                boxShadow: `0 0 ${size * 3}px ${size}px rgba(251, 191, 36, 0.6)`,
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
                opacity: 0.2,
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
