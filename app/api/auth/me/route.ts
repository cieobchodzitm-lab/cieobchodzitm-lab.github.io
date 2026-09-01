import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);
  return NextResponse.json({ ok: true, username: user });
}