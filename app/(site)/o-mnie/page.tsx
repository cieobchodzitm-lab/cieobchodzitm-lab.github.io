import Link from "next/link";
import type { Metadata } from "next";
import { STUDIO } from "@/lib/art";

export const metadata: Metadata = {
  title: "O mnie — artysta i pracownia",
  description:
    "Poznaj artystę L4L7art: filozofia pracowni, techniki (olej, złoto płatkowe, giclée, grafika warsztatowa), droga twórcza i wizyty w pracowni w Bydgoszczy.",
};

const TIMELINE = [
  {
    year: "2019",
    title: "Pierwsze złoto",
    text: "Pierwsze eksperymenty z płatkami złota na czerni. Powstaje manifest pracowni: mniej znaczy głębiej.",
  },
  {
    year: "2021",
    title: "Cykl Medytacje",
    text: "Rozmowa ze stoikami w oleju. Pierwsza indywidualna prezentacja prac i pierwsi kolekcjonerzy.",
  },
  {
    year: "2023",
    title: "Grafika warsztatowa",
    text: "Własny prasowy kąt w pracowni: akwaforty, mezzotinty, sitodruki ze złoceniami. Narodziny edycji limitowanych.",
  },
  {
    year: "2024",
    title: "Virtus I–IV",
    text: "Kaseta czterech grafik o cnotach — edycja 9 egzemplarzy wyprzedana w rok. Przełom kolekcjonerski.",
  },
  {
    year: "2026",
    title: "L4L7art online",
    text: "Pełna galeria internetowa ze sklepem. Pracownia w Bydgoszczy otwarta na wizyty kolekcjonerów.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="l4l7-section">
        <p className="l4l7-kicker">Artysta i pracownia</p>
        <h1 className="l4l7-page-title">Cześć, tu L4L7</h1>
        <div className="l4l7-split">
          <div className="l4l7-hero__frame">
            <img
              src="/artist.svg"
              alt="Pracownia L4L7art — sztaluga ze złotym obrazem"
            />
            <span className="l4l7-hero__caption">
              W pracowni · {STUDIO.city}
            </span>
          </div>
          <div className="l4l7-prose">
            <p className="l4l7-lead">
              Maluję ciszę. Złotem po czerni opowiadam o decyzjach, odwadze
              i spokoju — czyli o tym, co w życiu naprawdę zostaje.
            </p>
            <p>
              Nazwa pracowni to skrót mojej filozofii:{" "}
              <b>L4 to warstwa decyzji</b> — struktura, dyscyplina, rzemiosło,
              godziny przy sztalugach. <b>L7 to warstwa ducha</b> — intuicja,
              sen, to, czego nie da się zaplanować. Dobre obrazy rodzą się
              dokładnie na ich styku.
            </p>
            <p>
              Pracuję w oleju i akrylu, złocę płatkami 24-karatowego złota,
              drukuję grafiki muzealne giclée i własnoręcznie odbijam
              akwaforty oraz mezzotinty. Każdą pracę sygnuję, numeruję
              (w przypadku edycji) i wydaję z certyfikatem — bo kupujesz nie
              dekorację, tylko kawałek czyjejś uwagi.
            </p>
            <p>
              Moje prace wiszą dziś w kolekcjach prywatnych w Polsce, Niemczech
              i Holandii. Najbardziej cenię jednak moment, gdy ktoś staje przed
              oryginałem w mojej pracowni i milknie. Po to to robię.
            </p>
            <div className="l4l7-hero__ctas">
              <Link href="/galeria" className="btn btn--primary">
                Zobacz moje prace
              </Link>
              <Link href="/kontakt" className="btn">
                Umów wizytę w pracowni
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="l4l7-section l4l7-section--alt">
        <p className="l4l7-kicker l4l7-center">Droga twórcza</p>
        <h2 className="l4l7-center">Od pierwszego złota do dziś</h2>
        <ol className="l4l7-timeline">
          {TIMELINE.map((t) => (
            <li key={t.year}>
              <span className="l4l7-timeline__year">{t.year}</span>
              <div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="l4l7-section">
        <p className="l4l7-kicker l4l7-center">Warsztat</p>
        <h2 className="l4l7-center">Czym i jak pracuję</h2>
        <div className="l4l7-value-grid">
          <div className="l4l7-value">
            <span className="l4l7-value__icon">◈</span>
            <h3>Olej i złoto płatkowe</h3>
            <p>
              Farby olejne na płótnie lnianym, złocenia 24-karatowe,
              werniks muzealny. Trwałość liczona w pokoleniach.
            </p>
          </div>
          <div className="l4l7-value">
            <span className="l4l7-value__icon">⬢</span>
            <h3>Giclée muzealne</h3>
            <p>
              Pigmentowe wydruki na papierze bawełnianym 308 g,
              archiwalna trwałość 100+ lat, sygnatura ołówkiem.
            </p>
          </div>
          <div className="l4l7-value">
            <span className="l4l7-value__icon">◎</span>
            <h3>Grafika warsztatowa</h3>
            <p>
              Akwaforta, akwatinta, mezzotinta i sitodruk — odbijane
              własnoręcznie, w krótkich numerowanych seriach.
            </p>
          </div>
          <div className="l4l7-value">
            <span className="l4l7-value__icon">✦</span>
            <h3>Zamówienia indywidualne</h3>
            <p>
              2–3 realizacje w kwartale: portrety, obrazy do wnętrz,
              prace okolicznościowe. Ze szkicami i próbami koloru.
            </p>
          </div>
        </div>
        <div className="l4l7-center l4l7-mt">
          <Link href="/cennik" className="btn btn--primary">
            Sprawdź cennik zamówień
          </Link>
        </div>
      </section>
    </>
  );
}
