import Link from "next/link";
import {
  categoryName,
  formatPLN,
  type Artwork,
} from "@/lib/art";

export function statusLabel(status: Artwork["status"]): string {
  if (status === "dostepna") return "Dostępna";
  if (status === "zarezerwowana") return "Rezerwacja";
  return "Sprzedana";
}

export function ArtworkCard({ art }: { art: Artwork }) {
  const sold = art.status === "sprzedana";
  return (
    <Link
      href={`/galeria/${art.slug}`}
      className={`l4l7-work ${sold ? "l4l7-work--sold" : ""}`}
    >
      <div className="l4l7-work__frame">
        <img src={art.image} alt={`${art.title} — ${art.technique}`} loading="lazy" />
        <div className="l4l7-work__badges">
          {art.badge && (
            <span className="pill pill--gold">{art.badge}</span>
          )}
          <span
            className={`pill ${
              art.status === "dostepna"
                ? "pill--operational"
                : art.status === "zarezerwowana"
                  ? "pill--degraded"
                  : "pill--muted"
            }`}
          >
            {statusLabel(art.status)}
          </span>
        </div>
        <span className="l4l7-work__cta">Zobacz pracę →</span>
      </div>
      <div className="l4l7-work__meta">
        <div>
          <h3>{art.title}</h3>
          <p className="l4l7-work__sub">
            {categoryName(art.category)} · {art.year}
          </p>
        </div>
        <p className="l4l7-work__price">
          {art.pricePln != null ? formatPLN(art.pricePln) : "Na zapytanie"}
        </p>
      </div>
    </Link>
  );
}
