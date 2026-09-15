import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cennik — oryginały, grafiki, zamówienia",
  description:
    "Cennik L4L7art: obrazy olejne i akrylowe, grafiki muzealne giclée, edycje limitowane oraz pakiety obrazów na zamówienie. Oprawa, transport i certyfikat.",
};

const PACKAGES = [
  {
    name: "Mini",
    price: "od 2 900 zł",
    size: "do 50 × 70 cm",
    features: [
      "1 konsultacja online (30 min)",
      "2 szkice koncepcyjne",
      "Akryl lub grafika cyfrowa",
      "Realizacja do 4 tygodni",
      "Certyfikat autentyczności",
    ],
    featured: false,
  },
  {
    name: "Standard",
    price: "od 6 900 zł",
    size: "70 × 100 – 100 × 140 cm",
    features: [
      "Konsultacja w pracowni lub online",
      "3 szkice + próby koloru",
      "Olej lub akryl ze złoceniami",
      "Zdjęcia z postępów co tydzień",
      "Rama muzealna w cenie",
      "Realizacja 6–10 tygodni",
    ],
    featured: true,
  },
  {
    name: "Prestige",
    price: "od 12 900 zł",
    size: "powyżej 100 × 140 cm / dyptyki",
    features: [
      "Wszystko z pakietu Standard",
      "Wizyta z próbami we wnętrzu",
      "Dyptyk / tryptyk możliwy",
      "Pierwszeństwo w kolejce",
      "Wernisażowa prezentacja pracy",
    ],
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="l4l7-section">
        <p className="l4l7-kicker">Cennik</p>
        <h1 className="l4l7-page-title">Ile kosztuje cisza w złocie</h1>
        <p className="l4l7-lead">
          Uczciwe ceny, zero gwiazdek drobnym drukiem. Do każdej pracy:
          certyfikat, sygnatura i 14 dni na zwrot.
        </p>

        <div className="l4l7-price-tables">
          <div className="card">
            <h3>◈ Oryginały — olej & akryl</h3>
            <table className="l4l7-price-table">
              <tbody>
                <tr>
                  <td>Mały format (do 60 cm)</td>
                  <td>
                    <b>od 3 900 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Średni format (60–100 cm)</td>
                  <td>
                    <b>od 6 400 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Duży format (100 cm+)</td>
                  <td>
                    <b>od 9 800 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Złocenia 24 kt / rama muzealna</td>
                  <td>
                    <b>w cenie</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="muted">
              Dokładna cena widnieje przy każdej pracy w{" "}
              <Link href="/galeria?kat=obrazy">galerii obrazów</Link>.
            </p>
          </div>

          <div className="card">
            <h3>◈ Grafiki muzealne giclée</h3>
            <table className="l4l7-price-table">
              <tbody>
                <tr>
                  <td>40 × 60 cm, sygnowana</td>
                  <td>
                    <b>690 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>60 × 90 cm, sygnowana</td>
                  <td>
                    <b>980 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>70 × 100 cm, sygnowana</td>
                  <td>
                    <b>1 150 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Para grafik (np. Matryca + Labirynt)</td>
                  <td>
                    <b>−15%</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="muted">
              Papier bawełniany 308 g, wysyłka w 48 h. Oprawa od 350 zł.
            </p>
          </div>

          <div className="card">
            <h3>◈ Edycje limitowane</h3>
            <table className="l4l7-price-table">
              <tbody>
                <tr>
                  <td>Mezzotinta / akwaforta (ed. 15–20)</td>
                  <td>
                    <b>1 650 – 1 950 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Sitodruk ze złoceniem (ed. 12)</td>
                  <td>
                    <b>2 400 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Kasety kolekcjonerskie</td>
                  <td>
                    <b>od 2 900 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Certyfikat + numeracja</td>
                  <td>
                    <b>w cenie</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="muted">
              Ceny rosną wraz z wyprzedawaniem edycji — wcześniejszy numer
              to niższa cena.
            </p>
          </div>
        </div>
      </section>

      <section className="l4l7-section l4l7-section--alt">
        <p className="l4l7-kicker l4l7-center">Obraz na zamówienie</p>
        <h2 className="l4l7-center">Pakiety indywidualne</h2>
        <p className="l4l7-lead l4l7-center">
          Przyjmuję 2–3 zamówienia w kwartale. Zadatek 30%, reszta po
          akceptacji zdjęć gotowej pracy — przed wysyłką.
        </p>
        <div className="l4l7-packages">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className={`l4l7-package ${p.featured ? "l4l7-package--featured" : ""}`}
            >
              {p.featured && (
                <span className="l4l7-package__flag">Najczęściej wybierany</span>
              )}
              <h3>{p.name}</h3>
              <p className="l4l7-package__price">{p.price}</p>
              <p className="l4l7-package__size">{p.size}</p>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link href="/kontakt" className={`btn ${p.featured ? "btn--primary" : ""}`}>
                Zapytaj o {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="l4l7-section">
        <p className="l4l7-kicker l4l7-center">Dodatki i usługi</p>
        <h2 className="l4l7-center">Oprawa, transport, montaż</h2>
        <div className="l4l7-price-tables">
          <div className="card">
            <h3>◈ Oprawa</h3>
            <table className="l4l7-price-table">
              <tbody>
                <tr>
                  <td>Rama aluminiowa / drewniana do grafik</td>
                  <td>
                    <b>od 350 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Rama muzealna do oryginałów</td>
                  <td>
                    <b>od 800 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Szkło muzealne antyrefleksyjne</td>
                  <td>
                    <b>+40%</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>◈ Transport i montaż</h3>
            <table className="l4l7-price-table">
              <tbody>
                <tr>
                  <td>Wysyłka grafik (ubezpieczona)</td>
                  <td>
                    <b>29 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Transport oryginałów w PL</td>
                  <td>
                    <b>gratis od 2 000 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Wysyłka zagraniczna (UE)</td>
                  <td>
                    <b>od 190 zł</b>
                  </td>
                </tr>
                <tr>
                  <td>Zawieszenie u klienta (Bydgoszcz +50 km)</td>
                  <td>
                    <b>gratis</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="l4l7-center l4l7-mt">
          <Link href="/kontakt" className="btn btn--primary">
            Poproś o indywidualną wycenę
          </Link>
        </div>
      </section>
    </>
  );
}
