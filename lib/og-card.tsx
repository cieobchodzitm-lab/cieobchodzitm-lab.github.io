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
 * The social card itself — one React tree, rendered in two places:
 *
 *   - `app/api/og/route.tsx`  → on demand, as an Edge Function (`?slug=`, `?title=`)
 *   - `scripts/generate-og.tsx` → at build time, into static PNGs in `public/og/`
 *
 * Keeping the markup here guarantees both paths produce pixel-identical cards
 * (same fonts, same layout, same copy).
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgCardParams = {
  /** Artwork slug from `lib/art.ts` — fills title, technique, price and photo. */
  slug?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  price?: string;
  badge?: string;
};

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
  value: string | null | undefined,
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

function titleSize(title: string): number {
  if (title.length <= 24) return 78;
  if (title.length <= 40) return 66;
  if (title.length <= 58) return 56;
  if (title.length <= 84) return 48;
  return 42;
}

/** Everything the card needs, already resolved — no data fetching inside. */
export type OgCardModel = {
  title: string;
  eyebrow: string;
  subtitle: string;
  price: string | null;
  badge: string | null;
  badgeColor: string | null;
  badgeBackground: string | null;
  /** Raster image satori can embed: an absolute URL or a `data:` URI. */
  imageSrc: string | null;
  /** Label on the engraved plate shown when a work has no raster photo. */
  plateLabel: string | null;
  /** Footer: the public host, or a studio label for local/LAN hosts. */
  hostLabel: string;
  /** Brand card only — catalog counters under the title. */
  showStats: boolean;
};

export type OgCardOptions = {
  hostLabel?: string;
  /**
   * Turn `/works/foo.jpg` into something satori can embed. The Edge route
   * returns an absolute URL on its own origin; the build script returns a
   * `data:` URI read from `public/`. Returning `null` falls back to the plate.
   */
  resolveImage?: (src: string) => string | null;
};

/** Resolve raw query params into the values the card renders. */
export function buildOgCardModel(
  params: OgCardParams = {},
  options: OgCardOptions = {},
): OgCardModel {
  const slug = text(params.slug, null, 80);
  const artwork = slug ? getArtwork(slug) : undefined;

  const title = text(params.title, artwork?.title ?? STUDIO.name)!;
  const eyebrow = text(
    params.eyebrow,
    artwork
      ? `${categoryName(artwork.category)} · ${artwork.year}`
      : `Pracownia sztuki · ${STUDIO.city}`,
  )!;
  const subtitle = text(
    params.subtitle,
    artwork ? artwork.technique : STUDIO.tagline,
  )!;
  const price = text(
    params.price,
    artwork?.pricePln != null ? formatPLN(artwork.pricePln) : null,
    40,
  );
  const badge = text(
    params.badge,
    artwork ? STATUS_STYLE[artwork.status].label : null,
    40,
  );
  const badgeStyle = artwork ? STATUS_STYLE[artwork.status] : undefined;

  const imageSrc =
    artwork &&
    artwork.image.startsWith("/") &&
    RASTER_IMAGE.test(artwork.image)
      ? (options.resolveImage?.(artwork.image) ?? null)
      : null;

  // Brand card = no artwork and no custom text → it may show catalog stats.
  const isBrandCard =
    !artwork && !params.title?.trim() && !params.subtitle?.trim();

  return {
    title,
    eyebrow,
    subtitle,
    price,
    badge,
    badgeColor: badgeStyle?.color ?? null,
    badgeBackground: badgeStyle?.background ?? null,
    imageSrc,
    plateLabel: artwork && !imageSrc ? categoryName(artwork.category) : null,
    hostLabel: options.hostLabel ?? `${STUDIO.name} · ${STUDIO.city}`,
    showStats: isBrandCard,
  };
}

const STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: String(ARTWORKS.length), label: "prac w kolekcji" },
  { value: String(CATEGORIES.length), label: "techniki" },
  { value: "100%", label: "z certyfikatem" },
];

/** satori-compatible markup: every element with children sets `display: flex`. */
export function OgCard({ model }: { model: OgCardModel }) {
  return (
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
            maxWidth: model.imageSrc || model.plateLabel ? 620 : 980,
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
            {model.eyebrow}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: titleSize(model.title),
              fontWeight: 700,
              lineHeight: 1.06,
              color: COLORS.text,
            }}
          >
            {model.title}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 26,
              lineHeight: 1.35,
              color: COLORS.muted,
            }}
          >
            {model.subtitle}
          </div>

          {model.showStats && (
            <div
              style={{
                display: "flex",
                gap: 46,
                marginTop: 20,
                paddingTop: 22,
                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
              {STATS.map((stat) => (
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

          {(model.price || model.badge) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginTop: 10,
              }}
            >
              {model.price && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 42,
                    fontWeight: 700,
                    color: COLORS.gold,
                  }}
                >
                  {model.price}
                </div>
              )}
              {model.badge && (
                <div
                  style={{
                    display: "flex",
                    padding: "8px 20px",
                    borderRadius: 999,
                    fontSize: 20,
                    letterSpacing: 1,
                    border: `1px solid ${model.badgeColor ?? COLORS.goldDim}`,
                    color: model.badgeColor ?? COLORS.gold,
                    backgroundColor: model.badgeBackground ?? "transparent",
                  }}
                >
                  {model.badge}
                </div>
              )}
            </div>
          )}
        </div>

        {model.imageSrc && (
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
              src={model.imageSrc}
              alt=""
              width={366}
              height={366}
              style={{ width: 366, height: 366, objectFit: "cover" }}
            />
          </div>
        )}

        {model.plateLabel && (
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
              {model.plateLabel}
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
          {model.hostLabel}
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
  );
}
