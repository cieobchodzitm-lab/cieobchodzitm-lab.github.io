import { all } from "@/lib/db";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";

export const metadata = { title: "Zamówienia sklepu" };

interface OrderRow {
  id: number;
  numer: string;
  imie: string;
  email: string;
  telefon: string;
  adres: string;
  miasto: string;
  kod: string;
  dostawa: string;
  platnosc: string;
  uwagi: string;
  suma: number;
  status: string;
  created_at: string;
}

interface OrderItemRow {
  order_id: number;
  slug: string;
  tytul: string;
  cena: number;
  ilosc: number;
}

export default function OrdersAdminPage() {
  const orders = all<OrderRow>("SELECT * FROM orders ORDER BY id DESC LIMIT 200");
  const items = all<OrderItemRow>("SELECT * FROM order_items");
  const byOrder = new Map<number, OrderItemRow[]>();
  for (const it of items) {
    const list = byOrder.get(it.order_id) ?? [];
    list.push(it);
    byOrder.set(it.order_id, list);
  }

  return (
    <>
      <div className="section-head">
        <h2>Zamówienia sklepu</h2>
        <span className="hint">L4L7art · razem: {orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="empty">
          Brak zamówień. Gdy ktoś kupi pracę w galerii, pojawi się tutaj.
        </div>
      ) : (
        orders.map((o) => (
          <div className="card card--flat proposal-card" key={o.id}>
            <div style={{ flex: 1 }}>
              <h3>
                {o.numer} · {o.imie}
              </h3>
              <div className="meta">
                <span>{o.email}</span>
                {o.telefon && <span>{o.telefon}</span>}
                <span>{o.created_at.replace("T", " ").slice(0, 16)}</span>
              </div>
              <div className="meta">
                <span>dostawa: {o.dostawa}</span>
                <span>płatność: {o.platnosc}</span>
                {o.miasto && (
                  <span>
                    {o.kod} {o.miasto}, {o.adres}
                  </span>
                )}
              </div>
              <ul className="audit-list">
                {(byOrder.get(o.id) ?? []).map((it) => (
                  <li key={`${o.id}-${it.slug}`}>
                    <span>
                      <b>{it.tytul}</b> × {it.ilosc} · {it.cena} zł
                    </span>
                  </li>
                ))}
              </ul>
              {o.uwagi && <p className="desc">Uwagi: {o.uwagi}</p>}
              <p className="desc">
                Suma: <b style={{ color: "var(--gold)" }}>{o.suma} zł</b>
              </p>
            </div>
            <OrderStatusSelect id={o.id} status={o.status} />
          </div>
        ))
      )}
    </>
  );
}
