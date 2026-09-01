"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProposalCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ kind: "error", text: data.error ?? "Create failed." });
      } else {
        setMsg({ kind: "success", text: `Proposal #${data.proposal.id} opened for voting.` });
        setTitle("");
        setDescription("");
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
      <h3>+ Open a proposal</h3>
      <form className="form-stack" onSubmit={create}>
        <div className="field">
          <label htmlFor="prop-title">Title</label>
          <input
            id="prop-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ratify L5 Virtue Passport schema v0.9"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="prop-desc">Description / scope</label>
          <textarea
            id="prop-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is being decided? Effects on CNOTA, Meta-Jury review scope…"
          />
        </div>
        {msg && <div className={`msg msg--${msg.kind}`}>{msg.text}</div>}
        <div className="form-actions">
          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Opening…" : "Open for voting"}
          </button>
        </div>
      </form>
    </div>
  );
}