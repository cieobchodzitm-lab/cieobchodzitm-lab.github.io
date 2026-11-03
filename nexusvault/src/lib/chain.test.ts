import { describe, expect, it } from "vitest";
import {
  ASSETS,
  CATALOG_SIZE,
  COLLECTION_NAMES,
  MIN_LISTING_NEX,
  NETWORKS,
  RARITIES,
  START_BALANCES,
  type Action,
  type Nft,
  type VaultState,
  balanceUsd,
  buildCatalog,
  createVault,
  feeNexFor,
  marketListings,
  myNfts,
  nftValueUsd,
  pendingTxs,
  portfolioUsd,
  reducer,
  sortedTxs,
  validateBuy,
  validateListing,
  validateTransfer,
} from "./chain";
import { isAddress, plural, round6 } from "./crypto-demo";

const NOW = 1_700_000_000_000;

function vault(seed = "demo-seed"): VaultState {
  return createVault(seed, NOW);
}

function run(state: VaultState | null, actions: Action[]): VaultState | null {
  return actions.reduce(reducer, state);
}

const DEMO_ADDRESS = "0x1111111111111111111111111111111111111111";

describe("portfel i ziarno", () => {
  it("tworzy portfel z saldem startowym i adresem EVM", () => {
    const state = vault();
    expect(state.balances).toEqual(START_BALANCES);
    expect(isAddress(state.address)).toBe(true);
    expect(state.nfts).toHaveLength(CATALOG_SIZE);
    expect(state.version).toBe(1);
  });

  it("to samo ziarno daje ten sam adres, różne ziarna — różne", () => {
    expect(createVault("abc", NOW).address).toBe(createVault("abc", NOW).address);
    expect(createVault("abc", NOW).address).not.toBe(createVault("abd", NOW).address);
  });

  it("katalog jest deterministyczny i pokrywa 4 kolekcje", () => {
    const a = buildCatalog();
    const b = buildCatalog();
    expect(a.map((n) => n.id)).toEqual(b.map((n) => n.id));
    expect(a.map((n) => n.priceNex)).toEqual(b.map((n) => n.priceNex));
    expect(new Set(a.map((n) => n.collection))).toEqual(new Set(COLLECTION_NAMES));
    expect(new Set(a.map((n) => n.name)).size).toBe(CATALOG_SIZE);
  });

  it("wallet/reset czyści stan (powrót do onboardingu)", () => {
    expect(reducer(vault(), { type: "wallet/reset" })).toBeNull();
  });
});

describe("opłaty sieciowe", () => {
  it("opłata jest zawsze w NEX i rośnie dla tokenów", () => {
    expect(round6(feeNexFor("NEX"))).toBeCloseTo(0.0021, 6);
    expect(feeNexFor("ETH")).toBeGreaterThan(feeNexFor("NEX"));
    expect(feeNexFor("USDC")).toBeGreaterThan(feeNexFor("NEX"));
  });
});

describe("walidacja przelewu", () => {
  it("odrzuca zły adres", () => {
    const state = vault();
    expect(validateTransfer(state, { to: "0x123", asset: "NEX", amount: 1 })).toMatch(
      /0x i 40 znaków/,
    );
  });

  it("odrzuca własny adres", () => {
    const state = vault();
    expect(
      validateTransfer(state, { to: state.address, asset: "NEX", amount: 1 }),
    ).toMatch(/własny adres/);
  });

  it("odrzuca kwotę zero/ujemną i NaN", () => {
    const state = vault();
    expect(validateTransfer(state, { to: DEMO_ADDRESS, asset: "NEX", amount: 0 })).toMatch(
      /większą od zera/,
    );
    expect(
      validateTransfer(state, { to: DEMO_ADDRESS, asset: "NEX", amount: -5 }),
    ).toMatch(/większą od zera/);
    expect(
      validateTransfer(state, { to: DEMO_ADDRESS, asset: "NEX", amount: Number.NaN }),
    ).toMatch(/większą od zera/);
  });

  it("odrzuca kwotę powyżej salda (z opłatą wliczoną dla NEX)", () => {
    const state = vault();
    expect(
      validateTransfer(state, { to: DEMO_ADDRESS, asset: "NEX", amount: 9999 }),
    ).toMatch(/Za mało/);
    // dokładnie saldo → brak miejsca na opłatę
    expect(
      validateTransfer(state, {
        to: DEMO_ADDRESS,
        asset: "NEX",
        amount: state.balances.NEX,
      }),
    ).toMatch(/opłata/);
    // o opłatę mniej → już ok
    expect(
      validateTransfer(state, {
        to: DEMO_ADDRESS,
        asset: "NEX",
        amount: state.balances.NEX - feeNexFor("NEX"),
      }),
    ).toBeNull();
  });

  it("przy tokenie wymaga NEX na opłatę, ale nie odejmuje jej z tokena", () => {
    const state = vault();
    expect(
      validateTransfer(state, { to: DEMO_ADDRESS, asset: "ETH", amount: 0.42 }),
    ).toBeNull();
    const withoutNex: VaultState = { ...state, balances: { ...state.balances, NEX: 0 } };
    expect(
      validateTransfer(withoutNex, { to: DEMO_ADDRESS, asset: "ETH", amount: 0.01 }),
    ).toMatch(/opłatę sieciową/);
  });
});

describe("przelewy i potwierdzenia", () => {
  it("wysyłka pobiera kwotę i opłatę, zostawia pending", () => {
    const state = vault();
    const fee = feeNexFor("NEX");
    const next = reducer(state, {
      type: "tx/send",
      to: DEMO_ADDRESS,
      asset: "NEX",
      amount: 100,
      now: NOW,
    })!;
    expect(next.balances.NEX).toBeCloseTo(850 - 100 - fee, 6);
    expect(pendingTxs(next)).toHaveLength(1);
    expect(next.txs[0]?.status).toBe("pending");
    expect(next.txs[0]?.block).toBeNull();
  });

  it("potwierdzenie przypisuje blok, a porażka zwraca kwotę i opłatę", () => {
    const state = vault();
    const sent = reducer(state, {
      type: "tx/send",
      to: DEMO_ADDRESS,
      asset: "NEX",
      amount: 100,
      now: NOW,
    })!;
    const id = sent.txs[0]!.id;

    const confirmed = reducer(sent, { type: "tx/confirm", id })!;
    expect(confirmed.txs[0]?.status).toBe("confirmed");
    expect(confirmed.txs[0]?.block).toBe(confirmed.block);
    expect(confirmed.balances.NEX).toBeCloseTo(sent.balances.NEX, 6);

    const failed = reducer(sent, { type: "tx/fail", id })!;
    expect(failed.txs[0]?.status).toBe("failed");
    expect(failed.balances.NEX).toBeCloseTo(850, 6);
  });

  it("kran dodaje NEX od razu potwierdzoną transakcją", () => {
    const state = vault();
    const next = reducer(state, { type: "tx/faucet", now: NOW })!;
    expect(next.balances.NEX).toBe(860);
    expect(next.txs[0]?.status).toBe("confirmed");
    expect(next.txs[0]?.kind).toBe("faucet");
  });
});

describe("łańcuch", () => {
  it("tick dobija blok i potwierdza transakcje po czasie sieci", () => {
    const state = vault();
    const sent = reducer(state, {
      type: "tx/send",
      to: DEMO_ADDRESS,
      asset: "NEX",
      amount: 10,
      now: NOW,
    })!;
    const net = NETWORKS[sent.networkId];

    const tooEarly = reducer(sent, {
      type: "chain/tick",
      now: NOW + net.blockTimeMs - 1,
    })!;
    expect(pendingTxs(tooEarly)).toHaveLength(1);

    const later = reducer(sent, { type: "chain/tick", now: NOW + net.blockTimeMs })!;
    expect(pendingTxs(later)).toHaveLength(0);
    expect(later.txs[0]?.status).toBe("confirmed");
    expect(later.block).toBeGreaterThan(sent.block);
  });

  it("przełącznik sieci zmienia chainId i czas bloku", () => {
    const state = vault();
    expect(NETWORKS[state.networkId].chainId).toBe(8811);
    const next = reducer(state, { type: "network/set", networkId: "testnet-sim" })!;
    expect(NETWORKS[next.networkId].chainId).toBe(8812);
    expect(NETWORKS[next.networkId].blockTimeMs).toBeLessThan(
      NETWORKS["mainnet-sim"].blockTimeMs,
    );
  });
});

describe("marketplace", () => {
  it("kupno przenosi NFT do portfela i pobiera cenę z opłatą", () => {
    const state = vault();
    const target = marketListings(state)[0]!;
    const next = reducer(state, { type: "market/buy", nftId: target.id, now: NOW })!;
    expect(myNfts(next).map((n) => n.id)).toContain(target.id);
    expect(next.balances.NEX).toBeCloseTo(
      850 - (target.priceNex ?? 0) - feeNexFor("NEX"),
      6,
    );
    expect(next.txs[0]?.kind).toBe("buy");
    expect(next.txs[0]?.nftId).toBe(target.id);
    // sprzedany przedmiot znika z rynku
    expect(marketListings(next).map((n) => n.id)).not.toContain(target.id);
  });

  it("nie można kupić przedmiotu spoza rynku ani bez środków", () => {
    const state = vault();
    const mine = reducer(state, {
      type: "market/buy",
      nftId: marketListings(state)[0]!.id,
      now: NOW,
    })!;
    const bought = marketListings(state)[0]!.id;
    expect(validateBuy(mine, { nftId: bought })).toMatch(/Masz już/);

    const poor: VaultState = { ...state, balances: { ...state.balances, NEX: 1 } };
    expect(validateBuy(poor, { nftId: marketListings(state)[0]!.id })).toMatch(
      /Za mało NEX/,
    );
  });

  it("wystawienie i zdjęcie z rynku zmienia właściciela", () => {
    const state = vault();
    const target = marketListings(state)[0]!;
    const owned = reducer(state, { type: "market/buy", nftId: target.id, now: NOW })!;

    const listed = reducer(owned, {
      type: "market/list",
      nftId: target.id,
      priceNex: 750,
      now: NOW + 1,
    })!;
    expect(marketListings(listed).map((n) => n.id)).toContain(target.id);
    expect(myNfts(listed).map((n) => n.id)).not.toContain(target.id);

    const unlisted = reducer(listed, {
      type: "market/unlist",
      nftId: target.id,
      now: NOW + 2,
    })!;
    expect(myNfts(unlisted).map((n) => n.id)).toContain(target.id);
    expect(marketListings(unlisted).map((n) => n.id)).not.toContain(target.id);
  });

  it("walidacja wystawienia: minimum i cudzy przedmiot", () => {
    const state = vault();
    const foreign = marketListings(state)[0]!;
    expect(validateListing(state, { nftId: foreign.id, priceNex: 10 })).toMatch(
      /tylko własny/,
    );

    const owned = reducer(state, {
      type: "market/buy",
      nftId: foreign.id,
      now: NOW,
    })!;
    expect(validateListing(owned, { nftId: foreign.id, priceNex: 0.1 })).toMatch(
      new RegExp(`Minimalna cena.*${MIN_LISTING_NEX}`),
    );
    expect(validateListing(owned, { nftId: foreign.id, priceNex: 20 })).toBeNull();
  });
});

describe("selektory i ekonomia", () => {
  it("portfel = salda + wartość kolekcji", () => {
    const state = vault();
    expect(portfolioUsd(state)).toBeCloseTo(balanceUsd(state) + nftValueUsd(state), 6);
    expect(myNfts(state)).toHaveLength(0);
    expect(nftValueUsd(state)).toBe(0);

    const withNft = reducer(state, {
      type: "market/buy",
      nftId: marketListings(state)[0]!.id,
      now: NOW,
    })!;
    expect(myNfts(withNft)).toHaveLength(1);
    expect(nftValueUsd(withNft)).toBeGreaterThan(0);
  });

  it("transakcje sortowane są od najnowszej", () => {
    const state = run(null, [{ type: "wallet/create", seed: "s", now: NOW }])!;
    const next = run(state, [
      { type: "tx/faucet", now: NOW + 1000 },
      { type: "tx/faucet", now: NOW + 3000 },
    ])!;
    const sorted = sortedTxs(next);
    expect(sorted[0]!.timestamp).toBeGreaterThan(sorted[1]!.timestamp);
  });

  /**
   * Regresja: przy poprzednich progach rzadkości najtańsza oferta kosztowała
   * 8 904 NEX przy saldzie startowym 18,5 NEX — w demie nie dało się nic kupić.
   */
  it("najtańsza oferta jest osiągalna dla portfela startowego", () => {
    const state = vault();
    const prices = marketListings(state)
      .map((nft: Nft) => nft.priceNex ?? 0)
      .sort((a, b) => a - b);
    const cheapest = prices[0]!;
    expect(cheapest).toBeLessThan(START_BALANCES.NEX);
    expect(validateBuy(state, { nftId: marketListings(state)[0]!.id })).toBeNull();

    // legendarne przedmioty wciąż powinny zostawać poza zasięgiem startu
    const legendary = state.nfts.filter((nft) => nft.rarity === "legendary");
    expect(legendary.length).toBeGreaterThan(0);
    expect(RARITIES.legendary.floorNex).toBeGreaterThan(START_BALANCES.NEX);
  });
});

describe("polska odmiana (plural)", () => {
  it("1 przedmiot, 2 przedmioty, 5 przedmiotów, 12 przedmiotów", () => {
    const cases: [number, string][] = [
      [0, "przedmiotów"],
      [1, "przedmiot"],
      [2, "przedmioty"],
      [4, "przedmioty"],
      [5, "przedmiotów"],
      [11, "przedmiotów"],
      [12, "przedmiotów"],
      [14, "przedmiotów"],
      [21, "przedmiotów"],
      [22, "przedmioty"],
      [25, "przedmiotów"],
      [101, "przedmiotów"],
      [102, "przedmioty"],
    ];
    for (const [count, expected] of cases) {
      expect(plural(count, "przedmiot", "przedmioty", "przedmiotów")).toBe(expected);
    }
  });
});

describe("spójność metadanych", () => {
  it("każde aktywo ma cenę i opłatę, każda rzadkość próg", () => {
    for (const id of Object.keys(ASSETS) as (keyof typeof ASSETS)[]) {
      expect(ASSETS[id].priceUsd).toBeGreaterThan(0);
      expect(feeNexFor(id)).toBeGreaterThan(0);
    }
    for (const id of Object.keys(RARITIES) as (keyof typeof RARITIES)[]) {
      expect(RARITIES[id].floorNex).toBeGreaterThan(0);
      expect(RARITIES[id].weight).toBeGreaterThan(0);
    }
  });
});
