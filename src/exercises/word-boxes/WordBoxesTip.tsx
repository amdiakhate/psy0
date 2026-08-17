import { useMemo } from 'react';
import { generate } from './generator';
import { applyChoice, freeBoxes, initialState } from './model';
import type { BoxesState } from './model';

const SEED = 21;
const LEVEL = 3;
/** Nombre de mots déjà joués dans la démonstration. */
const PLAYED = 11;

/**
 * Illustration de la page d'astuces : l'état RÉEL d'une série à mi-parcours,
 * rejouée avec la stratégie recommandée (premier thème vu → boîte 1, etc.).
 */
export function WordBoxesTip() {
  const { question, state, current } = useMemo(() => {
    const item = generate(SEED, LEVEL);
    const q = item.question;
    let state: BoxesState = initialState(q.boxCount);
    for (const step of q.steps.slice(0, PLAYED)) {
      const assigned = state.assignment[step.theme];
      // Stratégie : au premier mot d'un thème, on prend la première boîte encore libre.
      const chosen = assigned === undefined ? freeBoxes(state, q.boxCount)[0] : assigned;
      state = applyChoice(state, step, chosen, q.boxCount).state;
    }
    return { question: q, state, current: q.steps[PLAYED] };
  }, []);

  const currentBox = state.assignment[current.theme];

  return (
    <div>
      <p className="text-sm text-zinc-400">
        Une série de {question.boxCount} champs lexicaux, après {PLAYED} mots. Les boîtes n'ont
        jamais eu d'étiquette : ce sont TES choix successifs qui les ont dédiées.
      </p>

      <div className="mt-4 flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Mot affiché</p>
        <p className="text-4xl font-bold text-zinc-100">{current.word}</p>
      </div>

      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(question.boxCount, 3)}, minmax(0, 1fr))` }}
      >
        {state.contents.map((words, i) => (
          <div
            key={i}
            className={`rounded-lg border-2 p-2 ${
              i === currentBox ? 'border-green-500 bg-green-950/20' : 'border-zinc-700 bg-zinc-900'
            }`}
          >
            <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
            {words.length === 0 ? (
              <p className="mt-1 text-xs italic text-zinc-600">boîte libre</p>
            ) : (
              <ul className="mt-1 space-y-0.5">
                {words.map((w, k) => (
                  <li key={k} className="text-sm text-zinc-300">
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm text-zinc-300">
        {current.firstOfTheme ? (
          <>
            « {current.word} » ouvre un nouveau champ lexical : n'importe quelle boîte encore libre
            est correcte. Prends la suivante dans l'ordre et encode le lien tout de suite.
          </>
        ) : (
          <>
            « {current.word} » appartient à un champ déjà rangé{' '}
            {current.gap >= 5 ? (
              <span className="text-amber-400">
                (il n'était pas revenu depuis {current.gap} mots — c'est le rappel lointain, là où
                se concentrent les erreurs)
              </span>
            ) : (
              <span className="text-zinc-500">(revu il y a {current.gap} mots)</span>
            )}
            . La boîte {currentBox + 1} contient déjà des mots du même champ : c'est l'indice à
            scanner quand la mémoire flanche.
          </>
        )}
      </p>
    </div>
  );
}
