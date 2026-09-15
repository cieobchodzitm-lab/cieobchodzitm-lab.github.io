"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["nowe", "w realizacji", "wysłane", "zakończone", "anulowane"];

export function OrderStatusSelect({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function change(next: string) {
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("status update failed");
      router.refresh();
    } catch {
      setValue(status);
      alert("Nie udało się zmienić statusu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => change(e.target.value)}
      aria-label="Status zamówienia"
      style={{ maxWidth: 150 }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
