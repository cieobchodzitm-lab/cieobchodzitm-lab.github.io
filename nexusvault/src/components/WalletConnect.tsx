import { useMemo, useState } from "react";
import { START_BALANCES, ASSETS } from "../lib/chain";
import { demoPhrase } from "../lib/words";
import { makeRng } from "../lib/crypto-demo";

type WalletConnectProps = {
  onCreate: (seed?: string) => void;
};

/**
 * Ekran startowy: „połączenie" portfela polega na wygenerowaniu demo-ziarna.
 * Wyraźnie zaznaczamy, że to nie jest prawdziwa fraza BIP-39 i że niczego
 * nie podpisujemy — to symulacja do pokazywania interfejsu.
 */
export function WalletConnect({ onCreate }: WalletConnectProps) {
  const [showImport, setShowImport] = useState(false);
  const [imported, setImported] = useState("");

  const previewPhrase = useMemo(
    () => demoPhrase(makeRng("nexusvault-preview")),
    [],
  );

  return (
    <div style={{ maxWidth: 560, margin: "6vh auto 0" }}>
      <div className="card">
        <div className="brand" style={{ marginBottom: 14 }}>
          <div className="brand__mark">N</div>
          <div>
            <div className="brand__name">NexusVault</div>
            <span className="brand__tag">Demo portfela Web3</span>
          </div>
        </div>

        <div className="alert alert--info">
          <strong>To demo, nie prawdziwy portfel.</strong> Łańcuch jest symulowany
          w przeglądarce: nie ma RPC, kluczy, podpisów ani prawdziwych środków.
          Fraza poniżej służy tylko do wyliczenia adresu w tym demo.
        </div>

        <h1 className="card__title" style={{ fontSize: 20, marginBottom: 6 }}>
          Portfel testowy gotowy do użycia
        </h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Na start dostajesz saldo demonstracyjne, żeby od razu dało się
          poćwiczyć przelewy i zakupy na rynku NFT.
        </p>

        <div className="stack" style={{ marginTop: 14 }}>
          <div className="card card--flush" style={{ background: "var(--bg-soft)" }}>
            {(Object.keys(START_BALANCES) as (keyof typeof START_BALANCES)[]).map(
              (id) => (
                <div className="kv" key={id} style={{ padding: "9px 14px" }}>
                  <span className="asset">
                    <span
                      className="asset__dot"
                      style={{ background: ASSETS[id].accent }}
                    />
                    <span className="asset__name">{id}</span>
                    <span className="asset__usd">{ASSETS[id].name}</span>
                  </span>
                  <strong className="num">
                    {START_BALANCES[id].toLocaleString("pl-PL")}
                  </strong>
                </div>
              ),
            )}
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => onCreate()}
          >
            Utwórz portfel demo
          </button>

          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => setShowImport((value) => !value)}
          >
            {showImport ? "Ukryj opcję frazy" : "Mam własną frazę (demo)"}
          </button>

          {showImport && (
            <div>
              <div className="field">
                <label className="field__label" htmlFor="seed-input">
                  Fraza (dowolny tekst — wylicza z niej adres)
                </label>
                <input
                  id="seed-input"
                  className="input"
                  placeholder={previewPhrase}
                  value={imported}
                  onChange={(event) => setImported(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn--block"
                disabled={imported.trim().length === 0}
                onClick={() => onCreate(imported)}
              >
                Użyj tej frazy
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="footer-note">
        Wszystkie dane żyją tylko w Twojej przeglądarce (localStorage).
        Brak backendu, brak telemetrii, brak prawdziwych transakcji.
      </p>
    </div>
  );
}
