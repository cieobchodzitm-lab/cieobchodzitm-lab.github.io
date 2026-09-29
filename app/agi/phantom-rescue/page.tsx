import type { Metadata } from "next";
import Link from "next/link";
import { PHANTOM_RESCUE } from "@/lib/agi-content";
import { AgiPageHead } from "@/components/AgiPageHead";
import { ClaimBadge } from "@/components/ClaimBadge";

export const metadata: Metadata = { title: "PHANTOM RESCUE" };

export default function PhantomRescuePage() {
  const p = PHANTOM_RESCUE;
  return (
    <>
      <AgiPageHead
        eyebrow="Autonomous search and rescue"
        title={p.name}
        stage={p.stage}
        stageLevel={p.stageLevel}
      />

      <p className="prose">{p.summary}</p>

      <div className="spacer" />

      <div className="section-head">
        <h2>Described specification</h2>
        <span className="hint">As published by the organisation</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subsystem</th>
              <th>As described</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {p.specs.map((row) => (
              <tr key={row.k}>
                <td>{row.k}</td>
                <td>{row.v}</td>
                <td>
                  <ClaimBadge level={row.level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="spacer" />

      <div className="grid-2">
        <div className="card card--flat">
          <h3>Intended users</h3>
          <p className="claim-note">
            Mostly target audiences. The exception is TOPR, whose partnership is
            confirmed — the others are not signed partners.
          </p>
          <ul className="tight-list">
            {p.intendedUsers.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </div>
        <div className="card card--flat">
          <h3>What a reader cannot check</h3>
          <p className="claim-note">
            Questions this page cannot answer from the published material. They are listed
            here rather than left implied.
          </p>
          <ul className="tight-list">
            {p.openQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="spacer" />

      <aside className="verify-banner">
        <p className="verify-banner__intro">{p.docsNote}</p>
      </aside>

      <div className="spacer" />
      <div className="cta-row">
        <Link href="/agi/crowdfunding" className="btn btn--primary">
          How this is being funded
        </Link>
        <Link href="/agi/contact" className="btn">
          Ask about field testing
        </Link>
      </div>
    </>
  );
}
