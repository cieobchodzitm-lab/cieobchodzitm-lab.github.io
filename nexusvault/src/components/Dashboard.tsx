import {
  ASSETS,
  FAUCET_AMOUNT_NEX,
  NETWORKS,
  type AssetId,
  type VaultState,
  balanceUsd,
  myNfts,
  nftValueNex,
  portfolioUsd,
} from "../lib/chain";
import { formatPct, formatUsd, round2 } from "../lib/crypto-demo";
import { Sparkline } from "./Sparkline";

type DashboardProps = {
  state: VaultState;
  onFaucet: () => void;
};

export function Dashboard({ state, onFaucet }: DashboardProps) {
  const total = portfolioUsd(state);
  const liquid = balanceUsd(state);
  const collectionNex = nftValueNex(state);
  const owned = myNfts(state).length;
  const network = NETWORKS[state.networkId];

  // „Zmiana" jest wyprowadzona z ziarna — deterministyczna, nie jest daniem rynkowym.
  const change = (state.block % 17) / 100 - 0.08;

  return (
    <div className="stack">
      <section className="card balance">
        <div className="spread">
          <div>
            <div className="balance__label">Wartość portfela</div>
            <div className="balance__value">{formatUsd(total)}</div>
            <div
              className="balance__delta"
              style={{ color: change >= 0 ? "var(--mint)" : "var(--danger)" }}
            >
              {formatPct(change * 100)} · 24 h (symulacja)
            </div>
          </div>
          <div style={{ width: 180, minWidth: 140 }}>
            <Sparkline seed={`portfolio:${state.address}`} points={36} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="balance__row">
            <span className="muted">Środki płynne</span>
            <strong className="num">{formatUsd(liquid)}</strong>
          </div>
          <div className="balance__row">
            <span className="muted">Kolekcja NFT ({owned})</span>
            <strong className="num">
              {round2(collectionNex).toLocaleString("pl-PL")} NEX
            </strong>
          </div>
          <div className="balance__row">
            <span className="muted">Sieć</span>
            <strong>
              {network.shortName} · chainId {network.chainId}
            </strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card__head">
          <h2 className="card__title">Salda</h2>
          <span className="card__sub">opłata zawsze w NEX</span>
        </div>

        {(Object.keys(ASSETS) as AssetId[]).map((id) => {
          const meta = ASSETS[id];
          const amount = state.balances[id];
          return (
            <div className="balance__row" key={id}>
              <span className="asset">
                <span className="asset__dot" style={{ background: meta.accent }} />
                <span>
                  <span className="asset__name">{id}</span>
                  <span className="asset__usd" style={{ marginLeft: 6 }}>
                    {meta.name}
                  </span>
                </span>
              </span>
              <span style={{ textAlign: "right" }}>
                <strong className="num">{amount.toLocaleString("pl-PL")}</strong>
                <span className="asset__usd" style={{ marginLeft: 8 }}>
                  {formatUsd(amount * meta.priceUsd)}
                </span>
              </span>
            </div>
          );
        })}

        <button
          type="button"
          className="btn btn--block"
          style={{ marginTop: 14 }}
          onClick={onFaucet}
        >
          Kran testowy · +{FAUCET_AMOUNT_NEX} NEX
        </button>
        <p className="muted tiny" style={{ marginBottom: 0 }}>
          Kran działa tylko w tym demo — dolewa wirtualne NEX na opłaty sieciowe.
        </p>
      </section>
    </div>
  );
}
