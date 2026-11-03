// TYMCZASOWA trasa diagnostyczna (Node runtime) — do usunięcia po diagnozie.
import { runOgDiagnostic } from "@/lib/og-diag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return await runOgDiagnostic();
  } catch (e: any) {
    return new Response(
      JSON.stringify(
        { ok: false, fatal: String(e?.message ?? e), stack: String(e?.stack ?? "") },
        null,
        2,
      ),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }
}
