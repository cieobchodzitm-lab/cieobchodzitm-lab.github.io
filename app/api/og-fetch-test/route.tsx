// TYMCZASOWE: pobiera /api/og przez PRAWDZIWY HTTP z wnętrza funkcji Vercela
// i zwraca status + content-type + rozmiar jako JSON.
//
// Po co: narzędzia pomocnicze potrafią źle raportować odpowiedzi binarne.
// Tu pomiar robi fetch() na serwerze — bez przeglądarki i bez parsera treści.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://cieobchodzitm-labgithubio.vercel.app";

async function probe(path: string) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    const buf = await res.arrayBuffer();
    const head = Buffer.from(buf.slice(0, 24)).toString("hex");
    const out: Record<string, unknown> = {
      path,
      ms: Date.now() - t0,
      status: res.status,
      contentType: res.headers.get("content-type"),
      bytes: buf.byteLength,
      firstBytesHex: head,
      isPng: head.startsWith("89504e47"),
    };
    // Przy błędzie pokaż treść — często jest tam komunikat Vercela.
    if (res.status !== 200) {
      out.body = Buffer.from(buf.slice(0, 1200)).toString("utf8");
    }
    return out;
  } catch (e: any) {
    return {
      path,
      ms: Date.now() - t0,
      errorName: e?.name ?? typeof e,
      errorMessage: String(e?.message ?? e).slice(0, 1200),
      errorStack: String(e?.stack ?? "").split("\n").slice(0, 8).join("\n"),
    };
  }
}

export async function GET() {
  const results = [];
  for (const p of [
    "/api/og",
    "/api/og?title=Test",
    "/api/og-debug-buffer",
    "/api/og-debug-stream",
    "/api/orders",
  ]) {
    results.push(await probe(p));
  }
  return new Response(JSON.stringify({ base: BASE, results }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
