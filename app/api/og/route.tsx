import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import { ogFonts } from "@/lib/og-fonts";
import { STUDIO } from "@/lib/art";
import {
  buildOgCardModel,
  OG_HEIGHT,
  OgCard,
  OG_WIDTH,
  type OgCardParams,
} from "@/lib/og-card";

/**
 * On-demand Open Graph / social card generator — the dynamic counterpart of
 * the static PNGs produced by `npm run og` (see `lib/og-catalog.ts`).
 *
 *   GET /api/og                                  → brand card (dark + gold)
 *   GET /api/og?title=Mój+tytuł&subtitle=...     → custom text card
 *   GET /api/og?slug=silentium-aurum             → artwork card (photo + price)
 *
 * Optional query params: `eyebrow`, `subtitle`, `price`, `badge`.
 * Rendered with @vercel/og (satori) — no browser, runs as an Edge Function.
 *
 * Page metadata prefers the pre-rendered files in `public/og/`; this route
 * serves any other combination (and ad-hoc links) straight from the query.
 */

// Edge Function — runs close to the visitor, no Node runtime needed.
export const runtime = "edge";

// Cards are generated per request (title/slug come from the query string).
export const dynamic = "force-dynamic";

/** Decode the inlined fonts once per isolate, not per request. */
let fontsCache: ReturnType<typeof ogFonts> | undefined;

export async function GET(request: NextRequest) {
  const { origin, host, searchParams } = new URL(request.url);

  // Footer label: the public hostname, or a studio label for local/IP hosts
  // (e.g. localhost:3000 or a LAN IP during development).
  const isLocalHost =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i.test(host) ||
    /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host);
  const hostLabel = isLocalHost ? `${STUDIO.name} · ${STUDIO.city}` : host;

  // Query params, passed through as-is (cleaning happens in the card model).
  const params: OgCardParams = {
    slug: searchParams.get("slug") ?? undefined,
    title: searchParams.get("title") ?? undefined,
    subtitle: searchParams.get("subtitle") ?? undefined,
    eyebrow: searchParams.get("eyebrow") ?? undefined,
    price: searchParams.get("price") ?? undefined,
    badge: searchParams.get("badge") ?? undefined,
  };

  const model = buildOgCardModel(params, {
    hostLabel,
    // Only catalog images from our own origin are ever embedded (no remote
    // URLs), and only raster formats: satori cannot rasterize SVG sources.
    resolveImage: (src) => new URL(src, origin).toString(),
  });

  const fonts = fontsCache ?? (fontsCache = ogFonts());

  return new ImageResponse(<OgCard model={model} />, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    emoji: "twemoji",
    fonts,
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
