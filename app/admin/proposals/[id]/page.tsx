import Link from "next/link";
import { notFound } from "next/navigation";
import { one, type ProposalRow } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { VoteButtons } from "@/components/VoteButtons";

export const metadata = { title: "Proposal" };

export default async function ProposalDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = (await getSessionUser()) ?? "";

  const row = one<
    ProposalRow & {
      yes: number;
      no: number;
      abstain: number;
    }
  >(
    `SELECT p.*,
        (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'yes') AS yes,
        (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'no') AS no,
        (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'abstain') AS abstain
       FROM proposals p WHERE p.id = ?`,
    id
  );

  if (!row) notFound();

  const myVote = one<{ choice: string }>(
    "SELECT choice FROM votes WHERE proposal_id = ? AND username = ?",
    id,
    user
  );

  const total = row.yes + row.no + row.abstain;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <>
      <div className="section-head">
        <h2>Proposal #{row.id}</h2>
        <Link className="btn btn--sm" href="/admin/proposals">
          ← All proposals
        </Link>
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          <h3 style={{ fontSize: "1.25rem", color: "var(--text)" }}>{row.title}</h3>
          <span className={`pill ${row.status === "open" ? "pill--gold" : "pill--muted"}`}>{row.status}</span>
        </div>
        <div className="meta" style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", fontSize: "0.82rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
          <span>Proposed by {row.proposer}</span>
          <span>Opened {row.created_at}</span>
          {row.closed_at && <span>Closed {row.closed_at}</span>}
        </div>

        {row.description && (
          <>
            <div className="divider" />
            <p style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>{row.description}</p>
          </>
        )}

        <div className="divider" />

        <div className="section-head">
          <h3 style={{ color: "var(--gold)", margin: 0 }}>Tally</h3>
          {row.status === "open" ? (
            <VoteButtons proposalId={row.id} myChoice={myVote?.choice} />
          ) : (
            <span className="pill pill--muted">voting closed</span>
          )}
        </div>

        <div className="vote-bar">
          <div className="yes" style={{ width: `${pct(row.yes)}%` }} />
          <div className="no" style={{ width: `${pct(row.no)}%` }} />
          <div className="abstain" style={{ width: `${pct(row.abstain)}%` }} />
        </div>
        <div className="vote-key">
          <span>Yes <b>{row.yes}</b> ({pct(row.yes)}%)</span>
          <span>No <b>{row.no}</b> ({pct(row.no)}%)</span>
          <span>Abstain <b>{row.abstain}</b> ({pct(row.abstain)}%)</span>
          <span>Total <b>{total}</b></span>
        </div>
        {myVote && (
          <p className="muted" style={{ marginTop: "0.7rem", fontSize: "0.85rem" }}>
            Your vote: <b style={{ color: "var(--gold)" }}>{myVote.choice}</b>
            {row.status === "open" && " — you may change it while voting is open."}
          </p>
        )}
      </div>
    </>
  );
}