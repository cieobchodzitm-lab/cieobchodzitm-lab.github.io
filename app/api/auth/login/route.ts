import { NextRequest, NextResponse } from "next/server";
import { getDb, audit } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { jsonError } from "@/lib/http";

export async function POST(req: NextRequest) {
  const db = getDb();
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return jsonError("Username and password are required.");
  }

  const row = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as
    | { id: number; username: string; password_hash: string }
    | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials." },
      { status: 401 }
    );
  }

  await setSession(row.username);
  audit(db, row.username, "auth.login", "signed in");

  return NextResponse.json({ ok: true, username: row.username });
}