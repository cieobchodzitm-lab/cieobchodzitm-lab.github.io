"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import type { Artwork } from "@/lib/art";

export function AddToCartButton({ art }: { art: Artwork }) {
  const { add, lines } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = lines.some((l) => l.slug === art.slug);
  const sellable = art.pricePln != null && art.status !== "sprzedana";

  if (!sellable) {
    return (
      <div className="l4l7-buybox__actions">
        <Link href="/kontakt" className="btn">
          Zapytaj o podobną pracę
        </Link>
      </div>
    );
  }

  return (
    <div className="l4l7-buybox__actions">
      <button
        className="btn btn--primary"
        onClick={() => {
          if (add(art.slug)) setAdded(true);
        }}
        disabled={inCart && art.category === "obrazy"}
      >
        {inCart && art.category === "obrazy"
          ? "Już w koszyku ✓"
          : added
            ? "Dodano ✓ — dodaj kolejną"
            : "Dodaj do koszyka"}
      </button>
      {(added || inCart) && (
        <Link href="/koszyk" className="btn">
          Przejdź do koszyka →
        </Link>
      )}
    </div>
  );
}
