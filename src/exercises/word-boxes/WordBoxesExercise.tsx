import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { WordBoxesAnswer, WordBoxesQuestion } from './generator';
import { applyChoice, initialState } from './model';
import type { BoxesState } from './model';
import { useKeys } from '../../hooks/useKeys';

type Phase = 'visible' | 'hidden';

/**
 * Une série : les boîtes démarrent vides et sans étiquette. Le premier mot d'un thème
 * s'attribue librement à une boîte libre ; les suivants doivent retrouver la MÊME boîte.
 * Le mot ne reste affiché que `wordMs`, puis il faut répondre de mémoire.
 */
export function WordBoxesExercise({
  item,
  onContinuousEvent,
  onFinished,
}: ExerciseComponentProps<WordBoxesQuestion, WordBoxesAnswer>) {
  const q = item.question;
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<BoxesState>(() => initialState(q.boxCount));
  const [phase, setPhase] = useState<Phase>('visible');
  const [flash, setFlash] = useState<{ box: number; ok: boolean } | null>(null);
  const shownAt = useRef(Date.now());
  const answeredRef = useRef(false);

  // Nouvelle série : on repart de boîtes vides.
  useEffect(() => {
    setIndex(0);
    setState(initialState(q.boxCount));
    setPhase('visible');
    setFlash(null);
    answeredRef.current = false;
    shownAt.current = Date.now();
  }, [item.seed, q.boxCount]);

  const step = q.steps[index];

  const answer = useCallback(
    (chosen: number | null) => {
      if (answeredRef.current || !step) return;
      answeredRef.current = true;
      const res = applyChoice(state, step, chosen, q.boxCount);
      setState(res.state);
      setFlash({ box: res.boxOfTheme, ok: res.correct });
      onContinuousEvent?.({
        tags: step.tags,
        correct: res.correct,
        rtMs: Date.now() - shownAt.current,
        given: res.given,
        expected: res.expected,
      });
      if (index + 1 < q.steps.length) {
        setIndex(index + 1);
        setPhase('visible');
        shownAt.current = Date.now();
        answeredRef.current = false;
      } else {
        onFinished?.();
      }
    },
    [state, step, q.boxCount, q.steps.length, index, onContinuousEvent, onFinished],
  );

  // Le mot disparaît après `wordMs`, puis le temps de réponse court jusqu'à `answerMs`.
  useEffect(() => {
    if (!step) return;
    const hide = setTimeout(() => setPhase('hidden'), q.wordMs);
    const timeout = setTimeout(() => answer(null), q.wordMs + q.answerMs);
    return () => {
      clearTimeout(hide);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, item.seed]);

  useKeys((e) => {
    const digit = Number(e.key);
    if (Number.isInteger(digit) && digit >= 1 && digit <= q.boxCount) {
      e.preventDefault();
      answer(digit - 1);
    }
  });

  if (!step) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <p className="text-sm uppercase tracking-widest text-zinc-500">
        Mot {index + 1}/{q.steps.length} · une boîte par champ lexical
      </p>

      <div className="flex h-24 items-center justify-center">
        {phase === 'visible' ? (
          <p className="text-6xl font-bold tracking-wide text-zinc-100 md:text-7xl">{step.word}</p>
        ) : (
          <p className="text-4xl font-bold text-zinc-600">· · ·</p>
        )}
      </div>

      <div
        className="grid w-full max-w-5xl gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(q.boxCount, 3)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: q.boxCount }, (_, i) => {
          const words = state.contents[i];
          const highlighted = flash?.box === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => answer(i)}
              className={`min-h-28 rounded-lg border-2 p-3 text-left transition ${
                highlighted
                  ? flash!.ok
                    ? 'border-green-500 bg-green-950/30'
                    : 'border-red-500 bg-red-950/30'
                  : words.length > 0
                    ? 'border-zinc-700 bg-zinc-900'
                    : 'border-dashed border-zinc-700 bg-zinc-900/40'
              }`}
            >
              <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
              {words.length === 0 ? (
                <p className="mt-1 text-sm italic text-zinc-600">boîte libre</p>
              ) : (
                <ul className="mt-1 space-y-0.5">
                  {words.slice(-5).map((w, k) => (
                    <li key={k} className="text-sm text-zinc-300">
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500">
        Touches 1-{q.boxCount} ou clic · au PREMIER mot d'un champ lexical, n'importe quelle boîte
        libre est correcte · ensuite, retrouve la même boîte
      </p>
    </div>
  );
}
