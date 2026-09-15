"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getArtwork } from "@/lib/art";

export interface CartLine {
  slug: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  add: (slug: string, qty?: number) => boolean;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "l4l7-cart-v1";

function maxQtyFor(slug: string): number {
  const art = getArtwork(slug);
  if (!art) return 0;
  // Oryginały istnieją w 1 egzemplarzu.
  return art.category === "obrazy" ? 1 : 5;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        const valid = parsed.filter((l) => {
          const art = getArtwork(l.slug);
          return (
            art &&
            art.pricePln != null &&
            art.status !== "sprzedana" &&
            Number.isInteger(l.qty) &&
            l.qty > 0
          );
        });
        setLines(valid);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const total = lines.reduce((sum, l) => {
      const art = getArtwork(l.slug);
      return sum + (art?.pricePln ?? 0) * l.qty;
    }, 0);

    return {
      lines,
      count,
      total,
      add: (slug: string, qty = 1) => {
        const art = getArtwork(slug);
        if (!art || art.pricePln == null || art.status === "sprzedana")
          return false;
        const max = maxQtyFor(slug);
        let added = false;
        setLines((prev) => {
          const existing = prev.find((l) => l.slug === slug);
          if (existing) {
            if (existing.qty >= max) return prev;
            added = true;
            return prev.map((l) =>
              l.slug === slug ? { ...l, qty: Math.min(max, l.qty + qty) } : l
            );
          }
          added = true;
          return [...prev, { slug, qty: Math.min(max, qty) }];
        });
        return added;
      },
      remove: (slug: string) =>
        setLines((prev) => prev.filter((l) => l.slug !== slug)),
      setQty: (slug: string, qty: number) => {
        const max = maxQtyFor(slug);
        const clamped = Math.max(0, Math.min(max, Math.floor(qty)));
        setLines((prev) =>
          clamped === 0
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => (l.slug === slug ? { ...l, qty: clamped } : l))
        );
      },
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
