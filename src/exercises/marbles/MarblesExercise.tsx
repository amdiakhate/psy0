import type { ExerciseComponentProps } from '../../core/types';
import type { MarblesQuestion } from './generator';
import { NumberInput } from '../../components/NumberInput';
import { TubesSvg } from './TubesSvg';

export function MarblesExercise({ item, onAnswer }: ExerciseComponentProps<MarblesQuestion, string>) {
  const q = item.question;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <p className="text-zinc-300">
        Combien de déplacements <span className="font-semibold text-sky-400">au minimum</span> pour
        passer du départ à l'arrivée ?
      </p>
      <div className="flex flex-col items-center gap-3">
        <TubesSvg state={q.start} label="Départ" />
        <span className="text-2xl text-zinc-600">↓</span>
        <TubesSvg state={q.goal} label="Arrivée" />
      </div>
      <NumberInput key={item.seed} onSubmit={onAnswer} placeholder="?" />
      <p className="text-xs text-zinc-500">
        Une bille se prend TOUJOURS sur le dessus d'un tube et se pose sur le dessus d'un autre ·
        capacités 3 / 2 / 3
      </p>
    </div>
  );
}
