// TYMCZASOWE — wywołuje PRAWDZIWY handler /api/og i zwraca wyjątek ze stosem.
import { NextRequest } from "next/server";
import { GET as realOgGET } from "@/app/api/og/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function probe(path: string) {
  const t0 = Date.now();
  try {
    const req = new NextRequest(new Request(`http://localhost:3000${path}`));
    const res = await realOgGET(req);
    const buf = await res.arrayBuffer();
    return {
      path,
      ms: Date.now() - t0,
      ok: true,
      status: res.status,
      contentType: res.headers.get("content-type"),
      bytes: buf.byteLength,
    };
  } catch (e: any) {
    return {
      path,
      ms: Date.now() - t0,
      ok: false,
      errorName: e?.name ?? typeof e,
      errorMessage: String(e?.message ?? e).slice(0, 3000),
      errorStack: String(e?.stack ?? "").split("\n").slice(0, 25).join("\n").slice(0, 6000),
    };
  }
}

export async function GET() {
  const results = [];
  for (const p of [
    "/api/og",
    "/api/og?title=Test",
    "/api/og?slug=silentium-aurum",
  ]) {
    results.push(await probe(p));
  }
  return new Response(JSON.stringify({ runtime: "nodejs", results }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
