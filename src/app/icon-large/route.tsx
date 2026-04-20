import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          fontSize: 340,
          fontWeight: 700,
          letterSpacing: "-0.05em",
        }}
      >
        Q
      </div>
    ),
    { width: 512, height: 512 },
  );
}
