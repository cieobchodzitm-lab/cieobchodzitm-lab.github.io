import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  ASSETS,
  type AssetId,
  type Nft,
  type NetworkId,
  type Tx,
  reducer as vaultReducer,
  validateBuy,
  validateListing,
  validateTransfer,
} from "./lib/chain";
import { shortAddress } from "./lib/crypto-demo";
import { loadState, saveState } from "./lib/storage";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Marketplace } from "./components/Marketplace";
import { MyCollection } from "./components/MyCollection";
import { SendForm } from "./components/SendForm";
import { ToastStack, useToasts } from "./components/Toast";
import { TxList } from "./components/TxList";
import { WalletConnect } from "./components/WalletConnect";
import { Modal } from "./components/Modal";

type TabId = "wallet" | "send" | "market" | "collection";

const TABS: { id: TabId; label: string }[] = [
  { id: "wallet", label: "Portfel" },
  { id: "send", label: "Wyślij" },
  { id: "market", label: "Rynek" },
  { id: "collection", label: "Kolekcja" },
];

export default function App() {
  const [state, dispatch] = useReducer(vaultReducer, null, loadState);
  const [tab, setTab] = useState<TabId>("wallet");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seedOpen, setSeedOpen] = useState(false);
  const { toasts, push } = useToasts();

  /* ------------------------- Trwałość i łańcuch ------------------------- */

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Symulowany czas bloku: transakcje oczekujące same się potwierdzają.
  useEffect(() => {
    if (!state) return;
    const timer = setInterval(() => {
      dispatch({ type: "chain/tick", now: Date.now() });
    }, 1000);
    return () => clearInterval(timer);
  }, [state != null]);

  /* ------------------------------ Akcje ------------------------------ */

  const createWallet = useCallback(
    (seed?: string) => {
      dispatch({ type: "wallet/create", seed, now: Date.now() });
      push("ok", "Portfel demo gotowy — saldo jest tylko symulowane.");
      setTab("wallet");
    },
    [push],
  );

  const reset = useCallback(() => {
    dispatch({ type: "wallet/reset" });
    push("info", "Portfel usunięty. Możesz utworzyć nowy.");
    setTab("wallet");
  }, [push]);

  const changeNetwork = useCallback(
    (networkId: NetworkId) => {
      dispatch({ type: "network/set", networkId });
      push("info", `Przełączono na ${networkId === "mainnet-sim" ? "mainnet" : "testnet"}.`);
    },
    [push],
  );

  const send = useCallback(
    (input: { to: string; asset: AssetId; amount: number }) => {
      if (!state) return;
      const error = validateTransfer(state, input);
      if (error != null) {
        push("error", error);
        return;
      }
      dispatch({ type: "tx/send", ...input, now: Date.now() });
      push(
        "ok",
        `Wysłano ${input.amount} ${input.asset} do ${shortAddress(input.to)} — oczekuje na blok.`,
      );
      setTab("wallet");
    },
    [state, push],
  );

  const faucet = useCallback(() => {
    dispatch({ type: "tx/faucet", now: Date.now() });
    push("ok", "Kran dolał 10 NEX (wirtualnych).");
  }, [push]);

  // „Sieć" potwierdza po jednym bloku — w demie symulujemy to krótkim opóźnieniem.
  const withFakeLatency = useCallback(
    (id: string, work: () => void) => {
      setBusyId(id);
      setTimeout(() => {
        work();
        setBusyId(null);
      }, 550);
    },
    [],
  );

  const buy = useCallback(
    (nft: Nft) => {
      if (!state) return;
      const error = validateBuy(state, { nftId: nft.id });
      if (error != null) {
        push("error", error);
        return;
      }
      withFakeLatency(nft.id, () => {
        dispatch({ type: "market/buy", nftId: nft.id, now: Date.now() });
        push("ok", `Kupiono „${nft.name}" za ${nft.priceNex} NEX.`);
      });
    },
    [state, push, withFakeLatency],
  );

  const list = useCallback(
    (nft: Nft, priceNex: number) => {
      if (!state) return;
      const error = validateListing(state, { nftId: nft.id, priceNex });
      if (error != null) {
        push("error", error);
        return;
      }
      dispatch({ type: "market/list", nftId: nft.id, priceNex, now: Date.now() });
      push("ok", `Wystawiono „${nft.name}" za ${priceNex} NEX.`);
    },
    [state, push],
  );

  const unlist = useCallback(
    (nft: Nft) => {
      dispatch({ type: "market/unlist", nftId: nft.id, now: Date.now() });
      push("ok", `Zdjęto „${nft.name}" z rynku.`);
    },
    [push],
  );

  const failTx = useCallback(
    (tx: Tx) => {
      dispatch({ type: "tx/fail", id: tx.id });
      push("error", "Transakcja odrzucona — środki wróciły na saldo.");
    },
    [push],
  );

  const onCopy = useCallback(
    (_value: string, label: string) => {
      push("info", label);
    },
    [push],
  );

  /* ------------------------------ Widok ------------------------------ */

  const pendingCount = useMemo(
    () => (state ? state.txs.filter((tx) => tx.status === "pending").length : 0),
    [state],
  );

  if (!state) {
    return (
      <>
        <WalletConnect onCreate={createWallet} />
        <ToastStack toasts={toasts} />
      </>
    );
  }

  return (
    <div className="app">
      <Header
        state={state}
        onNetworkChange={changeNetwork}
        onCopy={onCopy}
        onReset={reset}
      />

      {pendingCount > 0 && (
        <div className="alert alert--info">
          <span className="spinner" /> {pendingCount}{" "}
          {pendingCount === 1 ? "transakcja oczekuje" : "transakcje oczekują"} na
          potwierdzenie w bloku…
        </div>
      )}

      <nav className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            className="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "wallet" && (
        <div className="grid grid--2">
          <Dashboard state={state} onFaucet={faucet} faucetBusy={false} />
          <div className="stack">
            <section className="card">
              <div className="card__head">
                <h2 className="card__title">Bezpieczeństwo (demo)</h2>
                <span className="card__sub">nie używaj do prawdziwych środków</span>
              </div>
              <p className="muted tiny" style={{ marginTop: 0 }}>
                Fraza tego demo służy wyłącznie do wyliczenia adresu w przeglądarce.
                Nie jest to standard BIP-39 i nie zabezpiecza żadnych realnych
                środków.
              </p>
              <button
                type="button"
                className="btn btn--block btn--sm"
                onClick={() => setSeedOpen(true)}
              >
                Pokaż frazę demo
              </button>
            </section>
            <TxList state={state} onFail={failTx} />
          </div>
        </div>
      )}

      {tab === "send" && (
        <div className="grid grid--2">
          <SendForm state={state} onSend={send} busy={false} />
          <TxList state={state} onFail={failTx} />
        </div>
      )}

      {tab === "market" && (
        <Marketplace state={state} onBuy={buy} busyId={busyId} />
      )}

      {tab === "collection" && (
        <MyCollection
          state={state}
          onList={list}
          onUnlist={unlist}
          busyId={busyId}
        />
      )}

      {seedOpen && (
        <Modal title="Fraza demo (nie BIP-39)" onClose={() => setSeedOpen(false)}>
          <div className="alert alert--info">
            To fraza demonstracyjna. Nie wpisuj jej nigdzie poza tym demo i nie
            używaj do prawdziwego portfela.
          </div>
          <div className="seed-grid">
            {state.seedPhrase.split(" ").map((word, index) => (
              <div className="seed-word" key={`${word}-${index}`}>
                <span>{index + 1}</span>
                {word}
              </div>
            ))}
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                void navigator.clipboard
                  .writeText(state.seedPhrase)
                  .catch(() => undefined);
                push("info", "Frazę skopiowano (jeśli przeglądarka pozwoliła).");
              }}
            >
              Kopiuj
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setSeedOpen(false)}
            >
              Zamknij
            </button>
          </div>
        </Modal>
      )}

      <p className="footer-note">
        <strong>NexusVault — demo.</strong> Symulowany łańcuch w przeglądarce: brak
        RPC, kluczy i prawdziwych środków. Ceny aktywów ({ASSETS.NEX.priceUsd} USD
        za NEX) są wymyślone na potrzeby interfejsu.
        <br />
        Stan zapisuje się w localStorage — „Reset" czyści portfel.
      </p>

      <ToastStack toasts={toasts} />
    </div>
  );
}
