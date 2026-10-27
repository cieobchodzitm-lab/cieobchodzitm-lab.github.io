import Link from "next/link";
import { STUDIO } from "@/lib/art";
import { NewsletterForm } from "./NewsletterForm";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="l4l7-footer">
      <div className="l4l7-footer__grid">
        <div className="l4l7-footer__brand">
          <p className="l4l7-footer__logo">
            <span className="gold">◈</span> L4L7art
          </p>
          <p className="l4l7-footer__tagline">{STUDIO.tagline}.</p>
          <p className="muted">
            Unikatowe obrazy, grafiki muzealne i edycje limitowane.
            <br />
            Pracownia: {STUDIO.city}.
          </p>
        </div>

        <nav className="l4l7-footer__col" aria-label="Galeria">
          <h4>Galeria</h4>
          <Link href="/galeria">Wszystkie prace</Link>
          <Link href="/galeria?kat=obrazy">Olej & akryl</Link>
          <Link href="/galeria?kat=grafiki">Grafika cyfrowa</Link>
          <Link href="/galeria?kat=edycje">Edycje limitowane</Link>
        </nav>

        <nav className="l4l7-footer__col" aria-label="Pracownia">
          <h4>Pracownia</h4>
          <Link href="/o-mnie">O mnie</Link>
          <Link href="/cennik">Cennik i zamówienia</Link>
          <Link href="/faq">Częste pytania</Link>
          <Link href="/kontakt">Kontakt</Link>
        </nav>

        <div className="l4l7-footer__col">
          <h4>List z pracowni</h4>
          <p className="muted">
            Nowe prace i przedsprzedaże edycji — raz w miesiącu, bez spamu.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="l4l7-footer__bottom">
        <span>
          © {year} {STUDIO.name} · {STUDIO.city}
        </span>
        <span className="l4l7-footer__links">
          <Link href="/regulamin">Regulamin</Link>
          <Link href="/prywatnosc">Prywatność</Link>
          <Link href="/login">Panel ┊ ⌁</Link>
        </span>
        <span className="gold">Ad Astra Una</span>
      </div>
    </footer>
  );
}
