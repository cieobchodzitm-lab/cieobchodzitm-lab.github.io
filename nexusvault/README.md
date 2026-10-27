# NexusVault (demo)

Demo portfela Web3 i marketplace'u NFT działające **całkowicie w przeglądarce**.
Łańcuch jest symulowany — nie ma backendu, RPC, kluczy, podpisów ani prawdziwych
środków. Celem jest pokazanie interfejsu i logiki portfela, nie prawdziwa
kryptografia.

> **Uwaga:** fraza „seed" w tym demo **nie jest** standardem BIP-39 i nie
> zabezpiecza żadnych realnych środków. Wszystkie dane żyją w `localStorage`.

## Uruchomienie

```bash
cd nexusvault
npm install
npm run dev        # http://localhost:5173
```

| Skrypt              | Co robi                                          |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | serwer deweloperski (Vite, host `0.0.0.0`)       |
| `npm run build`     | `tsc --noEmit` + build produkcyjny do `dist/`    |
| `npm run preview`   | podgląd buildu produkcyjnego                     |
| `npm test`          | testy jednostkowe i interfejsu (Vitest + jsdom)  |
| `npm run typecheck` | samo sprawdzenie typów                           |

Wymagany Node ≥ 18 (narzędzia: Vite 5, React 19, TypeScript 5.8, Vitest 2).

## Co potrafi

- **Portfel** — generowany z frazy demo; salda startowe: 850 NEX, 0.42 ETH, 500 USDC.
- **Wysyłka** — walidacja adresu EVM, kwoty i opłaty; transakcja najpierw
  `pending`, po jednym bloku `confirmed`.
- **Rynek NFT** — 24 deterministyczne przedmioty w 4 kolekcjach, 4 rzadkościach;
  filtrowanie, wyszukiwanie, sortowanie.
- **Kolekcja** — wystawianie i zdejmowanie przedmiotów z rynku.
- **Historia** — lista operacji ze statusami, opłatą i numerem bloku.
- **Dwie sieci** — `mainnet-sim` (blok 2,4 s) i `testnet-sim` (blok 0,9 s).
- **Trwałość** — stan zapisuje się w `localStorage`, przycisk „Reset" czyści portfel.

## Architektura

```
src/
  lib/
    chain.ts         stan łańcucha: typy, stałe, reducer, walidacja, selektory
    crypto-demo.ts   deterministyczne „krypto": adresy, hashe, identikony, formaty
    words.ts         słownik i generator frazy demo (NIE BIP-39)
    storage.ts       odczyt/zapis stanu w localStorage (odporny na śmieci)
  components/        ekrany i prymitywy UI
  App.tsx            kompozycja, zakładki, powiadomienia, tykanie łańcucha
```

Kluczowe założenia:

- **Czysty reducer.** `reducer(state, action)` to jedyne miejsce, które zmienia
  stan — łatwo go testować i nie ma w nim efektów ubocznych.
- **Determinizm.** Katalog NFT, adresy, identikony i wykresy cenowe wyprowadzamy
  z ziarna przez PRNG (mulberry32). Ten sam seed → ten sam wynik, także w testach.
- **Opłata zawsze w NEX.** Nawet przy przelewie ETH/USDC opłata jest pobierana
  z salda NEX (`feeNexFor`).
- **Ekonomia demo dobrana celowo.** Saldo startowe i progi rzadkości są tak
  ustawione, żeby najtańsza oferta była osiągalna od pierwszego kliknięcia
  (test regresyjny w `chain.test.ts` to sprawdza).

## Testy

```bash
npm test
```

- `src/lib/chain.test.ts` — reduktor, walidacja, opłaty, potwierdzanie transakcji,
  marketplace, selektory, ekonomia (24 testy).
- `src/lib/crypto-demo.test.ts` — PRNG, adresy, hashe, identikony, formatowanie
  i polska odmiana liczebników (17 testów).
- `src/App.test.tsx` — dymny test interfejsu: utworzenie portfela, zakup NFT,
  trwałość po ponownym montowaniu, walidacja formularza (5 testów).

## Ograniczenia (świadome)

- Brak backendu, RPC i prawdziwych kluczy; „koperta" transakcji wygląda jak EVM,
  ale nie jest podpisywana.
- Ceny aktywów i progi rzadkości są wymyślone na potrzeby interfejsu.
- Kran testowy dolewa wirtualne NEX bez limitu — to demo.
- Stan w `localStorage` nie jest szyfrowany (i nie musi być: nie ma tam nic
  prawdziwego).
