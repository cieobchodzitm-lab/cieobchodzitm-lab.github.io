import type { Metadata } from "next";
import { STUDIO } from "@/lib/art";

export const metadata: Metadata = {
  title: "Regulamin sklepu",
  description: "Regulamin sklepu internetowego L4L7art: składanie zamówień, płatności, dostawa, prawo odstąpienia od umowy i reklamacje.",
};

export default function RegulaminPage() {
  return (
    <section className="l4l7-section l4l7-narrow">
      <p className="l4l7-kicker">Informacje prawne</p>
      <h1 className="l4l7-page-title">Regulamin sklepu</h1>
      <div className="l4l7-prose">
        <h2>§1. Kim jesteśmy</h2>
        <p>
          Sklep internetowy {STUDIO.name} prowadzony jest przez pracownię
          artystyczną: {STUDIO.address}, e-mail: {STUDIO.email}, tel.{" "}
          {STUDIO.phone}. Regulamin określa zasady składania zamówień,
          płatności, dostawy oraz odstąpienia od umowy.
        </p>
        <h2>§2. Prace i ceny</h2>
        <p>
          Oryginały (olej, akryl) sprzedawane są w jednym egzemplarzu.
          Grafiki i edycje limitowane są numerowane i sygnowane; liczba
          dostępnych egzemplarzy jest ograniczona. Wszystkie ceny podane są
          w złotych polskich i zawierają podatek VAT. Cena widoczna przy
          pracy w chwili składania zamówienia jest ceną wiążącą.
        </p>
        <h2>§3. Składanie zamówień</h2>
        <p>
          Zamówienie składasz przez koszyk na stronie, podając dane do
          kontaktu i dostawy. Złożenie zamówienia nie jest równoznaczne z
          zawarciem umowy — każde zamówienie potwierdzam e-mailem w 24
          godziny robocze (weryfikacja dostępności, zwłaszcza oryginałów
          1/1). Umowa zostaje zawarta z chwilą wysłania przeze mnie
          potwierdzenia przyjęcia zamówienia.
        </p>
        <h2>§4. Płatności</h2>
        <p>
          Płatność następuje przelewem bankowym na dane przesłane w e-mailu
          potwierdzającym (termin: 3 dni robocze) albo gotówką/kartą przy
          odbiorze osobistym. Pracę wysyłam po zaksięgowaniu płatności.
          Przy zamówieniach indywidualnych pobieram zadatek 30%.
        </p>
        <h2>§5. Dostawa</h2>
        <p>
          Grafiki wysyłam w 48 h, edycje do 5 dni, oryginały do 7 dni
          roboczych od zaksięgowania płatności. Koszty: grafiki i edycje —
          29 zł; oryginały — 120 zł, gratis od 2 000 zł; odbiór osobisty w
          Bydgoszczy — gratis; UE od 190 zł. Wszystkie przesyłki są
          ubezpieczone na pełną wartość.
        </p>
        <h2>§6. Odstąpienie od umowy (14 dni)</h2>
        <p>
          Konsument może odstąpić od umowy w 14 dni od otrzymania pracy,
          bez podania przyczyny — wystarczy e-mail na {STUDIO.email}.
          Zwracam pełną cenę pracy w 14 dni od otrzymania zwrotu.
          Wyjątek: prace wykonane na indywidualne zamówienie po akceptacji
          szkicu — te są bezzwrotne (art. 38 pkt 3 ustawy o prawach
          konsumenta).
        </p>
        <h2>§7. Reklamacje</h2>
        <p>
          Jeśli praca dotrze uszkodzona, zgłoś to w 48 godzin (zdjęcia
          opakowania i pracy) — wymienię egzemplarz lub zwrócę pieniądze.
          Reklamacje rozpatruję w 14 dni. Każda praca objęta jest rękojmią
          zgodnie z Kodeksem cywilnym.
        </p>
        <h2>§8. Dane osobowe</h2>
        <p>
          Zasady przetwarzania danych opisuje{" "}
          <a href="/prywatnosc">polityka prywatności</a>. Składając
          zamówienie, wyrażasz zgodę na przetwarzanie danych w celu jego
          realizacji.
        </p>
        <h2>§9. Postanowienia końcowe</h2>
        <p>
          W sprawach nieuregulowanych stosuje się prawo polskie. Spory
          rozstrzyga sąd właściwy dla siedziby pracowni, z zachowaniem praw
          konsumenta do sądu swojego miejsca zamieszkania. Regulamin
          obowiązuje od 15 września 2026 r.
        </p>
      </div>
    </section>
  );
}
