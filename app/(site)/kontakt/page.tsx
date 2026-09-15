import Link from "next/link";
import type { Metadata } from "next";
import { STUDIO } from "@/lib/art";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt — pracownia w Bydgoszczy",
  description:
    "Skontaktuj się z pracownią L4L7art: formularz, e-mail, telefon, godziny wizyt w Bydgoszczy. Odpowiadam zwykle w 24 godziny robocze.",
};

export default function KontaktPage() {
  return (
    <section className="l4l7-section">
      <p className="l4l7-kicker">Kontakt</p>
      <h1 className="l4l7-page-title">Napisz — odpowiadam w 24 h</h1>
      <p className="l4l7-lead">
        Zakup, rezerwacja, zamówienie indywidualne, wizyta w pracowni — albo
        po prostu pogadajmy o sztuce.
      </p>

      <div className="l4l7-contact-grid">
        <div className="card">
          <h3>◈ Formularz</h3>
          <ContactForm />
        </div>

        <aside className="l4l7-contact-side">
          <div className="card">
            <h3>◈ Pracownia</h3>
            <address className="l4l7-address">
              <p>
                <b>{STUDIO.name}</b>
                <br />
                {STUDIO.address}
              </p>
              <p>
                E-mail:{" "}
                <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
                <br />
                Tel: <a href={`tel:${STUDIO.phone.replace(/\s/g, "")}`}>{STUDIO.phone}</a>
              </p>
              <p className="muted">{STUDIO.hours}</p>
            </address>
          </div>

          <div className="card">
            <h3>◈ Zanim napiszesz</h3>
            <ul className="l4l7-ticks">
              <li>
                Pytanie o zakup lub wysyłkę? Sprawdź{" "}
                <Link href="/faq">FAQ</Link> — odpowiedź jest tam w 90%.
              </li>
              <li>
                Chcesz obraz na zamówienie? Zerknij na{" "}
                <Link href="/cennik">pakiety</Link> i napisz, który Cię
                interesuje.
              </li>
              <li>
                Wizyta w pracowni? Proponuj 2–3 terminy — oddzwonię z
                potwierdzeniem.
              </li>
            </ul>
          </div>

          <div className="card">
            <h3>◈ Gdzie mnie znajdziesz</h3>
            <p className="muted">
              Pracownia mieści się w Bydgoszczy, 10 minut pieszo od Starego
              Rynku. Dokładne wskazówki dojazdu wysyłam po umówieniu wizyty.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
