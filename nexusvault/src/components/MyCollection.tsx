import { useMemo, useState } from "react";
import {
  ASSETS,
  MIN_LISTING_NEX,
  RARITIES,
  type Nft,
  type VaultState,
  feeNexFor,
  myNfts,
  validateListing,
} from "../lib/chain";
import { formatTimestamp, formatUsd, round2 } from "../lib/crypto-demo";
import { Modal } from "./Modal";
import { NftCard } from "./NftCard";

type MyCollectionProps = {
  state: VaultState;
  onList: (nft: Nft, priceNex: number) => void;
  onUnlist: (nft: Nft) => void;
  busyId: string | null;
};

export function MyCollection({ state, onList, onUnlist, busyId }: MyCollectionProps) {
  const [listing, setListing] = useState<Nft | null>(null);
  const [price, setPrice] = useState("");
  const [touched, setTouched] = useState(false);

  const owned = useMemo(() => myNfts(state), [state]);

  const parsedPrice = Number(price.replace(",", "."));
  const error =
    listing == null
      ? null
      : validateListing(state, {
          nftId: listing.id,
          priceNex: price.trim() === "" ? 0 : parsedPrice,
        });

  const openListing = (nft: Nft) => {
    setListing(nft);
    setPrice(String(nft.priceNex ?? RARITIES[nft.rarity].floorNex));
    setTouched(false);
  };

  const closeListing = () => {
    setListing(null);
    setTouched(false);
  };

  const submitListing = () => {
    setTouched(true);
    if (listing == null || error != null) return;
    onList(listing, round2(parsedPrice));
    closeListing();
  };

  if (owned.length === 0) {
    return (
      <section className="card">
        <h2 className="card__title">Moja kolekcja</h2>
        <p className="muted">
          Nie masz jeszcze żadnego przedmiotu. Wejdź na <strong>Rynek</strong> i kup
          pierwszego NFT — najtańsze oferty są dobrane tak, żeby starczyło środków
          na start.
        </p>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="card">
        <div className="card__head">
          <h2 className="card__title">Moja kolekcja</h2>
          <span className="card__sub">{owned.length} szt.</span>
        </div>
        <div className="balance__row" style={{ borderTop: 0, paddingTop: 0 }}>
          <span className="muted">Wartość wg progów rzadkości</span>
          <strong className="num">
            {formatUsd(
              owned.reduce((sum, nft) => sum + RARITIES[nft.rarity].floorNex, 0) *
                ASSETS.NEX.priceUsd,
            )}
          </strong>
        </div>
      </div>

      <div className="nft-grid">
        {owned.map((nft) => (
          <div key={nft.id} style={{ display: "grid", gap: 0 }}>
            <NftCard
              nft={nft}
              mode="owned"
              busy={busyId === nft.id}
              onList={openListing}
              onUnlist={onUnlist}
            />
            <div className="muted tiny" style={{ padding: "6px 4px 0" }}>
              {nft.acquiredAt != null
                ? `Nabyte: ${formatTimestamp(nft.acquiredAt)}`
                : "Przedmiot początkowy"}
            </div>
          </div>
        ))}
      </div>

      {listing && (
        <Modal title={`Wystaw: ${listing.name}`} onClose={closeListing}>
          <p className="muted tiny" style={{ marginTop: 0 }}>
            {listing.collection} · #{listing.tokenId} · {RARITIES[listing.rarity].label}
          </p>

          <div className="field">
            <label className="field__label" htmlFor="list-price">
              Cena w NEX (minimum {MIN_LISTING_NEX})
            </label>
            <input
              id="list-price"
              className="input num"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              onBlur={() => setTouched(true)}
            />
            <span className="muted tiny">
              Opłata za wystawienie: {round2(feeNexFor("NEX"))} NEX · orientacyjnie{" "}
              {formatUsd(
                (Number.isFinite(parsedPrice) ? parsedPrice : 0) * ASSETS.NEX.priceUsd,
              )}
            </span>
          </div>

          {touched && error != null && <div className="alert">{error}</div>}

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn--ghost" onClick={closeListing}>
              Anuluj
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={error != null}
              onClick={submitListing}
            >
              Wystaw na rynek
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
