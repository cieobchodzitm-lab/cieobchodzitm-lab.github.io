import { STUDIO } from "@/lib/art";
import { OG_CATALOG } from "@/lib/og-catalog";
import { OG_HEIGHT, OG_WIDTH, type OgCardParams } from "@/lib/og-card";

/**
 * Helpers for the social cards.
 *
 * Two ways to get a card, in order of preference:
 *
 *   1. **Static PNG** — `npm run og` renders every entry of `OG_CATALOG` into
 *      `public/og/<id>.png` during the build. `ogCardUrl()` returns that path
 *      whenever the params match a catalogue entry, so no server code runs at
 *      request time and the card works on any host (Vercel, a static export,
 *      a CDN) — even when the Edge Function is unavailable.
 *   2. **`/api/og`** — the on-demand Edge Function (see `app/api/og/route.tsx`),
 *      used as a fallback for params that are not in the catalogue, and handy
 *      for ad-hoc links such as `/api/og?title=…`.
 *
 * Both paths render the same React tree (`lib/og-card.tsx`), so the images are
 * identical apart from the footer label.
 */

export { OG_WIDTH, OG_HEIGHT };
export type { OgCardParams } from "@/lib/og-card";
export { ogWorkCard, OG_CARD_ALTS, OG_PAGE_CARDS } from "@/lib/og-catalog";

/** Canonical query string for a set of params (stable order, blanks skipped). */
function ogQuery(params: OgCardParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.trim()) search.set(key, value);
  }
  return search.toString();
}

/** `canonical query → /og/<id>.png`, built from the static card catalogue. */
const STATIC_CARDS = new Map<string, string>(
  OG_CATALOG.map((entry) => [ogQuery(entry.params), `/og/${entry.id}.png`]),
);

/**
 * URL of a card: the pre-rendered PNG when one exists, otherwise the dynamic
 * route. `metadataBase` (set in `app/layout.tsx`) makes both absolute.
 */
export function ogCardUrl(params: OgCardParams = {}): string {
  const query = ogQuery(params);
  const staticCard = STATIC_CARDS.get(query);
  if (staticCard) return staticCard;
  return query ? `/api/og?${query}` : "/api/og";
}

/** Whether these params are covered by a static PNG (used by the smoke test). */
export function hasStaticCard(params: OgCardParams = {}): boolean {
  return STATIC_CARDS.has(ogQuery(params));
}

/** Ready-to-use `openGraph.images` entry (absolute once `metadataBase` is set). */
export function ogCard(params: OgCardParams = {}, alt?: string) {
  return {
    url: ogCardUrl(params),
    width: OG_WIDTH,
    height: OG_HEIGHT,
    type: "image/png",
    alt: alt ?? `${STUDIO.name} — ${STUDIO.tagline}`,
  };
}

/** Matching Twitter/X `summary_large_image` block for a card. */
export function twitterCard(
  params: OgCardParams = {},
  alt?: string,
): { card: "summary_large_image"; images: { url: string; alt: string }[] } {
  return {
    card: "summary_large_image",
    images: [{ url: ogCardUrl(params), alt: alt ?? `${STUDIO.name}` }],
  };
}

/**
 * OG + Twitter image blocks for a page in one call — spread into `metadata`:
 *
 * ```ts
 * export const metadata: Metadata = {
 *   title: "Galeria prac",
 *   ...socialMetadata(OG_PAGE_CARDS.galeria, OG_CARD_ALTS.galeria),
 * };
 * ```
 */
export function socialMetadata(params: OgCardParams = {}, alt?: string) {
  return {
    openGraph: { images: [ogCard(params, alt)] },
    twitter: twitterCard(params, alt),
  };
}
