import { NextRequest, NextResponse } from "next/server";
import { getDb, audit, one, type ProposalRow } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { jsonError } from "@/lib/http";
import { listProposals, proposalWithCounts } from "@/lib/proposals";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Not authenticated.", 401);
  return NextResponse.json({ ok: true, proposals: listProposals() });
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

  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const description =
    typeof body.description === "string"
      ? body.description.trim().slice(0, 4000)
      : "";

  if (!title) return jsonError("Proposal title is required.");

  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO proposals (title, description, proposer, status) VALUES (?, ?, ?, 'open')"
    )
    .run(title, description, user);

  const row = one<ProposalRow>(
    "SELECT * FROM proposals WHERE id = ?",
    result.lastInsertRowid
  )!;
  audit(db, user, "proposal.create", `'${row.title}' (id ${row.id})`);

  return NextResponse.json(
    {
      ok: true,
      proposal: proposalWithCounts({ ...row, yes: 0, no: 0, abstain: 0 }),
    },
    { status: 201 }
  );
}