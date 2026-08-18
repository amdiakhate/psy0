import { useMemo } from 'react';
import { useKeys } from '../../hooks/useKeys';
import type { ExerciseComponentProps } from '../../core/types';
import type { StackingAnswer, StackingQuestion } from './generator';
import { PolycubeSvg, commonWorldSize } from './PolycubeSvg';

/**
 * Trois empilements encadrés, numérotés, et rien d'autre : chez Pilotest on
 * désigne la figure elle-même. Doubler la pastille d'un bouton « Empilement N »
 * ajoutait un aller-retour du regard entre la figure et sa commande, sur une
 * épreuve chronométrée à 10 s la question.
 */
export function StackingExercise({
  item,
  onAnswer,
}: ExerciseComponentProps<StackingQuestion, StackingAnswer>) {
  const q = item.question;
  // Échelle commune : les cubes ont la même taille sur les trois empilements.
  const world = useMemo(() => commonWorldSize(q.stacks, q.tilts), [q.stacks, q.tilts]);

  // Le clavier reste la voie rapide : à 10 s la question, viser trois cadres à
  // la souris coûte plus cher que le raisonnement lui-même.
  useKeys((e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= q.stacks.length) onAnswer(n - 1);
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <p className="max-w-2xl text-center text-xl font-bold text-zinc-100">
        Deux empilements sont <span className="text-sky-400">identiques à une rotation près</span>.
        Lequel a subi la <span className="text-red-400">symétrie</span> ?
      </p>

      <div className="flex flex-wrap items-start justify-center gap-5">
        {q.stacks.map((shape, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i)}
            className="group flex flex-col items-center gap-2 rounded-xl focus:outline-none"
          >
            {/* Cadre CARRÉ à liseré fin, figure au large dedans : c'est la
                présentation de Pilotest, et la marge compte — un empilement qui
                touche le bord se lit par son contour au lieu de son relief. */}
            <div
              className="flex items-center justify-center border-2 border-zinc-800 transition-colors group-hover:border-sky-500 group-focus-visible:border-sky-400"
              style={{ background: '#d4d4d4', width: 250, height: 250 }}
            >
              <PolycubeSvg shape={shape} tilt={q.tilts[i]} world={world} px={200} />
            </div>
            <span className="rounded border border-zinc-600 bg-zinc-800 px-3 py-0.5 font-mono text-sm text-sky-400 transition-colors group-hover:border-sky-500 group-hover:text-sky-300">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <p className="text-sm text-zinc-500">Clique l’empilement symétrique, ou tape 1, 2 ou 3.</p>
    </div>
  );
}
