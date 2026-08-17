import { useMemo } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { StackingAnswer, StackingQuestion } from './generator';
import { Choices } from '../../components/Choices';
import { PolycubeSvg, commonWorldSize } from './PolycubeSvg';

export function StackingExercise({
  item,
  onAnswer,
}: ExerciseComponentProps<StackingQuestion, StackingAnswer>) {
  const q = item.question;
  // Échelle commune : les cubes ont la même taille sur les trois empilements.
  const world = useMemo(() => commonWorldSize(q.stacks), [q.stacks]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <p className="max-w-2xl text-center text-xl font-bold text-zinc-100">
        Deux empilements sont <span className="text-sky-400">identiques à une rotation près</span>.
        Lequel a subi la <span className="text-red-400">symétrie</span> ?
      </p>

      <div className="flex flex-wrap items-start justify-center gap-6">
        {q.stacks.map((shape, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2">
              <PolycubeSvg shape={shape} world={world} px={150} />
            </div>
            <span className="rounded bg-zinc-800 px-2.5 py-0.5 font-mono text-sm text-sky-400 border border-zinc-600">
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        <Choices
          columns={3}
          options={q.stacks.map((_, i) => (
            <span key={i}>Empilement {i + 1}</span>
          ))}
          onPick={onAnswer}
        />
      </div>
    </div>
  );
}
