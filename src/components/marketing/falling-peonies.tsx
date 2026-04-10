"use client";

/**
 * Falling peony petals — for the marketing landing page hero.
 *
 * Standalone version of the petal animation from wow-effects.tsx so the
 * marketing page does not need template context. Drops a continuous rain of
 * blush/rose/pink petals from the top of the container, gently swaying.
 */

const PETAL_COLORS = [
  "#fce7f3", // blush
  "#fbcfe8", // soft pink
  "#f9a8d4", // rose
  "#f472b6", // hot rose
  "#ec4899", // magenta
  "#fda4af", // coral
];

export function FallingPeonies({ count = 30 }: { count?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 12;
        const duration = 12 + Math.random() * 14;
        const size = 14 + Math.random() * 22;
        const color = PETAL_COLORS[i % PETAL_COLORS.length];
        const startRotation = Math.random() * 360;
        const opacity = 0.4 + Math.random() * 0.5;

        return (
          <div
            key={i}
            className="absolute animate-ambient-fall"
            style={{
              left: `${left}%`,
              top: `-${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity,
              transform: `rotate(${startRotation}deg)`,
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M20 4
                   C 28 6, 34 14, 33 22
                   C 32 30, 26 36, 20 36
                   C 14 36, 8 30, 7 22
                   C 6 14, 12 6, 20 4 Z"
                fill={color}
              />
              <path
                d="M20 8
                   C 25 10, 28 16, 27 22
                   C 26 28, 23 32, 20 32"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
