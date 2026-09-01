"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CHOICES = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "abstain", label: "Abstain" },
] as const;

export function VoteButtons({
  proposalId,
  myChoice,
}: {
  proposalId: number;
  myChoice?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function vote(choice: string) {
    setBusy(choice);
    setError("");
    try {
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Vote failed.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
      <div className="vote-buttons">
        {CHOICES.map((c) => (
          <button
            key={c.value}
            className={`btn btn--sm ${myChoice === c.value ? "chosen" : ""}`}
            onClick={() => vote(c.value)}
            disabled={busy !== null}
          >
            {busy === c.value ? "…" : c.label}
          </button>
        ))}
      </div>
      {error && <span className="msg msg--error" style={{ padding: "0.25rem 0.6rem" }}>{error}</span>}
    </div>
  );
}