/**
 * Les schémas des techniques de calcul mental.
 *
 * Une règle comme « les dizaines se complètent à 9 » est incompréhensible tant
 * qu'on ne VOIT pas d'où sort le 9. Trois formes suffisent à couvrir les dix-neuf
 * techniques, parce qu'il n'y a que trois gestes derrière : avancer par bonds,
 * découper un nombre en morceaux, ou comparer deux écritures.
 */

export type Diagram =
  /** Bonds successifs sur une droite : compléments, arrondir-compenser, distances. */
  | { kind: 'bonds'; from: number; to: number; stops: Array<{ at: number; note: string }>; caption: string }
  /** Un calcul découpé en morceaux qui se recomposent. */
  | { kind: 'decoupe'; source: string; parts: Array<{ label: string; value: string }>; total: string; caption: string }
  /** Deux écritures mises face à face — le cœur des techniques de vérification. */
  | { kind: 'face'; rows: Array<{ label: string; left: string; right: string; verdict?: 'ok' | 'ko' }>; caption: string };

const INK = '#a1a1aa';

function Bonds({ d }: { d: Extract<Diagram, { kind: 'bonds' }> }) {
  const W = 560;
  const H = 96;
  const pad = 40;
  const span = d.to - d.from || 1;
  const x = (v: number) => pad + ((v - d.from) / span) * (W - 2 * pad);
  const marks = [{ at: d.from, note: '' }, ...d.stops];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={d.caption}>
      <line x1={pad} y1={62} x2={W - pad} y2={62} stroke={INK} strokeWidth={1.5} />
      {marks.map((m, i) => {
        const next = marks[i + 1];
        if (!next) return null;
        const x1 = x(m.at);
        const x2 = x(next.at);
        const mid = (x1 + x2) / 2;
        // Un arc par bond : c'est le geste qu'on fait dans sa tête, un saut à la fois.
        return (
          <g key={i}>
            <path
              d={`M${x1} 58 Q${mid} ${20 + (i % 2) * 8} ${x2} 58`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <text x={mid} y={{ 0: 26, 1: 34 }[i % 2]} textAnchor="middle" fontSize={15} fontWeight={700} fill="#7dd3fc">
              {next.note}
            </text>
          </g>
        );
      })}
      {marks.map((m, i) => (
        <g key={`m${i}`}>
          <line x1={x(m.at)} y1={56} x2={x(m.at)} y2={68} stroke={INK} strokeWidth={2} />
          <text x={x(m.at)} y={86} textAnchor="middle" fontSize={15} fill="#e4e4e7" fontWeight={600}>
            {m.at}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Decoupe({ d }: { d: Extract<Diagram, { kind: 'decoupe' }> }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-mono text-2xl font-bold text-zinc-100">{d.source}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {d.parts.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-lg text-zinc-600">+</span>}
            <div className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-2 text-center">
              <p className="font-mono text-lg font-bold text-sky-200">{p.value}</p>
              <p className="text-[11px] text-sky-500">{p.label}</p>
            </div>
          </div>
        ))}
        <span className="text-lg text-zinc-600">=</span>
        <p className="rounded-lg border border-green-800 bg-green-950/30 px-3 py-2 font-mono text-lg font-bold text-green-300">
          {d.total}
        </p>
      </div>
    </div>
  );
}

function Face({ d }: { d: Extract<Diagram, { kind: 'face' }> }) {
  return (
    <div className="w-full max-w-lg space-y-1.5">
      {d.rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
          <span className="w-32 shrink-0 text-xs uppercase tracking-wide text-zinc-500">{r.label}</span>
          <span className="font-mono text-lg text-zinc-100">{r.left}</span>
          <span className="text-zinc-600">→</span>
          <span
            className={`font-mono text-lg font-bold ${
              r.verdict === 'ko' ? 'text-red-300' : r.verdict === 'ok' ? 'text-green-300' : 'text-sky-200'
            }`}
          >
            {r.right}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TechniqueDiagram({ diagram }: { diagram: Diagram }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
      {diagram.kind === 'bonds' && <Bonds d={diagram} />}
      {diagram.kind === 'decoupe' && <Decoupe d={diagram} />}
      {diagram.kind === 'face' && <Face d={diagram} />}
      <p className="mt-1 max-w-xl text-center text-sm text-zinc-400">{diagram.caption}</p>
    </div>
  );
}
