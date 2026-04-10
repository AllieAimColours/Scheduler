import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 142,
            height: 142,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f9a8d4 0%, #ec4899 70%, #db2777 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fbcfe8 0%, #f472b6 60%, #be185d 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f9a8d4 0%, #be185d 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 20,
            height: 20,
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
