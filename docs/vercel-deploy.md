# Vercel — diagnoza i plan naprawy

Stan na **2026-11-02**. Diagnoza zrewidowana: wcześniejsza wersja tego dokumentu
(z 2026-10-09) zakładała, że Vercel w ogóle przestał deployować. To się
**nie potwierdziło** — sprawdzono check-runs na GitHubie.

Projekt: `cieobchodzitm-labgithubio.vercel.app`
(repo `cieobchodzitm-lab/cieobchodzitm-lab.github.io`).

## Wniosek w jednym zdaniu

Vercel deployuje każdy push do `main`, a strona jest aktualna — zostały dwa
realne problemy: `/api/og` zwraca **500** na produkcji oraz drugi podłączony
projekt (`l7-cnota-dashboard`) sypie się na każdym commicie.

## Co jest sprawdzone (2026-11-02)

| Fakt | Skąd | Wniosek |
| --- | --- | --- |
| `Vercel – cieobchodzitm-lab.github.io` = **success** dla 9f2ab5d (02.11), a4989fc (30.10), 33643b0 i ad235fa (29.10), de93712 (28.10) | check-runs na GitHubie | deployy chodzą, integracja Git działa |
| Strona pokazuje aktualne dane: 10 dostępnych prac = 12 w `lib/art.ts` minus sprzedana i zarezerwowana | odczyt strony | produkcja **nie** jest starym buildem |
| `/api/orders` → 200 `{"error":"Brak sesji."}` | odczyt | funkcje serverless działają |
| `/api/og` oraz `/api/og?title=…` → **500** | odczyt | problem leży w tej jednej trasie |
| `/api/og` to jedyna trasa z `export const runtime = "edge"` | kod | Edge runtime jest różnicą |
| Lokalnie `/api/og` → 200 PNG w dev **i** w buildzie produkcyjnym (102 kB / 341 kB / 89 kB) | ta sesja | kod, fonty i dane są poprawne |
| Bundle Edge: 884 kB raw, **302 kB gzip** | `.next/server/app/api/og/route.js` | limit rozmiaru raczej nie wchodzi w grę |
| Do repo podłączone są **dwa** projekty; `l7-cnota-dashboard` = **failure** na każdym commicie | check-runs | hałas w checkach, prawdopodobnie pomyłkowe podłączenie |
| Preview deploymenty są chronione SSO (Vercel Authentication) | odczyt preview URL | nie da się ich zweryfikować bez logowania |

### `/api/og` → 500: co wiemy, a czego nie

**Pewne:** trasa jest wdrożona (nie 404) i działa lokalnie w obu trybach;
wszystkie trasy na Node runtime odpowiadają poprawnie; 500 pojawia się także dla
wariantu bez parametrów.

**Wykluczone:** brak trasy (byłoby 404), `Intl` z `pl-PL` w `formatPLN`
(500 występuje też bez wywołania tej funkcji), odczyt plików (fonty są
wbase64 i dekodowane przez `atob`), przekroczenie limitu rozmiaru funkcji.

**Najbardziej prawdopodobne:** `@vercel/og` **1.0.3** uruchamiany na Edge
runtime pod Next 15.5 (inicjalizacja WASM/resvg na infrastrukturze Vercela).
To **hipoteza, nie potwierdzenie** — bez logów z dashboardu nie da się tego
domknąć.

Jak to sprawdzić (2 minuty):
**Vercel → projekt → Deployments → ostatni → Functions → `/api/og` → Logs.**

Kierunki naprawy, gdy logi to potwierdzą:

1. **Przejście na `next/og`** — Next 15 ma wbudowany `ImageResponse`
   (`import { ImageResponse } from "next/og"`), co pozwala wyrzucić zależność
   `@vercel/og`. Najlepiej wspierana ścieżka dla tego Nexta.
2. **Albo `export const runtime = "nodejs"`** w `app/api/og/route.tsx` — trasy na
   Node działają w tym projekcie bez zarzutu (patrz `/api/orders`).

## Co zostało naprawione w repo (ten PR)

1. **`vercel.json`** (nowy) — jawna konfiguracja zamiast autodetekcji:
   ```json
   { "framework": "nextjs", "installCommand": "npm ci --include=dev", "buildCommand": "npm run build" }
   ```
   `installCommand` jest ważny: Next potrzebuje w czasie budowania
   devDependencies (`typescript`, `@types/*`). Bez `--include=dev` kompilacja
   potrafi skończyć się błędem jeszcze przed właściwym buildem.

2. **`.nvmrc`** (`22`) — kod używa `node:sqlite`, który wymaga Node ≥ 22.5
   (`engines.node: ">=22.5.0"` jest już w `package.json`).

3. **`.github/workflows/ci.yml`** (nowy) — na każdy push/PR buduje stronę
   (`npm ci --include=dev` + `npm run build`) oraz osobno weryfikuje
   podprojekt `nexusvault/` (`typecheck`, testy, build).

4. **`.github/workflows/vercel-deploy.yml`** (nowy) — deploy CLI-em z Actions,
   czyli obejście na wypadek problemów z integracją Git. Wymaga secretów
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Co sprawdzić w dashboardzie Vercela

W tej kolejności (punkty 1–2 są teraz najważniejsze):

1. **Deployments → ostatni → Functions → `/api/og` → Logs** — jedno źródło
   prawdy o błędzie 500. Reszta to domysły.
2. **Drugi projekt `l7-cnota-dashboard`** — jest podłączony do tego repo i
   failuje na każdym commicie. Jeśli to pomyłka: w tym projekcie
   Settings → Git → Disconnect.
3. **Settings → Git** — czy Production Branch to `main`.
4. **Settings → Node.js Version** — musi być **22.x** (`node:sqlite`).
5. **Settings → Deployment Protection** — previewy są dziś za SSO; jeśli
   utrudnia to sprawdzanie zmian, można to wyłączyć albo dodać wyjątki.

## Plan B — deploy z GitHub Actions

Działa nawet wtedy, gdy integracja Git Vercela jest całkiem martwa.

```bash
# 1. token: vercel.com/account/tokens → Create
# 2. orgId i projectId:
npx vercel link          # powstaje .vercel/project.json
# 3. GitHub → Settings → Secrets and variables → Actions → New repository secret:
#    VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
```

Potem: push do `main` → workflow `Deploy to Vercel` (albo ręcznie:
Actions → Deploy to Vercel → Run workflow).

Gdyby sypał się builder po stronie Vercela, w workflow jest w komentarzu
wariant `--prebuilt` (`vercel build` lokalnie + `vercel deploy --prebuilt`),
który wysyła gotowe artefakty i omija budowanie na Vercelu.

Uwaga: jeśli integracja Git działa (a dziś działa), **nie włączaj tego
workflowu** — każdy push zdeployowałby się dwa razy.

## Mina do załatwienia: SQLite na serverlessie

Niezależna od deployu, ale wysadzi sklep zaraz po udanym wdrożeniu.

`lib/db.ts` otwiera plik `data/bridge.db` (`process.cwd()/data`) i zapisuje tam
zamówienia, zgłoszenia i logowanie admina. Na Vercelu:

- system plików jest **tylko do odczytu** poza `/tmp` → `mkdirSync`/zapis
  wyrzuca `EROFS` → HTTP 500,
- nawet gdyby działało, każda funkcja serverless ma **własny, efemeryczny**
  dysk → zamówienie zapisane w jednej instancji nie istnieje w kolejnej.

Dotknięte ścieżki: `/api/orders`, `/api/contact`, `/api/newsletter`,
`/api/auth/login`, `/api/proposals/*/vote`, `/api/services/*/check`,
całe `/admin/*` oraz `/zamowienie/[numer]` (strona potwierdzenia, którą widzi
klient po zakupie).

Opcje naprawy — do wyboru:

1. **Turso / libSQL** (najbliżej obecnemu kodowi: nadal SQL, klient HTTP,
   darmowy tier) lub **Vercel Postgres** — zmienia się warstwa dostępu w
   `lib/db.ts`, reszta zostaje.
2. **Vercel KV / Upstash Redis** — dobre na liczniki i sesje, mniej wygodne na
   zamówienia.
3. **Formularze na zewnątrz** (Formspree / Resend) + zamówienia e-mailem —
   najszybsze, jeśli sklep ma działać bez bazy.

Nie ruszam tego samodzielnie: to decyzja o tym, gdzie leżą dane klientów.

## Po udanym deployu — jak sprawdzić

```bash
# Karty OG są generowane dopiero w locie przez funkcję Edge:
curl -sI https://cieobchodzitm-labgithubio.vercel.app/api/og   # 200 image/png
curl -sI https://cieobchodzitm-labgithubio.vercel.app/         # 200
```

Uwaga: statyczne pliki `public/og/*.png` opisane w starszych wersjach tego
dokumentu nie powstają w obecnym wariancie repozytorium (brak skryptu `og`).
Jeśli kiedyś wrócisz do generowania kart w buildzie, dopisz `public/og/` do
`.gitignore` — to artefakt, nie źródło.
