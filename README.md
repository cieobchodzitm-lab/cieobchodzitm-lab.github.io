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

## Layout

```
app/            pages (landing, /agi public pages, login, admin dashboard/services/proposals) + API routes
components/     client components (forms, vote/check buttons, CRUD controls) + server components (ClaimBadge, AgiPageHead)
lib/            db.ts (schema+seed), auth.ts (scrypt/HMAC), session.ts, proposals.ts, http.ts, agi-content.ts
legacy/         the original static landing page
data/           SQLite database (created at runtime, git-ignored)
rnd/, scripts/  pre-existing fleet-pulse tooling (unchanged)
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `BRIDGE_SESSION_SECRET` | HMAC key for session cookies (required in production) |
| `BRIDGE_ADMIN_USERNAME` / `BRIDGE_ADMIN_PASSWORD` | bootstrap admin, used only at first seed |

## Operator

Zbigniew Szymon Kołacz · phantom@angelguardian.tech

**Ad Astra Una** — ConstitutionalAudit: SMA-WEB-DEPLOY-20260817 · FOCUSMODE / AGENTOPS · No Pinky