/* ------------------------------------------------------------------ */
/* L4L7art — katalog prac (galeria + sklep)                             */
/* ------------------------------------------------------------------ */

export type ArtCategory = "obrazy" | "grafiki" | "edycje";
export type ArtStatus = "dostepna" | "zarezerwowana" | "sprzedana";

export interface Artwork {
  slug: string;
  title: string;
  category: ArtCategory;
  technique: string;
  year: number;
  widthCm: number;
  heightCm: number;
  /** Cena w PLN. null = praca nie na sprzedaż / cena na zapytanie. */
  pricePln: number | null;
  status: ArtStatus;
  /** Np. "Oryginał 1/1" albo "Edycja 12 egz." */
  edition: string;
  image: string;
  description: string;
  details: string[];
  featured?: boolean;
  badge?: string;
}

export const CATEGORIES: { id: ArtCategory; name: string; tagline: string }[] = [
  {
    id: "obrazy",
    name: "Olej & akryl",
    tagline: "Unikatowe oryginały na płótnie — jeden egzemplarz, sygnowany.",
  },
  {
    id: "grafiki",
    name: "Grafika cyfrowa",
    tagline: "Wydruki muzealne giclée na papierze bawełnianym.",
  },
  {
    id: "edycje",
    name: "Edycje limitowane",
    tagline: "Numerowane serie kolekcjonerskie z certyfikatem.",
  },
];

export function categoryName(id: ArtCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export const ARTWORKS: Artwork[] = [
  {
    slug: "silentium-aurum",
    title: "Silentium Aurum",
    category: "obrazy",
    technique: "Olej i złoto płatkowe na płótnie",
    year: 2026,
    widthCm: 100,
    heightCm: 140,
    pricePln: 9800,
    status: "dostepna",
    edition: "Oryginał 1/1",
    image: "/works/silentium-aurum.jpg",
    description:
      "Flagowa praca pracowni. Głęboka czerń przełamana żyłą złota płatkowego — cisza, która waży więcej niż hałas. Obraz o medytacji, cierpliwości i decyzjach podejmowanych bez pośpiechu.",
    details: [
      "Sygnowany na odwrocie, certyfikat autentyczności",
      "Werniksowane, gotowe do zawieszenia (blejtram 4 cm)",
      "Rama muzealna czarna — w cenie",
    ],
    featured: true,
    badge: "Praca flagowa",
  },
  {
    slug: "brama-cnot",
    title: "Brama Cnót",
    category: "obrazy",
    technique: "Olej na płótnie",
    year: 2025,
    widthCm: 120,
    heightCm: 120,
    pricePln: 12400,
    status: "dostepna",
    edition: "Oryginał 1/1",
    image: "/works/brama-cnot.jpg",
    description:
      "Monumentalny łuk w złocie i grafitowej czerni. Inspiracja czterema cnotami kardynalnymi — mądrością, odwagą, sprawiedliwością i umiarem. Obraz-brama: staje się centrum każdego wnętrza.",
    details: [
      "Sygnowany na odwrocie, certyfikat autentyczności",
      "Werniksowane, blejtram galeryjny 4 cm",
      "Możliwość obejrzenia na żywo w pracowni (Bydgoszcz)",
    ],
    featured: true,
  },
  {
    slug: "medytacje-i",
    title: "Medytacje I",
    category: "obrazy",
    technique: "Olej na płótnie lnianym",
    year: 2025,
    widthCm: 80,
    heightCm: 100,
    pricePln: 7200,
    status: "zarezerwowana",
    edition: "Oryginał 1/1",
    image: "/works/medytacje-i.jpg",
    description:
      "Fragment klasycznego popiersia wyłaniający się z mroku, muśnięty złotem. Pierwsza część cyklu „Medytacje” — rozmowa ze stoikami o tym, co od nas zależy, a co nie.",
    details: [
      "Sygnowany na odwrocie, certyfikat autentyczności",
      "Aktualnie zarezerwowany — zapytaj o status",
      "Możliwy obraz partnerski na zamówienie (Medytacje II)",
    ],
    badge: "Rezerwacja",
  },
  {
    slug: "rzeka-czasu",
    title: "Rzeka Czasu",
    category: "obrazy",
    technique: "Akryl i żelazo na płótnie",
    year: 2024,
    widthCm: 90,
    heightCm: 130,
    pricePln: 6400,
    status: "dostepna",
    edition: "Oryginał 1/1",
    image: "/works/rzeka-czasu.jpg",
    description:
      "Płynąca struga złota na tle surowej, niemal metalicznej czerni. O czasie, którego nie da się zatrzymać — ale można go skierować. Dynamiczna faktura, gra światła na impastach.",
    details: [
      "Sygnowany na odwrocie, certyfikat autentyczności",
      "Werniksowane, gotowe do zawieszenia",
      "Gratis: transport na terenie Polski",
    ],
  },
  {
    slug: "konstelacja-sophia",
    title: "Konstelacja Sophia",
    category: "grafiki",
    technique: "Wydruk giclée, papier bawełniany 308 g",
    year: 2026,
    widthCm: 70,
    heightCm: 100,
    pricePln: 1150,
    status: "dostepna",
    edition: "Edycja otwarta, sygnowana",
    image: "/works/konstelacja-sophia.jpg",
    description:
      "Geometryczna konstelacja — mądrość jako mapa gwiazd. Precyzyjna linia, głęboka czerń, złote węzły. Wydruk muzealny o archiwalnej trwałości 100+ lat.",
    details: [
      "Sygnowana ołówkiem, biały margines 5 cm",
      "Sprzedawana bez ramy (oferujemy oprawę)",
      "Wysyłka w tubie ochronnej w 48 h",
    ],
    featured: true,
  },
  {
    slug: "matryca-spokoju",
    title: "Matryca Spokoju",
    category: "grafiki",
    technique: "Wydruk giclée, papier bawełniany 308 g",
    year: 2026,
    widthCm: 70,
    heightCm: 70,
    pricePln: 890,
    status: "dostepna",
    edition: "Edycja otwarta, sygnowana",
    image: "/works/matryca-spokoju.jpg",
    description:
      "Minimalistyczna siatka złotych linii — porządek, który uspokaja. Idealna jako element dyptyku lub tryptyku; świetnie współgra z „Labiryntem Decyzji”.",
    details: [
      "Sygnowana ołówkiem, biały margines 5 cm",
      "Rabat 15% przy zakupie pary z Labiryntem Decyzji",
      "Wysyłka w tubie ochronnej w 48 h",
    ],
  },
  {
    slug: "sen-stoika",
    title: "Sen Stoika",
    category: "grafiki",
    technique: "Wydruk giclée, papier fine-art mat",
    year: 2025,
    widthCm: 60,
    heightCm: 90,
    pricePln: 980,
    status: "dostepna",
    edition: "Edycja otwarta, sygnowana",
    image: "/works/sen-stoika.jpg",
    description:
      "Sylwetka pogrążona w złotej mgle — oniryczna grafika o śnie jako ostatniej wolnej przestrzeni umysłu. Miękkie przejścia tonalne, głębokie czernie.",
    details: [
      "Sygnowana ołówkiem",
      "Dostępne rozmiary: 60×90 oraz 40×60 (690 zł)",
      "Wysyłka w tubie ochronnej w 48 h",
    ],
  },
  {
    slug: "labirynt-decyzji",
    title: "Labirynt Decyzji",
    category: "grafiki",
    technique: "Wydruk giclée, papier bawełniany 308 g",
    year: 2025,
    widthCm: 70,
    heightCm: 70,
    pricePln: 890,
    status: "dostepna",
    edition: "Edycja otwarta, sygnowana",
    image: "/works/labirynt-decyzji.jpg",
    description:
      "Labirynt jako metafora warstwy decyzji (L4): każda ścieżka ma cenę, ale z góry widać całość. Hipnotyczna, precyzyjna kompozycja do wnętrz nowoczesnych.",
    details: [
      "Sygnowana ołówkiem, biały margines 5 cm",
      "Rabat 15% przy zakupie pary z Matrycą Spokoju",
      "Wysyłka w tubie ochronnej w 48 h",
    ],
  },
  {
    slug: "fantom-vii",
    title: "Fantom VII",
    category: "edycje",
    technique: "Sitodruk + złoto płatkowe, papier 640 g",
    year: 2026,
    widthCm: 50,
    heightCm: 70,
    pricePln: 2400,
    status: "dostepna",
    edition: "Edycja 12 egz. + 2 AP",
    image: "/works/fantom-vii.jpg",
    description:
      "Siódma odsłona cyklu Fantom — postać ze światła i cienia, ręcznie złocona płatkami 24-karatowego złota. Każdy egzemplarz różni się układem złota: to hybryda grafiki i unikatowego gestu.",
    details: [
      "Numerowana i sygnowana, certyfikat z numerem",
      "Ręczne złocenia — każdy egzemplarz unikatowy",
      "Pozostało: 7 z 12 egzemplarzy",
    ],
    featured: true,
    badge: "Edycja kolekcjonerska",
  },
  {
    slug: "most-i",
    title: "Most I",
    category: "edycje",
    technique: "Akwaforta + akwatinta, papier Somerset",
    year: 2025,
    widthCm: 56,
    heightCm: 76,
    pricePln: 1950,
    status: "dostepna",
    edition: "Edycja 20 egz.",
    image: "/works/most-i.jpg",
    description:
      "Łuki mostu nad ciemną wodą — hołd dla idei Mostu: łączenia światów, ludzi i decyzji. Klasyczna akwaforta drukowana ręcznie w pracowni graficznej.",
    details: [
      "Numerowana i sygnowana ołówkiem",
      "Druk ręczny, sucha pieczęć pracowni",
      "Pozostało: 11 z 20 egzemplarzy",
    ],
  },
  {
    slug: "virtus",
    title: "Virtus I–IV",
    category: "edycje",
    technique: "4× pigment print + tłoczenie, kaseta kolekcjonerska",
    year: 2024,
    widthCm: 40,
    heightCm: 40,
    pricePln: 2900,
    status: "sprzedana",
    edition: "Edycja 9 kaset — wyprzedana",
    image: "/works/virtus.svg",
    description:
      "Kaseta czterech grafik poświęconych cnotom: Sophia, Andreia, Dikaiosyne, Sophrosyne. Archiwalny komplet kolekcjonerski w kasecie z czarnego lnu ze złoceniem. Edycja wyprzedana — zapytaj o listę rezerwową.",
    details: [
      "Edycja wyprzedana w 2025 roku",
      "Lista rezerwowa: napisz przez formularz",
      "Planowana reedycja Virtus II w 2027",
    ],
    badge: "Wyprzedana",
  },
  {
    slug: "ad-astra",
    title: "Ad Astra",
    category: "edycje",
    technique: "Mezzotinta, papier Hahnemühle",
    year: 2024,
    widthCm: 35,
    heightCm: 50,
    pricePln: 1650,
    status: "dostepna",
    edition: "Edycja 15 egz.",
    image: "/works/ad-astra.jpg",
    description:
      "Gwiezdne niebo w najgłębszej czerni mezzotinty, ze złotą dominantą. „Ad Astra Una” — razem ku gwiazdom. Nastrojowa, kameralna grafika do sypialni i gabinetów.",
    details: [
      "Numerowana i sygnowana ołówkiem",
      "Druk ręczny, sucha pieczęć pracowni",
      "Pozostało: 5 z 15 egzemplarzy",
    ],
  },
];

export function getArtwork(slug: string): Artwork | undefined {
  return ARTWORKS.find((a) => a.slug === slug);
}

export function relatedArtworks(slug: string, count = 3): Artwork[] {
  const current = getArtwork(slug);
  if (!current) return ARTWORKS.slice(0, count);
  const sameCategory = ARTWORKS.filter(
    (a) => a.slug !== slug && a.category === current.category
  );
  const rest = ARTWORKS.filter(
    (a) => a.slug !== slug && a.category !== current.category
  );
  return [...sameCategory, ...rest].slice(0, count);
}

export function formatPLN(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

export const STUDIO = {
  name: "L4L7art",
  tagline: "Gdzie struktura spotyka ducha",
  city: "Bydgoszcz",
  email: "kontakt@l4l7art.pl",
  phone: "+48 000 000 000",
  hours: "pn–pt 10:00–18:00 (wizyty po umówieniu)",
  address: "Pracownia L4L7art · ul. Przykładowa 7 · 85-001 Bydgoszcz",
} as const;
