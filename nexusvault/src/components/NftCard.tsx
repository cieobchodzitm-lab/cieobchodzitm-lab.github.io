import { useMemo } from "react";
import { RARITIES, type Nft } from "../lib/chain";
import { formatUsd, paletteFor } from "../lib/crypto-demo";
import { ASSETS } from "../lib/chain";

type NftCardProps = {
  nft: Nft;
  /** `market` → przycisk „Kup", `owned` → „Wystaw" / „Zdejmij". */
  mode: "market" | "owned";
  busy?: boolean;
  disabledReason?: string | null;
  onBuy?: (nft: Nft) => void;
  onList?: (nft: Nft) => void;
  onUnlist?: (nft: Nft) => void;
};

export function NftCard({
  nft,
  mode,
  busy = false,
  disabledReason = null,
  onBuy,
  onList,
  onUnlist,
}: NftCardProps) {
  const palette = useMemo(() => paletteFor(nft.seed), [nft.seed]);
  const rarity = RARITIES[nft.rarity];
  const [c1, c2, c3] = palette;

  const priceNex = nft.priceNex;

  return (
    <article className="nft">
      <div className="nft__art">
        <div
          className="nft__art-inner"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${c1}, transparent 55%),
                         radial-gradient(circle at 72% 68%, ${c2}, transparent 52%),
                         linear-gradient(140deg, ${c3}, #0b0d14)`,
          }}
        />
        <span className="nft__rarity" style={{ color: rarity.accent }}>
          {rarity.label}
        </span>
        <span className="nft__token">#{nft.tokenId}</span>
      </div>

      <div className="nft__body">
        <div>
          <div className="nft__name">{nft.name}</div>
          <div className="nft__collection">{nft.collection}</div>
        </div>

        <div className="nft__price">
          <strong>
            {priceNex != null ? `${priceNex.toLocaleString("pl-PL")} NEX` : "W portfelu"}
          </strong>
          {priceNex != null && (
            <span className="muted tiny">
              {formatUsd(priceNex * ASSETS.NEX.priceUsd)}
            </span>
          )}
        </div>

        {mode === "market" ? (
          <button
            type="button"
            className="btn btn--primary btn--block btn--sm"
            disabled={busy || disabledReason != null}
            title={disabledReason ?? undefined}
            onClick={() => onBuy?.(nft)}
          >
            {busy ? "Kupowanie…" : "Kup"}
          </button>
        ) : (
          <div className="row">
            <button
              type="button"
              className="btn btn--sm"
              style={{ flex: 1 }}
              disabled={busy}
              onClick={() => onList?.(nft)}
            >
              Wystaw
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              style={{ flex: 1 }}
              disabled={busy}
              onClick={() => onUnlist?.(nft)}
            >
              Zdejmij
            </button>
          </div>
        )}

        {disabledReason != null && (
          <div className="muted tiny">{disabledReason}</div>
        )}
      </div>
    </article>
  );
}
