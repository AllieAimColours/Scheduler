import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

function getPeonyDataUrl(): string {
  try {
    const svgPath = path.join(process.cwd(), "public", "icon.svg");
    const svg = fs.readFileSync(svgPath, "utf-8");
    const base64 = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    console.error("Failed to read public/icon.svg for apple-icon route:", e);
    return "";
  }
}

export default function AppleIcon() {
  const peonyUrl = getPeonyDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {peonyUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={peonyUrl}
            alt=""
            width={180}
            height={180}
            style={{ width: 180, height: 180 }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
              display: "flex",
            }}
          />
        )}
      </div>
    ),
    { ...size }
  );
}
