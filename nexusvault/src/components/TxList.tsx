import { useEffect, useMemo, useState } from "react";
import {
  ASSETS,
  type Tx,
  type TxKind,
  type VaultState,
  sortedTxs,
} from "../lib/chain";
import { formatTimestamp, round6, shortAddress, timeAgo } from "../lib/crypto-demo";

type TxListProps = {
  state: VaultState;
  onFail: (tx: Tx) => void;
};

const ICONS: Record<TxKind, string> = {
  send: "↗",
  receive: "↙",
  faucet: "◍",
  buy: "★",
  list: "☆",
  unlist: "↺",
};

const STATUS_LABEL = {
  pending: "oczekuje",
  confirmed: "potwierdzona",
  failed: "odrzucona",
} as const;

export function TxList({ state, onFail }: TxListProps) {
  const [now, setNow] = useState(() => Date.now());
  const txs = useMemo(() => sortedTxs(state), [state]);

  // Odświeżamy „x temu" raz na 10 s, bez tykania całego łańcucha.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  if (txs.length === 0) {
    return (
      <section className="card">
        <h2 className="card__title">Transakcje</h2>
        <p className="muted" style={{ margin: 0 }}>
          Brak operacji. Wyślij środki, weź z kranu albo kup NFT — historia
          pojawi się tutaj.
        </p>
      </section>
    );
  }

  return (
    <section className="card card--flush">
      <div style={{ padding: "14px 16px 0" }}>
        <h2 className="card__title">Transakcje</h2>
        <p className="card__sub" style={{ margin: "2px 0 0" }}>
          {txs.length} operacji · kliknij wiersz, żeby zobaczyć szczegóły
        </p>
      </div>

      <div style={{ marginTop: 10 }}>
        {txs.map((tx) => (
          <div className="tx" key={tx.id}>
            <div className="tx__icon">{ICONS[tx.kind]}</div>
            <div className="tx__body">
              <div className="tx__title">
                {labelFor(tx)}
                {tx.note != null && (
                  <span className="muted"> · {tx.note}</span>
                )}
              </div>
              <div className="tx__meta">
                <span className={`badge badge--${tx.status}`}>
                  {STATUS_LABEL[tx.status]}
                </span>{" "}
                {tx.block != null && ` blok #${tx.block.toLocaleString("pl-PL")} · `}
                <span title={formatTimestamp(tx.timestamp)}>{timeAgo(tx.timestamp, now)}</span>
                {tx.to != null && (
                  <>
                    {" · do "}
                    <span className="mono">{shortAddress(tx.to)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="tx__amount">
              <div style={{ color: colorFor(tx) }}>
                {signFor(tx)}
                {tx.amount > 0 ? `${tx.amount.toLocaleString("pl-PL")} ${tx.asset}` : "—"}
              </div>
              <div className="muted tiny">opłata {round6(tx.feeNex)} NEX</div>
              {tx.status === "pending" && (
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  style={{ marginTop: 4 }}
                  onClick={() => onFail(tx)}
                >
                  Odrzuć
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function labelFor(tx: Tx): string {
  switch (tx.kind) {
    case "send":
      return "Przelew wychodzący";
    case "receive":
      return "Przelew przychodzący";
    case "faucet":
      return "Kran testowy";
    case "buy":
      return "Zakup NFT";
    case "list":
      return "Wystawienie na rynek";
    case "unlist":
      return "Zdjęcie z rynku";
    default:
      return "Operacja";
  }
}

function signFor(tx: Tx): string {
  if (tx.kind === "send") return "−";
  if (tx.kind === "receive" || tx.kind === "faucet" || tx.kind === "unlist") return "+";
  return "";
}

function colorFor(tx: Tx): string {
  if (tx.status === "failed") return "var(--danger)";
  if (tx.kind === "send") return "var(--text)";
  if (tx.kind === "receive" || tx.kind === "faucet" || tx.kind === "unlist") {
    return "var(--mint)";
  }
  return ASSETS[tx.asset].accent;
}
