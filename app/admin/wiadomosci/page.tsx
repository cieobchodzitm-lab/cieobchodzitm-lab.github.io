import { all, getDb } from "@/lib/db";

export const metadata = { title: "Wiadomości i newsletter" };

interface MessageRow {
  id: number;
  imie: string;
  email: string;
  temat: string;
  wiadomosc: string;
  created_at: string;
}

interface SubscriberRow {
  id: number;
  email: string;
  created_at: string;
}

export default function MessagesAdminPage() {
  getDb();
  const messages = all<MessageRow>(
    "SELECT * FROM messages ORDER BY id DESC LIMIT 200"
  );
  const subs = all<SubscriberRow>(
    "SELECT * FROM subscribers ORDER BY id DESC LIMIT 500"
  );

  return (
    <>
      <div className="section-head">
        <h2>Wiadomości z formularza</h2>
        <span className="hint">razem: {messages.length}</span>
      </div>

      {messages.length === 0 ? (
        <div className="empty">Brak wiadomości.</div>
      ) : (
        messages.map((m) => (
          <div className="card card--flat proposal-card" key={m.id}>
            <div>
              <h3>
                {m.temat || "Bez tematu"} · {m.imie}
              </h3>
              <div className="meta">
                <span>{m.email}</span>
                <span>{m.created_at.replace("T", " ").slice(0, 16)}</span>
              </div>
              <p className="desc">{m.wiadomosc}</p>
            </div>
            <a className="btn btn--sm" href={`mailto:${m.email}`}>
              Odpowiedz
            </a>
          </div>
        ))
      )}

      <div className="spacer" />

      <div className="section-head">
        <h2>Newsletter — „List z pracowni”</h2>
        <span className="hint">zapisanych: {subs.length}</span>
      </div>
      {subs.length === 0 ? (
        <div className="empty">Brak zapisów.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Zapisano</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.email}</td>
                  <td>{s.created_at.replace("T", " ").slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
