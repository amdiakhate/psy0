import type { ExerciseComponentProps } from '../../core/types';
import type { Objects3dAnswer, Objects3dQuestion } from './generator';
import { DesertView } from './DesertView';
import { SceneMap } from './SceneMap';

/**
 * La réponse se donne UNIQUEMENT en cliquant le rond sur la vue aérienne,
 * comme sur Pilotest : « cliquez sur le rond numéroté correspondant ».
 *
 * Une version antérieure doublait la carte d'un QCM « Point de vue 1…8 ».
 * C'était plus facile que l'original : lire une liste de numéros dispense de
 * situer soi-même la position dans le cercle, or c'est précisément le geste
 * mental que l'exercice mesure.
 */
export function Objects3dExercise({
  item,
  onAnswer,
}: ExerciseComponentProps<Objects3dQuestion, Objects3dAnswer>) {
  const q = item.question;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="max-w-2xl text-center text-lg font-bold text-zinc-100">
        Sur la vue aérienne, clique l'emplacement d'où la{' '}
        <span className="text-sky-400">photo</span> a été prise.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-5">
        <div className="w-[420px] max-w-full">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <DesertView objects={q.objects} viewpoint={q.viewpoint} />
          </div>
          <p className="mt-1 text-center text-xs text-zinc-500">la scène telle qu'elle est vue</p>
        </div>

        <div>
          <SceneMap objects={q.objects} highlight={null} onPick={onAnswer} />
          <p className="mt-1 text-center text-xs text-zinc-500">
            la vue aérienne — chaque rond regarde vers le centre
          </p>
        </div>
      </div>
    </div>
  );
}
