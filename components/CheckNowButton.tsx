"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CheckNowButton({ id, compact = false }: { id: number; compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function check() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/services/${id}/check`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Check failed.");
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
      <button
        className="btn btn--sm"
        onClick={check}
        disabled={busy}
        title="Ping the endpoint now"
      >
        {busy ? "Checking…" : "Check"}
      </button>
      {error && <span className="muted" style={{ fontSize: "0.75rem" }}>{error}</span>}
    </span>
  );
}