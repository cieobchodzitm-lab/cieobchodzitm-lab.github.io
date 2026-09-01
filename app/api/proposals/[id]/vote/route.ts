import { NextRequest, NextResponse } from "next/server";
import { getDb, audit, type VoteChoice } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";
import { getProposal } from "@/lib/proposals";

const CHOICES: VoteChoice[] = ["yes", "no", "abstain"];

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);

  const { id } = await ctx.params;
  const proposal = getProposal(id);
  if (!proposal) return jsonError("Proposal not found.", 404);
  if (proposal.status !== "open") {
    return jsonError("Voting is closed for this proposal.");
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const choice = String(body.choice ?? "");
  if (!CHOICES.includes(choice as VoteChoice)) {
    return jsonError("Choice must be one of: yes, no, abstain.");
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM votes WHERE proposal_id = ? AND username = ?")
    .get(id, user);

  let changed = "voted";
  if (existing) {
    db.prepare(
      "UPDATE votes SET choice = ?, created_at = datetime('now') WHERE proposal_id = ? AND username = ?"
    ).run(choice, id, user);
    changed = "changed vote";
  } else {
    db.prepare(
      "INSERT INTO votes (proposal_id, username, choice) VALUES (?, ?, ?)"
    ).run(id, user, choice);
    changed = "voted";
  }

  audit(db, user, "proposal.vote", `'${proposal.title}' — ${choice} (${changed})`);

  return NextResponse.json({ ok: true, proposal: getProposal(id) });
}