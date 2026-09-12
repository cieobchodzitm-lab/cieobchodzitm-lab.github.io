"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditState {
  name: string;
  url: string;
  note: string;
  status: string;
}

export function ServiceRowActions({ id }: { id: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditState>({ name: "", url: "", note: "", status: "untracked" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startEdit() {
    // We need current values; fetch the row from the server list.
    fetch(`/api/services`).then((r) => r.json()).then((data) => {
      const row = (data.services ?? []).find((s: { id: number }) => s.id === id);
      if (row) {
        setForm({ name: row.name, url: row.url, note: row.note, status: row.status });
        setEditing(true);
      }
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
      } else {
        setEditing(false);
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!confirm(`Delete service #${id}? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setBusy(false);
  }

  if (editing) {
    return (
      <form className="form-stack" onSubmit={save} style={{ minWidth: "320px", gap: "0.5rem" }}>
        <div className="field">
          <label>Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field">
          <label>Endpoint URL</label>
          <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <div className="field">
          <label>Note</label>
          <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="operational">Operational</option>
            <option value="degraded">Degraded</option>
            <option value="down">Down</option>
            <option value="untracked">Untracked</option>
          </select>
        </div>
        {error && <div className="msg msg--error">{error}</div>}
        <div className="form-actions">
          <button className="btn btn--primary btn--sm" disabled={busy}>Save</button>
          <button type="button" className="btn btn--sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
      <button className="btn btn--sm" onClick={startEdit}>Edit</button>
      <button className="btn btn--sm btn--danger" onClick={del} disabled={busy}>
        Delete
      </button>
    </div>
  );
}