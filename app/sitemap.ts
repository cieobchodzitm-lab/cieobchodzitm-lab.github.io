import type { MetadataRoute } from "next";
import { ARTWORKS } from "@/lib/art";
import { ogCardUrl, ogWorkCard, OG_PAGE_CARDS } from "@/lib/og";
import { SITE_ORIGIN as BASE } from "@/lib/site";

/**
 * Sitemap with image entries: every URL advertises the social card that
 * belongs to it, so Google Images can pick them up. The URLs come from the
 * same catalogue as the cards (`lib/og-catalog.ts`) — add a page there and it
 * shows up here.
 */
const PAGES: { path: string; card: Parameters<typeof ogCardUrl>[0] }[] = [
  { path: "", card: OG_PAGE_CARDS.brand },
  { path: "/galeria", card: OG_PAGE_CARDS.galeria },
  { path: "/o-mnie", card: OG_PAGE_CARDS["o-mnie"] },
  { path: "/cennik", card: OG_PAGE_CARDS.cennik },
  { path: "/faq", card: OG_PAGE_CARDS.faq },
  { path: "/kontakt", card: OG_PAGE_CARDS.kontakt },
  { path: "/koszyk", card: OG_PAGE_CARDS.koszyk },
  { path: "/zamowienie", card: OG_PAGE_CARDS.zamowienie },
  { path: "/regulamin", card: OG_PAGE_CARDS.regulamin },
  { path: "/prywatnosc", card: OG_PAGE_CARDS.prywatnosc },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = PAGES.map(({ path, card }) => ({
    url: path === "" ? `${BASE}/` : `${BASE}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
    images: [`${BASE}${ogCardUrl(card)}`],
  }));

  const works = ARTWORKS.map((a) => ({
    url: `${BASE}/galeria/${a.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: [`${BASE}${ogCardUrl(ogWorkCard(a.slug))}`],
  }));

  return [...staticPages, ...works];
}
