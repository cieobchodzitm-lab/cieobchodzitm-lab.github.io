/**
 * Single source of truth for the site's absolute origin (canonical URLs,
 * Open Graph images, sitemap, robots).
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL`               — set for a custom domain.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL`      — the project's production host.
 *   3. `VERCEL_URL`                         — per-deployment host (previews).
 *   4. the current production deployment    — last-resort default.
 *
 * The host MUST run this app: `/api/og` is an Edge Function that renders the
 * social cards on demand.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://cieobchodzitm-labgithubio.vercel.app");

/** `SITE_URL` with any trailing slash removed, e.g. for template strings. */
export const SITE_ORIGIN = SITE_URL.replace(/\/+$/, "");
