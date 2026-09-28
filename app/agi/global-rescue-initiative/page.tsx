import type { Metadata } from "next";
import Link from "next/link";
import { GLOBAL_RESCUE } from "@/lib/agi-content";
import { AgiPageHead } from "@/components/AgiPageHead";

export const metadata: Metadata = { title: "Global Rescue Initiative" };

export default function GlobalRescuePage() {
  const g = GLOBAL_RESCUE;
  return (
    <>
      <AgiPageHead
        eyebrow="Policy and interoperability"
        title={g.name}
        stage={g.stage}
        stageLevel={g.stageLevel}
      />

      <p className="prose">{g.summary}</p>

      <div className="spacer" />

      <div className="section-head">
        <h2>Pillars of the proposal</h2>
      </div>
      <div className="card-grid card-grid--tight">
        {g.pillars.map((pillar, index) => (
          <div key={pillar} className="card card--flat">
            <h3>{String(index + 1).padStart(2, "0")}</h3>
            <p>{pillar}</p>
          </div>
        ))}
      </div>

      <div className="spacer" />

      <aside className="verify-banner">
        <p className="verify-banner__intro">
          {g.docsNote} A framework document is a statement of intent: no national SAR
          organisation has adopted it, and no coordination body exists as a result of it.
        </p>
      </aside>

      <div className="spacer" />
      <div className="cta-row">
        <Link href="/agi/phantom-rescue" className="btn btn--primary">
          The hardware programme
        </Link>
        <Link href="/agi/contact" className="btn">
          Contact
        </Link>
      </div>
    </>
  );
}
