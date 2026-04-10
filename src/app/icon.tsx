import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

// Petal path — single peony petal pointing up, viewBox 100x130
// Tip at (50, 0), base at (50, 130). Used by all 22 petals via rotation.
const PETAL_PATH =
  "M50 0 C 75 25, 95 50, 90 85 C 85 110, 65 125, 50 130 C 35 125, 15 110, 10 85 C 5 50, 25 25, 50 0 Z";

const OUTER_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const MIDDLE_ANGLES = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
const INNER_ANGLES = [0, 60, 120, 180, 240, 300];

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 42,
        }}
      >
        <svg
          width="192"
          height="192"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* OUTER LAYER — 8 large petals */}
          <g transform="translate(256 256)">
            {OUTER_ANGLES.map((angle) => (
              <g key={`outer-${angle}`} transform={`rotate(${angle})`}>
                <g transform="translate(-100 -220) scale(2 2)">
                  <path d={PETAL_PATH} fill="#f472b6" opacity="0.95" />
                </g>
              </g>
            ))}
          </g>

          {/* MIDDLE LAYER — 8 medium petals offset by 22.5° */}
          <g transform="translate(256 256)">
            {MIDDLE_ANGLES.map((angle) => (
              <g key={`mid-${angle}`} transform={`rotate(${angle})`}>
                <g transform="translate(-75 -160) scale(1.5 1.5)">
                  <path d={PETAL_PATH} fill="#ec4899" />
                </g>
              </g>
            ))}
          </g>

          {/* INNER LAYER — 6 small petals tightly packed */}
          <g transform="translate(256 256)">
            {INNER_ANGLES.map((angle) => (
              <g key={`inner-${angle}`} transform={`rotate(${angle})`}>
                <g transform="translate(-50 -105) scale(1 1)">
                  <path d={PETAL_PATH} fill="#be185d" />
                </g>
              </g>
            ))}
          </g>

          {/* Pollen center */}
          <circle cx="256" cy="256" r="32" fill="#fde047" />
          <circle cx="256" cy="256" r="14" fill="#f59e0b" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
