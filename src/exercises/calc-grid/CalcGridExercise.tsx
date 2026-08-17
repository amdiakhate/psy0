import { useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { CalcQuestion } from './generator';
import { useKeys } from '../../hooks/useKeys';

/**
 * Grille de 9 calculs : clique (ou touches 1-9) les cases dont le résultat est
 * FAUX, puis valide avec Entrée. Une grille peut ne contenir aucune erreur.
 */
export function CalcGridExercise({ item, onAnswer }: ExerciseComponentProps<CalcQuestion, number[]>) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  useKeys((e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= 9) toggle(n - 1);
    if (e.key === 'Enter') onAnswer([...selected]);
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <p className="text-zinc-300">
        Sélectionne les calculs <span className="font-semibold text-red-400">FAUX</span>
        <span className="text-zinc-500"> — il y en a de 0 à 4</span>
      </p>
      <div className="grid grid-cols-3 gap-3">
        {item.question.cells.map((cell, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 font-mono text-lg tabular-nums transition-colors ${
              selected.has(i)
                ? 'border-red-500 bg-red-950/50 text-red-200'
                : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
            }`}
          >
            <kbd className="rounded bg-zinc-800 px-1.5 text-xs text-zinc-500">{i + 1}</kbd>
            <span>{cell.display}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => onAnswer([...selected])}
        className="rounded-lg bg-sky-600 px-6 py-2 font-semibold hover:bg-sky-500"
      >
        Valider ({selected.size}) · Entrée ⏎
      </button>
    </div>
  );
}
