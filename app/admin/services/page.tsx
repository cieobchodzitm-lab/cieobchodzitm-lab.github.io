import { getDb, all, type ServiceRow } from "@/lib/db";
import { StatusPill } from "@/components/StatusPill";
import { ServiceManager } from "@/components/ServiceManager";
import { ServiceRowActions } from "@/components/ServiceRowActions";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const db = getDb();
  const services = all<ServiceRow>("SELECT * FROM services ORDER BY id ASC");

  return (
    <>
      <div className="section-head">
        <h2>Services</h2>
        <span className="hint">
          Register endpoints, run live checks, keep the ledger honest.
        </span>
      </div>

      <ServiceManager />

      <div className="table-wrap" style={{ marginTop: "1.4rem" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Last checked</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td className="mono">{s.id}</td>
                <td>{s.name}</td>
                <td className="mono">{s.url || "—"}</td>
                <td>
                  <StatusPill status={s.status} />
                </td>
                <td>{s.latency_ms != null ? `${s.latency_ms} ms` : "—"}</td>
                <td>{s.last_checked_at ?? "never"}</td>
                <td>{s.note || ""}</td>
                <td>
                  <ServiceRowActions id={s.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}