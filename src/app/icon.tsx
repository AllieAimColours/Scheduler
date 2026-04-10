import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "42px",
          color: "white",
          fontSize: 110,
        }}
      >
        ✨
      </div>
    ),
    { ...size }
  );
}
