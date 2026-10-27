import { useState } from "react";
import {
  NETWORKS,
  type NetworkId,
  type VaultState,
} from "../lib/chain";
import { shortAddress } from "../lib/crypto-demo";
import { Identicon } from "./Identicon";

type HeaderProps = {
  state: VaultState;
  onNetworkChange: (networkId: NetworkId) => void;
  onCopy: (value: string, label: string) => void;
  onReset: () => void;
};

export function Header({ state, onNetworkChange, onCopy, onReset }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const network = NETWORKS[state.networkId];

  // Schowek może być zablokowany przez przeglądarkę — wtedy pokazujemy
  // tylko potwierdzenie wizualne, bez rzucania błędem.
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(state.address);
    } catch {
      // ignorujemy
    }
    onCopy(state.address, "Adres skopiowany");
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <header className="masthead">
      <div className="brand">
        <div className="brand__mark">N</div>
        <div>
          <div className="brand__name">NexusVault</div>
          <span className="brand__tag">
            blok #{state.block.toLocaleString("pl-PL")} · {network.shortName}
          </span>
        </div>
      </div>

      <div className="masthead__actions">
        <select
          className="select"
          style={{ width: "auto" }}
          value={state.networkId}
          aria-label="Sieć"
          onChange={(event) => onNetworkChange(event.target.value as NetworkId)}
        >
          {(Object.keys(NETWORKS) as NetworkId[]).map((id) => (
            <option key={id} value={id}>
              {NETWORKS[id].name} · {NETWORKS[id].chainId}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="wallet-pill"
          onClick={copyAddress}
          title="Kliknij, żeby skopiować adres"
        >
          <Identicon seed={state.address} />
          <span className="mono">{shortAddress(state.address, 4)}</span>
          <span className="muted tiny">{copied ? "✓" : "⧉"}</span>
        </button>

        <button type="button" className="btn btn--sm btn--ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </header>
  );
}
