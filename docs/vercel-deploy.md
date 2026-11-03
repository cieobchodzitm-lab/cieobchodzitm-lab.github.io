# Vercel — diagnoza i stan wdrożenia

Stan na **2026-11-03**.

Projekt: `cieobchodzitm-labgithubio.vercel.app`
(repo `cieobchodzitm-lab/cieobchodzitm-lab.github.io`).

## Wniosek w jednym zdaniu

**Wdrożenia działają, a `/api/og` zwraca poprawne PNG 1200×630.** Usterka, którą
tu przez kilka godzin goniliśmy („`/api/og` → 500 na produkcji"), była artefaktem
narzędzia pomiarowego, nie aplikacji. Jedna **realna** usterka po drodze jednak
wyszła i została naprawiona: workflow `vercel-deploy.yml` failował na każdym
pushu do `main`.

## Jak sprawdzać endpointy — ważna przestroga

Narzędzie, którym pierwotnie odpytywaliśmy stronę, raportowało **HTTP 500 dla
każdej odpowiedzi `image/png`** — niezależnie od tego, co mówił serwer. Ten sam
mechanizm podawał `/api/orders` jako 200, choć serwer zwraca **401**.

Dlatego statusów nie wolno brać z narzędzia, które parsuje treść. Sprawdzone
sposoby:

| Sposób | Wynik |
| --- | --- |
| `curl -sI https://cieobchodzitm-labgithubio.vercel.app/api/og` | wiarygodny |
| Prawdziwy `fetch()` z wnętrza funkcji Vercela | wiarygodny (użyty poniżej) |
| Narzędzie do czytania stron (jak to, które nas zmyliło) | **niewiarygodne dla obrazów** |

Pomiar kontrolny wykonany `fetch()` z wnętrza Vercela (region `iad1`):

| Ścieżka | Status | Content-Type | Bajtów | PNG |
| --- | --- | --- | --- | --- |
| `/api/og` | **200** | `image/png` | 104 840 | ✅ 1200×630 |
| `/api/og?title=Test` | **200** | `image/png` | 92 201 | ✅ 1200×630 |
| `/` | 200 | HTML | — | — |
| `/api/orders` bez sesji | **401** | `application/json` | 23 | — |

Nagłówek pliku to `89 50 4E 47` (`\x89PNG`), a w IHDR `0x4B0 × 0x276`
= **1200 × 630**, czyli dokładnie format karty OG.

### Skąd wziął się fałszywy alarm — kronika

Kolejne hipotezy i ich wynik. Zapisujemy, żeby nikt nie wracał do nich drugi raz:

1. **„Vercel przestał deployować"** — obalone: check-runsy pokazują `success`
   dla każdego commita na `main`, a GitHubowe deploymenty trafiają do
   środowiska **Production**.
2. **„Wadliwy `@vercel/og` 1.0.3 na Edge"** — obalone: zamiana na `next/og` nic
   nie zmieniła (PNG identyczne co do bajtu). Co gorsza, oba warianty od
   początku działały.
3. **„Winny Edge runtime, trzeba przejść na Node"** — obalone: diagnostyka
   uruchomiona na produkcji pokazała `ok: true` na **obu** runtime'ach
   (Edge: 521 ms, Node: 425 ms).
4. **„Winny kod trasy `/api/og`"** — obalone: wywołanie prawdziwego handlera na
   produkcji zwraca 200 `image/png` dla wszystkich wariantów.
5. **„Winny jest sposób zwracania odpowiedzi (stream vs buffer)"** — obalone
   ostatecznie: obie trasy testowe zwracały 200 `image/png`, gdy zmierzyć to
   prawdziwym `fetch()`.

Punkt, w którym pękło: pomiar `fetch()` z wnętrza Vercela pokazał **200** tam,
gdzie narzędzie do czytania stron pokazywało 500 — dla dokładnie tych samych
adresów, w tej samej minucie. Wniosek: źle mierzyło narzędzie.

## Co naprawdę zostało naprawione

1. **`.github/workflows/vercel-deploy.yml` — jedyna realna usterka.**
   Workflow miał wyzwalacz `push: branches: [main]` i wymagał secretów
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, których w repo nie ma.
   Efekt: **każdy commit w `main` dostawał czerwony check `deploy`.**
   Zmieniono na `workflow_dispatch` (uruchamiany ręcznie) + jawne sprawdzenie
   secretów z czytelnym komunikatem. Integracja Git Vercela działa, więc
   domyślnie ten workflow ma być wyłączony — inaczej każdy push deployuje się
   dwa razy.

2. **`vercel.json`** (nowy) — jawna konfiguracja zamiast autodetekcji:
   ```json
   { "framework": "nextjs", "installCommand": "npm ci --include=dev", "buildCommand": "npm run build" }
   ```
   `installCommand` jest ważny: Next potrzebuje w czasie budowania
   devDependencies (`typescript`, `@types/*`). Bez `--include=dev` kompilacja
   potrafi skończyć się błędem jeszcze przed właściwym buildem
   (`tsx: not found`, exit 127).

3. **`.nvmrc`** (`22`) — kod używa `node:sqlite`, który wymaga Node ≥ 22.5
   (`engines.node: ">=22.5.0"` jest już w `package.json`).

4. **`.github/workflows/ci.yml`** (nowy) — na każdy push/PR buduje stronę
   (`npm ci --include=dev` + `npm run build`) oraz osobno weryfikuje
   podprojekt `nexusvault/` (`typecheck`, testy, build).

5. **`.github/workflows/smoke-prod.yml`** (nowy) — dymek produkcji: prawdziwy
   `curl` z maszyny CI sprawdza `/`, `/api/og` (trzy warianty) i `/api/orders`,
   a potem weryfikuje, czy `/api/og` to faktycznie PNG 1200×630. Uruchamiany
   ręcznie i raz dziennie (05:23). **To jest właściwy sposób weryfikacji**
   — zobacz przestrogę wyżej.

6. **`next/og` zamiast `@vercel/og`** (dobrowolne porządki, nie naprawa błędu) —
   ten sam silnik satori, a o 25 pakietów mniej w `node_modules`
   (`ImageResponse` jest wbudowany w Next 15). Przetestowane na produkcji na
   Edge runtime — PNG wychodzą identyczne co do bajtu jak wcześniej.

## Co sprawdzić w dashboardzie Vercela

1. **Settings → Git** — czy Production Branch to `main`.
2. **Settings → Node.js Version** — musi być **22.x** (`node:sqlite`).
3. **Settings → Deployment Protection** — previewy są dziś za SSO; jeśli
   utrudnia to sprawdzanie zmian, można to wyłączyć albo dodać wyjątki.
   Uwaga: przez tę ochronę **nie da się** zweryfikować niczego na URL-ach
   preview — dostępna jest tylko produkcja.

## Plan B — deploy z GitHub Actions

Działa nawet wtedy, gdy integracja Git Vercela jest całkiem martwa.

```bash
# 1. token: vercel.com/account/tokens → Create
# 2. orgId i projectId:
npx vercel link          # powstaje .vercel/project.json
# 3. GitHub → Settings → Secrets and variables → Actions → New repository secret:
#    VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
```

Potem: Actions → Deploy to Vercel → Run workflow.

Gdyby sypał się builder po stronie Vercela, w workflow jest w komentarzu
wariant `--prebuilt` (`vercel build` lokalnie + `vercel deploy --prebuilt`),
który wysyła gotowe artefakty i omija budowanie na Vercelu.

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
# Karty OG są generowane w locie przez funkcję Edge:
curl -sI https://cieobchodzitm-labgithubio.vercel.app/api/og   # 200 image/png
curl -sI https://cieobchodzitm-labgithubio.vercel.app/         # 200

# Albo po prostu odpal workflow "Smoke test (produkcja)" — sprawdzi to samo
# i dodatkowo potwierdzi wymiary PNG.
```

Uwaga: statyczne pliki `public/og/*.png` opisane w starszych wersjach tego
dokumentu nie powstają w obecnym wariancie repozytorium (brak skryptu `og`).
Jeśli kiedyś wrócisz do generowania kart w buildzie, dopisz `public/og/` do
`.gitignore` — to artefakt, nie źródło.
