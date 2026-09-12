import { NextResponse } from "next/server";
import { getDb, audit } from "@/lib/db";
import { getSessionUser, clearSession } from "@/lib/session";

export async function POST() {
  const db = getDb();
  const user = await getSessionUser();
  if (user) {
    audit(db, user, "auth.logout", "signed out");
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}