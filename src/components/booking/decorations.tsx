"use client";

import { useTemplate } from "@/lib/templates/context";
import { getTemplate } from "@/lib/templates/index";

function Orbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(155,126,200,0.35) 0%, transparent 70%)",
          animation: "orbFloat1 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-32 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,229,210,0.4) 0%, transparent 70%)",
          animation: "orbFloat2 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(232,196,196,0.35) 0%, transparent 70%)",
          animation: "orbFloat3 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-2/3 left-1/4 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(155,126,200,0.25) 0%, transparent 70%)",
          animation: "orbFloat1 18s ease-in-out infinite reverse",
        }}
      />
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 25px) scale(1.08); }
          66% { transform: translate(20px, -10px) scale(0.92); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -30px) scale(1.04); }
        }
      `}</style>
    </div>
  );
}

function Grid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-100"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

function Confetti() {
  // Deterministic positions for colorful floating shapes
  const pieces = [
    { top: "8%", left: "12%", color: "#7C3AED", size: 8, delay: 0 },
    { top: "15%", left: "75%", color: "#EC4899", size: 6, delay: 1.2 },
    { top: "25%", left: "88%", color: "#FACC15", size: 10, delay: 0.6 },
    { top: "40%", left: "5%", color: "#3B82F6", size: 7, delay: 2.1 },
    { top: "55%", left: "92%", color: "#7C3AED", size: 5, delay: 1.8 },
    { top: "65%", left: "20%", color: "#EC4899", size: 9, delay: 0.3 },
    { top: "78%", left: "65%", color: "#FACC15", size: 6, delay: 2.5 },
    { top: "85%", left: "40%", color: "#3B82F6", size: 8, delay: 1.5 },
    { top: "10%", left: "45%", color: "#EC4899", size: 5, delay: 3 },
    { top: "50%", left: "50%", color: "#7C3AED", size: 7, delay: 0.9 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-30"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confettiFloat ${6 + i * 0.5}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function Shimmer() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        background:
          "linear-gradient(120deg, transparent 30%, rgba(212,168,83,0.12) 50%, transparent 70%)",
        backgroundSize: "200% 100%",
        animation: "shimmerMove 8s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes shimmerMove {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function Decorations() {
  const templateId = useTemplate();
  const template = getTemplate(templateId);
  const { decorations } = template;

  return (
    <>
      {decorations.background && decorations.background !== "none" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: decorations.background }}
        />
      )}
      {decorations.hasOrbs && <Orbs />}
      {decorations.hasGrid && <Grid />}
      {decorations.hasConfetti && <Confetti />}
      {decorations.hasShimmer && <Shimmer />}
    </>
  );
}
