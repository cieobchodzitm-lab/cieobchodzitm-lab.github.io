import type { Metadata } from "next";
import Link from "next/link";
import { FOUNDER, OPEN_ROLES, SUPPORTERS } from "@/lib/agi-content";
import { AgiPageHead } from "@/components/AgiPageHead";
import { ClaimBadge } from "@/components/ClaimBadge";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <>
      <AgiPageHead eyebrow="People" title="Team and open roles" />

      <p className="prose">
        The published material names one individual and three advertised positions. There
        is no published organisation chart, payroll, or headcount behind it — the team as
        described is a founder plus roles that have not yet been filled.
      </p>

      <div className="spacer" />

      <div className="section-head">
        <h2>Founder</h2>
      </div>
      <div className="card">
        <h3>{FOUNDER.name}</h3>
        <p className="project-card__tag">{FOUNDER.role}</p>
        <p>{FOUNDER.bio}</p>
        <ClaimBadge level={FOUNDER.level} withNote />
      </div>

      <div className="spacer" />

      <div className="section-head">
        <h2>Open positions</h2>
        <span className="hint">Advertised, not filled</span>
      </div>
      <div className="card-grid card-grid--tight">
        {OPEN_ROLES.map((role) => (
          <div key={role.title} className="card card--flat">
            <h3>{role.title}</h3>
            <p>{role.focus}</p>
            <ClaimBadge level={role.level} />
          </div>
        ))}
      </div>

      <div className="spacer" />

      <div className="section-head">
        <h2>Named supporters</h2>
      </div>
      <div className="card-grid card-grid--tight">
        {SUPPORTERS.map((supporter) => (
          <div key={supporter.name} className="card card--flat">
            <h3>{supporter.name}</h3>
            <p>{supporter.detail}</p>
            <ClaimBadge level={supporter.level} />
          </div>
        ))}
      </div>
      <p className="claim-note">
        The badges above carry the distinction: TOPR&apos;s partnership is confirmed, while
        the remaining entries are named in the organisation&apos;s own material and are not
        the same as a confirmed endorsement, contract or partnership.
      </p>

      <div className="spacer" />
      <div className="cta-row">
        <Link href="/agi/contact" className="btn btn--primary">
          Apply or enquire
        </Link>
        <Link href="/agi" className="btn">
          Back to overview
        </Link>
      </div>
    </>
  );
}
