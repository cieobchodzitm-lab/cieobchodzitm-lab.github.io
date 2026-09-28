import type { Metadata } from "next";
import Link from "next/link";
import { FUNDING } from "@/lib/agi-content";
import { AgiPageHead } from "@/components/AgiPageHead";
import { ClaimBadge } from "@/components/ClaimBadge";

export const metadata: Metadata = { title: "Crowdfunding" };

export default function CrowdfundingPage() {
  return (
    <>
      <AgiPageHead
        eyebrow="Community funding"
        title="Crowdfunding campaign"
        stage={`Stated launch ${FUNDING.statedLaunch}`}
        stageLevel={FUNDING.linkLevel}
      />

      <p className="prose">
        The programme is described as being funded through a public donation campaign on{" "}
        {FUNDING.platform}, with a stated target of {FUNDING.goal}. What follows is the
        campaign as the organisation presents it, together with the parts a prospective
        backer cannot verify from the published material.
      </p>

      <div className="spacer" />

      <div className="stat-grid">
        <div className="stat-tile stat-tile--claim">
          <span className="label">Platform</span>
          <div className="value">{FUNDING.platform}</div>
        </div>
        <div className="stat-tile stat-tile--claim">
          <span className="label">Stated goal</span>
          <div className="value">{FUNDING.goal}</div>
        </div>
        <div className="stat-tile stat-tile--claim">
          <span className="label">Stated launch</span>
          <div className="value">{FUNDING.statedLaunch}</div>
          <p className="claim-note">
            That window has already passed. Whether the campaign is live is unconfirmed.
          </p>
        </div>
      </div>

      <div className="section-head">
        <h2>Milestones</h2>
        <span className="hint">Author&apos;s own targets</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Milestone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {FUNDING.stretchGoals.map((goal) => (
              <tr key={goal.amount}>
                <td className="mono">{goal.amount}</td>
                <td>{goal.milestone}</td>
                <td>
                  <ClaimBadge level={goal.level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="spacer" />

      <aside className="verify-banner verify-banner--warn">
        <p className="verify-banner__title">Before you contribute</p>
        <ul className="tight-list">
          {FUNDING.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </aside>

      <div className="spacer" />

      <div className="card card--flat">
        <h3>Campaign link</h3>
        <p className="mono">{FUNDING.link}</p>
        <ClaimBadge level={FUNDING.linkLevel} withNote />
        <p className="claim-note">
          The URL is published here as text rather than as a hyperlink because its live
          status could not be verified when this page was generated. Confirm the campaign
          page exists, is run by the organisation named on it, and is still open before
          sending money.
        </p>
      </div>

      <div className="spacer" />
      <div className="cta-row">
        <Link href="/agi/phantom-rescue" className="btn btn--primary">
          What the money is for
        </Link>
        <Link href="/agi/contact" className="btn">
          Ask questions first
        </Link>
      </div>
    </>
  );
}
