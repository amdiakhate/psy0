/**
 * Illustration statique d'Airways : un bloc de 6 lignes, zone grise EN ESCALIER,
 * compteurs saturés, et le choix « petite croix vs grosse croix ».
 */
export function AirwaysTip() {
  const CELL = 26;
  const ROW = 26;
  const cols = 18;
  // Zone en escalier : lignes 0-2 sur [7,10], lignes 3-5 sur [9,12].
  const span = (line: number) => (line < 3 ? { start: 7, end: 10 } : { start: 9, end: 12 });

  const planes = [
    { col: 8, line: 0, color: '#38bdf8', dir: 'left' },
    { col: 10, line: 2, color: '#38bdf8', dir: 'left' },
    { col: 14, line: 4, color: '#38bdf8', dir: 'left', danger: true },
    { col: 9, line: 3, color: '#7c3aed', dir: 'right' },
    { col: 3, line: 5, color: '#7c3aed', dir: 'right' },
  ];

  return (
    <div>
      <p className="text-sm text-zinc-300">
        Situation critique figée : la zone grise contient déjà{' '}
        <span className="font-semibold text-sky-300">2 bleus (2/2)</span>. Le bleu cerclé de rouge
        entre en zone dans 3 cases — s’il arrive avant qu’un autre sorte,{' '}
        <span className="font-semibold text-red-400">accident</span>.
      </p>
      <div className="mx-auto mt-4 max-w-xl">
        <div className="mb-1 flex justify-center gap-1 font-mono text-sm">
          <span className="rounded-md border border-amber-500 bg-amber-950/40 px-3 py-0.5 text-amber-300">2/2 ◀</span>
          <span className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-0.5 text-zinc-300">3/4 ◀▶</span>
        </div>
        <div className="flex items-stretch gap-1">
          {/* Grosse croix violette */}
          <div className="flex w-8 items-center justify-center rounded-lg bg-violet-500">
            <svg width="22" height="22" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="15" fill="none" stroke="var(--ink-0)" strokeWidth="2.5" />
              <path d="M10,10 L24,24 M24,10 L10,24" stroke="var(--ink-0)" strokeWidth="2.5" />
            </svg>
          </div>
          <svg viewBox={`0 0 ${cols * CELL} ${6 * ROW}`} className="flex-1 rounded border border-zinc-600 bg-zinc-100">
            {Array.from({ length: 6 }, (_, line) => {
              const s = span(line);
              return (
                <rect key={line} x={s.start * CELL} y={line * ROW} width={(s.end - s.start + 1) * CELL} height={ROW} fill="var(--ink-400)" opacity={0.5} />
              );
            })}
            {Array.from({ length: cols + 1 }, (_, c) => (
              <line key={`c${c}`} x1={c * CELL} y1={0} x2={c * CELL} y2={6 * ROW} stroke="var(--ink-300)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 7 }, (_, r) => (
              <line key={`r${r}`} x1={0} y1={r * ROW} x2={cols * CELL} y2={r * ROW} stroke="var(--ink-400)" strokeWidth={0.7} />
            ))}
            {planes.map((p, i) => {
              const cx = p.col * CELL + CELL / 2;
              const cy = p.line * ROW + ROW / 2;
              const s = 8;
              const points =
                p.dir === 'left'
                  ? `${cx - s},${cy} ${cx + s},${cy - s * 0.85} ${cx + s},${cy + s * 0.85}`
                  : `${cx + s},${cy} ${cx - s},${cy - s * 0.85} ${cx - s},${cy + s * 0.85}`;
              return (
                <g key={i}>
                  <polygon points={points} fill={p.color} />
                  {p.danger && <circle cx={cx} cy={cy} r={13} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 3" />}
                </g>
              );
            })}
            {/* Petites croix bleues sur les lignes contenant un bleu */}
            {[0, 2, 4].map((line) => (
              <g key={line}>
                <rect x={(cols - 1) * CELL} y={line * ROW} width={CELL} height={ROW} fill="#7dd3fc" />
                <circle cx={(cols - 0.5) * CELL} cy={line * ROW + ROW / 2} r={7} fill="none" stroke="var(--ink-0)" strokeWidth={1.5} />
                <path
                  d={`M${(cols - 0.5) * CELL - 4},${line * ROW + ROW / 2 - 4} l8,8 M${(cols - 0.5) * CELL + 4},${line * ROW + ROW / 2 - 4} l-8,8`}
                  stroke="var(--ink-0)"
                  strokeWidth={1.5}
                />
              </g>
            ))}
          </svg>
          {/* Grosse croix bleue */}
          <div className="flex w-8 items-center justify-center rounded-lg bg-sky-300">
            <svg width="22" height="22" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="15" fill="none" stroke="var(--ink-0)" strokeWidth="2.5" />
              <path d="M10,10 L24,24 M24,10 L10,24" stroke="var(--ink-0)" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">
        <li>
          <span className="font-semibold text-sky-300">Le bon geste</span> : la petite croix de la
          ligne du bleu cerclé — coût 1 avion, la série continue.
        </li>
        <li>
          <span className="font-semibold text-red-400">Le mauvais geste</span> : la grosse croix bleue
          à droite — elle déroute les 3 bleus d’un coup. Pas d’accident, mais le score de stratégie
          s’effondre.
        </li>
        <li>
          <span className="font-semibold text-zinc-300">L’escalier</span> : la zone grise des lignes
          4-6 est décalée de 2 cases vers la droite. Un avion « au niveau » de la zone d’une autre
          ligne n’est pas forcément dans la sienne.
        </li>
      </ul>
    </div>
  );
}
