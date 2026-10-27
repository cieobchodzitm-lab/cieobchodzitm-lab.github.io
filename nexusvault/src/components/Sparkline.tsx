import { useMemo } from "react";
import { priceSeries } from "../lib/crypto-demo";

type SparklineProps = {
  seed: string;
  points?: number;
  accent?: string;
  width?: number;
  height?: number;
};

/** Malutki wykres „cenowy" — random walk wyprowadzony z ziarna, bez danych z sieci. */
export function Sparkline({
  seed,
  points = 40,
  accent = "#7c5cff",
  width = 240,
  height = 56,
}: SparklineProps) {
  const geometry = useMemo(() => {
    const series = priceSeries(seed, points);
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = max - min || 1;
    const stepX = width / Math.max(1, series.length - 1);

    const coords = series.map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / span) * (height - 6) - 3;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const first = series[0] ?? 1;
    const last = series[series.length - 1] ?? 1;

    return {
      line: coords.join(" "),
      area: `0,${height} ${coords.join(" ")} ${width},${height}`,
      change: (last - first) / first,
    };
  }, [seed, points, width, height]);

  const stroke = geometry.change >= 0 ? "#2ac9a3" : "#ff6b6b";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Wykres cenowy, zmiana ${(geometry.change * 100).toFixed(2)}%`}
    >
      <defs>
        <linearGradient id={`spark-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={geometry.area} fill={`url(#spark-${seed})`} />
      <polyline
        points={geometry.line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={width} cy="0" r="0" fill={accent} />
    </svg>
  );
}
