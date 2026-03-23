import { ImageResponse } from "next/og";

export const alt = "Padel Manual — The Modern Guide to UK Padel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
            }}
          >
            Padel
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#a0a0a0",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Manual
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#c4956a",
            fontWeight: 400,
          }}
        >
          The Modern Guide to UK Padel
        </div>
      </div>
    ),
    { ...size }
  );
}
