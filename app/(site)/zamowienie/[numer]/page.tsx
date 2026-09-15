import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { all, one, getDb } from "@/lib/db";
import { formatPLN } from "@/lib/art";

export const metadata: Metadata = {
  title: "Potwierdzenie zamówienia",
  robots: { index: false, follow: false },
};

interface OrderRow {
  id: number;
  numer: string;
  imie: string;
  email: string;
  dostawa: string;
  platnosc: string;
  suma: number;
  status: string;
  created_at: string;
}

interface OrderItemRow {
  slug: string;
  tytul: string;
  cena: number;
  ilosc: number;
}

const DELIVERY: Record<string, string> = {
  kurier: "Kurier ubezpieczony",
  odbior: "Odbiór osobisty w Bydgoszczy",
};

const PAYMENT: Record<string, string> = {
  przelew: "Przelew bankowy",
  odbior: "Płatność przy odbiorze",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ numer: string }>;
}) {
  const { numer } = await params;
  getDb();
  const order = one<OrderRow>("SELECT * FROM orders WHERE numer = ?", numer);
  if (!order) notFound();
  const items = all<OrderItemRow>(
    "SELECT slug, tytul, cena, ilosc FROM order_items WHERE order_id = ?",
    order.id
  );

  return (
    <section className="l4l7-section l4l7-narrow">
      <div className="l4l7-cta-box">
        <p className="l4l7-kicker">◈ Dziękuję!</p>
        <h1>Zamówienie {order.numer} przyjęte</h1>
        <p>
          {order.imie}, Twoje zamówienie jest już u mnie. W ciągu 24 godzin
          roboczych potwierdzę dostępność prac e-mailem na adres{" "}
          <b>{order.email}</b> i — jeśli wszystko się zgadza — wyślę dane do
          przelewu.
        </p>
      </div>

      <div className="card l4l7-mt">
        <h3>◈ Szczegóły zamówienia</h3>
        <ul className="l4l7-summary-lines">
          {items.map((it) => (
            <li key={it.slug}>
              <span>
                {it.tytul} × {it.ilosc}
              </span>
              <b>{formatPLN(it.cena * it.ilosc)}</b>
            </li>
          ))}
        </ul>
        <dl className="l4l7-specs">
          <div>
            <dt>Dostawa</dt>
            <dd>{DELIVERY[order.dostawa] ?? order.dostawa}</dd>
          </div>
          <div>
            <dt>Płatność</dt>
            <dd>{PAYMENT[order.platnosc] ?? order.platnosc}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className="pill pill--gold">{order.status}</span>
            </dd>
          </div>
        </dl>
        <p className="l4l7-summary-total">
          Razem: <b>{formatPLN(order.suma)}</b>
        </p>
      </div>

      <div className="l4l7-center l4l7-mt">
        <Link href="/galeria" className="btn btn--primary">
          Wróć do galerii
        </Link>
      </div>
      <p className="muted l4l7-center l4l7-mt">
        Zapisz numer zamówienia: <b>{order.numer}</b> — przyda się w
        korespondencji.
      </p>
    </section>
  );
}
