import { NextRequest, NextResponse } from "next/server";
import { getDb, audit, one, type ServiceRow } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";

const VALID_STATUS = ["operational", "degraded", "down", "untracked"];

function cleanString(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function findService(id: string) {
  const db = getDb();
  const row = one<ServiceRow>("SELECT * FROM services WHERE id = ?", id);
  return { db, row };
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  const { id } = await ctx.params;
  const { db, row } = findService(id);
  if (!row) return jsonError("Service not found.", 404);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const fields: string[] = [];
  const values: string[] = [];

  if (body.name !== undefined) {
    const name = cleanString(body.name, 120);
    if (!name) return jsonError("Service name cannot be empty.");
    fields.push("name = ?");
    values.push(name);
  }
  if (body.url !== undefined) {
    fields.push("url = ?");
    values.push(cleanString(body.url));
  }
  if (body.note !== undefined) {
    fields.push("note = ?");
    values.push(cleanString(body.note));
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!VALID_STATUS.includes(status))
      return jsonError("Status must be one of: " + VALID_STATUS.join(", "));
    fields.push("status = ?");
    values.push(status);
  }

  if (fields.length === 0) return jsonError("Nothing to update.");

  values.push(id);
  db.prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  const updated = one<ServiceRow>("SELECT * FROM services WHERE id = ?", id)!;
  audit(db, user, "service.update", `'${updated.name}' (id ${id})`);

  return NextResponse.json({ ok: true, service: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  const { id } = await ctx.params;
  const { db, row } = findService(id);
  if (!row) return jsonError("Service not found.", 404);

  db.prepare("DELETE FROM services WHERE id = ?").run(id);
  audit(db, user, "service.delete", `'${row.name}' (id ${id})`);

  return NextResponse.json({ ok: true });
}