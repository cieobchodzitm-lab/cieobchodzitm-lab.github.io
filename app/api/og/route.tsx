import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import { ogFonts } from "@/lib/og-fonts";
import {
  ARTWORKS,
  CATEGORIES,
  categoryName,
  formatPLN,
  getArtwork,
  STUDIO,
  type Artwork,
} from "@/lib/art";

/**
 * Dynamic Open Graph / social card generator.
 *
 *   GET /api/og                                  → brand card (dark + gold)
 *   GET /api/og?title=Mój+tytuł&subtitle=...     → custom text card
 *   GET /api/og?slug=silentium-aurum             → artwork card (photo + price)
 *
 * Optional query params: `eyebrow`, `subtitle`, `price`, `badge`.
 * Rendered with @vercel/og (satori) — no browser, runs as an Edge Function.
 */

// Edge Function — runs close to the visitor, no Node runtime needed.
export const runtime = "edge";

// Cards are generated per request (title/slug come from the query string).
export const dynamic = "force-dynamic";

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  bg: "#0c0e12",
  glow: "#1b2029",
  card: "#1a1e26",
  gold: "#d4af37",
  goldDim: "#a88b2a",
  goldFaint: "rgba(212, 175, 55, 0.35)",
  text: "#e8e6e3",
  muted: "#9a968f",
  border: "#2a2f38",
  ok: "#4ade80",
  okBg: "rgba(74, 222, 128, 0.12)",
  warn: "#fbbf24",
  warnBg: "rgba(251, 191, 36, 0.12)",
} as const;

const STATUS_STYLE: Record<
  Artwork["status"],
  { label: string; color: string; background: string }
> = {
  dostepna: { label: "Dostępna", color: COLORS.ok, background: COLORS.okBg },
  zarezerwowana: {
    label: "Zarezerwowana",
    color: COLORS.warn,
    background: COLORS.warnBg,
  },
  sprzedana: { label: "Wyprzedana", color: COLORS.muted, background: "#20242c" },
};

/** Trim / collapse whitespace, cap the length, keep `null` for empty input. */
function text(
  value: string | null,
  fallback: string | null = null,
  maxLength = 120,
): string | null {
  if (!value) return fallback;
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  return cleaned.length <= maxLength
    ? cleaned
    : `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Catalog images satori can rasterise (SVG sources are skipped). */
const RASTER_IMAGE = /\.(jpe?g|png|webp|gif)$/i;

/** Decode the inlined fonts once per isolate, not per request. */
let fontsCache: ReturnType<typeof ogFonts> | undefined;

function titleSize(title: string): number {
  if (title.length <= 24) return 78;
  if (title.length <= 40) return 66;
  if (title.length <= 58) return 56;
  if (title.length <= 84) return 48;
  return 42;
}

export async function GET(request: NextRequest) {
  const { origin, host, searchParams } = new URL(request.url);

  // Footer label: the public hostname, or a studio label for local/IP hosts
  // (e.g. localhost:3000 or a LAN IP during development).
  const isLocalHost =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i.test(host) ||
    /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host);
  const hostLabel = isLocalHost ? `${STUDIO.name} · ${STUDIO.city}` : host;

  // 1. Dynamic data from the URL — an artwork slug, or free text.
  const slug = text(searchParams.get("slug"), null, 80);
  const artwork = slug ? getArtwork(slug) : undefined;

  const title = text(searchParams.get("title"), artwork?.title ?? STUDIO.name)!;
  const eyebrow = text(
    searchParams.get("eyebrow"),
    artwork
      ? `${categoryName(artwork.category)} · ${artwork.year}`
      : `Pracownia sztuki · ${STUDIO.city}`,
  )!;
  const subtitle = text(
    searchParams.get("subtitle"),
    artwork ? artwork.technique : STUDIO.tagline,
  )!;
  const price = text(
    searchParams.get("price"),
    artwork?.pricePln != null ? formatPLN(artwork.pricePln) : null,
    40,
  );
  const badge = text(
    searchParams.get("badge"),
    artwork ? STATUS_STYLE[artwork.status].label : null,
    40,
  );
  const badgeStyle = artwork ? STATUS_STYLE[artwork.status] : undefined;

  // Only catalog images from our own origin are ever embedded (no remote URLs),
  // and only raster formats: satori cannot rasterize SVG sources.
  const artworkImage =
    artwork && artwork.image.startsWith("/") && RASTER_IMAGE.test(artwork.image)
      ? new URL(artwork.image, origin).toString()
      : null;
  // Works without a raster photo get an engraved plate instead of an empty box.
  const showPlate = Boolean(artwork) && !artworkImage;

  // Brand card = no artwork and no custom text → it may show catalog stats.
  const isBrandCard =
    !artwork && !searchParams.get("title") && !searchParams.get("subtitle");

  const stats: ReadonlyArray<{ value: string; label: string }> = [
    { value: String(ARTWORKS.length), label: "prac w kolekcji" },
    { value: String(CATEGORIES.length), label: "techniki" },
    { value: "100%", label: "z certyfikatem" },
  ];

  const fonts = fontsCache ?? (fontsCache = ogFonts());

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "54px 60px",
          backgroundColor: COLORS.bg,
          backgroundImage: `linear-gradient(155deg, ${COLORS.glow} 0%, ${COLORS.bg} 48%, #10131a 100%)`,
          color: COLORS.text,
          fontFamily: "Cinzel",
        }}
      >
        {/* hairline gold frame */}
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 22,
            right: 22,
            bottom: 22,
            border: `1px solid ${COLORS.border}`,
            display: "flex",
          }}
        />

        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 16,
                height: 16,
                backgroundColor: COLORS.gold,
                transform: "rotate(45deg)",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 10,
                color: COLORS.text,
              }}
            >
              {STUDIO.name.toUpperCase()}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 2,
              color: COLORS.muted,
            }}
          >
            {STUDIO.city}
          </div>
        </div>

        {/* body */}
        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            width: "100%",
            padding: "18px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
              maxHeight: 452,
              overflow: "hidden",
              justifyContent: "center",
              gap: 16,
              maxWidth: artworkImage || showPlate ? 620 : 980,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: COLORS.goldDim,
              }}
            >
              {eyebrow}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: titleSize(title),
                fontWeight: 700,
                lineHeight: 1.06,
                color: COLORS.text,
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.35,
                color: COLORS.muted,
              }}
            >
              {subtitle}
            </div>

            {isBrandCard && (
              <div
                style={{
                  display: "flex",
                  gap: 46,
                  marginTop: 20,
                  paddingTop: 22,
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontSize: 40,
                        fontWeight: 700,
                        color: COLORS.gold,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 19,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: COLORS.muted,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(price || badge) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginTop: 10,
                }}
              >
                {price && (
                  <div
                    style={{
                      display: "flex",
                      fontSize: 42,
                      fontWeight: 700,
                      color: COLORS.gold,
                    }}
                  >
                    {price}
                  </div>
                )}
                {badge && (
                  <div
                    style={{
                      display: "flex",
                      padding: "8px 20px",
                      borderRadius: 999,
                      fontSize: 20,
                      letterSpacing: 1,
                      border: `1px solid ${badgeStyle?.color ?? COLORS.goldDim}`,
                      color: badgeStyle?.color ?? COLORS.gold,
                      backgroundColor: badgeStyle?.background ?? "transparent",
                    }}
                  >
                    {badge}
                  </div>
                )}
              </div>
            )}
          </div>

          {artworkImage && (
            <div
              style={{
                display: "flex",
                width: 392,
                height: 392,
                padding: 12,
                flexShrink: 0,
                border: `1px solid ${COLORS.goldDim}`,
                backgroundColor: COLORS.card,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artworkImage}
                alt=""
                width={366}
                height={366}
                style={{ width: 366, height: 366, objectFit: "cover" }}
              />
            </div>
          )}

          {showPlate && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 22,
                width: 392,
                height: 392,
                flexShrink: 0,
                border: `1px solid ${COLORS.goldDim}`,
                backgroundColor: COLORS.card,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 74,
                  height: 74,
                  border: `2px solid ${COLORS.gold}`,
                  transform: "rotate(45deg)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  color: COLORS.goldDim,
                }}
              >
                {categoryName(artwork!.category)}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: 20,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 1,
              color: COLORS.goldFaint,
            }}
          >
            {hostLabel}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.muted,
            }}
          >
            {STUDIO.tagline}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      emoji: "twemoji",
      fonts,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
