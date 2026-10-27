#!/usr/bin/env node
/**
 * Embeds the TTFs in `assets/fonts/` as base64 into `lib/og-fonts.ts`.
 *
 * The Open Graph card generator (`app/api/og/route.tsx`) runs as an Edge
 * Function and must not depend on an external font CDN: satori needs raw TTF
 * data, and Google Fonts serves woff2 to modern clients. Inlining keeps the
 * function self-contained (and works behind deployment protection).
 *
 * Usage:  node scripts/embed-og-fonts.mjs   (or: npm run og:fonts)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FONTS = [
  { file: "assets/fonts/cinzel-400.ttf", weight: 400 },
  { file: "assets/fonts/cinzel-700.ttf", weight: 700 },
];

const entries = FONTS.map(({ file, weight }) => {
  const base64 = readFileSync(join(root, file)).toString("base64");
  return { weight, file, base64 };
});

const output = `// GENERATED FILE — do not edit by hand.
// Run \`npm run og:fonts\` (scripts/embed-og-fonts.mjs) after changing
// assets/fonts/*.ttf. Cinzel is licensed under the SIL Open Font License,
// see assets/fonts/LICENSE.txt.

/** Cinzel (SIL OFL) as base64 TTF — self-contained fonts for the OG cards. */
export const OG_FONT_FAMILY = "Cinzel";

export const OG_FONTS_BASE64: ReadonlyArray<{ weight: 400 | 700; base64: string }> = [
${entries
  .map(
    (e) => `  {
    // ${e.file}
    weight: ${e.weight},
    base64:
      "${e.base64}",
  }`,
  )
  .join(",\n")},
];

function decode(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** Ready-to-use \`fonts\` option for \`new ImageResponse(...)\`. */
export function ogFonts() {
  return OG_FONTS_BASE64.map(({ weight, base64 }) => ({
    name: OG_FONT_FAMILY,
    data: decode(base64),
    weight,
    style: "normal" as const,
  }));
}
`;

writeFileSync(join(root, "lib/og-fonts.ts"), output, "utf8");
const bytes = entries.reduce((sum, e) => sum + e.base64.length, 0);
console.log(
  `lib/og-fonts.ts written — ${entries.length} fonts, ${Math.round(bytes / 1024)} KiB base64`,
);
