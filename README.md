# L4L7art — Pracownia sztuki (galeria + sklep) · THE BRIDGE

Public site for **L4L7art** — an art studio in Bydgoszcz: unique oil/acrylic
paintings, museum-grade giclée prints and numbered limited editions, with a
full shop (cart → checkout → order tracking) in a dark + gold aesthetic.

The original **Stoic Matrix AI — THE BRIDGE** admin & governance console now
lives under `/admin` (shop orders + messages included) and is documented
below. The earlier static landing page is preserved in
[`legacy/`](legacy/index.html).

## L4L7art site map (public, in Polish)

| Page | Route |
| --- | --- |
| Homepage (hero, featured works, reviews, newsletter) | `/` |
| Gallery with filters + sorting | `/galeria` |
| Artwork detail + add to cart | `/galeria/[slug]` (12 works) |
| About the artist | `/o-mnie` |
| Price list (originals, prints, editions, commissions) | `/cennik` |
| FAQ accordion | `/faq` |
| Contact (form + studio info) | `/kontakt` |
| Cart (localStorage) | `/koszyk` |
| Checkout → confirmation | `/zamowienie` → `/zamowienie/[numer]` |
| Terms & privacy | `/regulamin`, `/prywatnosc` |
| SEO | `/sitemap.xml`, `/robots.txt` |
| Social cards | static `public/og/*.png` generated in the build (`npm run og`), `/api/og` Edge Function as fallback |

Shop API (public `POST`, validation + server-side pricing from the catalog
in [`lib/art.ts`](lib/art.ts)):

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/orders` | place an order → returns `L4L7-YYYY-NNNN` |
| POST | `/api/contact` | contact-form message → `messages` table |
| POST | `/api/newsletter` | newsletter signup → `subscribers` table |

Admin additions: `/admin/zamowienia` (orders + `PATCH /api/orders/[id]`
status flow) and `/admin/wiadomosci` (messages + subscribers).

## Stack

- **Next.js 15** (App Router, TypeScript) — pages + API routes
- **SQLite** via Node's built-in `node:sqlite` module (Node ≥ 22.5, no native deps, DB file at `data/bridge.db`)
- **Auth** — scrypt password hashing + HMAC-signed session cookies (Node `crypto`, no external auth deps)
- Styling: hand-rolled design system (dark stoic theme, Cinzel + gold) — no CSS framework

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# or production:
npm run build && npm run start
```

The database (schema + demo seed: admin user, 4 services, 2 proposals) is created automatically on first boot.

> **Deployment note:** this app needs a Node server for its API routes + SQLite,
> so static hosts (GitHub Pages) can no longer serve it. Deploy on any Node ≥ 22
> host (Vercel, Railway, Fly.io, a VPS…) — `next build && next start`.

Default bootstrap credentials (only used when no user exists yet — override in `.env.local`):

```
username: admin
password: admin123
```

Copy `.env.local.example` → `.env.local` and set a real `BRIDGE_SESSION_SECRET` for any deployment.

## Features

### Auth
- Sign in / out; every login and action is written to the append-only audit ledger
- Session cookie: 7-day, httpOnly, HMAC-signed; admin pages redirect unauthenticated visitors to `/login`

### Service status monitoring (`/admin/services`)
- CRUD: register/edit/delete services with a name, endpoint URL and note
- **Live checks**: ping any endpoint from the server (8 s timeout) — status becomes
  `operational` / `degraded` (HTTP ≥ 500) / `down` (unreachable) / `untracked` (no URL), with latency + last-check time
- Dashboard shows an at-a-glance status grid with per-row "Check" buttons

### Governance proposals & voting (`/admin/proposals`)
- Open proposals with title + description; close/reopen preserves the tally
- Yes / No / Abstain voting — **one member, one vote** (re-voting updates the choice while open; voting on closed proposals is rejected)
- Visual tally bars on the list and detail pages

### Audit ledger
- Every create/edit/delete/check/vote/login is logged with actor, action, detail and timestamp; latest 8 shown on the dashboard, full history via `GET /api/audit`

## Public programme pages (`/agi`)

A public, no-login section that republishes the **Angel Guardian Industry** project
material (PHANTOM RESCUE, PHANTOM SCOUT, Global Rescue Initiative, crowdfunding, team,
contact). Reachable from the landing page header and from the "Angel Guardian Industry"
card on `/`.

| Route | Content |
| --- | --- |
| `/agi` | Mission, programmes, claimed results, funding summary, supporters, contacts |
| `/agi/phantom-rescue` | Described spec, intended users, open questions |
| `/agi/phantom-scout` | R&D concept and its current (non-)status |
| `/agi/global-rescue-initiative` | Policy/interoperability proposal pillars |
| `/agi/crowdfunding` | Goal, milestones, and pre-contribution caveats |
| `/agi/team` | Founder, open roles, named supporters |
| `/agi/contact` | Published addresses, locations, website status |

**Verification labels.** Nothing is published as a bare assertion. Every claim carries a
`ClaimBadge` at one of three levels, defined in `lib/agi-content.ts`:

- `confirmed` — publicly documented or independently checkable
- `self-reported` — stated by the organisation, not independently validated by this site
- `planned` — an intention, not a current fact

Deliberate editorial choices, worth knowing before editing:

- All content lives in **`lib/agi-content.ts`** — a single source of truth. Pages render
  it; they do not hard-code claims. Change a number there and it changes everywhere.
- **No dead links.** The original material links to ~14 files (`docs/*.md`,
  `pitch-deck/*.pdf`, `cli/*.md`, `LICENSE.md`) that do not exist in this repository.
  Those links are omitted and replaced by on-page notes saying the documents are
  unpublished.
- **External links are linked only when confirmed.** The Zrzutka campaign is linked
  because the organisation confirmed it as open on 2026-09-29.
  `www.angelguardian.tech` still renders as plain text — the domain could not be
  confirmed reachable from the build environment. The mailto addresses are linked.
- The campaign is marked **Open** (`FUNDING.status`), launched Q4 2025. Live totals are
  not mirrored here; they live on Zrzutka.pl.
- The **TOPR** partnership is marked `confirmed` (owner-confirmed 2026-09-29). Scope and
  terms are not published.

## API (all require a session cookie)

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | sign in |
| POST | `/api/auth/logout` | sign out |
| GET | `/api/auth/me` | current session |
| GET/POST | `/api/services` | list / create service |
| PATCH/DELETE | `/api/services/[id]` | update / delete service |
| POST | `/api/services/[id]/check` | run a live health check |
| GET/POST | `/api/proposals` | list / create proposal |
| PATCH | `/api/proposals/[id]` | close / reopen |
| POST | `/api/proposals/[id]/vote` | cast / change a vote |
| GET | `/api/audit` | audit ledger (latest 100) |

## Social cards — static PNGs in the build (+ `/api/og` fallback)

Every public page ships a generated 1200×630 Open Graph / Twitter card, drawn
with [`@vercel/og`](https://vercel.com/docs/og-image-generation) (satori →
resvg, no headless browser). The card follows the studio's dark + gold design
system and uses the site's own Cinzel fonts for the full Polish diacritic set.
The TTFs live in [`assets/fonts/`](assets/fonts) (SIL OFL) and are inlined as
base64 into `lib/og-fonts.ts` by `npm run og:fonts`, so rendering never depends
on an external font CDN — satori cannot use woff2 and a CDN fetch would break
behind deployment protection.

Two ways a card is served, in order of preference:

1. **Static PNG** — `npm run og`
   ([`scripts/generate-og.tsx`](scripts/generate-og.tsx)) renders the whole
   catalogue into `public/og/<id>.png`. It is wired to npm's `prebuild` and
   `predev` hooks, so `npm run build` and `npm run dev` always have the cards —
   and a `postbuild` hook re-checks them, so a deploy fails loudly instead of
   shipping pages whose `og:image` 404s. Plain files: no Edge runtime, no
   serverless invocation, they work on any host.
2. **`/api/og`** — the on-demand Edge Function
   ([`app/api/og/route.tsx`](app/api/og/route.tsx)) for anything outside the
   catalogue and for ad-hoc links.

| Piece | Role |
| --- | --- |
| [`lib/og-catalog.ts`](lib/og-catalog.ts) | the cards that exist: 12 page cards + one per artwork (24) |
| [`scripts/generate-og.tsx`](scripts/generate-og.tsx) | renders the catalogue to `public/og/<id>.png` (incremental, verifies each PNG) |
| [`lib/og-card.tsx`](lib/og-card.tsx) | the card itself — one React tree for both paths |
| [`lib/og.ts`](lib/og.ts) | `ogCardUrl()` → static file when one exists, else `/api/og?…` |
| [`app/api/og/route.tsx`](app/api/og/route.tsx) | on-demand Edge Function (fallback) |

| Query (fallback route) | Result |
| --- | --- |
| `/api/og` | brand card: logo, tagline, live catalog counters |
| `/api/og?slug=<artwork>` | artwork card: title, technique, price, availability, photo |
| `/api/og?title=…&subtitle=…&eyebrow=…&price=…&badge=…` | custom text card (all values sanitised + truncated) |

Wiring: pages declare their card by name, never by inline params, so a card
cannot silently fall back to the dynamic route —

```ts
import { OG_CARD_ALTS, OG_PAGE_CARDS, socialMetadata } from "@/lib/og";

export const metadata: Metadata = {
  title: "Galeria prac",
  ...socialMetadata(OG_PAGE_CARDS.galeria, OG_CARD_ALTS.galeria),
};
```

Artwork pages pass `ogWorkCard(art.slug)`, which renders from the same catalog
entry (`lib/art.ts`) as the page itself. Root metadata (OG + Twitter card type,
`og:image:alt`, dimensions) is set in [`app/layout.tsx`](app/layout.tsx);
`metadataBase`, `sitemap.xml` and `robots.txt` all resolve the origin in
[`lib/site.ts`](lib/site.ts) (`NEXT_PUBLIC_SITE_URL` → Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`). `robots.txt` explicitly keeps `/api/og`
fetchable for social crawlers.

Adding a card: append an entry to `OG_CATALOG` (id + params + label) and
reference it from the page. Removing one: its PNG is deleted on the next
`npm run og`.

Notes:

- Static and dynamic renders come from the same React tree and are
  byte-identical on the same host; the only intentional difference is the footer
  label — the Edge route prints the public hostname, the PNGs print the studio
  label, so a static file never bakes in a host that can change between deploys.
- `next.config.ts` serves `/og/*` with the same `Cache-Control` the Edge route
  used (`max-age=3600, s-maxage=86400, stale-while-revalidate=604800`).
- `app/sitemap.ts` advertises every URL's card as an `<image:image>` entry, so
  Google Images can pick them up straight from the sitemap.
- Each card carries its own `og:image:alt` (`OG_CARD_ALTS`); artwork pages build
  theirs from the work's title and technique.
- The generator verifies each PNG (signature, 1200×630, non-trivial size),
  checks that every catalogue entry maps to the URL the pages actually request,
  and deletes files whose entry is gone. A broken render fails the build instead
  of shipping a placeholder.
- It is incremental: a card is re-rendered only when `lib/`, `public/works/` or
  the script itself are newer than the PNG (`npm run og -- --force` overrides).
- `npm run og:check` verifies without writing: every catalogue card exists and is
  a valid 1200×630 PNG, every entry maps to the URL the pages request, and no
  prerendered page in `.next/server/app` still points at `/api/og`. Exits 1 on any
  problem — drop it into CI or run it after a fresh clone.
- `public/og/` is a build artifact (~5.4 MB, git-ignored). Commit it only if the
  site must be served without running the build — e.g. a plain static host.
- Card images must be readable at render time; the static generator embeds
  catalog photos as `data:` URIs from `public/`, while the Edge route fetches
  them from its own origin. SVG catalog artwork is replaced by an engraved plate
  placeholder, and missing photos degrade gracefully.
- Long titles are clamped (max 120 chars, auto font-size tiers), so the layout
  cannot overflow.

## Layout

```
app/            pages (landing, /agi public pages, login, admin dashboard/services/proposals) + API routes
app/api/og/     on-demand Open Graph card generator (Edge Function, fallback)
components/     client components (forms, vote/check buttons, CRUD controls) + server components (ClaimBadge, AgiPageHead)
lib/            db.ts (schema+seed), auth.ts (scrypt/HMAC), session.ts, proposals.ts, http.ts, agi-content.ts, art.ts (catalog), og.ts (social cards)
legacy/         the original static landing page
data/           SQLite database (created at runtime, git-ignored)
rnd/, scripts/  pre-existing fleet-pulse tooling (unchanged)
```

## Deployment (Vercel)

Configuration lives in [`vercel.json`](vercel.json): `installCommand` is
`npm ci --include=dev` because `prebuild` needs `tsx` to render the static
social cards — without devDependencies the build exits 127 before Next even
compiles. Node must be **22.x** (the app uses `node:sqlite`).

```
npm run build   # prebuild → cards, build → Next, postbuild → og:check
```

Vercel has not deployed anything since 2 October 2026 while `main` keeps
moving, so the trigger — not the code — is broken. Diagnosis, the dashboard
checklist, a GitHub Actions deploy fallback and the one open landmine (SQLite
does not survive serverless) are written up in
[`docs/vercel-deploy.md`](docs/vercel-deploy.md).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `BRIDGE_SESSION_SECRET` | HMAC key for session cookies (required in production) |
| `BRIDGE_ADMIN_USERNAME` / `BRIDGE_ADMIN_PASSWORD` | bootstrap admin, used only at first seed |
| `NEXT_PUBLIC_SITE_URL` | absolute origin for canonical + OG image URLs (on Vercel it falls back to `VERCEL_PROJECT_PRODUCTION_URL`) |

## Operator

Zbigniew Szymon Kołacz · phantom@angelguardian.tech

**Ad Astra Una** — ConstitutionalAudit: SMA-WEB-DEPLOY-20260817 · FOCUSMODE / AGENTOPS · No Pinky