import { useMemo } from 'react';
import type { ExplainProps } from '../../core/types';
import { PolycubeSvg, commonWorldSize } from './PolycubeSvg';
import { alignToCanonical } from './model';
import { handOf } from './signature';
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

      <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">Ce que tu avais à l’écran</p>
      <div className="mt-2 flex flex-wrap items-start justify-center gap-4">
        {q.stacks.map((shape, i) => (
          <Figure
            key={i}
            index={i}
            shape={shape}
            tilt={q.tilts[i]}
            world={world}
            px={150}
            answerIndex={q.answerIndex}
            given={answer}
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

function Figure({
  index,
  shape,
  tilt,
  world,
  px,
  answerIndex,
  given,
}: {
  index: number;
  shape: Parameters<typeof PolycubeSvg>[0]['shape'];
  tilt?: Parameters<typeof PolycubeSvg>[0]['tilt'];
  world: number;
  px: number;
  answerIndex: number;
  given: number;
}) {
  const isAnswer = index === answerIndex;
  const isGiven = index === given && given !== answerIndex;
  const border = isAnswer ? 'border-red-500' : isGiven ? 'border-amber-500' : 'border-green-600';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`rounded-lg border-2 ${border} p-1.5`} style={{ background: '#e7e5e4' }}>
        <PolycubeSvg shape={shape} tilt={tilt} world={world} px={px} />
      </div>
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
