import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f6",
          borderRadius: 32,
          fontFamily: "Georgia, serif",
          fontSize: 120,
          fontWeight: 700,
          color: "#c4956a",
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
