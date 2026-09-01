"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ServiceManager() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ kind: "error", text: data.error ?? "Create failed." });
      } else {
        setMsg({ kind: "success", text: `Service “${data.service.name}” registered.` });
        setName("");
        setUrl("");
        setNote("");
        router.refresh();
      }
    } catch {
      setMsg({ kind: "error", text: "Network error." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3>+ Register service</h3>
      <form className="form-stack" onSubmit={create}>
        <div className="grid-2" style={{ gap: "0.9rem" }}>
          <div className="field">
            <label htmlFor="svc-name">Name</label>
            <input
              id="svc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CNOTA Ledger"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="svc-url">Endpoint URL</label>
            <input
              id="svc-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="svc-note">Note</label>
          <input
            id="svc-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional context — incident notes, links, upstreams"
          />
        </div>
        {msg && <div className={`msg msg--${msg.kind}`}>{msg.text}</div>}
        <div className="form-actions">
          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Saving…" : "Add service"}
          </button>
        </div>
      </form>
    </div>
  );
}