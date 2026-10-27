import { ARTWORKS } from "@/lib/art";
import type { OgCardParams } from "@/lib/og-card";

/**
 * Single source of truth for the cards rendered at build time.
 *
 *   `npm run og` renders every entry below into `public/og/<id>.png`, and
 *   `lib/og.ts` points the page metadata at those static files. Pages must use
 *   `OG_PAGE_CARDS`/`ogWorkCard()` instead of inline params — that way a card
 *   can never fall back to the on-demand `/api/og` route by accident.
 *
 * Adding a card: append an entry here (and reference it from the page).
 * Removing one: its PNG is deleted automatically on the next `npm run og`.
 */

export type OgCatalogEntry = {
  /** `public/og/<id>.png` — also the cache key, so keep it stable. */
  id: string;
  params: OgCardParams;
  /** Human-readable description, printed by the generator. */
  label: string;
};

/** Cards for the static pages — the same values the pages pass to metadata. */
export const OG_PAGE_CARDS = {
  /** Brand card: no params → logo, tagline and catalog counters. */
  brand: {},
  galeria: {
    title: "Galeria prac",
    subtitle: "Kolekcja prac L4L7art",
    eyebrow: "Galeria",
  },
  cennik: {
    title: "Cennik",
    subtitle: "Oryginały, grafiki, edycje i zamówienia indywidualne",
    eyebrow: "Ceny i pakiety",
  },
  faq: {
    title: "Częste pytania",
    subtitle: "Zakupy, wysyłka, zwroty",
    eyebrow: "Pomoc",
  },
  helmet: {
    title: "PHANTOM DEFENSE",
    subtitle: "Hełm patrolowy z NINI Dronem — MagLev, RAIL-V",
    eyebrow: "Angel Guardian Technologies",
  },
  kontakt: {
    title: "Kontakt",
    subtitle: "Pracownia w Bydgoszczy",
    eyebrow: "Napisz",
  },
  "o-mnie": {
    title: "O mnie",
    subtitle: "Artysta i pracownia",
    eyebrow: "Pracownia",
  },
  koszyk: {
    title: "Koszyk",
    subtitle: "Wybrane prace i finalizacja zamówienia",
    eyebrow: "Zakupy",
  },
  zamowienie: {
    title: "Finalizacja zamówienia",
    subtitle: "Dane, dostawa i płatność",
    eyebrow: "Zamówienie",
  },
  regulamin: {
    title: "Regulamin sklepu",
    subtitle: "Zamówienia, płatności, dostawa, zwroty",
    eyebrow: "Dokumenty",
  },
  prywatnosc: {
    title: "Polityka prywatności",
    subtitle: "Jakie dane zbieramy i jak długo je przechowujemy",
    eyebrow: "Dokumenty",
  },
  agi: {
    title: "Angel Guardian Industry",
    subtitle: "PHANTOM RESCUE · PHANTOM SCOUT · Global Rescue Initiative",
    eyebrow: "Public overview",
  },
} satisfies Record<string, OgCardParams>;

/**
 * `og:image:alt` per card — screen readers and Google Images read it, so a
 * generic "studio — tagline" on every page is a wasted slot. Artwork pages
 * build their own alt (`title — technique`) and are not listed here.
 */
export const OG_CARD_ALTS = {
  brand:
    "L4L7art — unikatowe obrazy, grafiki muzealne i edycje limitowane z certyfikatem",
  galeria: "Galeria L4L7art — obrazy, grafiki i edycje limitowane",
  cennik: "Cennik L4L7art — oryginały, grafiki, edycje i zamówienia indywidualne",
  faq: "Częste pytania — zakupy, wysyłka i zwroty w L4L7art",
  helmet: "PHANTOM DEFENSE — hełm patrolowy z pionowym dronem NINI",
  kontakt: "Kontakt — pracownia L4L7art w Bydgoszczy",
  "o-mnie": "O mnie — artysta i pracownia L4L7art",
  koszyk: "Koszyk — wybrane prace w galerii L4L7art",
  zamowienie: "Finalizacja zamówienia — dane, dostawa i płatność",
  regulamin: "Regulamin sklepu L4L7art",
  prywatnosc: "Polityka prywatności L4L7art",
  agi: "Angel Guardian Industry — PHANTOM RESCUE, PHANTOM SCOUT, Global Rescue Initiative",
} satisfies Record<keyof typeof OG_PAGE_CARDS, string>;

/** Card for a single artwork (photo, price, category, availability). */
export function ogWorkCard(slug: string): OgCardParams {
  return { slug };
}

export const OG_CATALOG: readonly OgCatalogEntry[] = [
  { id: "brand", params: OG_PAGE_CARDS.brand, label: "Karta marki (strona główna)" },
  { id: "galeria", params: OG_PAGE_CARDS.galeria, label: "Strona: galeria" },
  { id: "cennik", params: OG_PAGE_CARDS.cennik, label: "Strona: cennik" },
  { id: "faq", params: OG_PAGE_CARDS.faq, label: "Strona: FAQ" },
  { id: "helmet", params: OG_PAGE_CARDS.helmet, label: "Strona: PHANTOM DEFENSE" },
  { id: "kontakt", params: OG_PAGE_CARDS.kontakt, label: "Strona: kontakt" },
  { id: "o-mnie", params: OG_PAGE_CARDS["o-mnie"], label: "Strona: o mnie" },
  { id: "koszyk", params: OG_PAGE_CARDS.koszyk, label: "Strona: koszyk" },
  {
    id: "zamowienie",
    params: OG_PAGE_CARDS.zamowienie,
    label: "Strona: finalizacja zamówienia",
  },
  { id: "regulamin", params: OG_PAGE_CARDS.regulamin, label: "Strona: regulamin" },
  {
    id: "prywatnosc",
    params: OG_PAGE_CARDS.prywatnosc,
    label: "Strona: polityka prywatności",
  },
  { id: "agi", params: OG_PAGE_CARDS.agi, label: "Sekcja: Angel Guardian Industry" },
  ...ARTWORKS.map(
    (art): OgCatalogEntry => ({
      id: `praca-${art.slug}`,
      params: ogWorkCard(art.slug),
      label: `Praca: ${art.title}`,
    }),
  ),
];
