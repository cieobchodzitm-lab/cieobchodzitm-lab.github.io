import { useMemo, useState } from "react";
import {
  COLLECTION_NAMES,
  RARITIES,
  RARITY_ORDER,
  type Nft,
  type Rarity,
  type VaultState,
  marketListings,
  validateBuy,
} from "../lib/chain";
import { plural } from "../lib/crypto-demo";
import { NftCard } from "./NftCard";

type SortKey = "price-asc" | "price-desc" | "rarity" | "newest";

type MarketplaceProps = {
  state: VaultState;
  onBuy: (nft: Nft) => void;
  busyId: string | null;
};

const RARITY_RANK: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

export function Marketplace({ state, onBuy, busyId }: MarketplaceProps) {
  const [collection, setCollection] = useState<string>("all");
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [query, setQuery] = useState("");

  const listings = useMemo(() => marketListings(state), [state]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = listings.filter((nft) => {
      if (collection !== "all" && nft.collection !== collection) return false;
      if (rarity !== "all" && nft.rarity !== rarity) return false;
      if (needle.length > 0) {
        const haystack = `${nft.name} ${nft.collection} ${nft.tokenId}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "price-asc") return (a.priceNex ?? 0) - (b.priceNex ?? 0);
      if (sort === "price-desc") return (b.priceNex ?? 0) - (a.priceNex ?? 0);
      if (sort === "rarity") {
        const diff = RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity];
        if (diff !== 0) return diff;
        return (a.priceNex ?? 0) - (b.priceNex ?? 0);
      }
      return b.tokenId - a.tokenId;
    });
    return sorted;
  }, [listings, collection, rarity, sort, query]);

  return (
    <section className="stack">
      <div className="card">
        <div className="card__head">
          <h2 className="card__title">Rynek NFT</h2>
          <span className="card__sub">
            {visible.length} {plural(visible.length, "oferta", "oferty", "ofert")}
          </span>
        </div>

        <div className="row">
          <input
            className="input"
            placeholder="Szukaj po nazwie lub tokenie…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ flex: "2 1 220px" }}
          />
          <select
            className="select"
            value={collection}
            onChange={(event) => setCollection(event.target.value)}
            style={{ flex: "1 1 160px" }}
            aria-label="Kolekcja"
          >
            <option value="all">Wszystkie kolekcje</option>
            {COLLECTION_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={rarity}
            onChange={(event) => setRarity(event.target.value as Rarity | "all")}
            style={{ flex: "1 1 150px" }}
            aria-label="Rzadkość"
          >
            <option value="all">Każda rzadkość</option>
            {RARITY_ORDER.map((id) => (
              <option key={id} value={id}>
                {RARITIES[id].label}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            style={{ flex: "1 1 160px" }}
            aria-label="Sortowanie"
          >
            <option value="price-asc">Cena: od najniższej</option>
            <option value="price-desc">Cena: od najwyższej</option>
            <option value="rarity">Rzadkość</option>
            <option value="newest">Najnowsze</option>
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Nic nie pasuje do tych filtrów. Zmień kolekcję albo wyczyść wyszukiwanie.
          </p>
        </div>
      ) : (
        <div className="nft-grid">
          {visible.map((nft) => (
            <NftCard
              key={nft.id}
              nft={nft}
              mode="market"
              busy={busyId === nft.id}
              disabledReason={validateBuy(state, { nftId: nft.id })}
              onBuy={onBuy}
            />
          ))}
        </div>
      )}
    </section>
  );
}
