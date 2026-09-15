import Link from "next/link";
import { ARTWORKS, CATEGORIES, STUDIO, formatPLN } from "@/lib/art";
import { ArtworkCard } from "@/components/site/ArtworkCard";
import { NewsletterForm } from "@/components/site/NewsletterForm";

const featured = ARTWORKS.filter((a) => a.featured);
const availableCount = ARTWORKS.filter((a) => a.status === "dostepna").length;

const TESTIMONIALS = [
  {
    quote:
      "„Silentium Aurum zmienił całe nasze wnętrze. Zdjęcia nie oddają głębi złota — na żywo obraz wręcz oddycha.”",
    author: "Marek i Ewa, Warszawa",
    detail: "zakup: Silentium Aurum",
  },
  {
    quote:
      "„Zamawiałem grafikę na prezent. Ekspresowa wysyłka, piękne pakowanie i odręczna notatka od artysty. Klasa.”",
    author: "Tomasz, Gdańsk",
    detail: "zakup: Konstelacja Sophia",
  },
  {
    quote:
      "„Fantom VII to moja pierwsza praca kolekcjonerska. Certyfikat, numeracja, historia edycji — pełen profesjonalizm.”",
    author: "Anna, Kraków",
    detail: "zakup: Fantom VII, egz. 4/12",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="l4l7-hero">
        <div className="l4l7-hero__text">
          <p className="l4l7-kicker">Pracownia sztuki · {STUDIO.city}</p>
          <h1>
            L4L7<span className="gold">art</span>
          </h1>
          <p className="l4l7-hero__tagline">
            {STUDIO.tagline} — obrazy, grafiki i edycje limitowane dla ludzi,
            którzy wybierają świadomie.
          </p>
          <p className="l4l7-hero__sub">
            Każdy oryginał jest jeden na świecie. Każda edycja — numerowana
            i certyfikowana. Czerń, złoto i stoicki spokój.
          </p>
          <div className="l4l7-hero__ctas">
            <Link href="/galeria" className="btn btn--primary">
              Zobacz galerię
            </Link>
            <Link href="/cennik" className="btn">
              Zamów obraz
            </Link>
          </div>
          <dl className="l4l7-hero__stats">
            <div>
              <dt>Dostępnych prac</dt>
              <dd>{availableCount}</dd>
            </div>
            <div>
              <dt>Technik</dt>
              <dd>3</dd>
            </div>
            <div>
              <dt>Certyfikat</dt>
              <dd>100%</dd>
            </div>
            <div>
              <dt>Wysyłka grafik</dt>
              <dd>48 h</dd>
            </div>
          </dl>
        </div>
        <div className="l4l7-hero__visual">
          <Link href="/galeria/silentium-aurum" className="l4l7-hero__frame">
            <img
              src="/works/silentium-aurum.jpg"
              alt="Silentium Aurum — flagowy obraz pracowni L4L7art"
            />
            <span className="l4l7-hero__caption">
              Silentium Aurum · {formatPLN(9800)} →
            </span>
          </Link>
        </div>
      </section>

      {/* WYRÓŻNIONE */}
      <section className="l4l7-section">
        <div className="l4l7-section__head">
          <div>
            <p className="l4l7-kicker">Wybrane prace</p>
            <h2>Aktualne perełki kolekcji</h2>
          </div>
          <Link href="/galeria" className="btn">
            Cała galeria →
          </Link>
        </div>
        <div className="l4l7-grid">
          {featured.map((art) => (
            <ArtworkCard key={art.slug} art={art} />
          ))}
        </div>
      </section>

      {/* KATEGORIE */}
      <section className="l4l7-section l4l7-section--alt">
        <p className="l4l7-kicker l4l7-center">Trzy drogi do jednej ściany</p>
        <h2 className="l4l7-center">Wybierz swoją technikę</h2>
        <div className="l4l7-cat-grid">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.id}
              href={`/galeria?kat=${c.id}`}
              className="l4l7-cat-card"
            >
              <span className="l4l7-cat-card__num">0{i + 1}</span>
              <h3>{c.name}</h3>
              <p>{c.tagline}</p>
              <span className="l4l7-cat-card__link">Przeglądaj →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DLACZEGO */}
      <section className="l4l7-section">
        <p className="l4l7-kicker l4l7-center">Kupujesz bez ryzyka</p>
        <h2 className="l4l7-center">Dlaczego kolekcjonerzy wracają</h2>
        <div className="l4l7-value-grid">
          <div className="l4l7-value">
            <span className="l4l7-value__icon">◈</span>
            <h3>Certyfikat autentyczności</h3>
            <p>
              Każdy oryginał i każdy egzemplarz edycji ma podpisaną
              sygnaturę, numer i certyfikat. Na zawsze.
            </p>
          </div>
          <div className="l4l7-value">
            <span className="l4l7-value__icon">⬢</span>
            <h3>Ubezpieczona wysyłka</h3>
            <p>
              Pakujemy jak dla muzeum: skrzynie, narożniki, folie.
              Transport w Polsce gratis od 2 000 zł.
            </p>
          </div>
          <div className="l4l7-value">
            <span className="l4l7-value__icon">◎</span>
            <h3>14 dni na decyzję</h3>
            <p>
              Powieś, pożyj, zobacz w swoim świetle. Jeśli nie pokochasz —
              zwrócimy pieniądze bez pytań.
            </p>
          </div>
          <div className="l4l7-value">
            <span className="l4l7-value__icon">✦</span>
            <h3>Opieka po zakupie</h3>
            <p>
              Doradzimy oprawę, zawieszenie i pielęgnację. Kolekcjonerzy
              dostają pierwszeństwo w przedsprzedażach.
            </p>
          </div>
        </div>
      </section>

      {/* PROCES */}
      <section className="l4l7-section l4l7-section--alt">
        <p className="l4l7-kicker l4l7-center">Od kliknięcia do ściany</p>
        <h2 className="l4l7-center">Jak wygląda zakup</h2>
        <ol className="l4l7-steps">
          <li>
            <span>01</span>
            <h3>Wybierasz pracę</h3>
            <p>
              W galerii online albo na żywo w pracowni po umówieniu wizyty.
            </p>
          </li>
          <li>
            <span>02</span>
            <h3>Składasz zamówienie</h3>
            <p>
              Koszyk zajmie Ci 3 minuty. Potwierdzamy dostępność w 24 h.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>Pakujemy i wysyłamy</h3>
            <p>
              Grafiki w 48 h, oryginały do 7 dni. Wszystko ubezpieczone.
            </p>
          </li>
          <li>
            <span>04</span>
            <h3>Wieszasz i cieszysz oczy</h3>
            <p>Certyfikat w pakiecie. Opieka posprzedażowa — zawsze.</p>
          </li>
        </ol>
        <div className="l4l7-center">
          <Link href="/faq" className="btn">
            Masz pytania? Zobacz FAQ
          </Link>
        </div>
      </section>

      {/* OPINIE */}
      <section className="l4l7-section">
        <p className="l4l7-kicker l4l7-center">Ściany mówią same</p>
        <h2 className="l4l7-center">Co mówią kolekcjonerzy</h2>
        <div className="l4l7-testimonials">
          {TESTIMONIALS.map((t) => (
            <figure key={t.author} className="l4l7-quote">
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <b>{t.author}</b>
                <span>{t.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ZAMÓWIENIA */}
      <section className="l4l7-section l4l7-section--alt">
        <div className="l4l7-split">
          <div>
            <p className="l4l7-kicker">Obraz na zamówienie</p>
            <h2>Twoja historia, moje złoto</h2>
            <p>
              Przyjmuję 2–3 zamówienia indywidualne w kwartale: portrety w
              klimacie cyklu Fantom, obrazy do konkretnego wnętrza, prace
              ślubne i jubileuszowe. Zaczynamy od bezpłatnej rozmowy.
            </p>
            <ul className="l4l7-ticks">
              <li>Bezpłatna konsultacja 30 minut (online lub w pracowni)</li>
              <li>Szkice koncepcyjne przed decyzją</li>
              <li>Zdjęcia z postępów prac co tydzień</li>
            </ul>
            <div className="l4l7-hero__ctas">
              <Link href="/cennik" className="btn btn--primary">
                Zobacz cennik
              </Link>
              <Link href="/kontakt" className="btn">
                Umów rozmowę
              </Link>
            </div>
          </div>
          <Link href="/galeria/fantom-vii" className="l4l7-hero__frame">
            <img
              src="/works/fantom-vii.jpg"
              alt="Fantom VII — przykład pracy z cyklu portretowego"
              loading="lazy"
            />
            <span className="l4l7-hero__caption">
              Fantom VII — cykl portretowy →
            </span>
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="l4l7-section">
        <div className="l4l7-cta-box">
          <p className="l4l7-kicker">List z pracowni</p>
          <h2>Edycje wyprzedają się w dni. Bądź pierwsza/-y.</h2>
          <p>
            Raz w miesiącu: nowe prace, przedsprzedaże numerowanych edycji
            i zaproszenia na wernisaże. Zero spamu, wypiszesz się jednym
            klikiem.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
