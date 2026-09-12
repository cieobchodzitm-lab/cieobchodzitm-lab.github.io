# Stoic Matrix AI — THE BRIDGE

Full-stack admin & governance console for **Stoic Matrix AI** / Angel Guardian Technologies.
Replaces the earlier static landing page (preserved in [`legacy/`](legacy/index.html)).

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
app/            pages (landing, login, admin dashboard/services/proposals) + API routes
components/     client components (forms, vote/check buttons, CRUD controls)
lib/            db.ts (schema+seed), auth.ts (scrypt/HMAC), session.ts, proposals.ts, http.ts
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