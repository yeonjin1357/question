import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fb923c 0%, #f97316 60%, #ea580c 100%)",
          color: "white",
          fontSize: 128,
          fontWeight: 700,
          letterSpacing: "-0.05em",
        }}
      >
        Q
      </div>
    ),
    { ...size },
  );
}
