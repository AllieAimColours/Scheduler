"use client";

import { useTemplate } from "@/lib/templates/context";

// ─────────────────────────────────────────────────────────────
//  Template Personality Pass — each template gets a distinct
//  signature ambient animation that identifies it in the first
//  second a visitor lands. Keeps the product from feeling like
//  a color-palette-swap.
//
//  All animations are CSS-only, zero runtime JS cost, and use
//  pointer-events: none so they never block interaction.
// ─────────────────────────────────────────────────────────────

// ─── AURA — drifting fireflies + soft nebula orbs ───
function AuraFireflies() {
  // 18 fireflies at deterministic positions, each with its own
  // blink phase, drift speed, and hue (violet or pink accent).
  const flies = Array.from({ length: 18 }, (_, i) => {
    const seed = i * 37.5;
    return {
      top: `${(seed * 1.3) % 95}%`,
      left: `${(seed * 2.1 + 8) % 95}%`,
      size: 2 + (i % 4),
      delay: (i * 0.7) % 6,
      duration: 8 + (i % 5) * 2,
      hue: i % 3 === 0 ? "#FF9ECF" : "#C4A0FF",
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft violet nebula orbs */}
      <div
        className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(196,160,255,0.35) 0%, transparent 65%)",
          animation: "auraOrb 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/4 -right-32 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(255,158,207,0.30) 0%, transparent 65%)",
          animation: "auraOrb 35s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute -bottom-32 left-1/3 h-[24rem] w-[24rem] rounded-full opacity-35 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
          animation: "auraOrb 40s ease-in-out infinite",
        }}
      />

      {/* Fireflies */}
      {flies.map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: f.top,
            left: f.left,
            width: f.size,
            height: f.size,
            backgroundColor: f.hue,
            boxShadow: `0 0 ${f.size * 4}px ${f.hue}, 0 0 ${f.size * 8}px ${f.hue}50`,
            animation: `firefly ${f.duration}s ease-in-out ${f.delay}s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes auraOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-30px, 20px) scale(0.94); }
        }
        @keyframes firefly {
          0%, 100% { opacity: 0; transform: translate(0, 0); }
          10% { opacity: 0.9; }
          50% { opacity: 0.6; transform: translate(20px, -30px); }
          90% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

// ─── ROSE — falling peony petals ───
function RosePetals() {
  // 14 petals drifting down from above the fold, each rotating
  // gently. Positions are deterministic so server + client match.
  const petals = Array.from({ length: 14 }, (_, i) => ({
    left: `${(i * 7.3 + 3) % 100}%`,
    size: 14 + (i % 4) * 4,
    delay: (i * 1.1) % 10,
    duration: 14 + (i % 5) * 3,
    hue: i % 3 === 0 ? "#FFB8D6" : i % 3 === 1 ? "#FF6B9D" : "#D4348B",
    rotate: (i * 23) % 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <svg
          key={i}
          className="absolute"
          style={{
            top: "-5%",
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `petalFall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.55,
            transform: `rotate(${p.rotate}deg)`,
          }}
          viewBox="0 0 20 20"
        >
          {/* Stylized petal — teardrop with a curl */}
          <path
            d="M10 1 C 15 5, 17 10, 13 17 C 11 19, 9 19, 7 17 C 3 10, 5 5, 10 1 Z"
            fill={p.hue}
          />
        </svg>
      ))}

      {/* Subtle warm vignette */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(212,52,139,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 80% 90%, rgba(255,107,157,0.15) 0%, transparent 60%)",
        }}
      />

      <style>{`
        @keyframes petalFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.55;
          }
          50% {
            transform: translateY(50vh) translateX(25px) rotate(180deg);
          }
          90% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(110vh) translateX(-20px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ─── EDGE — pulsing neon grid ───
function EdgeGridPulse() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base grid */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Sweeping pulse line */}
      <div
        className="absolute inset-x-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #00F0FF 50%, transparent 100%)",
          boxShadow: "0 0 20px #00F0FF, 0 0 40px #00F0FF",
          animation: "edgeScanline 6s linear infinite",
          top: "0%",
        }}
      />
      {/* Corner glows */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.25) 0%, transparent 70%)",
          animation: "edgeGlowPulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(255,0,229,0.20) 0%, transparent 70%)",
          animation: "edgeGlowPulse 4s ease-in-out infinite 2s",
        }}
      />

      <style>{`
        @keyframes edgeScanline {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        @keyframes edgeGlowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

// ─── POP — playful rising confetti ───
function PopConfetti() {
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    left: `${(i * 4.5 + 2) % 100}%`,
    size: 6 + (i % 5) * 2,
    delay: (i * 0.4) % 8,
    duration: 9 + (i % 4) * 2,
    shape: i % 3, // 0: circle, 1: square, 2: triangle
    color: [
      "#FF2D6F", // pink
      "#FFCE00", // yellow
      "#00D4FF", // cyan
      "#7C3AED", // purple
      "#34D399", // green
    ][i % 5],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: p.left,
            bottom: "-5%",
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 2 ? p.color : "transparent",
            borderRadius: p.shape === 0 ? "9999px" : p.shape === 1 ? "2px" : 0,
            ...(p.shape === 2 && {
              width: 0,
              height: 0,
              borderLeft: `${p.size / 2}px solid transparent`,
              borderRight: `${p.size / 2}px solid transparent`,
              borderBottom: `${p.size}px solid ${p.color}`,
              backgroundColor: "transparent",
            }),
            animation: `popRise ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0.7,
          }}
        />
      ))}
      <style>{`
        @keyframes popRise {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.7; }
          50% {
            transform: translateY(-50vh) translateX(20px) rotate(180deg);
          }
          90% { opacity: 0.7; }
          100% {
            transform: translateY(-110vh) translateX(-15px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ─── LUXE — slow gold shimmer sweep ───
function LuxeGoldShimmer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Slow sweeping gold bar */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, transparent 35%, rgba(212,168,83,0.25) 48%, rgba(238,210,141,0.35) 50%, rgba(212,168,83,0.25) 52%, transparent 65%, transparent 100%)",
          backgroundSize: "300% 100%",
          animation: "luxeShimmer 16s ease-in-out infinite",
        }}
      />
      {/* Warm vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 15%, rgba(212,168,83,0.12) 0%, transparent 55%), radial-gradient(ellipse 70% 70% at 85% 90%, rgba(151,108,45,0.08) 0%, transparent 60%)",
        }}
      />
      {/* Subtle floating particles */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${(i * 13 + 5) % 90}%`,
            left: `${(i * 17 + 10) % 90}%`,
            width: 2,
            height: 2,
            backgroundColor: "#D4A853",
            boxShadow: "0 0 6px #D4A853, 0 0 12px rgba(212,168,83,0.5)",
            animation: `luxeParticle ${12 + (i % 3) * 3}s ease-in-out ${i * 0.8}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes luxeShimmer {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -100% 0; }
        }
        @keyframes luxeParticle {
          0%, 100% { opacity: 0; transform: translate(0, 0); }
          20% { opacity: 0.8; }
          50% { opacity: 0.6; transform: translate(15px, -20px); }
          80% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// ─── STUDIO — quiet dot grid + gentle horizontal sweep ───
function StudioAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(107,114,128,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Soft sweeping light */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(120deg, transparent 40%, rgba(107,114,128,0.08) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "studioSweep 18s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes studioSweep {
          0%, 100% { background-position: 100% 0; }
          50% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Main dispatcher ───
export function Decorations() {
  const templateId = useTemplate();

  switch (templateId) {
    case "aura":
      return <AuraFireflies />;
    case "bloom": // "Rose" (internal id still bloom)
      return <RosePetals />;
    case "edge":
      return <EdgeGridPulse />;
    case "pop":
      return <PopConfetti />;
    case "luxe":
      return <LuxeGoldShimmer />;
    case "studio":
      return <StudioAmbient />;
    default:
      return null;
  }
}
