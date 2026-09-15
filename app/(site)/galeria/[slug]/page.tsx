import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ARTWORKS,
  categoryName,
  formatPLN,
  getArtwork,
  relatedArtworks,
} from "@/lib/art";
import { ArtworkCard, statusLabel } from "@/components/site/ArtworkCard";
import { AddToCartButton } from "@/components/site/AddToCartButton";

export function generateStaticParams() {
  return ARTWORKS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const art = getArtwork(slug);
  if (!art) return { title: "Nie znaleziono pracy" };
  return {
    title: `${art.title} — ${categoryName(art.category)}`,
    description: `${art.title} (${art.year}): ${art.technique}, ${art.widthCm}×${art.heightCm} cm. ${art.edition}. ${art.pricePln != null ? `Cena: ${formatPLN(art.pricePln)}.` : ""}`,
    openGraph: { images: [art.image] },
  };
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const art = getArtwork(slug);
  if (!art) notFound();
  const related = relatedArtworks(art.slug, 3);

  return (
    <>
      <nav className="l4l7-crumbs" aria-label="Okruszki">
        <Link href="/">Start</Link> <span>›</span>
        <Link href="/galeria">Galeria</Link> <span>›</span>
        <Link href={`/galeria?kat=${art.category}`}>
          {categoryName(art.category)}
        </Link>{" "}
        <span>›</span> <b>{art.title}</b>
      </nav>

      <section className="l4l7-detail">
        <div className="l4l7-detail__visual">
          <img src={art.image} alt={`${art.title} — ${art.technique}`} />
        </div>

        <div className="l4l7-buybox">
          <div className="l4l7-buybox__pills">
            <span className="pill pill--gold">{categoryName(art.category)}</span>
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
            {art.badge && <span className="pill pill--gold">{art.badge}</span>}
          </div>

          <h1>{art.title}</h1>
          <p className="l4l7-buybox__tech">
            {art.technique} · {art.year}
          </p>
          <p className="l4l7-buybox__price">
            {art.pricePln != null ? formatPLN(art.pricePln) : "Cena na zapytanie"}
          </p>
          <p className="l4l7-buybox__edition">{art.edition}</p>

          <p className="l4l7-buybox__desc">{art.description}</p>

          <dl className="l4l7-specs">
            <div>
              <dt>Wymiary</dt>
              <dd>
                {art.widthCm} × {art.heightCm} cm
              </dd>
            </div>
            <div>
              <dt>Technika</dt>
              <dd>{art.technique}</dd>
            </div>
            <div>
              <dt>Rok</dt>
              <dd>{art.year}</dd>
            </div>
            <div>
              <dt>Edycja</dt>
              <dd>{art.edition}</dd>
            </div>
          </dl>

          <ul className="l4l7-ticks">
            {art.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <AddToCartButton art={art} />

          <div className="l4l7-trust">
            <span>◈ Certyfikat w cenie</span>
            <span>⬢ Ubezpieczona wysyłka</span>
            <span>◎ 14 dni na zwrot</span>
          </div>
        </div>
      </section>

      <section className="l4l7-section">
        <div className="l4l7-section__head">
          <h2>Może też pokochasz</h2>
          <Link href="/galeria" className="btn">
            Cała galeria →
          </Link>
        </div>
        <div className="l4l7-grid">
          {related.map((r) => (
            <ArtworkCard key={r.slug} art={r} />
          ))}
        </div>
      </section>
    </>
  );
}
