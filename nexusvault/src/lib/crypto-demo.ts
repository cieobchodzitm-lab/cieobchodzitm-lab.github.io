/**
 * Demonstracyjne „krypto". Wszystko jest deterministyczne i lokalne:
 * brak RPC, podpisów i prawdziwych kluczy. Adresy i hashe mają tylko *kształt*
 * EVM, żeby UI wyglądało znajomo — nie są to w żadnym sensie prawdziwe dane.
 */

/** 32-bitowy hash FNV-1a — mały, szybki, wystarczający do ziaren demo. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Generator PRNG (mulberry32) — te same ziarno → ten sam ciąg. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** PRNG z dowolnego napisu. */
export function makeRng(seed: string): () => number {
  return mulberry32(fnv1a(seed));
}

/** Liczba z [0, 1) wyprowadzona z napisu (bez stanu). */
export function hashRatio(input: string, salt = ""): number {
  return fnv1a(`${salt}::${input}`) / 4294967296;
}

/** Adres o kształcie EVM (0x + 40 hex) wyprowadzony z ziarna. */
export function addressFromSeed(seed: string): string {
  const rng = makeRng(`address:${seed}`);
  let hex = "";
  while (hex.length < 40) {
    hex += Math.floor(rng() * 16)
      .toString(16)
      .padStart(1, "0");
  }
  return `0x${hex}`;
}

/** Czy to wygląda jak adres EVM. */
export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim());
}

/** `0x1234…abcd` */
export function shortAddress(address: string, edge = 4): string {
  if (address.length <= 2 + edge * 2) return address;
  return `${address.slice(0, 2 + edge)}…${address.slice(-edge)}`;
}

/** Hash transakcji o kształcie EVM (0x + 64 hex). */
export function txHash(input: string): string {
  let hex = "";
  let salt = input;
  while (hex.length < 64) {
    salt = `${salt}:${hex.length}`;
    hex += fnv1a(salt).toString(16).padStart(8, "0");
  }
  return `0x${hex.slice(0, 64)}`;
}

/** Zaokrąglij do 6 miejsc — tniemy błędy zmiennoprzecinkowe w saldach. */
export function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/** Zaokrąglij do 2 miejsc (ceny w NEX). */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const AMOUNT_FORMAT = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export function formatAmount(value: number): string {
  return AMOUNT_FORMAT.format(value);
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(ms: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - ms) / 1000));
  if (seconds < 5) return "przed chwilą";
  if (seconds < 60) return `${seconds} s temu`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h temu`;
  const days = Math.round(hours / 24);
  return `${days} d temu`;
}

/** Trzy kolory (gradient) wyprowadzone z ziarna — dla grafiki NFT i identikonów. */
export function paletteFor(seed: string): [string, string, string] {
  const rng = makeRng(`palette:${seed}`);
  const hue = Math.floor(rng() * 360);
  const spread = 30 + Math.floor(rng() * 60);
  const sat = 55 + Math.floor(rng() * 35);
  return [
    `hsl(${hue} ${sat}% 62%)`,
    `hsl(${(hue + spread) % 360} ${sat}% 48%)`,
    `hsl(${(hue + spread * 2) % 360} ${sat}% 26%)`,
  ];
}

/** 5×5 komórek identikonu (symetria w poziomie, jak w prawdziwych portfelach). */
export function identiconCells(seed: string): boolean[] {
  const rng = makeRng(`identicon:${seed}`);
  const cells: boolean[] = [];
  for (let row = 0; row < 5; row += 1) {
    // Lewa połowa (3 komórki) + odbicie lustrzane bez środkowej kolumny = 5.
    const half: boolean[] = [];
    for (let col = 0; col < 3; col += 1) half.push(rng() > 0.5);
    const [a, b, c] = [half[0] ?? false, half[1] ?? false, half[2] ?? false];
    cells.push(a, b, c, b, a);
  }
  return cells;
}

/** Szereg cenowy do wykresu: random walk wyprowadzony z ziarna. */
export function priceSeries(seed: string, points = 40, base = 1): number[] {
  const rng = makeRng(`series:${seed}`);
  const out: number[] = [];
  let value = base;
  for (let i = 0; i < points; i += 1) {
    value *= 1 + (rng() - 0.48) * 0.06;
    out.push(value);
  }
  return out;
}

/**
 * Polska odmiana liczebników: 1 przedmiot, 2 przedmioty, 5 przedmiotów.
 * (Zwróć uwagę na 12–14: „12 przedmiotów", nie „przedmioty".)
 */
export function plural(
  count: number,
  singular: string,
  few: string,
  many: string,
): string {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return singular;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
  return many;
}

/** Losowy identyfikator (do tx id w UI). */
export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
