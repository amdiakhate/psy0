/**
 * Illustration statique d'Airways : un groupe de 6 lignes, la bande grise
 * centrale, les compteurs à l'extérieur, et l'arbitrage qui décide de la note —
 * fermer UNE voie, ou payer cinq points pour les six.
 */
export function AirwaysTip() {
  const CELL = 26;
  const ROW = 26;
  const cols = 18;
  /** Bande centrale, colonnes 8-12, sur les lignes 0 à 4 (la 6ᵉ n'est pas couverte). */
  const ZONE = { start: 8, end: 12, lineFrom: 0, lineTo: 4 };

  const planes = [
    { col: 9, line: 0, color: '#38bdf8', dir: 'left', fast: false },
    { col: 11, line: 2, color: '#38bdf8', dir: 'left', fast: false },
    { col: 15, line: 3, color: '#38bdf8', dir: 'left', fast: true, danger: true },
    { col: 10, line: 1, color: '#7c3aed', dir: 'right', fast: false },
    { col: 3, line: 5, color: '#7c3aed', dir: 'right', fast: false, free: true },
  ];

  const triangle = (cx: number, cy: number, dir: string, offset = 0) => {
    const s = 8;
    const d = dir === 'left' ? -1 : 1;
    return `${cx + d * (s + offset)},${cy} ${cx - d * (s - offset)},${cy - s * 0.85} ${
      cx - d * (s - offset)
    },${cy + s * 0.85}`;
  };

  return (
    <div>
      <p className="text-sm text-zinc-300">
        Situation figée. La bande grise contient déjà{' '}
        <span className="font-semibold text-sky-300">2 bleus (2/2)</span> : le prochain bleu qui y
        entre déclenche l’<span className="font-semibold text-red-400">accident</span>. Le bleu
        cerclé porte un double chevron — il va deux fois plus vite et y sera dans deux pas.
      </p>

      <div className="mx-auto mt-4 flex w-full max-w-2xl items-center gap-2">
        {/* Compteurs À L'EXTÉRIEUR du groupe, comme au test. */}
        <div className="flex w-24 shrink-0 flex-col gap-1 font-mono text-xs">
          <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-center text-zinc-300">
            3/4 total
          </span>
          <span className="rounded-md border border-amber-500 bg-amber-950/40 px-2 py-0.5 text-center text-amber-300">
            2/2 ◀ bleus
          </span>
        </div>

        {/* Colonne violette : les violets entrent par la gauche. */}
        <ButtonColumn color="#8b5cf6" rowHeight={ROW} />

        <svg
          viewBox={`0 0 ${cols * CELL} ${6 * ROW}`}
          className="min-w-0 flex-1 rounded border border-zinc-600 bg-zinc-100"
        >
          <rect
            x={ZONE.start * CELL}
            y={ZONE.lineFrom * ROW}
            width={(ZONE.end - ZONE.start + 1) * CELL}
            height={(ZONE.lineTo - ZONE.lineFrom + 1) * ROW}
            fill="var(--ink-400)"
            opacity={0.5}
          />
          {Array.from({ length: cols + 1 }, (_, c) => (
            <line
              key={`c${c}`}
              x1={c * CELL}
              y1={0}
              x2={c * CELL}
              y2={6 * ROW}
              stroke="var(--ink-300)"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 7 }, (_, r) => (
            <line
              key={`r${r}`}
              x1={0}
              y1={r * ROW}
              x2={cols * CELL}
              y2={r * ROW}
              stroke="var(--ink-400)"
              strokeWidth={0.7}
            />
          ))}
          {planes.map((p, i) => {
            const cx = p.col * CELL + CELL / 2;
            const cy = p.line * ROW + ROW / 2;
            return (
              <g key={i}>
                <polygon points={triangle(cx, cy, p.dir)} fill={p.color} />
                {p.fast && <polygon points={triangle(cx, cy, p.dir, -8)} fill={p.color} opacity={0.7} />}
                {p.danger && (
                  <circle cx={cx} cy={cy} r={14} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 3" />
                )}
                {p.free && (
                  <circle cx={cx} cy={cy} r={14} fill="none" stroke="#16a34a" strokeWidth={2} strokeDasharray="4 3" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Colonne bleue : les bleus entrent par la droite. */}
        <ButtonColumn color="#7dd3fc" rowHeight={ROW} highlight={3} />
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">
        <li>
          <span className="font-semibold text-sky-300">Le bon geste</span> : le bouton bleu de la
          ligne 4, celle du bleu cerclé de rouge. Une voie fermée, 1 point, la série tient.
        </li>
        <li>
          <span className="font-semibold text-red-400">Le mauvais geste</span> : le bouton{' '}
          <span className="font-mono">×6</span> bleu — il ferme les six voies d’un coup et coûte 5
          points là où 1 suffisait. Il ne devient rentable qu’à partir de six voies à fermer.
        </li>
        <li>
          <span className="font-semibold text-amber-300">Trop tard, c’est trop tard</span> : les deux
          bleus DÉJÀ dans la bande la traverseront quoi qu’il arrive. Fermer leur voie maintenant ne
          les fait pas disparaître — ça ne fait que payer un point pour rien.
        </li>
        <li>
          <span className="font-semibold text-green-400">Le violet cerclé de vert est gratuit</span> :
          la bande ne couvre pas la ligne 6. Il n’entrera jamais dans aucun compteur, sa voie n’a
          aucune raison d’être fermée.
        </li>
      </ul>
    </div>
  );
}

function ButtonColumn({
  color,
  rowHeight,
  highlight,
}: {
  color: string;
  rowHeight: number;
  highlight?: number;
}) {
  return (
    <div className="flex w-9 shrink-0 flex-col gap-0.5">
      <div
        className="rounded-t-md py-0.5 text-center text-[10px] font-bold text-zinc-950"
        style={{ backgroundColor: color }}
      >
        ×6
      </div>
      {Array.from({ length: 6 }, (_, line) => (
        <div
          key={line}
          className="flex items-center justify-center rounded-sm text-xs font-bold text-zinc-950"
          style={{
            height: rowHeight - 2,
            backgroundColor: color,
            outline: highlight === line ? '2px solid #dc2626' : undefined,
          }}
        >
          ✕
        </div>
      ))}
    </div>
  );
}
