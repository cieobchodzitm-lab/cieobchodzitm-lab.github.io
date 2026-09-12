import { NextResponse } from "next/server";
import { all, type AuditRow } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  const limitRaw = 100;
  const rows = all<AuditRow>(
    "SELECT * FROM audit_log ORDER BY id DESC LIMIT ?",
    limitRaw
  );

  return NextResponse.json({ ok: true, audit: rows });
}