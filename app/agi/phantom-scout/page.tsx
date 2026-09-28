import type { Metadata } from "next";
import Link from "next/link";
import { PHANTOM_SCOUT } from "@/lib/agi-content";
import { AgiPageHead } from "@/components/AgiPageHead";

export const metadata: Metadata = { title: "PHANTOM SCOUT" };

export default function PhantomScoutPage() {
  const p = PHANTOM_SCOUT;
  return (
    <>
      <AgiPageHead
        eyebrow="Reconnaissance · research and development"
        title={p.name}
        stage={p.stage}
        stageLevel={p.stageLevel}
      />

      <p className="prose">{p.summary}</p>

      <div className="spacer" />

      <div className="section-head">
        <h2>Current position</h2>
      </div>
      <div className="card card--flat">
        <ul className="tight-list">
          {p.status.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="spacer" />

      <aside className="verify-banner">
        <p className="verify-banner__intro">{p.docsNote}</p>
      </aside>

      <div className="spacer" />
      <div className="cta-row">
        <Link href="/agi/phantom-rescue" className="btn btn--primary">
          Back to PHANTOM RESCUE
        </Link>
        <Link href="/agi/contact" className="btn">
          Contact
        </Link>
      </div>
    </>
  );
}
