// Diagnostyka /api/og na produkcji — TYMCZASOWA, do usunięcia po ustaleniu
// przyczyny HTTP 500.
//
// Mały, bezpieczny `process` shim: Edge runtime nie ma process.version /
// process.memoryUsage, więc każdy odczyt jest sprawdzany, żeby diagnostyka
// sama nie stała się źródłem błędu.
function nodeInfo(): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  try {
    const anyProc: any = (globalThis as any).process;
    p.version = anyProc?.version ?? null;
    p.platform = anyProc?.platform ?? null;
    p.nextRuntime = anyProc?.env?.NEXT_RUNTIME ?? null;
    p.vercelRegion = anyProc?.env?.VERCEL_REGION ?? null;
    p.vercelDeploymentId = anyProc?.env?.VERCEL_DEPLOYMENT_ID ?? null;
    p.vercelEnv = anyProc?.env?.VERCEL_ENV ?? null;
    if (typeof anyProc?.memoryUsage === "function") {
      const m = anyProc.memoryUsage();
      p.heapUsedMB = Math.round(m.heapUsed / 1048576);
      p.rssMB = Math.round((m.rss ?? 0) / 1048576);
    }
  } catch (e: any) {
    p.processError = String(e?.message ?? e);
  }
  return p;
}

function step(name: string, fn: () => unknown): Record<string, unknown> {
  const t0 = Date.now();
  try {
    const value = fn();
    return { step: name, ms: Date.now() - t0, ok: true, value };
  } catch (e: any) {
    return {
      step: name,
      ms: Date.now() - t0,
      ok: false,
      errorName: e?.name ?? typeof e,
      errorMessage: String(e?.message ?? e).slice(0, 2000),
      errorStack: String(e?.stack ?? "")
        .split("\n")
        .slice(0, 12)
        .join("\n")
        .slice(0, 3000),
    };
  }
}

async function stepAsync(
  name: string,
  fn: () => Promise<unknown>,
): Promise<Record<string, unknown>> {
  const t0 = Date.now();
  try {
    const value = await fn();
    return { step: name, ms: Date.now() - t0, ok: true, value };
  } catch (e: any) {
    return {
      step: name,
      ms: Date.now() - t0,
      ok: false,
      errorName: e?.name ?? typeof e,
      errorMessage: String(e?.message ?? e).slice(0, 2000),
      errorStack: String(e?.stack ?? "")
        .split("\n")
        .slice(0, 12)
        .join("\n")
        .slice(0, 3000),
    };
  }
}

/**
 * Odpala ImageResponse etapami i zwraca JSON z wynikiem każdego etapu.
 * Kolejność: dekodowanie fontów → konstrukcja → render (arrayBuffer) →
 * render bez fontów. Dzięki temu widać, w którym miejscu pęka.
 */
export async function runOgDiagnostic(): Promise<Response> {
  const { ImageResponse } = await import("next/og");
  const { ogFonts } = await import("./og-fonts");

  const steps: Array<Record<string, unknown>> = [];

  steps.push({ step: "import", ms: 0, ok: true, value: "next/og + og-fonts OK" });

  // 1. Dekodowanie fontów (201 kB base64 → Uint8Array).
  let fonts: unknown = null;
  steps.push(
    step("fonts-decode", () => {
      fonts = ogFonts();
      const f = fonts as Array<{ data: ArrayBuffer; name: string; weight: number }>;
      return `fonty: ${f.length}, bajtów: ${f.reduce((n, x) => n + x.data.byteLength, 0)}`;
    }),
  );

  // 2. Konstrukcja ImageResponse — zwykle leniwa, ale może rzucić od razu.
  let ir: any = null;
  steps.push(
    step("construct-with-fonts", () => {
      ir = new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              background: "#111",
              color: "#fff",
              fontSize: 48,
              fontFamily: "Cinzel",
            }}
          >
            Diagnostyka OG
          </div>
        ),
        { width: 1200, height: 630, fonts: fonts as never },
      );
      return "skonstruowano";
    }),
  );

  // 3. Render — tu działa satori + resvg/wasm i tu zwykle wychodzi błąd.
  steps.push(
    await stepAsync("render-arrayBuffer", async () => {
      const buf = await ir.arrayBuffer();
      return `bajtów PNG: ${buf.byteLength}`;
    }),
  );

  // 4. Bez fontów — oddziela problem z satori/resvg od problemu z fontami.
  steps.push(
    await stepAsync("render-without-fonts", async () => {
    const ir2 = new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#222" }}>
          Bez fontow
        </div>
      ),
      { width: 600, height: 315 },
    );
      const buf2 = await ir2.arrayBuffer();
      return `bajtów PNG: ${buf2.byteLength}`;
    }),
  );

  const failed = steps.filter((s) => s.ok === false);

  return new Response(
    JSON.stringify(
      {
        ok: failed.length === 0,
        runtime: process.env.NEXT_RUNTIME ?? "unknown",
        ...nodeInfo(),
        steps,
      },
      null,
      2,
    ),
    { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
  );
}
