"use client";

import { useState } from "react";

const TOPICS = [
  "Zakup pracy z galerii",
  "Obraz na zamówienie",
  "Edycje limitowane / lista rezerwowa",
  "Wizyta w pracowni",
  "Współpraca / wystawa",
  "Inna sprawa",
];

export function ContactForm({ defaultTopic = TOPICS[0] }: { defaultTopic?: string }) {
  const [form, setForm] = useState({
    imie: "",
    email: "",
    temat: defaultTopic,
    wiadomosc: "",
    rodo: false,
  });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rodo) {
      setState("error");
      setMsg("Zaznacz zgodę na kontakt, aby wysłać wiadomość.");
      return;
    }
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Nie udało się wysłać.");
      setState("done");
      setMsg("Wiadomość wysłana! Odpowiadam zwykle w 24 godziny robocze.");
      setForm({ imie: "", email: "", temat: TOPICS[0], wiadomosc: "", rodo: false });
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Spróbuj ponownie.");
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="l4l7-form-row">
        <div className="field">
          <label htmlFor="cf-imie">Imię i nazwisko *</label>
          <input
            id="cf-imie"
            type="text"
            value={form.imie}
            onChange={(e) => set("imie", e.target.value)}
            required
            minLength={2}
            maxLength={80}
            placeholder="Jan Kowalski"
            disabled={state === "sending"}
          />
        </div>
        <div className="field">
          <label htmlFor="cf-email">E-mail *</label>
          <input
            id="cf-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            maxLength={120}
            placeholder="jan@poczta.pl"
            disabled={state === "sending"}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-temat">Temat</label>
        <select
          id="cf-temat"
          value={form.temat}
          onChange={(e) => set("temat", e.target.value)}
          disabled={state === "sending"}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="cf-msg">Wiadomość *</label>
        <textarea
          id="cf-msg"
          value={form.wiadomosc}
          onChange={(e) => set("wiadomosc", e.target.value)}
          required
          minLength={10}
          maxLength={3000}
          placeholder="Opowiedz, o jaką pracę chodzi lub co chcesz zamówić…"
          disabled={state === "sending"}
        />
      </div>
      <label className="l4l7-check">
        <input
          type="checkbox"
          checked={form.rodo}
          onChange={(e) => set("rodo", e.target.checked)}
        />
        <span>
          Wyrażam zgodę na kontakt w sprawie mojego zapytania (szczegóły:{" "}
          <a href="/prywatnosc">polityka prywatności</a>). *
        </span>
      </label>
      {msg && (
        <p className={`msg ${state === "done" ? "msg--success" : "msg--error"}`}>
          {msg}
        </p>
      )}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={state === "sending"}
        >
          {state === "sending" ? "Wysyłanie…" : "Wyślij wiadomość"}
        </button>
      </div>
    </form>
  );
}
