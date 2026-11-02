import {
  addressFromSeed,
  hashRatio,
  isAddress,
  makeRng,
  round2,
  round6,
  txHash,
} from "./crypto-demo";
import { ADJECTIVES, NOUNS, demoPhrase } from "./words";

/**
 * Symulowany łańcuch NexusVault.
 *
 * Czysta logika: `reducer(state, action) → state`, walidatory i selektory.
 * Brak RPC, podpisów i kontraktów — stan żyje w pamięci i w localStorage.
 * Opłata sieciowa jest zawsze pobierana w NEX (jak gas), a jej wysokość zależy
 * od przenoszonego aktywa: wysłanie tokenu ERC-20 kosztuje więcej niż NEX.
 */

export const STATE_VERSION = 1;
export const STORAGE_KEY = "nexusvault:state:v1";
export const CATALOG_SEED = "nexusvault-genesis-v1";
export const CATALOG_SIZE = 24;
export const MIN_LISTING_NEX = 0.5;
export const FAUCET_AMOUNT_NEX = 10;

/* ------------------------------------------------------------------ */
/* Typy                                                                */
/* ------------------------------------------------------------------ */

export type AssetId = "NEX" | "ETH" | "USDC";
export type NetworkId = "mainnet-sim" | "testnet-sim";
export type Rarity = "common" | "rare" | "epic" | "legendary";
export type TxKind = "send" | "receive" | "faucet" | "buy" | "list" | "unlist";
export type TxStatus = "pending" | "confirmed" | "failed";

export type AssetMeta = {
  id: AssetId;
  name: string;
  /** Miejsca po przecinku pokazywane w UI. */
  decimals: number;
  priceUsd: number;
  /** Typowa opłata w jednostkach tego aktywa (przeliczana na NEX). */
  networkFee: number;
  accent: string;
};

export type NetworkMeta = {
  id: NetworkId;
  name: string;
  shortName: string;
  chainId: number;
  /** Czas between blokami i jednocześnie czas potwierdzenia transakcji. */
  blockTimeMs: number;
  currency: AssetId;
  explorer: string;
};

export type RarityMeta = {
  id: Rarity;
  label: string;
  /** Cena minimalna (w NEX), od której liczy się oferta rynkowa. */
  floorNex: number;
  accent: string;
  weight: number;
};

export type Nft = {
  id: string;
  tokenId: number;
  name: string;
  collection: string;
  collectionIndex: number;
  rarity: Rarity;
  seed: string;
  /** `null` → wystawiony na rynku; adres → w portfelu właściciela. */
  owner: string | null;
  priceNex: number | null;
  acquiredAt: number | null;
};

export type Tx = {
  id: string;
  hash: string;
  kind: TxKind;
  asset: AssetId;
  amount: number;
  feeNex: number;
  from: string | null;
  to: string | null;
  status: TxStatus;
  block: number | null;
  timestamp: number;
  note: string | null;
  nftId: string | null;
};

export type VaultState = {
  version: number;
  address: string;
  seedPhrase: string;
  balances: Record<AssetId, number>;
  networkId: NetworkId;
  block: number;
  blockAt: number;
  txs: Tx[];
  nfts: Nft[];
  createdAt: number;
};

/* ------------------------------------------------------------------ */
/* Stałe                                                               */
/* ------------------------------------------------------------------ */

export const ASSETS: Record<AssetId, AssetMeta> = {
  NEX: {
    id: "NEX",
    name: "Nexus",
    decimals: 4,
    priceUsd: 3.42,
    networkFee: 0.0021,
    accent: "#7c5cff",
  },
  ETH: {
    id: "ETH",
    name: "Ether",
    decimals: 5,
    priceUsd: 3120,
    networkFee: 0.00042,
    accent: "#8a93ff",
  },
  USDC: {
    id: "USDC",
    name: "USD Coin",
    decimals: 2,
    priceUsd: 1,
    networkFee: 0.35,
    accent: "#2ac9a3",
  },
};

export const NETWORKS: Record<NetworkId, NetworkMeta> = {
  "mainnet-sim": {
    id: "mainnet-sim",
    name: "Nexus Mainnet (symulacja)",
    shortName: "Mainnet",
    chainId: 8811,
    blockTimeMs: 2400,
    currency: "NEX",
    explorer: "https://explorer.nexusvault.example",
  },
  "testnet-sim": {
    id: "testnet-sim",
    name: "Nexus Testnet (symulacja)",
    shortName: "Testnet",
    chainId: 8812,
    blockTimeMs: 900,
    currency: "NEX",
    explorer: "https://explorer-testnet.nexusvault.example",
  },
};

export const RARITIES: Record<Rarity, RarityMeta> = {
  common: { id: "common", label: "Pospolita", floorNex: 18, accent: "#8a93ff", weight: 0.55 },
  rare: { id: "rare", label: "Rzadka", floorNex: 145, accent: "#2ac9a3", weight: 0.28 },
  epic: { id: "epic", label: "Epicka", floorNex: 620, accent: "#d4af37", weight: 0.12 },
  legendary: { id: "legendary", label: "Legendarna", floorNex: 2400, accent: "#ff7ac6", weight: 0.05 },
};

/** Dobrane tak, by najtańsza oferta była osiągalna od pierwszego kliknięcia. */
export const START_BALANCES: Record<AssetId, number> = {
  NEX: 850,
  ETH: 0.42,
  USDC: 500,
};

export const COLLECTION_NAMES: readonly string[] = [
  "Nexus Genesis",
  "Aurora Drift",
  "Silent Nodes",
  "Phantom Ledger",
];

export const RARITY_ORDER: readonly Rarity[] = ["common", "rare", "epic", "legendary"];

export const txKindLabels: Record<TxKind, string> = {
  send: "Przelew",
  receive: "Odbiór",
  faucet: "Kran testowy",
  buy: "Zakup NFT",
  list: "Wystawienie",
  unlist: "Zdjęcie z rynku",
};

/* ------------------------------------------------------------------ */
/* Pomocnicze                                                          */
/* ------------------------------------------------------------------ */

export function collectionAccent(index: number): string {
  const accents = ["#7c5cff", "#2ac9a3", "#d4af37", "#ff7ac6"];
  return accents[Math.abs(index) % accents.length] ?? "#7c5cff";
}

export function rarityLabel(rarity: Rarity): string {
  return RARITIES[rarity].label;
}

/** Opłata sieciowa za operację na danym aktywie — zawsze w NEX. */
export function feeNexFor(asset: AssetId): number {
  const meta = ASSETS[asset];
  const nex = ASSETS.NEX;
  return round6((meta.networkFee * meta.priceUsd) / nex.priceUsd);
}

function pickRarity(ratio: number): Rarity {
  let acc = 0;
  for (const id of RARITY_ORDER) {
    acc += RARITIES[id].weight;
    if (ratio <= acc) return id;
  }
  return "common";
}

/** Deterministyczny katalog: to samo ziarno → te same 24 przedmioty. */
export function buildCatalog(): Nft[] {
  const nfts: Nft[] = [];
  for (let i = 0; i < CATALOG_SIZE; i += 1) {
    const seed = `${CATALOG_SEED}:${i}`;
    const rng = makeRng(seed);
    const collectionIndex = i % COLLECTION_NAMES.length;
    const adjective = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)] ?? "Cichy";
    const noun = NOUNS[Math.floor(rng() * NOUNS.length)] ?? "Węzeł";
    const rarity = pickRarity(rng());
    const floor = RARITIES[rarity].floorNex;
    const priceNex = round2(floor * (0.88 + rng() * 1.7));
    nfts.push({
      id: `nft-${i + 1}`,
      tokenId: 1000 + i + 1,
      name: `${adjective} ${noun} #${i + 1}`,
      collection: COLLECTION_NAMES[collectionIndex] ?? "Nexus Genesis",
      collectionIndex,
      rarity,
      seed,
      owner: null, // wystawiony na rynku
      priceNex,
      acquiredAt: null,
    });
  }
  return nfts;
}

export function createVault(seedPhrase?: string, now = Date.now()): VaultState {
  const seed =
    seedPhrase && seedPhrase.trim().length > 0
      ? seedPhrase.trim()
      : demoPhrase(makeRng(`seed:${now}:${Math.random()}`));
  return {
    version: STATE_VERSION,
    address: addressFromSeed(seed),
    seedPhrase: seed,
    balances: { ...START_BALANCES },
    networkId: "mainnet-sim",
    block: 1,
    blockAt: now,
    txs: [],
    nfts: buildCatalog(),
    createdAt: now,
  };
}

function makeTx(input: {
  state: VaultState;
  kind: TxKind;
  asset: AssetId;
  amount: number;
  feeNex: number;
  from: string | null;
  to: string | null;
  timestamp: number;
  status?: TxStatus;
  note?: string | null;
  nftId?: string | null;
}): Tx {
  const {
    state,
    kind,
    asset,
    amount,
    feeNex,
    from,
    to,
    timestamp,
    status = "pending",
    note = null,
    nftId = null,
  } = input;
  const hash = txHash(
    `${state.address}:${kind}:${asset}:${amount}:${timestamp}:${state.block}:${state.txs.length}`,
  );
  return {
    id: `tx-${hash.slice(2, 12)}`,
    hash,
    kind,
    asset,
    amount: round6(amount),
    feeNex,
    from,
    to,
    status,
    block: status === "confirmed" ? state.block : null,
    timestamp,
    note,
    nftId,
  };
}

/* ------------------------------------------------------------------ */
/* Akcje i reducer                                                     */
/* ------------------------------------------------------------------ */

export type Action =
  | { type: "wallet/create"; seed?: string; now?: number }
  | { type: "wallet/reset" }
  | { type: "network/set"; networkId: NetworkId }
  | { type: "chain/tick"; now: number }
  | {
      type: "tx/send";
      to: string;
      asset: AssetId;
      amount: number;
      now?: number;
    }
  | { type: "tx/faucet"; now?: number }
  | { type: "tx/confirm"; id: string }
  | { type: "tx/fail"; id: string }
  | { type: "market/buy"; nftId: string; now?: number }
  | { type: "market/list"; nftId: string; priceNex: number; now?: number }
  | { type: "market/unlist"; nftId: string; now?: number };

export function reducer(state: VaultState | null, action: Action): VaultState | null {
  if (action.type === "wallet/create") {
    return createVault(action.seed, action.now);
  }
  if (action.type === "wallet/reset") return null;
  if (!state) return state;

  switch (action.type) {
    case "network/set":
      return { ...state, networkId: action.networkId };

    case "chain/tick": {
      const net = NETWORKS[state.networkId];
      let block = state.block;
      let blockAt = state.blockAt;
      if (action.now - blockAt >= net.blockTimeMs) {
        const steps = Math.floor((action.now - blockAt) / net.blockTimeMs);
        block += steps;
        blockAt += steps * net.blockTimeMs;
      }
      const txs = state.txs.map((tx) =>
        tx.status === "pending" && action.now - tx.timestamp >= net.blockTimeMs
          ? { ...tx, status: "confirmed" as TxStatus, block }
          : tx,
      );
      return { ...state, block, blockAt, txs };
    }

    case "tx/send": {
      const now = action.now ?? Date.now();
      const feeNex = feeNexFor(action.asset);
      const balances: Record<AssetId, number> = { ...state.balances };
      balances[action.asset] = round6(balances[action.asset] - action.amount);
      balances.NEX = round6(balances.NEX - feeNex);
      const tx = makeTx({
        state,
        kind: "send",
        asset: action.asset,
        amount: action.amount,
        feeNex,
        from: state.address,
        to: action.to,
        timestamp: now,
      });
      return { ...state, balances, txs: [tx, ...state.txs] };
    }

    case "tx/faucet": {
      const now = action.now ?? Date.now();
      const balances: Record<AssetId, number> = { ...state.balances };
      balances.NEX = round6(balances.NEX + FAUCET_AMOUNT_NEX);
      const tx = makeTx({
        state,
        kind: "faucet",
        asset: "NEX",
        amount: FAUCET_AMOUNT_NEX,
        feeNex: 0,
        from: null,
        to: state.address,
        timestamp: now,
        status: "confirmed",
        note: "Kran sieci testowej",
      });
      return { ...state, balances, txs: [tx, ...state.txs] };
    }

    case "tx/confirm":
      return {
        ...state,
        txs: state.txs.map((tx) =>
          tx.id === action.id
            ? { ...tx, status: "confirmed" as TxStatus, block: state.block }
            : tx,
        ),
      };

    case "tx/fail": {
      const target = state.txs.find((tx) => tx.id === action.id);
      if (!target || target.status !== "pending") return state;
      const balances: Record<AssetId, number> = { ...state.balances };
      // Zwrot: kwota wraca na aktywo, opłata przepada tylko przy potwierdzeniu.
      if (target.kind === "send") {
        balances[target.asset] = round6(balances[target.asset] + target.amount);
        balances.NEX = round6(balances.NEX + target.feeNex);
      }
      return {
        ...state,
        balances,
        txs: state.txs.map((tx) =>
          tx.id === action.id ? { ...tx, status: "failed" as TxStatus } : tx,
        ),
      };
    }

    case "market/buy": {
      const now = action.now ?? Date.now();
      const nft = state.nfts.find((item) => item.id === action.nftId);
      if (!nft || nft.owner !== null || nft.priceNex == null) return state;
      const price = nft.priceNex;
      const feeNex = feeNexFor("NEX");
      const balances: Record<AssetId, number> = { ...state.balances };
      balances.NEX = round6(balances.NEX - price - feeNex);
      const nfts = state.nfts.map((item) =>
        item.id === action.nftId
          ? { ...item, owner: state.address, priceNex: null, acquiredAt: now }
          : item,
      );
      const tx = makeTx({
        state,
        kind: "buy",
        asset: "NEX",
        amount: price,
        feeNex,
        from: null,
        to: state.address,
        timestamp: now,
        status: "confirmed",
        note: nft.name,
        nftId: nft.id,
      });
      return { ...state, balances, nfts, txs: [tx, ...state.txs] };
    }

    case "market/list": {
      const now = action.now ?? Date.now();
      const nft = state.nfts.find((item) => item.id === action.nftId);
      if (!nft || nft.owner !== state.address) return state;
      const feeNex = feeNexFor("NEX");
      const balances: Record<AssetId, number> = { ...state.balances };
      balances.NEX = round6(balances.NEX - feeNex);
      const nfts = state.nfts.map((item) =>
        item.id === action.nftId
          ? { ...item, owner: null, priceNex: round2(action.priceNex) }
          : item,
      );
      const tx = makeTx({
        state,
        kind: "list",
        asset: "NEX",
        amount: round2(action.priceNex),
        feeNex,
        from: state.address,
        to: null,
        timestamp: now,
        status: "confirmed",
        note: nft.name,
        nftId: nft.id,
      });
      return { ...state, balances, nfts, txs: [tx, ...state.txs] };
    }

    case "market/unlist": {
      const now = action.now ?? Date.now();
      const nft = state.nfts.find((item) => item.id === action.nftId);
      if (!nft || nft.owner !== null) return state;
      const feeNex = feeNexFor("NEX");
      const balances: Record<AssetId, number> = { ...state.balances };
      balances.NEX = round6(balances.NEX - feeNex);
      const nfts = state.nfts.map((item) =>
        item.id === action.nftId
          ? { ...item, owner: state.address, priceNex: null }
          : item,
      );
      const tx = makeTx({
        state,
        kind: "unlist",
        asset: "NEX",
        amount: 0,
        feeNex,
        from: null,
        to: state.address,
        timestamp: now,
        status: "confirmed",
        note: nft.name,
        nftId: nft.id,
      });
      return { ...state, balances, nfts, txs: [tx, ...state.txs] };
    }

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Walidacja                                                           */
/* ------------------------------------------------------------------ */

export function validateTransfer(
  state: VaultState,
  input: { to: string; asset: AssetId; amount: number },
): string | null {
  if (!isAddress(input.to)) {
    return "Adres musi wyglądać jak EVM: 0x i 40 znaków hex.";
  }
  if (input.to.toLowerCase() === state.address.toLowerCase()) {
    return "Nie możesz wysłać środków na własny adres.";
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return "Podaj kwotę większą od zera.";
  }
  const feeNex = feeNexFor(input.asset);
  const balance = state.balances[input.asset];
  if (input.amount > balance) {
    return `Za mało środków: masz ${round6(balance)} ${input.asset}.`;
  }
  if (input.asset === "NEX" && input.amount + feeNex > balance) {
    return `Za mało NEX: kwota + opłata sieciowa ${round6(feeNex)} NEX.`;
  }
  if (input.asset !== "NEX" && state.balances.NEX < feeNex) {
    return `Za mało NEX na opłatę sieciową (${round6(feeNex)} NEX).`;
  }
  return null;
}

export function validateListing(
  state: VaultState,
  input: { nftId: string; priceNex: number },
): string | null {
  const nft = state.nfts.find((item) => item.id === input.nftId);
  if (!nft) return "Nie ma takiego przedmiotu.";
  if (nft.owner !== state.address) return "Możesz wystawić tylko własny przedmiot.";
  if (!Number.isFinite(input.priceNex) || input.priceNex <= 0) {
    return "Podaj cenę większą od zera.";
  }
  if (input.priceNex < MIN_LISTING_NEX) {
    return `Minimalna cena wystawienia to ${MIN_LISTING_NEX} NEX.`;
  }
  if (state.balances.NEX < feeNexFor("NEX")) {
    return "Za mało NEX na opłatę sieciową.";
  }
  return null;
}

export function validateBuy(state: VaultState, input: { nftId: string }): string | null {
  const nft = state.nfts.find((item) => item.id === input.nftId);
  if (!nft) return "Nie ma takiego przedmiotu.";
  if (nft.owner === state.address) return "Masz już ten przedmiot.";
  if (nft.priceNex == null) return "Ten przedmiot nie jest na sprzedaż.";
  const total = nft.priceNex + feeNexFor("NEX");
  if (state.balances.NEX < total) {
    return `Za mało NEX: cena ${nft.priceNex} + opłata ${round6(feeNexFor("NEX"))}.`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Selektory                                                           */
/* ------------------------------------------------------------------ */

export function myNfts(state: VaultState): Nft[] {
  return state.nfts.filter((nft) => nft.owner === state.address);
}

export function marketListings(state: VaultState): Nft[] {
  return state.nfts.filter((nft) => nft.owner === null && nft.priceNex != null);
}

export function sortedTxs(state: VaultState): Tx[] {
  return [...state.txs].sort((a, b) => b.timestamp - a.timestamp);
}

export function pendingTxs(state: VaultState): Tx[] {
  return state.txs.filter((tx) => tx.status === "pending");
}

export function findTx(state: VaultState, id: string): Tx | undefined {
  return state.txs.find((tx) => tx.id === id);
}

export function balanceUsd(state: VaultState): number {
  return (Object.keys(ASSETS) as AssetId[]).reduce(
    (sum, id) => sum + state.balances[id] * ASSETS[id].priceUsd,
    0,
  );
}

/** Wartość kolekcji: oferta rynkowa albo próg rzadkości. */
export function nftValueNex(state: VaultState): number {
  return myNfts(state).reduce((sum, nft) => {
    const value = nft.priceNex ?? RARITIES[nft.rarity].floorNex;
    return sum + value;
  }, 0);
}

export function nftValueUsd(state: VaultState): number {
  return nftValueNex(state) * ASSETS.NEX.priceUsd;
}

export function portfolioUsd(state: VaultState): number {
  return balanceUsd(state) + nftValueUsd(state);
}

/** Ułamek [0,1) do animacji / wizualizacji — deterministyczny dla ziarna. */
export function nftShimmer(nft: Nft): number {
  return hashRatio(nft.seed, "shimmer");
}
