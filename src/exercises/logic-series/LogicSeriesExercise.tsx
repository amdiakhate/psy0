import type { ExerciseComponentProps } from '../../core/types';
import type { FigDesc, LogicAnswer, LogicQuestion } from './generator';
import { Choices } from '../../components/Choices';

/** Rendu SVG partagé d'une description figurale (le générateur ne produit que la description). */
export function FigSvg({ desc, size = 72 }: { desc: FigDesc; size?: number }) {
  const r = { s: 8, m: 12, l: 16 }[desc.size];
  const positions: [number, number][] =
    desc.count === 1
      ? [[48, 48]]
      : desc.count === 2
        ? [
            [30, 48],
            [66, 48],
          ]
        : [
            [48, 28],
            [30, 66],
            [66, 66],
          ];
  const fill = desc.filled ? '#7dd3fc' : 'none';
  const stroke = desc.filled ? '#7dd3fc' : '#e4e4e7';

  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden>
      {positions.map(([cx, cy], i) => {
        const transform = desc.rotation !== 0 ? `rotate(${desc.rotation} ${cx} ${cy})` : undefined;
        if (desc.shape === 'circle') {
          return <circle key={i} cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2} />;
        }
        if (desc.shape === 'square') {
          return (
            <rect
              key={i}
              x={cx - r}
              y={cy - r}
              width={2 * r}
              height={2 * r}
              fill={fill}
              stroke={stroke}
              strokeWidth={2}
              transform={transform}
            />
          );
        }
        const h = r * 0.866;
        const points = `${cx},${cy - r} ${cx - h},${cy + r / 2} ${cx + h},${cy + r / 2}`;
        return <polygon key={i} points={points} fill={fill} stroke={stroke} strokeWidth={2} transform={transform} />;
      })}
    </svg>
  );
}

/** Rappel permanent du barème : c'est LA consigne stratégique de l'épreuve. */
export function PenaltyBanner() {
  return (
    <p className="rounded-lg border border-amber-900/60 bg-amber-950/20 px-4 py-2 text-center text-sm text-amber-300">
      Bonne réponse <span className="font-semibold">+1</span> · mauvaise réponse{' '}
      <span className="font-semibold">−1/3</span> · ne réponds pas au hasard
    </p>
  );
}

export function LogicSeriesExercise({ item, onAnswer }: ExerciseComponentProps<LogicQuestion, LogicAnswer>) {
  const q = item.question;

  if (q.format === 'numeric' || q.format === 'letters') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8">
        <PenaltyBanner />
        <p className="font-mono text-4xl font-bold tabular-nums tracking-wide md:text-5xl">
          {q.terms.join(' , ')}
          <span className="text-sky-400">{' , ?'}</span>
        </p>
        <div className="w-full max-w-xl">
          <Choices
            options={q.options.map((o, i) => (
              <span key={i} className="font-mono text-2xl font-bold tabular-nums">
                {o}
              </span>
            ))}
            onPick={(i) => onAnswer(String(i))}
            columns={4}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-7">
      <PenaltyBanner />
      <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        {q.cells.map((cell, i) => (
          <div
            key={i}
            className="flex h-20 w-20 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 md:h-24 md:w-24"
          >
            <FigSvg desc={cell} />
          </div>
        ))}
        <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-sky-700 bg-zinc-900 md:h-24 md:w-24">
          <span className="text-4xl font-bold text-sky-400">?</span>
        </div>
      </div>
      <div className="w-full max-w-xl">
        <Choices
          options={q.options.map((o, i) => (
            <FigSvg key={i} desc={o} size={56} />
          ))}
          onPick={(i) => onAnswer(String(i))}
          columns={4}
        />
      </div>
    </div>
  );
}
