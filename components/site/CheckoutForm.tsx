"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPLN, getArtwork } from "@/lib/art";

export function shippingCost(
  lines: { slug: string; qty: number }[],
  dostawa: string,
  subtotal: number
): number {
  if (dostawa === "odbior") return 0;
  if (subtotal >= 2000) return 0;
  const hasOriginal = lines.some(
    (l) => getArtwork(l.slug)?.category === "obrazy"
  );
  return hasOriginal ? 120 : 29;
}

export function CheckoutForm() {
  const { lines, total, clear } = useCart();
  const router = useRouter();
  const [form, setFormState] = useState({
    imie: "",
    email: "",
    telefon: "",
    adres: "",
    miasto: "",
    kod: "",
    dostawa: "kurier",
    platnosc: "przelew",
    uwagi: "",
    rodo: false,
  });
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [msg, setMsg] = useState("");

  const shipping = useMemo(
    () => shippingCost(lines, form.dostawa, total),
    [lines, form.dostawa, total]
  );
  const grandTotal = total + shipping;

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setFormState((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        numer?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.numer)
        throw new Error(data.error || "Nie udało się złożyć zamówienia.");
      clear();
      router.push(`/zamowienie/${data.numer}`);
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Spróbuj ponownie.");
    }
  }

  if (lines.length === 0) {
    return (
      <div className="empty">
        Twój koszyk jest pusty.{" "}
        <Link href="/galeria">Wróć do galerii →</Link>
      </div>
    );
  }

  return (
    <form className="l4l7-checkout" onSubmit={submit}>
      <div className="l4l7-checkout__form card">
        <h3>◈ Dane do zamówienia</h3>
        <div className="form-stack">
          <div className="l4l7-form-row">
            <div className="field">
              <label htmlFor="co-imie">Imię i nazwisko *</label>
              <input
                id="co-imie"
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={form.imie}
                onChange={(e) => set("imie", e.target.value)}
                disabled={state === "sending"}
              />
            </div>
            <div className="field">
              <label htmlFor="co-email">E-mail *</label>
              <input
                id="co-email"
                type="email"
                required
                maxLength={120}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                disabled={state === "sending"}
              />
            </div>
          </div>
          <div className="l4l7-form-row">
            <div className="field">
              <label htmlFor="co-tel">Telefon</label>
              <input
                id="co-tel"
                type="tel"
                maxLength={30}
                placeholder="+48 … (dla kuriera)"
                value={form.telefon}
                onChange={(e) => set("telefon", e.target.value)}
                disabled={state === "sending"}
              />
            </div>
            <div className="field">
              <label htmlFor="co-adres">
                Ulica i numer {form.dostawa === "kurier" ? "*" : ""}
              </label>
              <input
                id="co-adres"
                type="text"
                maxLength={120}
                required={form.dostawa === "kurier"}
                value={form.adres}
                onChange={(e) => set("adres", e.target.value)}
                disabled={state === "sending"}
              />
            </div>
          </div>
          <div className="l4l7-form-row">
            <div className="field">
              <label htmlFor="co-kod">
                Kod pocztowy {form.dostawa === "kurier" ? "*" : ""}
              </label>
              <input
                id="co-kod"
                type="text"
                maxLength={10}
                placeholder="00-000"
                required={form.dostawa === "kurier"}
                value={form.kod}
                onChange={(e) => set("kod", e.target.value)}
                disabled={state === "sending"}
              />
            </div>
            <div className="field">
              <label htmlFor="co-miasto">
                Miasto {form.dostawa === "kurier" ? "*" : ""}
              </label>
              <input
                id="co-miasto"
                type="text"
                maxLength={60}
                required={form.dostawa === "kurier"}
                value={form.miasto}
                onChange={(e) => set("miasto", e.target.value)}
                disabled={state === "sending"}
              />
            </div>
          </div>

          <div className="field">
            <label>Dostawa *</label>
            <div className="l4l7-radio-group">
              <label className="l4l7-radio">
                <input
                  type="radio"
                  name="dostawa"
                  value="kurier"
                  checked={form.dostawa === "kurier"}
                  onChange={() => set("dostawa", "kurier")}
                />
                <span>
                  Kurier ubezpieczony —{" "}
                  {shippingCost(lines, "kurier", total) === 0
                    ? "gratis"
                    : formatPLN(shippingCost(lines, "kurier", total))}
                </span>
              </label>
              <label className="l4l7-radio">
                <input
                  type="radio"
                  name="dostawa"
                  value="odbior"
                  checked={form.dostawa === "odbior"}
                  onChange={() => set("dostawa", "odbior")}
                />
                <span>Odbiór osobisty w Bydgoszczy — gratis</span>
              </label>
            </div>
          </div>

          <div className="field">
            <label>Płatność *</label>
            <div className="l4l7-radio-group">
              <label className="l4l7-radio">
                <input
                  type="radio"
                  name="platnosc"
                  value="przelew"
                  checked={form.platnosc === "przelew"}
                  onChange={() => set("platnosc", "przelew")}
                />
                <span>Przelew bankowy (dane po potwierdzeniu)</span>
              </label>
              <label className="l4l7-radio">
                <input
                  type="radio"
                  name="platnosc"
                  value="odbior"
                  checked={form.platnosc === "odbior"}
                  onChange={() => set("platnosc", "odbior")}
                  disabled={form.dostawa !== "odbior"}
                />
                <span>
                  Przy odbiorze {form.dostawa !== "odbior" ? "(tylko odbiór osobisty)" : ""}
                </span>
              </label>
            </div>
          </div>

          <div className="field">
            <label htmlFor="co-uwagi">Uwagi (opcjonalnie)</label>
            <textarea
              id="co-uwagi"
              maxLength={1000}
              placeholder="Np. faktura na firmę (NIP), preferowana data odbioru, pytanie o oprawę…"
              value={form.uwagi}
              onChange={(e) => set("uwagi", e.target.value)}
              disabled={state === "sending"}
            />
          </div>

          <label className="l4l7-check">
            <input
              type="checkbox"
              checked={form.rodo}
              onChange={(e) => set("rodo", e.target.checked)}
              required
            />
            <span>
              Akceptuję <Link href="/regulamin">regulamin</Link> i wyrażam
              zgodę na przetwarzanie danych w celu realizacji zamówienia
              (<Link href="/prywatnosc">polityka prywatności</Link>). *
            </span>
          </label>
        </div>
      </div>

      <aside className="l4l7-checkout__summary card">
        <h3>◈ Podsumowanie</h3>
        <ul className="l4l7-summary-lines">
          {lines.map((l) => {
            const art = getArtwork(l.slug);
            if (!art) return null;
            return (
              <li key={l.slug}>
                <span>
                  {art.title} × {l.qty}
                </span>
                <b>{formatPLN((art.pricePln ?? 0) * l.qty)}</b>
              </li>
            );
          })}
          <li>
            <span>Dostawa</span>
            <b>{shipping === 0 ? "gratis" : formatPLN(shipping)}</b>
          </li>
        </ul>
        <p className="l4l7-summary-total">
          Razem: <b>{formatPLN(grandTotal)}</b>
        </p>
        {msg && <p className="msg msg--error">{msg}</p>}
        <button
          type="submit"
          className="btn btn--primary l4l7-btn-full"
          disabled={state === "sending"}
        >
          {state === "sending" ? "Składanie…" : "Składam zamówienie"}
        </button>
        <p className="muted l4l7-summary-note">
          To zamówienie z obowiązkiem zapłaty po potwierdzeniu dostępności.
          Potwierdzam każde zamówienie e-mailem w 24 h.
        </p>
      </aside>
    </form>
  );
}
