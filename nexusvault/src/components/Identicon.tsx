import { useMemo } from "react";
import { identiconCells, paletteFor } from "../lib/crypto-demo";

/**
 * Identyfikator portfela z ziarna: 5×5 komórek z symetrią w poziomie,
 * jak w prawdziwych portfelach. Czysto dekoracyjny — nie jest to żaden
 * prawdziwy identikon kryptograficzny.
 */
export function Identicon({ seed, size = 34 }: { seed: string; size?: number }) {
  const cells = useMemo(() => identiconCells(seed), [seed]);
  const [from, to] = useMemo(() => paletteFor(seed), [seed]);

  return (
    <div
      className="identicon"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {cells.map((filled, index) => (
        <span
          key={index}
          style={{
            background: filled ? "rgba(255,255,255,0.92)" : "transparent",
          }}
        />
      ))}
    </div>
  );
}
