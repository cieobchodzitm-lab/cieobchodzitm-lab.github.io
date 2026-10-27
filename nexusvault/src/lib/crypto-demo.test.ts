import { describe, expect, it } from "vitest";
import {
  addressFromSeed,
  fnv1a,
  formatAmount,
  formatPct,
  formatUsd,
  hashRatio,
  identiconCells,
  isAddress,
  makeRng,
  mulberry32,
  paletteFor,
  priceSeries,
  round2,
  round6,
  shortAddress,
  timeAgo,
  txHash,
  uid,
} from "./crypto-demo";
import { WORDS, demoPhrase } from "./words";

describe("fnv1a + rng", () => {
  it("jest stabilny i różnicujący", () => {
    expect(fnv1a("nexus")).toBe(fnv1a("nexus"));
    expect(fnv1a("nexus")).not.toBe(fnv1a("nexuz"));
    expect(fnv1a("")).toBeGreaterThanOrEqual(0);
  });

  it("hashRatio daje wartość z [0,1)", () => {
    for (const s of ["a", "b", "seed-42", "", "łańcuch"]) {
      const r = hashRatio(s);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
    }
  });

  it("mulberry32 jest deterministyczny i w zakresie", () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    for (let i = 0; i < 5; i += 1) expect(a()).toBe(b());
    const r = mulberry32(1);
    for (let i = 0; i < 100; i += 1) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("makeRng daje te same wartości dla tego samego ziarna", () => {
    const a = makeRng("demo");
    const b = makeRng("demo");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("adresy i hashe", () => {
  it("adres ma 0x + 40 znaków hex i przechodzi isAddress", () => {
    const addr = addressFromSeed("moje-ziarno");
    expect(addr).toMatch(/^0x[0-9a-f]{40}$/);
    expect(isAddress(addr)).toBe(true);
    expect(addressFromSeed("moje-ziarno")).toBe(addr);
    expect(addressFromSeed("inne-ziarno")).not.toBe(addr);
  });

  it("isAddress odrzuca śmieci", () => {
    for (const bad of ["", "0x", "0x123", "0xZZZZ", "0x" + "g".repeat(40)]) {
      expect(isAddress(bad)).toBe(false);
    }
  });

  it("txHash ma 64 znaki hex i jest unikalny", () => {
    const h = txHash("transfer:1");
    expect(h).toMatch(/^0x[0-9a-f]{64}$/);
    expect(txHash("transfer:2")).not.toBe(h);
  });

  it("shortAddress skraca środek", () => {
    const addr = addressFromSeed("x");
    expect(shortAddress(addr, 6)).toBe(`${addr.slice(0, 8)}…${addr.slice(-6)}`);
    expect(shortAddress("")).toBe("");
    expect(shortAddress("abc")).toBe("abc");
  });

  it("uid jest unikalny", () => {
    const ids = new Set(Array.from({ length: 500 }, () => uid("tx")));
    expect([...ids][0]).toMatch(/^tx-/);
    expect(ids.size).toBe(500);
  });
});

describe("formatowanie", () => {
  it("round2/round6 ucinają błędy float", () => {
    expect(round6(0.1 + 0.2)).toBe(0.3);
    expect(round6(1 / 3)).toBe(0.333333);
    expect(round2(1.005)).toBe(1);
    expect(round2(2.675)).toBe(2.68);
  });

  it("formatAmount trzyma min. 2 miejsca i polski separator", () => {
    expect(formatAmount(0)).toBe("0,00");
    expect(formatAmount(0.000123)).toBe("0,000123");
    expect(formatAmount(12.5)).toBe("12,50");
    expect(formatAmount(1234.5678)).toBe("1234,5678");
  });

  it("formatUsd i formatPct", () => {
    expect(formatUsd(1234.5)).toContain("234,50");
    expect(formatUsd(-5)).toContain("-5,00");
    expect(formatPct(5.12)).toBe("+5.12%");
    expect(formatPct(-2)).toBe("-2.00%");
    expect(formatPct(0)).toBe("0.00%");
  });

  it("timeAgo po polsku", () => {
    const now = 1_700_000_000_000;
    expect(timeAgo(now, now)).toBe("przed chwilą");
    expect(timeAgo(now - 45_000, now)).toBe("45 s temu");
    expect(timeAgo(now - 5 * 60_000, now)).toBe("5 min temu");
    expect(timeAgo(now - 3 * 3_600_000, now)).toBe("3 h temu");
    expect(timeAgo(now - 2 * 86_400_000, now)).toBe("2 d temu");
    expect(timeAgo(now - 90 * 86_400_000, now)).toBe("90 d temu");
  });
});

describe("generatory graficzne", () => {
  it("paletteFor jest powtarzalna i ma 3 kolory", () => {
    expect(paletteFor("a")).toEqual(paletteFor("a"));
    expect(paletteFor("a")).not.toEqual(paletteFor("b"));
    expect(paletteFor("a")).toHaveLength(3);
  });

  it("identiconCells zwraca 25 wartości 0/1, symetrycznie", () => {
    const cells = identiconCells("seed");
    expect(cells).toHaveLength(25);
    for (const c of cells) expect(typeof c).toBe("boolean");
    // symetria w poziomie: pierwsza kolumna == ostatnia w każdym wierszu
    for (let row = 0; row < 5; row += 1) {
      expect(cells[row * 5]).toBe(cells[row * 5 + 4]);
      expect(cells[row * 5 + 1]).toBe(cells[row * 5 + 3]);
    }
    expect(cells).toEqual(identiconCells("seed"));
    expect(cells).not.toEqual(identiconCells("inne"));
  });

  it("priceSeries jest deterministyczna, dodatnia i ma długość n", () => {
    const series = priceSeries("NEX", 30);
    expect(series).toHaveLength(30);
    expect(series).toEqual(priceSeries("NEX", 30));
    for (const v of series) expect(v).toBeGreaterThan(0);
    expect(priceSeries("ETH", 30)).not.toEqual(series);
  });
});

describe("fraza demonstracyjna", () => {
  it("ma 12 słów i nie jest prawdziwym BIP-39", () => {
    const phrase = demoPhrase(makeRng("demo-seed"));
    expect(phrase.split(" ")).toHaveLength(12);
    expect(phrase).toBe(demoPhrase(makeRng("demo-seed")));
    expect(demoPhrase(makeRng("inne"))).not.toBe(phrase);
    expect(demoPhrase(makeRng("x"), 6).split(" ")).toHaveLength(6);
    for (const word of phrase.split(" ")) expect(WORDS).toContain(word);
  });
});
