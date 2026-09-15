import type { Metadata } from "next";
import { STUDIO } from "@/lib/art";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Polityka prywatności L4L7art: jakie dane zbieramy (zamówienia, kontakt, newsletter), po co i jak długo je przechowujemy oraz jakie masz prawa (RODO).",
};

export default function PrywatnoscPage() {
  return (
    <section className="l4l7-section l4l7-narrow">
      <p className="l4l7-kicker">Informacje prawne</p>
      <h1 className="l4l7-page-title">Polityka prywatności</h1>
      <div className="l4l7-prose">
        <h2>1. Kto administruje danymi</h2>
        <p>
          Administratorem Twoich danych jest pracownia {STUDIO.name},{" "}
          {STUDIO.address}, e-mail: {STUDIO.email}. W sprawach danych pisz
          śmiało na ten adres — odpowiadam osobiście.
        </p>
        <h2>2. Jakie dane zbieram i po co</h2>
        <ul>
          <li>
            <b>Zamówienia:</b> imię, e-mail, telefon, adres dostawy —
            do realizacji umowy (podstawa: art. 6 ust. 1 lit. b RODO).
          </li>
          <li>
            <b>Formularz kontaktowy:</b> imię, e-mail, treść wiadomości —
            do obsługi zapytania (art. 6 ust. 1 lit. a i f RODO).
          </li>
          <li>
            <b>Newsletter:</b> adres e-mail — do wysyłki listu z pracowni
            (zgoda, art. 6 ust. 1 lit. a RODO; wypiszesz się jednym klikiem).
          </li>
        </ul>
        <h2>3. Komu przekazuję dane</h2>
        <p>
          Tylko tyle, ile trzeba: firmie kurierskiej (dostawa) oraz biuru
          rachunkowemu (faktury). Nie sprzedaję danych, nie przekazuję ich
          poza EOG, nie profiluję.
        </p>
        <h2>4. Jak długo przechowuję dane</h2>
        <p>
          Dane z zamówień — przez okres wymagany przepisami podatkowymi
          (5 lat). Zapytania kontaktowe — do 2 lat. Newsletter — do wycofania
          zgody.
        </p>
        <h2>5. Twoje prawa</h2>
        <p>
          Masz prawo dostępu do danych, ich sprostowania, usunięcia,
          ograniczenia przetwarzania, przenoszenia oraz sprzeciwu. Możesz
          też wnieść skargę do Prezesa UODO. Żądania realizuję w 30 dni.
        </p>
        <h2>6. Pliki cookie i techniczne</h2>
        <p>
          Strona używa wyłącznie niezbędnych technicznie mechanizmów:
          koszyk zapisywany jest lokalnie w Twojej przeglądarce
          (localStorage) i nie opuszcza Twojego urządzenia do momentu
          złożenia zamówienia. Nie stosuję śledzących plików cookie ani
          pikseli reklamowych. Osadzone fonty Google mogą przesłać Twój
          adres IP do Google — tak działa większość stron internetowych.
        </p>
        <p className="muted">Ostatnia aktualizacja: 15 września 2026 r.</p>
      </div>
    </section>
  );
}
