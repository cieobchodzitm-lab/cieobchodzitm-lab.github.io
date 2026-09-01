import Link from "next/link";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-header__brand">
            <span className="mark">⌁</span> THE BRIDGE
          </Link>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="kicker">Stoic Matrix AI · Angel Guardian Technologies</p>
          <h1>THE BRIDGE</h1>
          <p className="subtitle">
            Virtue-aligned operations console for the L0–L5 federation —
            service status, governance proposals, and a tamper-minded audit
            trail.
          </p>
          <div className="cta">
            <Link href="/admin" className="btn btn--primary">
              Enter the Bridge
            </Link>
            {!user && (
              <Link href="/login" className="btn">
                Sign in
              </Link>
            )}
          </div>
        </section>

        <div className="card-grid">
          <div className="card">
            <h3>◈ System Status</h3>
            <p>
              Monitor bridge services — CNOTA Ledger, Virtue Passport,
              Meta-Jury Relay — with live checks, latency and incident notes.
            </p>
          </div>
          <div className="card">
            <h3>◈ Governance</h3>
            <p>
              Open and close constitutional proposals; cast yes / no / abstain
              votes, one member, one vote.
            </p>
          </div>
          <div className="card">
            <h3>◈ Audit Ledger</h3>
            <p>
              Every action — login, edits, checks, votes — is appended to an
              append-only audit log for Meta-Jury review.
            </p>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <p>
          <span className="gold">Ad Astra Una</span> · ConstitutionalAudit:
          SMA-WEB-DEPLOY-20260817
        </p>
        <p>Operator: Zbigniew Szymon Kołacz · phantom@angelguardian.tech</p>
      </footer>
    </>
  );
}