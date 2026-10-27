"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ARTWORKS, CATEGORIES, type ArtCategory } from "@/lib/art";
import { ArtworkCard } from "./ArtworkCard";

type SortKey = "najnowsze" | "cena-rosnaco" | "cena-malejaco" | "tytul";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "najnowsze", label: "Najnowsze" },
  { id: "cena-rosnaco", label: "Cena: od najniższej" },
  { id: "cena-malejaco", label: "Cena: od najwyższej" },
  { id: "tytul", label: "Alfabetycznie" },
];

export function GalleryExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCat = (searchParams.get("kat") as ArtCategory | null) ?? "all";

  const [cat, setCat] = useState<ArtCategory | "all">(
    initialCat === "obrazy" || initialCat === "grafiki" || initialCat === "edycje"
      ? initialCat
      : "all"
  );
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<SortKey>("najnowsze");

  function pickCat(next: ArtCategory | "all") {
    setCat(next);
    const q = next === "all" ? "/galeria" : `/galeria?kat=${next}`;
    router.replace(q, { scroll: false });
  }

  const works = useMemo(() => {
    let list = [...ARTWORKS];
    if (cat !== "all") list = list.filter((a) => a.category === cat);
    if (onlyAvailable) list = list.filter((a) => a.status === "dostepna");
    switch (sort) {
      case "najnowsze":
        list.sort((a, b) => b.year - a.year);
        break;
      case "cena-rosnaco":
        list.sort((a, b) => (a.pricePln ?? Infinity) - (b.pricePln ?? Infinity));
        break;
      case "cena-malejaco":
        list.sort((a, b) => (b.pricePln ?? -1) - (a.pricePln ?? -1));
        break;
      case "tytul":
        list.sort((a, b) => a.title.localeCompare(b.title, "pl"));
        break;
    }
    return list;
  }, [cat, onlyAvailable, sort]);

  return (
    <>
      <div className="l4l7-filters">
        <div
          className="l4l7-filters__cats"
          role="tablist"
          aria-label="Filtruj wg kategorii"
        >
          <button
            role="tab"
            aria-selected={cat === "all"}
            className={cat === "all" ? "active" : ""}
            onClick={() => pickCat("all")}
          >
            Wszystkie
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              className={cat === c.id ? "active" : ""}
              onClick={() => pickCat(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="l4l7-filters__side">
          <label className="l4l7-check">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Tylko dostępne
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sortowanie"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="l4l7-result-count" aria-live="polite">
        {works.length === 0
          ? "Brak prac dla wybranych filtrów."
          : `Znaleziono prac: ${works.length}`}
      </p>

      <div className="l4l7-grid">
        {works.map((art) => (
          <ArtworkCard key={art.slug} art={art} />
        ))}
      </div>
    </>
  );
}
