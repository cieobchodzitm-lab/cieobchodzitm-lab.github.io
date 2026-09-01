import { all, one, type ProposalRow, type ProposalCounts } from "./db";

const proposalSelectSql = `
  SELECT p.*,
    (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'yes') AS yes,
    (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'no')  AS no,
    (SELECT COUNT(*) FROM votes v WHERE v.proposal_id = p.id AND v.choice = 'abstain') AS abstain
  FROM proposals p
`;

export function proposalWithCounts(
  row: ProposalRow & { yes?: number; no?: number; abstain?: number }
): ProposalRow & ProposalCounts {
  const yes = Number(row.yes ?? 0);
  const no = Number(row.no ?? 0);
  const abstain = Number(row.abstain ?? 0);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    proposer: row.proposer,
    created_at: row.created_at,
    closed_at: row.closed_at,
    total: yes + no + abstain,
    yes,
    no,
    abstain,
  };
}

export function getProposal(id: string | number) {
  const row = one<
    ProposalRow & { yes: number; no: number; abstain: number }
  >(proposalSelectSql + " WHERE p.id = ?", id);
  return row ? proposalWithCounts(row) : null;
}

/** Full listing: open first, then newest. */
export function listProposals() {
  const rows = all<ProposalRow & { yes: number; no: number; abstain: number }>(
    proposalSelectSql + " ORDER BY (p.status = 'open') DESC, p.id DESC"
  );
  return rows.map((r) => proposalWithCounts(r));
}