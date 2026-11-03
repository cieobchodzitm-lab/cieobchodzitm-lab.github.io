// TYMCZASOWE: BUFORUJE ImageResponse i zwraca nowy Response z bufora.
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ir = new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#321", color: "#fff", fontSize: 64 }}>
      Buffer test
    </div>,
    { width: 600, height: 315 },
  );
  const buf = await ir.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: { "content-type": "image/png", "cache-control": "no-store" },
  });
}
