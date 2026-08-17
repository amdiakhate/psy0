/** Mini-courbe inline (précision 0-1 par jour). SVG pur : léger et sans dépendance. */
export function Sparkline({ values, width = 90, height = 24 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) {
    return <span className="text-xs text-zinc-600">—</span>;
  }
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * (width - 4) + 2},${height - 2 - v * (height - 4)}`)
    .join(' ');
  const up = values[values.length - 1] >= values[0];
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline points={points} fill="none" stroke={up ? '#4ade80' : '#f87171'} strokeWidth={1.5} />
    </svg>
  );
}
