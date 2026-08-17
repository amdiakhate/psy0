import type { ExerciseComponentProps } from '../../core/types';
import type { MarblesQuestion } from './generator';
import { ANSWER_CHOICES } from './config';
import { TubesSvg } from './TubesSvg';
import { useKeys } from '../../hooks/useKeys';

/**
 * Réponse par QCM de 2 à 9, comme sur Pilotest — et non par saisie libre.
 * La différence n'est pas cosmétique : un QCM borne le champ des réponses,
 * ce qui change la stratégie (on peut éliminer, et un décompte approximatif
 * suffit parfois à trancher entre deux boutons).
 */
export function MarblesExercise({ item, onAnswer }: ExerciseComponentProps<MarblesQuestion, string>) {
  const q = item.question;

  // La touche frappée EST la réponse : taper « 3 » répond 3.
  useKeys((e) => {
    const n = Number(e.key);
    if (ANSWER_CHOICES.includes(n as (typeof ANSWER_CHOICES)[number])) onAnswer(String(n));
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-zinc-300">
        Combien de déplacements <span className="font-semibold text-sky-400">au minimum</span> pour
        passer de la configuration du haut à celle du bas ?
      </p>
      <div className="flex flex-col items-center gap-2">
        <TubesSvg state={q.start} label="Départ" />
        <span className="text-2xl text-zinc-600">↓</span>
        <TubesSvg state={q.goal} label="Arrivée" />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {ANSWER_CHOICES.map((n) => (
          <button
            key={n}
            onClick={() => onAnswer(String(n))}
            className="h-12 w-12 rounded-lg border border-zinc-700 bg-zinc-900 text-lg font-semibold hover:border-sky-500 hover:bg-zinc-800 focus:outline-none"
          >
            {n}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        Une bille se prend TOUJOURS sur le dessus d'un tube et se pose sur le dessus d'un autre ·
        capacités 3 / 2 / 3 · chaque bille est numérotée, aucune n'est interchangeable
      </p>
    </div>
  );
}
