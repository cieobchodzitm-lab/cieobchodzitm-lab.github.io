import Link from "next/link";
import type { Metadata } from "next";
import { FaqAccordion, type FaqItem } from "@/components/site/FaqAccordion";

export const metadata: Metadata = {
  title: "Częste pytania — zakupy, wysyłka, zwroty",
  description:
    "FAQ L4L7art: jak kupić obraz, ile trwa wysyłka, czy prace mają certyfikat, jak działa zwrot 14 dni, oprawa, zamówienia indywidualne i wizyty w pracowni.",
};

const GROUPS: { title: string; items: FaqItem[] }[] = [
  {
    title: "Zakupy i płatności",
    items: [
      {
        q: "Jak mogę kupić pracę?",
        a: "Dwojako: przez koszyk na stronie (zajmuje ok. 3 minut) albo osobiście w pracowni w Bydgoszczy po umówieniu wizyty. Po złożeniu zamówienia potwierdzam dostępność w 24 godziny robocze i wysyłam dane do przelewu.",
      },
      {
        q: "Jakie formy płatności akceptujesz?",
        a: "Przelew bankowy (po potwierdzeniu dostępności), gotówka i karta przy odbiorze osobistym. Przy zamówieniach indywidualnych: zadatek 30%, reszta po akceptacji zdjęć gotowej pracy.",
      },
      {
        q: "Czy mogę zarezerwować pracę bez zakupu?",
        a: "Tak — bezpłatna rezerwacja na 72 godziny. Napisz przez formularz kontaktowy, którą pracę rezerwujesz, a zdejmę ją ze sprzedaży na ten czas.",
      },
      {
        q: "Czy wystawiasz faktury?",
        a: "Tak, wystawiam faktury VAT dla firm i klientów indywidualnych. Zaznacz to w uwagach do zamówienia lub napisz wiadomość.",
      },
    ],
  },
  {
    title: "Wysyłka i oprawa",
    items: [
      {
        q: "Ile trwa dostawa?",
        a: "Grafiki wysyłam w 48 godzin, edycje limitowane do 5 dni, oryginały do 7 dni (dosychanie werniksu + skrzynia). Sam transport kurierem to zwykle 1–2 dni robocze.",
      },
      {
        q: "Jak pakujesz prace?",
        a: "Jak dla muzeum: grafiki w tubach ochronnych, edycje w teczkach z przekładkami, oryginały w drewnianych skrzyniach z narożnikami. Każda przesyłka jest ubezpieczona na pełną wartość.",
      },
      {
        q: "Ile kosztuje wysyłka?",
        a: "Grafiki: 29 zł. Oryginały: gratis przy zakupach od 2000 zł (poniżej 120 zł). Wysyłka do UE od 190 zł. Odbiór osobisty w Bydgoszczy — zawsze gratis.",
      },
      {
        q: "Czy praca jest oprawiona?",
        a: "Oryginały sprzedaję z blejtramem galeryjnym (gotowe do zawieszenia) — rama muzealna jest w cenie przy większości prac. Grafiki i edycje sprzedaję bez ramy, ale oferuję profesjonalną oprawę od 350 zł.",
      },
    ],
  },
  {
    title: "Certyfikaty i zwroty",
    items: [
      {
        q: "Czy dostanę certyfikat autentyczności?",
        a: "Zawsze. Każdy oryginał i każdy egzemplarz edycji ma odręczną sygnaturę, numer (w edycjach) oraz podpisany certyfikat z opisem pracy. To Twoja gwarancja wartości kolekcjonerskiej.",
      },
      {
        q: "Jak działa 14 dni na zwrot?",
        a: "Prosto: od otrzymania pracy masz 14 dni, by ją zwrócić bez podania przyczyny. Zwracam pełną cenę pracy (koszt odesłania pokrywa kupujący, chyba że praca dotarła uszkodzona). Zamówienia indywidualne są bezzwrotne po akceptacji szkicu.",
      },
      {
        q: "Co jeśli praca dotrze uszkodzona?",
        a: "Zrób zdjęcia opakowania i pracy, napisz w 48 godzin — wymieniam na nowy egzemplarz (grafiki/edycje) albo zwracam pieniądze. Zgłoszenie do ubezpieczyciela biorę na siebie.",
      },
    ],
  },
  {
    title: "Zamówienia i pracownia",
    items: [
      {
        q: "Czy mogę zamówić obraz na wymiar / do wnętrza?",
        a: "Tak, przyjmuję 2–3 zamówienia w kwartale. Zaczynamy od bezpłatnej konsultacji, potem szkice i próby koloru. Cennik pakietów znajdziesz na stronie Cennik, a realizacja trwa zwykle 6–10 tygodni.",
      },
      {
        q: "Czy mogę obejrzeć prace na żywo?",
        a: "Oczywiście — i polecam, bo złoto na zdjęciach kłamie. Pracownia w Bydgoszczy jest otwarta na wizyty po umówieniu (pn–pt 10:00–18:00, soboty po uzgodnieniu). Napisz lub zadzwoń.",
      },
      {
        q: "Edycja, która mnie interesuje, jest wyprzedana. Co robić?",
        a: "Wpisz się na listę rezerwową przez formularz kontaktowy — czasem egzemplarze wracają z rezerwacji. Dam Ci też znać o planowanych reedycjach (np. Virtus II w 2027).",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <section className="l4l7-section l4l7-narrow">
      <p className="l4l7-kicker">Pomoc</p>
      <h1 className="l4l7-page-title">Częste pytania</h1>
      <p className="l4l7-lead">
        Wszystko o zakupach, wysyłce, certyfikatach i zamówieniach. Nie
        znalazłaś/-eś odpowiedzi?{" "}
        <Link href="/kontakt">Napisz do mnie</Link> — odpowiadam w 24 h.
      </p>
      {GROUPS.map((g) => (
        <div key={g.title} className="l4l7-faq-group">
          <h2>{g.title}</h2>
          <FaqAccordion items={g.items} />
        </div>
      ))}
      <div className="l4l7-cta-box l4l7-mt">
        <h2>Wolisz zapytać wprost?</h2>
        <p>Żadne pytanie o sztukę nie jest głupie. Naprawdę.</p>
        <Link href="/kontakt" className="btn btn--primary">
          Przejdź do kontaktu
        </Link>
      </div>
    </section>
  );
}
