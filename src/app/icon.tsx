import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

// Image metadata
export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

// Read the real peony SVG from public/icon.svg at build time and embed it
// as a base64 data URL inside an <img>. Satori has spotty support for
// nested SVG <g transform> elements, but it has full support for <img>
// with SVG data URLs — so this is the most reliable way to render the
// real peony shape.
function getPeonyDataUrl(): string {
  try {
    const svgPath = path.join(process.cwd(), "public", "icon.svg");
    const svg = fs.readFileSync(svgPath, "utf-8");
    const base64 = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    console.error("Failed to read public/icon.svg for icon route:", e);
    return "";
  }
}

export default function Icon() {
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
            width={192}
            height={192}
            style={{ width: 192, height: 192 }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
              borderRadius: 42,
              display: "flex",
            }}
          />
        )}
      </div>
    ),
    { ...size }
  );
}
