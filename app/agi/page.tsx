import Link from "next/link";
import {
  ACHIEVEMENTS,
  AGI,
  CONTACTS,
  FUNDING,
  PROJECTS,
  SUPPORTERS,
  VERIFICATION_BANNER,
} from "@/lib/agi-content";
import { ClaimBadge, VerificationLegend } from "@/components/ClaimBadge";

export default function AgiOverviewPage() {
  return (
    <>
      <section className="hero">
        <p className="kicker">{AGI.motto}</p>
        <h1>{AGI.name}</h1>
        <p className="subtitle">{AGI.tagline}</p>
        <div className="cta">
          <Link href="/agi/phantom-rescue" className="btn btn--primary">
            PHANTOM RESCUE
          </Link>
          <Link href="/agi/crowdfunding" className="btn">
            Support the campaign
          </Link>
          <Link href="/agi/contact" className="btn">
            Get in touch
          </Link>
        </div>
      </section>

      <VerificationLegend intro={VERIFICATION_BANNER} />

      <div className="spacer" />

      <div className="section-head">
        <h2>Mission</h2>
      </div>
      <p className="prose">{AGI.mission}</p>

      <div className="spacer" />

      <div className="section-head">
        <h2>Programmes</h2>
        <span className="hint">Stage labels are the organisation&apos;s own</span>
      </div>
      <div className="card-grid card-grid--tight">
        {PROJECTS.map((project) => (
          <article key={project.slug} className="card project-card">
            <h3>{project.name}</h3>
            <p className="project-card__tag">{project.tagline}</p>
            <p className="stage">
              <ClaimBadge level={project.stageLevel} />
              <span>{project.stage}</span>
            </p>
            <p>{project.blurb}</p>
            <Link href={`/agi/${project.slug}`} className="btn btn--sm">
              Read more →
            </Link>
          </article>
        ))}
      </div>

      <div className="spacer" />

      <div className="section-head">
        <h2>Claimed results</h2>
        <span className="hint">Published as reported, with the caveat attached</span>
      </div>
      <div className="stat-grid">
        {ACHIEVEMENTS.map((claim) => (
          <div key={claim.label} className="stat-tile stat-tile--claim">
            <span className="label">{claim.label}</span>
            <div className="value">{claim.value}</div>
            <ClaimBadge level={claim.level} />
            <p className="claim-note">{claim.detail}</p>
          </div>
        ))}
      </div>

      <div className="spacer" />

      <div className="section-head">
        <h2>Crowdfunding</h2>
        <Link href="/agi/crowdfunding" className="hint">
          Details and caveats →
        </Link>
      </div>
      <div className="grid-2">
        <div className="card card--flat">
          <h3>Stated target</h3>
          <p className="funding-goal">
            {FUNDING.goal} on {FUNDING.platform}
          </p>
          <p>
            Stated launch window: <strong>{FUNDING.statedLaunch}</strong>. That window has
            already passed and the campaign&apos;s live status is not confirmed here.
          </p>
          <ClaimBadge level={FUNDING.linkLevel} />
        </div>
        <div className="card card--flat">
          <h3>Milestones</h3>
          <ul className="tight-list">
            {FUNDING.stretchGoals.map((goal) => (
              <li key={goal.amount}>
                <strong>{goal.amount}</strong> — {goal.milestone}
              </li>
            ))}
          </ul>
          <p className="claim-note">
            Milestones are the author&apos;s own targets. There is no third-party escrow or
            delivery guarantee attached to them.
          </p>
        </div>
      </div>

      <div className="spacer" />

      <div className="section-head">
        <h2>Team</h2>
        <Link href="/agi/team" className="hint">
          Roles and openings →
        </Link>
      </div>
      <p className="prose">
        The organisation is described as being founded and led by a single founder, with
        three technical roles advertised. See the <Link href="/agi/team">team page</Link>{" "}
        for the detail.
      </p>

      <div className="spacer" />

      <div className="section-head">
        <h2>Supporters named in the source material</h2>
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

      <div className="spacer" />

      <div className="section-head">
        <h2>Contact</h2>
      </div>
      <div className="grid-2">
        {CONTACTS.map((channel) => (
          <div key={channel.value} className="card card--flat">
            <h3>{channel.label}</h3>
            <p className="mono">
              {channel.href ? <a href={channel.href}>{channel.value}</a> : channel.value}
            </p>
            <ClaimBadge level={channel.level} />
          </div>
        ))}
      </div>
    </>
  );
}
