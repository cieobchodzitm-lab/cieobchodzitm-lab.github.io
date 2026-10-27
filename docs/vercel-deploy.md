# Vercel — diagnoza i plan naprawy

Stan na 2026-10-09. Projekt: `cieobchodzitm-labgithubio.vercel.app`
(repo `cieobchodzitm-lab/cieobchodzitm-lab.github.io`).

## Objaw

Vercel nie deployuje nic od **2 października 2026** (`26a7df69`). Na produkcji
nadal działa build sprzed wprowadzenia kart OG — dlatego `/api/og` odpowiada
`404`, mimo że kod od 3 października jest w `main`.

## Dowody

| Fakt | Skąd | Wniosek |
| --- | --- | --- |
| `main` żyje: commity 5, 6, 7, 8 i 9 października (`agt-rnd-bot`) | historia commitów na GitHubie | pushy dochodzą, repo działa |
| GitHub Actions działają (codzienne commity bota idą z workflow `agt-rnd.yml`) | jw. | CI w repo jest sprawne |
| Ostatni deploy: `26a7df69`, 2.10 | Vercel | **wyzwalacz deployu nie działa** |
| `/api/og` → 404 na produkcji | odczyt strony | potwierdza, że to stary build |
| `npm ci && npm run build` lokalnie: exit 0 | ta sesja | kod się buduje |
| `npm ci --omit=dev && npm run build`: **exit 127** (`tsx: not found`) | ta sesja | build wymaga devDependencies |

Wniosek: problem leży **po stronie Vercela** (integracja Git / konto), nie w
kodzie. Build jest poprawny, ale od 2 października nie jest wyzwalany.

## Co zostało naprawione w repo

1. **`vercel.json`** (nowy) — jawna konfiguracja zamiast autodetekcji:
   ```json
   { "framework": "nextjs", "installCommand": "npm ci --include=dev", "buildCommand": "npm run build" }
   ```
   `installCommand` jest krytyczny: `prebuild` generuje karty OG i potrzebuje
   `tsx` z devDependencies. Bez `--include=dev` build kończy się kodem 127
   przed kompilacją — to realna mina, nie teoria (sprawdzone).

2. **`.nvmrc`** (`22`) + `engines.node: ">=22.5.0"` w `package.json` — kod
   używa `node:sqlite`, który wymaga Node ≥ 22.5.

3. **`.github/workflows/ci.yml`** (nowy) — na każdy push/PR: `typecheck` +
   `build` (+ `og:check` w `postbuild`). Daje pewność, że kod się buduje, nawet
   gdy Vercel milczy.

4. **`.github/workflows/vercel-deploy.yml`** (nowy) — deploy CLI-em z Actions,
   czyli **obejście niedziałającej integracji Git**. Wymaga secretów
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Co sprawdzić w dashboardzie Vercela

W tej kolejności — każdy punkt potrafi sam zatrzymać deploye:

1. **Settings → Git** — czy repo jest w ogóle podłączone i czy Production
   Branch to `main`. Jeśli sekcja jest pusta → „Connect Git Repository".
2. **Settings → Git → Deploy Hooks / Auto-deploy** — czy auto-deploy dla `main`
   jest włączony.
3. **GitHub → Settings → Webhooks → `api.vercel.com`** — Recent Deliveries:
   czy są wysyłki i z jakim kodem (200 vs 401/404). Brak wpisów = aplikacja
   Vercel straciła dostęp do repo.
4. **GitHub → Settings → Applications → Vercel** — czy ma dostęp do tego repo
   (Configure → Repository access).
5. **Vercel → Usage / Billing** — baner o wstrzymaniu (spend limit, plan,
   nieopłacona faktura). Wstrzymane konto nie deployuje, ale buildy historii
   pokazują dawne sukcesy.
6. **Settings → Node.js Version** — musi być **22.x** (`node:sqlite`).
7. **Deployments** — czy widać choćby *próbę* builda po 2.10. Jeśli nie ma
   żadnej → problem z wyzwalaczem (punkty 1–5). Jeśli są i są czerwone →
   logi builda pokażą konkretny błąd.

Jeśli punkty 1–7 nie pomogą: **Settings → Git → Disconnect**, potem ponowne
podłączenie repo (czyści uszkodzony webhook).

## Plan B — deploy z GitHub Actions

Działa nawet wtedy, gdy integracja Git Vercela jest całkiem martwa (Actions w
repo chodzą — widać to po codziennych commitach bota).

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

Uwaga: jeśli naprawisz integrację Git, **wyłącz ten workflow** — inaczej każdy
push zdeployuje się dwa razy.

## Mina do załatwienia: SQLite na serverlessie

Niezależna od deployu, ale wysadzi sklep zaraz po udanym wdrożeniu.

`lib/db.ts` otwiera plik `data/bridge.db` (`process.cwd()/data`) i zapisuje tam
zamówienia, zgłoszenia i logowanie admina. Na Vercelu:

- system plików jest **tylko do odczytu** poza `/tmp` → `mkdirSync`/zapis
  wyrzuca `EROFS` → HTTP 500,
- nawet gdyby działało, każda funkcja serverless ma **własny, efemeryczny**
  dysk → zamówienie zapisane w jednej instancji nie istnieje w kolejnej.

Dotknięte ścieżki (20 plików): `/api/orders`, `/api/contact`,
`/api/newsletter`, `/api/auth/login`, `/api/proposals/*/vote`,
`/api/services/*/check`, całe `/admin/*` oraz `/zamowienie/[numer]` (strona
potwierdzenia, którą widzi klient po zakupie).

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
curl -sI https://cieobchodzitm-labgithubio.vercel.app/og/brand.png       # 200 image/png
curl -s  https://cieobchodzitm-labgithubio.vercel.app/sitemap.xml | grep -c image:image   # 22
curl -sI https://cieobchodzitm-labgithubio.vercel.app/api/og             # 200 image/png
```
