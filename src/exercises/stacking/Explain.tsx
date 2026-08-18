import { useMemo } from 'react';
import type { ExplainProps } from '../../core/types';
import { PolycubeSvg, commonWorldSize } from './PolycubeSvg';
import { alignToCanonical, cellCenterOf, projectPoint } from './model';
import type { Mat3, Shape } from './model';
import { findTrihedron, handOf, tracedSign } from './signature';
import type { StackingQuestion } from './generator';

/**
 * Correction visuelle des Empilements.
 *
 * La difficulté de l'exercice tient entièrement au BRUIT D'ORIENTATION : les
 * trois figures sont basculées d'angles quelconques, donc la paire ne se voit
 * pas. La correction fait ce que l'œil ne peut pas faire sous chrono — elle
 * retire ce bruit.
 *
 * Deuxième rangée : les trois figures remises dans la même orientation
 * canonique. Les deux qui ne diffèrent que d'une rotation deviennent alors
 * IDENTIQUES au pixel près, et le symétrique reste visiblement différent. Ce
 * n'est pas une illustration, c'est une démonstration : `alignToCanonical` est
 * prouvée invariante par rotation et distincte pour le miroir.
 */
export function StackingExplain({ item, answer }: ExplainProps<StackingQuestion, number>) {
  const q = item.question;
  const world = commonWorldSize(q.stacks, q.tilts);
  const aligned = useMemo(() => q.stacks.map(alignToCanonical), [q.stacks]);
  const alignedWorld = useMemo(() => commonWorldSize(aligned), [aligned]);
  const hands = useMemo(() => q.stacks.map(handOf), [q.stacks]);
  const pair = [0, 1, 2].filter((i) => i !== q.answerIndex);

  /**
   * Le repère n'est dessiné que s'il DIT VRAI sur cet item précis : le sens lu
   * sur chaque figure doit coller à sa main réelle. C'est un garde-fou en plus
   * des tests — sur une figure trop symétrique le repère refuse de se prononcer,
   * et mieux vaut ne rien tracer qu'un trio de flèches qui désigne à côté.
   */
  const traced = useMemo(() => {
    const signs = q.stacks.map(tracedSign);
    if (signs.some((s) => s === null)) return null;
    const coherent = q.stacks.every((cells, i) => signs[i]! * handOf(cells) === signs[0]! * handOf(q.stacks[0]));
    return coherent ? (signs as (-1 | 1)[]) : null;
  }, [q.stacks]);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-zinc-300">
        La réponse était l’empilement{' '}
        <span className="font-semibold text-red-400">{q.answerIndex + 1}</span>
        {answer !== q.answerIndex && (
          <>
            , tu as répondu <span className="font-semibold text-amber-400">{answer + 1}</span>
          </>
        )}
        .
      </p>

      <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">
        {traced ? 'La méthode, tracée sur tes figures' : 'Ce que tu avais à l’écran'}
      </p>
      {traced && (
        <p className="mt-1 text-sm text-zinc-400">
          Pars du <span className="text-sky-300">bout du plus long bras</span> ①, puis les deux
          décrochages ② et ③, toujours dans cet ordre. Pouce sur ①, index sur ②, majeur sur ③ : si
          ta main droite fait le geste sans se tordre, la figure est « main droite ». Cette main ne
          change pas quand la figure tourne — elle s’inverse seulement par symétrie. Deux mains
          identiques forment la paire ; la troisième est la réponse.
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-start justify-center gap-4">
        {q.stacks.map((shape, i) => (
          <Figure
            key={i}
            index={i}
            shape={shape}
            tilt={q.tilts[i]}
            world={world}
            px={165}
            answerIndex={q.answerIndex}
            given={answer}
            hand={traced ? traced[i] : undefined}
            showTrihedron={traced !== null}
          />
        ))}
      </div>

      <p className="mt-6 text-xs uppercase tracking-widest text-zinc-500">
        Les mêmes, remises dans la même orientation
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-center gap-4">
        {aligned.map((shape, i) => (
          <Figure
            key={i}
            index={i}
            shape={shape}
            world={alignedWorld}
            px={150}
            answerIndex={q.answerIndex}
            given={answer}
          />
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200">
        Débarrassées du basculement, les figures{' '}
        <span className="font-semibold text-green-400">
          {pair[0] + 1} et {pair[1] + 1}
        </span>{' '}
        sont exactement le même dessin : c’est le même objet, simplement tourné. La{' '}
        <span className="font-semibold text-red-400">{q.answerIndex + 1}</span> ne peut pas leur être
        superposée, quelle que soit la rotation — c’est elle qui a subi la symétrie.
        <span className="mt-2 block text-zinc-400">
          Main de chaque figure : {hands.map((h, i) => `${i + 1} → ${h > 0 ? 'droite' : 'gauche'}`).join(' · ')}.
          Deux mains identiques forment la paire ; la troisième est la réponse.
        </span>
      </p>
    </div>
  );
}

const ROLE_COLORS = ['#2f7fd6', '#e07a1a', '#1f9e52'];

/** Les trois flèches du repère, projetées sur la figure telle qu'elle est affichée. */
function Trihedron({ cells, tilt }: { cells: Shape; tilt?: Mat3 }) {
  const t = findTrihedron(cells);
  if (t === null) return null;
  const at = (i: number) => projectPoint(cellCenterOf(cells[i]), tilt);
  const legs: Array<{ from: [number, number]; to: [number, number]; color: string; label: string }> = [
    { from: at(t.anchorIndex), to: at(t.armIndices[t.armIndices.length - 1]), color: ROLE_COLORS[0], label: '1' },
    { from: at(t.firstBaseIndex), to: at(t.firstIndex), color: ROLE_COLORS[1], label: '2' },
    { from: at(t.secondBaseIndex), to: at(t.secondIndex), color: ROLE_COLORS[2], label: '3' },
  ];
  return (
    <g>
      {legs.map((leg, i) => {
        const [x1, y1] = leg.from;
        const [x2, y2] = leg.to;
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;
        const tipX = x2 + ux * 0.28;
        const tipY = y2 + uy * 0.28;
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={tipX}
              y2={tipY}
              stroke="#111"
              strokeWidth={0.17}
              strokeLinecap="round"
            />
            <line
              x1={x1}
              y1={y1}
              x2={tipX}
              y2={tipY}
              stroke={leg.color}
              strokeWidth={0.1}
              strokeLinecap="round"
            />
            <circle cx={tipX} cy={tipY} r={0.19} fill={leg.color} stroke="#111" strokeWidth={0.04} />
            <text
              x={tipX}
              y={tipY}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fff"
              style={{ fontSize: 0.26, fontWeight: 700 }}
            >
              {leg.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Figure({
  index,
  shape,
  tilt,
  world,
  px,
  answerIndex,
  given,
  hand,
  showTrihedron = false,
}: {
  index: number;
  shape: Shape;
  tilt?: Mat3;
  world: number;
  px: number;
  answerIndex: number;
  given: number;
  hand?: -1 | 1;
  showTrihedron?: boolean;
}) {
  const isAnswer = index === answerIndex;
  const isGiven = index === given && given !== answerIndex;
  const border = isAnswer ? 'border-red-500' : isGiven ? 'border-amber-500' : 'border-green-600';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`rounded-lg border-2 ${border} p-1.5`} style={{ background: '#e7e5e4' }}>
        <PolycubeSvg shape={shape} tilt={tilt} world={world} px={px}>
          {showTrihedron ? <Trihedron cells={shape} tilt={tilt} /> : null}
        </PolycubeSvg>
      </div>
      {hand !== undefined && (
        <span className="rounded-full border border-zinc-600 px-2.5 py-0.5 text-[11px] text-zinc-300">
          main {hand > 0 ? 'droite' : 'gauche'}
        </span>
      )}
      <span className="rounded border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 font-mono text-sm text-sky-400">
        {index + 1}
      </span>
      <span
        className={`text-xs ${isAnswer ? 'text-red-400' : isGiven ? 'text-amber-400' : 'text-green-400'}`}
      >
        {isAnswer ? 'le symétrique' : isGiven ? 'ton choix' : 'la paire'}
      </span>
    </div>
  );
}
