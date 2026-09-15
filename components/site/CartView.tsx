"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPLN, getArtwork } from "@/lib/art";

const FREE_SHIPPING_FROM = 2000;

export function CartView() {
  const { lines, total, setQty, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="empty">
        Twój koszyk jest pusty.{" "}
        <Link href="/galeria">Odkryj galerię →</Link>
      </div>
    );
  }

  const missing = Math.max(0, FREE_SHIPPING_FROM - total);
  const progress = Math.min(100, Math.round((total / FREE_SHIPPING_FROM) * 100));

  return (
    <>
      {missing > 0 ? (
        <div className="l4l7-shipbar">
          <p>
            Do <b>darmowego transportu</b> brakuje Ci{" "}
            <b>{formatPLN(missing)}</b>
          </p>
          <div className="l4l7-shipbar__track">
            <div
              className="l4l7-shipbar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="msg msg--success">
          ◈ Masz darmowy, ubezpieczony transport kurierem!
        </p>
      )}

      <ul className="l4l7-cart-lines">
        {lines.map((l) => {
          const art = getArtwork(l.slug);
          if (!art) return null;
          const single = art.category === "obrazy";
          return (
            <li key={l.slug} className="l4l7-cart-line">
              <Link href={`/galeria/${art.slug}`} className="l4l7-cart-line__img">
                <img src={art.image} alt={art.title} />
              </Link>
              <div className="l4l7-cart-line__info">
                <Link href={`/galeria/${art.slug}`}>
                  <b>{art.title}</b>
                </Link>
                <span className="muted">
                  {art.technique} · {art.widthCm}×{art.heightCm} cm
                </span>
                <span className="muted">{art.edition}</span>
              </div>
              <div className="l4l7-cart-line__qty">
                {single ? (
                  <span className="pill pill--gold">1/1 oryginał</span>
                ) : (
                  <>
                    <button
                      className="btn btn--sm"
                      aria-label="Zmniejsz liczbę"
                      onClick={() => setQty(l.slug, l.qty - 1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{l.qty}</span>
                    <button
                      className="btn btn--sm"
                      aria-label="Zwiększ liczbę"
                      onClick={() => setQty(l.slug, l.qty + 1)}
                    >
                      +
                    </button>
                  </>
                )}
              </div>
              <b className="l4l7-cart-line__price">
                {formatPLN((art.pricePln ?? 0) * l.qty)}
              </b>
              <button
                className="btn btn--sm btn--danger"
                onClick={() => remove(l.slug)}
                aria-label={`Usuń ${art.title} z koszyka`}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <div className="l4l7-cart-foot">
        <Link href="/galeria" className="btn">
          ← Wróć do galerii
        </Link>
        <p className="l4l7-cart-total">
          Podsuma: <b>{formatPLN(total)}</b>{" "}
          <span className="muted">+ dostawa na następnym kroku</span>
        </p>
        <Link href="/zamowienie" className="btn btn--primary">
          Przejdź do finalizacji →
        </Link>
      </div>
    </>
  );
}
