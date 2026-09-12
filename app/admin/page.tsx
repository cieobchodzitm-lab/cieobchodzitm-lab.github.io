import Link from "next/link";
import { getDb, all, type AuditRow, type ServiceRow } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { StatusPill } from "@/components/StatusPill";
import { CheckNowButton } from "@/components/CheckNowButton";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = (await getSessionUser()) ?? "";
  const db = getDb();

  const serviceCount = (
    db.prepare("SELECT COUNT(*) AS n FROM services").get() as { n: number }
  ).n;
  const downCount = (
    db.prepare("SELECT COUNT(*) AS n FROM services WHERE status = 'down'").get() as {
      n: number;
    }
  ).n;
  const degradedCount = (
    db.prepare("SELECT COUNT(*) AS n FROM services WHERE status = 'degraded'")
      .get() as { n: number }
  ).n;
  const openCount = (
    db.prepare("SELECT COUNT(*) AS n FROM proposals WHERE status = 'open'").get() as {
      n: number;
    }
  ).n;
  const voteCount = (
    db.prepare("SELECT COUNT(*) AS n FROM votes").get() as { n: number }
  ).n;
  const members = (
    db.prepare(
      "SELECT COUNT(DISTINCT username) AS n FROM votes"
    ).get() as { n: number }
  ).n;

  const services = all<ServiceRow>("SELECT * FROM services ORDER BY id ASC");

  const auditRows = all<AuditRow>(
    "SELECT * FROM audit_log ORDER BY id DESC LIMIT 8"
  );

  const recentProposals = all<{ id: number; title: string }>(
    "SELECT * FROM proposals WHERE status = 'open' ORDER BY id DESC LIMIT 3"
  );

  return (
    <>
      <div className="section-head">
        <h2>Dashboard</h2>
        <span className="hint">Signed in as {user}</span>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">Services</div>
          <div className="value">{serviceCount}</div>
          <div className="delta">{downCount} down · {degradedCount} degraded</div>
        </div>
        <div className="stat-tile">
          <div className="label">Open proposals</div>
          <div className="value">{openCount}</div>
          <div className="delta">governance floor</div>
        </div>
        <div className="stat-tile">
          <div className="label">Total votes</div>
          <div className="value">{voteCount}</div>
          <div className="delta">{members} distinct members</div>
        </div>
        <div className="stat-tile">
          <div className="label">Audit ledger</div>
          <div className="value">∞</div>
          <div className="delta">append-only</div>
        </div>
      </div>

      <div className="grid-2">
        <section>
          <div className="section-head">
            <h2>Service Status</h2>
            <Link className="btn btn--sm" href="/admin/services">
              Manage →
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Latency</th>
                  <th>Last check</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.name}
                      <div className="mono">{s.url}</div>
                    </td>
                    <td>
                      <StatusPill status={s.status} />
                    </td>
                    <td>
                      {s.latency_ms != null ? `${s.latency_ms} ms` : "—"}
                    </td>
                    <td>
                      {s.last_checked_at ? formatTime(s.last_checked_at) : "never"}
                      {s.note && <div className="mono">{s.note}</div>}
                    </td>
                    <td>
                      <CheckNowButton id={s.id} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="section-head">
            <h2>Open Proposals</h2>
            <Link className="btn btn--sm" href="/admin/proposals">
              All →
            </Link>
          </div>
          {recentProposals.length === 0 ? (
            <div className="empty">No open proposals.</div>
          ) : (
            recentProposals.map((p) => (
              <div className="card card--flat proposal-card" key={p.id}>
                <div>
                  <h3>{p.title}</h3>
                  <div className="meta">
                    <span>#{p.id}</span>
                    <Link href={`/admin/proposals/${p.id}`}>View & vote →</Link>
                  </div>
                </div>
                <span className="pill pill--gold">open</span>
              </div>
            ))
          )}

          <div className="spacer" />

          <div className="section-head">
            <h2>Audit Ledger</h2>
          </div>
          <div className="card card--flat">
            <ul className="audit-list">
              {auditRows.map((a) => (
                <li key={a.id}>
                  <span className="when">{formatTime(a.created_at)}</span>
                  <span>
                    <b>{a.actor}</b> {a.action}
                    {a.detail && <span className="muted"> · {a.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

function formatTime(iso: string): string {
  const t = iso.replace(" ", "T") + "Z";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}