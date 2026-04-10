/**
 * PeonyMark — the Bloom brand mark.
 *
 * A small inline SVG peony used wherever a logo placeholder is needed
 * (sidebar, install banner, empty states). Renders quickly, scales
 * cleanly, and matches /icon.svg.
 */

interface Props {
  size?: number;
  className?: string;
}

export function PeonyMark({ size = 40, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="pm-outer" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="60%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </radialGradient>
        <radialGradient id="pm-mid" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="60%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </radialGradient>
        <radialGradient id="pm-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
        <radialGradient id="pm-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>

      {/* Outer petals — 8 large at 45° increments */}
      <g transform="translate(50 50)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <g key={`o-${angle}`} transform={`rotate(${angle})`}>
            <path
              d="M0 -45 C 16 -38, 22 -22, 18 -5 C 14 8, 4 12, 0 12 C -4 12, -14 8, -18 -5 C -22 -22, -16 -38, 0 -45 Z"
              fill="url(#pm-outer)"
              opacity="0.95"
            />
          </g>
        ))}
      </g>

      {/* Middle petals — 8 medium offset by 22.5° */}
      <g transform="translate(50 50)">
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
          <g key={`m-${angle}`} transform={`rotate(${angle})`}>
            <path
              d="M0 -32 C 12 -27, 16 -16, 13 -4 C 10 6, 3 9, 0 9 C -3 9, -10 6, -13 -4 C -16 -16, -12 -27, 0 -32 Z"
              fill="url(#pm-mid)"
            />
          </g>
        ))}
      </g>

      {/* Inner petals — 6 small */}
      <g transform="translate(50 50)">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <g key={`i-${angle}`} transform={`rotate(${angle})`}>
            <path
              d="M0 -20 C 8 -16, 10 -10, 8 -2 C 6 5, 2 6, 0 6 C -2 6, -6 5, -8 -2 C -10 -10, -8 -16, 0 -20 Z"
              fill="url(#pm-inner)"
            />
          </g>
        ))}
      </g>

      {/* Pollen center */}
      <circle cx="50" cy="50" r="6" fill="url(#pm-center)" />
      <circle cx="50" cy="50" r="2.5" fill="#fbbf24" opacity="0.9" />
    </svg>
  );
}
