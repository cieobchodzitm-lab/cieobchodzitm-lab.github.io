import { NextRequest, NextResponse } from "next/server";
import { getDb, audit, all, one, type ServiceRow } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";

const VALID_STATUS = ["operational", "degraded", "down", "untracked"];

function cleanString(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  const rows = all<ServiceRow>("SELECT * FROM services ORDER BY id ASC");
  return NextResponse.json({ ok: true, services: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const name = cleanString(body.name, 120);
  if (!name) return jsonError("Service name is required.");

  const url = cleanString(body.url, 500);
  const note = cleanString(body.note, 500);

  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO services (name, url, status, note) VALUES (?, ?, 'untracked', ?)"
    )
    .run(name, url, note);

  const row = one<ServiceRow>(
    "SELECT * FROM services WHERE id = ?",
    result.lastInsertRowid
  )!;

  audit(db, user, "service.create", `'${row.name}' (id ${row.id})`);
  return NextResponse.json({ ok: true, service: row }, { status: 201 });
}