import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { WordSkipAnswer, WordSkipQuestion } from './generator';
import { isPlayable } from './generator';
import { useKeys } from '../../hooks/useKeys';

/**
 * « Un mot sur deux » : une grille de mots en désordre, issus de DEUX
 * thématiques. En partant du mot marqué START, on clique alternativement un mot
 * de chaque thématique, en respectant l'ordre alphabétique À L'INTÉRIEUR de
 * chaque thématique. Toute erreur renvoie au début de la série.
 * Réponse à la souris ou au clavier (étiquette affichée sur chaque mot).
 */
export function WordSkipExercise({ item, onAnswer }: ExerciseComponentProps<WordSkipQuestion, WordSkipAnswer>) {
  const q = item.question;
  const total = q.chain.length;

  /** Nombre de mots validés après le START (0 = seul le START est acquis). */
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const clicks = useRef<string[]>([]);
  const done = useRef(false);

  useEffect(() => {
    setStep(0);
    setErrors(0);
    setWrongId(null);
    clicks.current = [];
    done.current = false;
  }, [item.seed, item.level]);

  useEffect(() => {
    if (wrongId === null) return;
    const t = setTimeout(() => setWrongId(null), 380);
    return () => clearTimeout(t);
  }, [wrongId]);

  const play = useCallback(
    (cellId: number) => {
      if (done.current) return;
      const cell = q.cells[cellId];
      if (cell.isStart && step === 0) return; // le START est déjà acquis
      clicks.current.push(cell.word);

      if (isPlayable(q, step, cellId)) {
        const next = step + 1;
        setStep(next);
        if (next === total - 1) {
          done.current = true;
          onAnswer(clicks.current.join(' '));
        }
        return;
      }
      // Erreur : flash rouge, la série repart du START.
      setErrors((e) => e + 1);
      setWrongId(cellId);
      setStep(0);
    },
    [q, step, total, onAnswer],
  );

  useKeys((e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toUpperCase();
    const cell = q.cells.find((c) => c.label === key);
    if (!cell) return;
    e.preventDefault();
    play(cell.id);
  });

  const playedIds = new Set(q.chain.slice(0, step + 1));

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-6 text-sm">
        <span className="rounded-lg border border-sky-700 bg-sky-950/50 px-3 py-1 font-semibold text-sky-300">
          {q.themeLabels[0]}
        </span>
        <span className="text-zinc-600">alterner</span>
        <span className="rounded-lg border border-violet-700 bg-violet-950/50 px-3 py-1 font-semibold text-violet-300">
          {q.themeLabels[1]}
        </span>
      </div>
      <p className="text-xs text-zinc-500">
        Ordre alphabétique à l'intérieur de chaque thématique · toute erreur renvoie au START
      </p>

      <div className="relative h-[58vh] min-h-[380px] w-full max-w-4xl rounded-xl border border-zinc-800 bg-zinc-950/40">
        {q.cells.map((c) => {
          const played = playedIds.has(c.id);
          const order = played ? q.chain.indexOf(c.id) : -1;
          const isWrong = wrongId === c.id;
          const themeRing = c.theme === 0 ? 'border-sky-800' : 'border-violet-800';
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => play(c.id)}
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
              className={`absolute flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-2 py-1.5 font-mono text-xs font-bold transition-colors sm:text-sm ${
                isWrong
                  ? 'border-red-500 bg-red-900/70 text-red-100'
                  : played
                    ? 'border-green-500 bg-green-900/50 text-green-200'
                    : `${themeRing} bg-zinc-900 text-zinc-200 hover:border-zinc-400`
              }`}
            >
              <span className="rounded bg-zinc-800/80 px-1 text-[10px] text-zinc-400">{c.label}</span>
              {c.word}
              {c.isStart && (
                <span className="rounded bg-amber-500 px-1 text-[10px] font-bold text-black">START</span>
              )}
              {order > 0 && <span className="text-[10px] text-green-400">#{order}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6 text-sm text-zinc-400">
        <span>
          Progression <span className="font-mono text-sky-400">{step}/{total - 1}</span>
        </span>
        <span>
          Reprises <span className={`font-mono ${errors > 0 ? 'text-red-400' : 'text-zinc-500'}`}>{errors}</span>
        </span>
      </div>
    </div>
  );
}
