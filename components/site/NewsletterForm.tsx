"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      setMsg("Podaj poprawny adres e-mail.");
      return;
    }
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Błąd zapisu.");
      setState("done");
      setMsg("Dziękuję! Pierwszy list już do Ciebie leci.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Spróbuj ponownie.");
    }
  }

  return (
    <form className="l4l7-newsletter" onSubmit={submit}>
      <div className="l4l7-newsletter__row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
          aria-label="Adres e-mail do newslettera"
          disabled={state === "sending"}
        />
        <button
          type="submit"
          className="btn btn--primary btn--sm"
          disabled={state === "sending"}
        >
          {state === "sending" ? "…" : "Zapisz mnie"}
        </button>
      </div>
      {msg && (
        <p
          className={`l4l7-newsletter__msg ${
            state === "done" ? "l4l7-newsletter__msg--ok" : "l4l7-newsletter__msg--err"
          }`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
