import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

// Image generation — simplified peony icon
// Uses concentric layers of pink to suggest peony petals.
// Real SVG petal paths are in public/icon.svg; ImageResponse cannot render
// arbitrary SVG paths so we use stacked gradient circles to evoke the peony.
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
          borderRadius: "42px",
          position: "relative",
        }}
      >
        {/* Outer petal ring — soft blush */}
        <div
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f9a8d4 0%, #ec4899 70%, #db2777 100%)",
            display: "flex",
          }}
        />
        {/* Middle petal ring — deeper rose */}
        <div
          style={{
            position: "absolute",
            width: 105,
            height: 105,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fbcfe8 0%, #f472b6 60%, #be185d 100%)",
            display: "flex",
          }}
        />
        {/* Inner petal ring — rich magenta */}
        <div
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f9a8d4 0%, #be185d 100%)",
            display: "flex",
          }}
        />
        {/* Pollen center */}
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fef9c3 0%, #fde047 60%, #f59e0b 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
