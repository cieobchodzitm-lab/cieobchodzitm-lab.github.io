import { useMemo, useState } from "react";
import {
  ASSETS,
  type AssetId,
  type VaultState,
  feeNexFor,
  validateTransfer,
} from "../lib/chain";
import { formatUsd, round6 } from "../lib/crypto-demo";

type SendFormProps = {
  state: VaultState;
  onSend: (input: { to: string; asset: AssetId; amount: number }) => void;
  busy: boolean;
  prefillTo?: string;
};

export function SendForm({ state, onSend, busy, prefillTo = "" }: SendFormProps) {
  const [to, setTo] = useState(prefillTo);
  const [asset, setAsset] = useState<AssetId>("NEX");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const parsedAmount = Number(amount.replace(",", "."));
  const meta = ASSETS[asset];
  const fee = feeNexFor(asset);

  const error = useMemo(
    () =>
      validateTransfer(state, {
        to: to.trim(),
        asset,
        amount: amount.trim() === "" ? 0 : parsedAmount,
      }),
    [state, to, asset, amount, parsedAmount],
  );

  const showError = touched && error != null && amount.trim() !== "";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (error != null) return;
    onSend({ to: to.trim(), asset, amount: parsedAmount });
    setAmount("");
    setTouched(false);
  };

  const setMax = () => {
    const max = asset === "NEX" ? state.balances.NEX - fee : state.balances[asset];
    setAmount(String(round6(Math.max(0, max))));
  };

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">Wyślij środki</h2>
        <span className="card__sub">{meta.name}</span>
      </div>

      <form onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="send-to">
            Adres odbiorcy
          </label>
          <input
            id="send-to"
            className="input input--mono"
            placeholder="0x…"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            onBlur={() => setTouched(true)}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="grid grid--2" style={{ gap: 12 }}>
          <div className="field">
            <label className="field__label" htmlFor="send-asset">
              Aktywo
            </label>
            <select
              id="send-asset"
              className="select"
              value={asset}
              onChange={(event) => setAsset(event.target.value as AssetId)}
            >
              {(Object.keys(ASSETS) as AssetId[]).map((id) => (
                <option key={id} value={id}>
                  {id} — {ASSETS[id].name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="send-amount">
              Kwota (dostępne {state.balances[asset].toLocaleString("pl-PL")} {asset})
            </label>
            <input
              id="send-amount"
              className="input num"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onBlur={() => setTouched(true)}
            />
          </div>
        </div>

        <div className="row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn btn--sm btn--ghost" onClick={setMax}>
            Maksimum
          </button>
          <span className="muted tiny">
            Opłata sieciowa: {round6(fee)} NEX
            {asset !== "NEX" && " (pobierana z salda NEX)"}
          </span>
        </div>

        {showError && <div className="alert">{error}</div>}

        <div className="kv">
          <span className="muted">Wartość</span>
          <strong className="num">
            {formatUsd((Number.isFinite(parsedAmount) ? parsedAmount : 0) * meta.priceUsd)}
          </strong>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--block"
          style={{ marginTop: 14 }}
          disabled={busy || error != null}
        >
          {busy ? "Wysyłanie…" : "Wyślij"}
        </button>
      </form>
    </section>
  );
}
