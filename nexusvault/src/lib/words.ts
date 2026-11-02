/**
 * Słownik demo — 96 słów do generowania „frazy odzyskiwania".
 * Umyślnie NIE jest to lista BIP-39: to demo, a fraza nie otwiera żadnego
 * prawdziwego portfela.
 */
export const WORDS: readonly string[] = [
  "akacja", "amber", "antena", "arbuz", "atlas", "aurora", "baobab", "bastion",
  "bursztyn", "cedr", "cyklon", "cytadela", "delta", "diament", "dorsz", "drachma",
  "dzwon", "echo", "emerald", "estuarium", "feniks", "filar", "fiolet", "fontanna",
  "galera", "gejzer", "genesis", "granit", "gruszka", "harmonia", "helion", "herbata",
  "horyzont", "ikar", "irys", "jantar", "jaspis", "jodła", "kadra", "kamea",
  "kaskada", "klinkier", "kompas", "korona", "krater", "krypton", "księżyc", "latarnia",
  "lawenda", "lazur", "lokomotywa", "lumen", "magnes", "mahoni", "mandarynka", "marmur",
  "meridian", "meteoryt", "mgławica", "mikroskop", "modrzew", "mozaika", "nektar", "neon",
  "obelisk", "obsydian", "ocean", "okaryna", "onyks", "opal", "orbita", "orgia",
  "papirus", "parasol", "perłowy", "piramida", "plankton", "platyna", "pomarańcza", "portyk",
  "pryzmat", "pulsar", "radar", "reflektor", "robot", "rubin", "satelita", "szafir",
  "szmaragd", "taras", "teleskop", "topaz", "tulipan", "tytan", "wachlarz", "welon",
  "wenus", "wulkan", "zefir", "zenit", "złoty", "zygzak",
];

/** Przymiotniki i rzeczowniki do nazw NFT (deterministycznie łączone). */
export const ADJECTIVES: readonly string[] = [
  "Cichy", "Złoty", "Szkarłatny", "Srebrny", "Nocny", "Głęboki", "Żelazny", "Płynny",
  "Świetlisty", "Odległy", "Szafirowy", "Przezroczysty",
];

export const NOUNS: readonly string[] = [
  "Horyzont", "Sygnał", "Labirynt", "Strumień", "Kryptonim", "Węzeł", "Puls", "Relikt",
  "Cień", "Klucz", "Most", "Sen",
];

/** Losowa fraza demo z `WORDS`. */
export function demoPhrase(rng: () => number, words = 12): string {
  const picked: string[] = [];
  for (let i = 0; i < words; i += 1) {
    const word = WORDS[Math.floor(rng() * WORDS.length)] ?? "genesis";
    picked.push(word);
  }
  return picked.join(" ");
}
