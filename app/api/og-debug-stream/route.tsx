// TYMCZASOWE: zwraca ImageResponse BEZPOSREDNIO (strumieniowanie).
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#123", color: "#fff", fontSize: 64 }}>
      Stream test
    </div>,
    { width: 600, height: 315 },
  );
}
