import Link from "next/link";
import { all } from "@/lib/db";
import { ProposalCreateForm } from "@/components/ProposalCreateForm";

export const metadata = { title: "Proposals" };

export default async function ProposalsPage() {
  const rows = all<{
    id: number;
    title: string;
    description: string;
    status: "open" | "closed";
    proposer: string;
    created_at: string;
    closed_at: string | null;
    yes: number;
    no: number;
    abstain: number;
  }>(
    `SELECT p.*,
        (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'yes') AS yes,
        (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'no') AS no,
        (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'abstain') AS abstain
       FROM proposals p
       ORDER BY (p.status = 'open') DESC, p.id DESC`
  );

  const totalVotes = (p: (typeof rows)[number]) => p.yes + p.no + p.abstain;

  return (
    <>
      <div className="section-head">
        <h2>Proposals</h2>
        <span className="hint">One member — one vote. Choices are recorded in the audit ledger.</span>
      </div>

      <ProposalCreateForm />

      <div className="spacer" />

      {rows.length === 0 ? (
        <div className="empty">No proposals recorded.</div>
      ) : (
        rows.map((p) => {
          const total = totalVotes(p);
          const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
          return (
            <div className="card proposal-card" key={p.id}>
              <div>
                <h3>{p.title}</h3>
                <div className="meta">
                  <span>#{p.id}</span>
                  <span>by {p.proposer}</span>
                  <span>{p.created_at}</span>
                  <span>{total} vote{total === 1 ? "" : "s"}</span>
                </div>
                {p.description && <p className="desc">{p.description}</p>}
                <div className="vote-bar">
                  <div className="yes" style={{ width: `${pct(p.yes)}%` }} />
                  <div className="no" style={{ width: `${pct(p.no)}%` }} />
                  <div className="abstain" style={{ width: `${pct(p.abstain)}%` }} />
                </div>
                <div className="vote-key">
                  <span>Yes <b>{p.yes}</b></span>
                  <span>No <b>{p.no}</b></span>
                  <span>Abstain <b>{p.abstain}</b></span>
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                <span className={`pill ${p.status === "open" ? "pill--gold" : "pill--muted"}`}>
                  {p.status}
                </span>
                <Link className="btn btn--sm" href={`/admin/proposals/${p.id}`}>
                  {p.status === "open" ? "Vote →" : "Review"}
                </Link>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}