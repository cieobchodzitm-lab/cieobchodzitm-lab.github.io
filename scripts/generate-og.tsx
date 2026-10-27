/**
 * Build-time Open Graph cards.
 *
 *   npm run og              → renders every entry of `OG_CATALOG` to public/og/
 *   npm run og -- --force   → re-render everything, ignoring the cache
 *   npm run og:check        → verify without writing (CI, fresh clone, Vercel)
 *
 * The cards come from the same React tree as the `/api/og` Edge Function
 * (`lib/og-card.tsx`), so the only difference is the footer label: the Edge
 * route prints the public hostname, while these files print the studio label —
 * a static PNG must not bake in a host that can change between deploys.
 *
 * Output files are build artefacts (git-ignored). The generator is incremental:
 * a card is re-rendered only when its sources (`lib/`, `public/works/`, this
 * script) are newer than the PNG. Each file is verified before it is written —
 * a broken render fails the build instead of shipping a 1×1 placeholder.
 */
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";
import { ARTWORKS, STUDIO } from "@/lib/art";
import { OG_CATALOG } from "@/lib/og-catalog";
import { buildOgCardModel, OG_HEIGHT, OgCard, OG_WIDTH } from "@/lib/og-card";
import { ogFonts } from "@/lib/og-fonts";
import { ogCardUrl } from "@/lib/og";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "og");

/** satori can only rasterise these (SVG sources fall back to the plate). */
const RASTER_IMAGE = /\.(jpe?g|png|webp|gif)$/i;
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} kB`;
}

async function mtime(file: string): Promise<number> {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return 0;
  }
}

/** Newest mtime among the sources that change how a card looks. */
async function newestSourceMtime(): Promise<number> {
  const files = [
    path.join(ROOT, "scripts", "generate-og.tsx"),
    path.join(ROOT, "package.json"),
  ];
  for (const dir of ["lib", path.join("public", "works")]) {
    const entries = await readdir(path.join(ROOT, dir), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) files.push(path.join(ROOT, dir, entry.name));
    }
  }
  const times = await Promise.all(files.map(mtime));
  return times.reduce((a, b) => Math.max(a, b), 0);
}

/**
 * Catalog photos as `data:` URIs. The renderer never touches the network, so
 * the cards build in a sandbox and on CI without a running dev server.
 */
async function imageDataUris(): Promise<Map<string, string>> {
  const uris = new Map<string, string>();
  for (const art of ARTWORKS) {
    const src = art.image;
    if (!src.startsWith("/") || !RASTER_IMAGE.test(src)) continue;
    const mime = MIME[path.extname(src).toLowerCase()];
    if (!mime) continue;
    try {
      const bytes = await readFile(path.join(PUBLIC_DIR, src.slice(1)));
      uris.set(src, `data:${mime};base64,${bytes.toString("base64")}`);
    } catch {
      // Missing photo → the card falls back to the engraved plate.
    }
  }
  return uris;
}

/** Reject anything that is not a full-size PNG before it reaches `public/`. */
function assertValidPng(buffer: Buffer, id: string): void {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`${id}: to nie jest PNG (zły nagłówek)`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== OG_WIDTH || height !== OG_HEIGHT) {
    throw new Error(
      `${id}: wymiary ${width}×${height}, oczekiwano ${OG_WIDTH}×${OG_HEIGHT}`,
    );
  }
  if (buffer.length < 10_000) {
    throw new Error(`${id}: plik podejrzanie mały (${buffer.length} B)`);
  }
}

/**
 * Catalogue ↔ metadata integrity, without touching the filesystem: every id is
 * unique and `ogCardUrl()` (the function the pages actually call) resolves to
 * the file this generator is about to write. Catches duplicate ids, duplicate
 * params and catalogue drift — without it a page could silently fall back to
 * the `/api/og` route and nobody would notice.
 */
function verifyCatalogueIds(): string[] {
  const failures: string[] = [];
  const seenIds = new Set<string>();
  for (const entry of OG_CATALOG) {
    if (seenIds.has(entry.id)) {
      failures.push(`${entry.id}: zduplikowane id w katalogu`);
      continue;
    }
    seenIds.add(entry.id);
    const expected = `/og/${entry.id}.png`;
    const actual = ogCardUrl(entry.params);
    if (actual !== expected) {
      failures.push(
        `${entry.id}: ogCardUrl() → ${actual}, oczekiwano ${expected}`,
      );
    }
  }
  return failures;
}

/**
 * Every catalogue entry has a complete, full-size PNG on disk. Used by
 * `--check` (and after a render) so a broken card fails loudly.
 */
async function verifyFiles(): Promise<string[]> {
  const failures: string[] = [];
  for (const entry of OG_CATALOG) {
    const file = path.join(OUT_DIR, `${entry.id}.png`);
    try {
      assertValidPng(await readFile(file), entry.id);
    } catch (error) {
      failures.push(
        error instanceof Error
          ? error.message
          : `${entry.id}: ${String(error)}`,
      );
    }
  }
  return failures;
}

/** Stale PNGs: files in `public/og/` without a catalogue entry. */
async function staleFiles(): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(OUT_DIR);
  } catch {
    return [];
  }
  const keep = new Set(OG_CATALOG.map((entry) => `${entry.id}.png`));
  return names.filter((name) => name.endsWith(".png") && !keep.has(name));
}

/**
 * Proof that the static pipeline is actually wired up: scan the HTML emitted by
 * `next build` for `og:image` values that still point at the Edge route. A page
 * with custom params legitimately does that — a prerendered page must not.
 */
async function pagesStillUsingDynamicRoute(): Promise<string[] | null> {
  const appDir = path.join(ROOT, ".next", "server", "app");
  let files: string[];
  try {
    files = await readdir(appDir, { recursive: true });
  } catch {
    return null; // not built yet — nothing to check
  }
  const offenders: string[] = [];
  for (const name of files) {
    if (!name.endsWith(".html")) continue;
    const html = await readFile(path.join(appDir, name), "utf8");
    if (/content="[^"]*\/api\/og\?/.test(html)) offenders.push(name);
  }
  return offenders;
}

/** `npm run og:check` — verify the cards without rendering anything. */
async function runCheck(): Promise<void> {
  const [idFailures, fileFailures, stale, dynamic] = await Promise.all([
    Promise.resolve(verifyCatalogueIds()),
    verifyFiles(),
    staleFiles(),
    pagesStillUsingDynamicRoute(),
  ]);

  console.log(`Katalog kart: ${OG_CATALOG.length} wpisów`);
  console.log(`public/og/:   ${OG_CATALOG.length - fileFailures.length} poprawnych PNG`);
  console.log(
    `Zbudowany HTML: ${
      dynamic === null
        ? "brak builda (.next) — pominięto, uruchom `npm run build`"
        : dynamic.length === 0
          ? "sprawdzono — żadna strona nie używa /api/og"
          : `${dynamic.length} stron wciąż używa /api/og`
    }`,
  );
  if (stale.length > 0) console.log(`Nieaktualne pliki: ${stale.join(", ")}`);

  const failures = [...idFailures, ...fileFailures];
  if (dynamic && dynamic.length > 0) {
    failures.push(`strony używające /api/og: ${dynamic.join(", ")}`);
  }
  if (failures.length > 0) {
    console.error(`\nPROBLEMY:\n  ${failures.join("\n  ")}`);
    process.exitCode = 1;
  } else {
    console.log("\nWszystko w porządku — karty statyczne są kompletne.");
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  if (process.argv.includes("--check")) {
    await runCheck();
    return;
  }
  const started = Date.now();

  const [images, sourceTime] = await Promise.all([
    imageDataUris(),
    newestSourceMtime(),
  ]);
  await mkdir(OUT_DIR, { recursive: true });

  const fonts = ogFonts();
  const hostLabel = `${STUDIO.name} · ${STUDIO.city}`;
  const rows: { id: string; label: string; size: string; status: string }[] = [];
  const failures: string[] = verifyCatalogueIds();
  let generated = 0;
  let cached = 0;

  for (const entry of OG_CATALOG) {
    const file = path.join(OUT_DIR, `${entry.id}.png`);
    const outputTime = await mtime(file);

    if (!force && outputTime > 0 && outputTime >= sourceTime) {
      rows.push({
        id: entry.id,
        label: entry.label,
        size: formatSize((await stat(file)).size),
        status: "aktualna",
      });
      cached += 1;
      continue;
    }

    try {
      const model = buildOgCardModel(entry.params, {
        hostLabel,
        resolveImage: (src) => images.get(src) ?? null,
      });

      const response = new ImageResponse(<OgCard model={model} />, {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        emoji: "twemoji",
        fonts,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      assertValidPng(buffer, entry.id);
      await writeFile(file, buffer);

      rows.push({
        id: entry.id,
        label: entry.label,
        size: formatSize(buffer.length),
        status: "wygenerowana",
      });
      generated += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${entry.id}: ${message}`);
      rows.push({
        id: entry.id,
        label: entry.label,
        size: "—",
        status: "BŁĄD",
      });
    }
  }

  // Drop PNGs whose catalogue entry is gone (renamed work, removed page).
  const keep = new Set(OG_CATALOG.map((entry) => `${entry.id}.png`));
  const removed: string[] = [];
  for (const name of await readdir(OUT_DIR)) {
    if (name.endsWith(".png") && !keep.has(name)) {
      await rm(path.join(OUT_DIR, name));
      removed.push(name);
    }
  }

  const width = Math.max(...rows.map((row) => row.label.length));
  for (const row of rows) {
    console.log(
      `  ${row.label.padEnd(width)}  ${row.status.padEnd(12)} ${row.id}.png ${row.size}`,
    );
  }

  const total = await Promise.all(
    rows
      .filter((row) => row.status !== "BŁĄD")
      .map(async (row) => (await stat(path.join(OUT_DIR, `${row.id}.png`))).size),
  );
  const totalSize = total.reduce((a, b) => a + b, 0);

  console.log(
    `\nKarty OG: ${generated} wygenerowanych, ${cached} aktualnych, ` +
      `${rows.length} razem · ${formatSize(totalSize)} w public/og/` +
      `${removed.length ? ` · usunięto nieaktualne: ${removed.join(", ")}` : ""}` +
      ` · ${((Date.now() - started) / 1000).toFixed(1)} s`,
  );

  if (failures.length > 0) {
    console.error(`\nBłędy generowania kart OG:\n  ${failures.join("\n  ")}`);
    process.exitCode = 1;
  }
}

// No top-level `await`: the package is CommonJS, so the script is transpiled to
// CJS where top-level await is unavailable.
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
