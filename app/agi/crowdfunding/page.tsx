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
        stage={`Campaign ${FUNDING.status} · launched ${FUNDING.statedLaunch}`}
        stageLevel={FUNDING.statusLevel}
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
          <span className="label">Status</span>
          <div className="value">{FUNDING.status}</div>
          <ClaimBadge level={FUNDING.statusLevel} />
          <p className="claim-note">
            Launched {FUNDING.statedLaunch}; confirmed open on 2026-09-29. Live totals sit
            with {FUNDING.platform} and are not mirrored here.
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
        <p className="mono contact-address">
          <a href={FUNDING.link} target="_blank" rel="noopener noreferrer">
            {FUNDING.link}
          </a>
        </p>
        <ClaimBadge level={FUNDING.linkLevel} withNote />
        <p className="claim-note">
          The organisation confirms the campaign is open. As with any donation page, check
          that the page you land on is run by the organisation named on it before sending
          money.
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
