import { NextRequest, NextResponse } from "next/server";
import { getDb, audit, one, type ServiceRow } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";

const PING_TIMEOUT_MS = 8000;

/** Resolve a possibly-relative service URL against the request origin. */
function resolveUrl(raw: string, req: NextRequest): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    return new URL(trimmed, req.url).toString();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  const { id } = await ctx.params;
  const db = getDb();
  const row = one<ServiceRow>("SELECT * FROM services WHERE id = ?", id);
  if (!row) return jsonError("Service not found.", 404);

  const url = resolveUrl(row.url, req);
  if (!url) {
    db.prepare(
      "UPDATE services SET status = 'untracked', latency_ms = NULL, last_checked_at = datetime('now') WHERE id = ?"
    ).run(id);
    return NextResponse.json({
      ok: true,
      service: db.prepare("SELECT * FROM services WHERE id = ?").get(id),
      note: "No endpoint configured — marked untracked.",
    });
  }

  const started = Date.now();
  let status: "operational" | "degraded" | "down" = "down";
  let ok = false;
  let errorDetail = "";

  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
    });
    const elapsed = Date.now() - started;
    if (res.status >= 200 && res.status < 500) {
      status = "operational";
      ok = true;
    } else {
      status = "degraded";
      errorDetail = `HTTP ${res.status}`;
    }
    db.prepare(
      "UPDATE services SET status = ?, latency_ms = ?, last_checked_at = datetime('now'), note = ? WHERE id = ?"
    ).run(status, elapsed, errorDetail, id);
  } catch (err) {
    const elapsed = Date.now() - started;
    status = "down";
    errorDetail = err instanceof Error ? err.message.slice(0, 200) : "Unreachable";
    db.prepare(
      "UPDATE services SET status = 'down', latency_ms = ?, last_checked_at = datetime('now'), note = ? WHERE id = ?"
    ).run(elapsed, errorDetail, id);
  }

  const updated = one<ServiceRow>("SELECT * FROM services WHERE id = ?", id)!;
  audit(
    db,
    user,
    "service.check",
    `'${updated.name}' → ${updated.status}${ok ? "" : " · " + errorDetail}`
  );

  return NextResponse.json({ ok: true, service: updated });
}