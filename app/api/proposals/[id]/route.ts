import { NextRequest, NextResponse } from "next/server";
import { getDb, audit } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";
import { getProposal } from "@/lib/proposals";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  const { id } = await ctx.params;
  const proposal = getProposal(id);
  if (!proposal) return jsonError("Proposal not found.", 404);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const status = body.status;
  if (status !== "open" && status !== "closed") {
    return jsonError("Status must be 'open' or 'closed'.");
  }

  const db = getDb();
  const result = db
    .prepare(
      status === "closed"
        ? "UPDATE proposals SET status = 'closed', closed_at = datetime('now') WHERE id = ?"
        : "UPDATE proposals SET status = 'open', closed_at = NULL WHERE id = ?"
    )
    .run(id);

  if (result.changes === 0) return jsonError("Proposal not found.", 404);

  audit(db, user, "proposal.status", `'${proposal.title}' → ${status} (id ${id})`);

  return NextResponse.json({ ok: true, proposal: getProposal(id) });
}