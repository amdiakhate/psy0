import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { NBackQuestion } from './generator';
import { useKeys } from '../../hooks/useKeys';

type Phase = 'digit' | 'answer';

/**
 * M2 Back numérique : un chiffre paraît 1 s, s'efface, puis deux boutons
 * « Oui » / « Non » restent 3 s. Oui = ce chiffre est identique à celui de
 * DEUX coups avant. Une non-réponse dans la fenêtre est une erreur (timeout).
 * Un event est émis par position évaluable (les 2 premières sont l'amorce).
 */
export function NBackExercise({
  item,
  onContinuousEvent,
  onFinished,
}: ExerciseComponentProps<NBackQuestion, boolean>) {
  const q = item.question;
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('digit');
  const [picked, setPicked] = useState<boolean | null>(null);

  const answered = useRef(false);
  const answerShownAt = useRef(0);
  const cbRef = useRef({ onContinuousEvent, onFinished });
  cbRef.current = { onContinuousEvent, onFinished };

  // Nouvelle séquence : on repart de la première position.
  useEffect(() => {
    setIndex(0);
    setPhase('digit');
    setPicked(null);
  }, [item.seed]);

  const emit = useCallback(
    (given: boolean | null) => {
      const pos = q.positions[index];
      if (!pos) return;
      if (pos.kind !== 'warmup') {
        cbRef.current.onContinuousEvent?.({
          tags: given === null ? [`n=${q.n}`, pos.kind, 'timeout'] : [`n=${q.n}`, pos.kind],
          correct: given === pos.expected,
          rtMs: given === null ? q.responseMs : Date.now() - answerShownAt.current,
          given: given === null ? '—' : given ? 'oui' : 'non',
          expected: pos.expected ? 'oui' : 'non',
        });
      }
    },
    [index, q],
  );

  const advance = useCallback(() => {
    setPicked(null);
    setPhase('digit');
    if (index + 1 < q.positions.length) setIndex(index + 1);
    else cbRef.current.onFinished?.();
  }, [index, q.positions.length]);

  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const emitRef = useRef(emit);
  emitRef.current = emit;

  // Phase 1 : le chiffre est visible digitMs, sans réponse possible.
  useEffect(() => {
    if (phase !== 'digit') return;
    answered.current = false;
    const t = setTimeout(() => {
      // Les positions d'amorce ne se répondent pas : elles enchaînent directement.
      if (q.positions[index]?.kind === 'warmup') advanceRef.current();
      else {
        answerShownAt.current = Date.now();
        setPhase('answer');
      }
    }, q.digitMs);
    return () => clearTimeout(t);
  }, [phase, index, item.seed, q]);

  // Phase 2 : les deux boutons, responseMs pour trancher — sinon timeout.
  useEffect(() => {
    if (phase !== 'answer') return;
    const t = setTimeout(() => {
      // Si la réponse est déjà donnée, c'est l'accusé de réception qui enchaîne.
      if (answered.current) return;
      answered.current = true;
      emitRef.current(null);
      advanceRef.current();
    }, q.responseMs);
    return () => clearTimeout(t);
  }, [phase, index, item.seed, q.responseMs]);

  // Court accusé de réception visuel du choix avant d'enchaîner.
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(confirmTimer.current), []);

  const answer = useCallback(
    (given: boolean) => {
      if (phase !== 'answer' || answered.current) return;
      answered.current = true;
      setPicked(given);
      emitRef.current(given);
      clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => advanceRef.current(), 200);
    },
    [phase],
  );

  useKeys((e) => {
    if (phase !== 'answer') return;
    if (e.key === 'o' || e.key === 'O' || e.key === 'ArrowLeft') {
      e.preventDefault();
      answer(true);
    }
    if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
      e.preventDefault();
      answer(false);
    }
  });

  const pos = q.positions[index];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <p className="text-sm uppercase tracking-widest text-zinc-500">
        Identique au chiffre de <span className="font-bold text-sky-400">2</span> coups avant ?
      </p>

      <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-zinc-700 bg-zinc-900">
        <span className="font-mono text-8xl font-bold">
          {phase === 'digit' && pos ? pos.digit : ''}
        </span>
      </div>

      <div className="flex h-16 items-center gap-6">
        {phase === 'answer' ? (
          <>
            <AnswerButton
              label="Oui"
              hint="O / ←"
              active={picked === true}
              onClick={() => answer(true)}
            />
            <AnswerButton
              label="Non"
              hint="N / →"
              active={picked === false}
              onClick={() => answer(false)}
            />
          </>
        ) : (
          <span className="text-sm text-zinc-600">mémorise…</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {q.positions.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < index ? 'bg-sky-600' : i === index ? 'bg-sky-300' : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-600">
        {q.positions.length} chiffres · {(q.digitMs / 1000).toFixed(0)} s d’affichage puis{' '}
        {(q.responseMs / 1000).toFixed(1)} s pour répondre
      </p>
    </div>
  );
}

function AnswerButton({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-32 flex-col items-center rounded-xl border-2 px-6 py-2 text-xl font-semibold transition-colors ${
        active
          ? 'border-sky-400 bg-sky-900/50 text-sky-100'
          : 'border-zinc-600 bg-zinc-900 text-zinc-100 hover:border-sky-500'
      }`}
    >
      {label}
      <span className="font-mono text-xs font-normal text-zinc-500">{hint}</span>
    </button>
  );
}
