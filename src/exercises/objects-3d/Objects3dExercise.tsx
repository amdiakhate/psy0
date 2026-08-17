import { useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { Objects3dAnswer, Objects3dQuestion } from './generator';
import { Choices } from '../../components/Choices';
import { DesertView } from './DesertView';
import { SceneMap } from './SceneMap';
import { VIEWPOINT_COUNT } from './config';

export function Objects3dExercise({
  item,
  onAnswer,
}: ExerciseComponentProps<Objects3dQuestion, Objects3dAnswer>) {
  const q = item.question;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="max-w-2xl text-center text-lg font-bold text-zinc-100">
        Depuis quel <span className="text-sky-400">point de vue</span> cette scène est-elle
        observée ?
      </p>

      <div className="flex flex-wrap items-center justify-center gap-5">
        <div className="w-[420px] max-w-full">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <DesertView objects={q.objects} viewpoint={q.viewpoint} />
          </div>
          <p className="mt-1 text-center text-xs text-zinc-500">la scène telle qu'elle est vue</p>
        </div>

        <div>
          <SceneMap objects={q.objects} highlight={hover} onPick={onAnswer} />
          <p className="mt-1 text-center text-xs text-zinc-500">
            le plan — chaque rond regarde vers le centre
          </p>
        </div>
      </div>

      <div className="w-full max-w-3xl" onMouseLeave={() => setHover(null)}>
        <Choices
          columns={4}
          options={Array.from({ length: VIEWPOINT_COUNT }, (_, k) => (
            <span key={k} onMouseEnter={() => setHover(k)} className="block">
              Point de vue {k + 1}
            </span>
          ))}
          onPick={onAnswer}
        />
      </div>
    </div>
  );
}
