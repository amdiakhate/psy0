import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeys } from '../hooks/useKeys';
import { ITEM_LIMIT_SEC, POINTS, scoreOf } from './quiz';
import type { Given, QuizQuestion } from './quiz';
import { loadProgress, record, saveProgress } from './progress';
import type { Outcome } from './progress';
import { THEME_LABELS } from './types';

/**
 * Le déroulé d'une série de questions.
 *
 * Deux régimes, et la différence n'est pas cosmétique :
 *
 * — RÉVISION : pas de chrono, la correction s'affiche après chaque question et
 *   on la lit. C'est là qu'on apprend, et lire une explication sous chronomètre
 *   ne sert à rien.
 * — TEST BLANC : 15 s par question comme au vrai test, aucune correction en
 *   cours de route, tout est repris à la fin. C'est là qu'on mesure.
 */
export interface CultureQuizProps {
  questions: QuizQuestion[];
  title: string;
  subtitle: string;
  /** Test blanc : chrono par question et corrections repoussées à la fin. */
  exam: boolean;
  onExit: () => void;
}

export function CultureQuiz({ questions, title, subtitle, exam, onExit }: CultureQuizProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Given[]>([]);
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer');
  const [left, setLeft] = useState(ITEM_LIMIT_SEC);
  const answeredRef = useRef(false);

  const done = index >= questions.length;
  const q = done ? null : questions[index];

  const commit = useCallback(
    (given: Given) => {
      if (answeredRef.current || !q) return;
      answeredRef.current = true;

      const outcome: Outcome =
        given === null ? 'skip' : given === q.correctIndex ? 'correct' : 'wrong';
      saveProgress(record(loadProgress(), q.entry.id, outcome, Date.now()));

      setAnswers((prev) => {
        const next = [...prev];
        next[index] = given;
        return next;
      });

      // En test blanc on enchaîne : la correction viendra en bloc à la fin.
      if (exam) setIndex((i) => i + 1);
      else setPhase('feedback');
    },
    [q, index, exam],
  );

  const next = useCallback(() => {
    setPhase('answer');
    setIndex((i) => i + 1);
  }, []);

  // Nouvelle question : on rouvre la saisie et on relance le chrono.
  useEffect(() => {
    answeredRef.current = false;
    setLeft(ITEM_LIMIT_SEC);
  }, [index]);

  // Le chrono officiel. Absent en révision, où il n'aurait aucun sens.
  useEffect(() => {
    if (!exam || done || phase !== 'answer') return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [exam, done, phase, index]);

  useEffect(() => {
    if (exam && left <= 0 && !answeredRef.current) commit(null);
  }, [exam, left, commit]);

  useKeys((e) => {
    if (done) return;
    if (phase === 'feedback') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        next();
      }
      return;
    }
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= 4) {
      e.preventDefault();
      commit(n - 1);
    } else if (e.key === '0' || e.key.toLowerCase() === 'n') {
      e.preventDefault();
      commit(null);
    }
  });

  if (done) {
    return <Debrief questions={questions} answers={answers} title={title} onExit={onExit} />;
  }

  const given = answers[index] ?? null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col">
      <header className="flex items-baseline justify-between gap-4 border-b border-zinc-800 pb-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-500">
            {index + 1}/{questions.length}
          </span>
          {exam && (
            <span
              className={`font-mono tabular-nums ${left <= 5 ? 'text-red-400' : 'text-zinc-400'}`}
            >
              {Math.max(left, 0)} s
            </span>
          )}
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300">
            Quitter
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-8 py-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {THEME_LABELS[q!.entry.theme]}
            {q!.entry.asked && ` · posée en ${q!.entry.asked}`}
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{q!.entry.prompt}</p>
        </div>

        <div className="grid gap-2">
          {q!.options.map((opt, i) => {
            const isCorrect = i === q!.correctIndex;
            const isGiven = phase === 'feedback' && given === i;
            const tone =
              phase !== 'feedback'
                ? 'border-zinc-700 bg-zinc-900 hover:border-sky-500 hover:bg-zinc-800'
                : isCorrect
                  ? 'border-green-600 bg-green-950/30'
                  : isGiven
                    ? 'border-red-600 bg-red-950/30'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-500';
            return (
              <button
                key={i}
                type="button"
                disabled={phase === 'feedback'}
                onClick={() => commit(i)}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${tone}`}
              >
                <kbd className="mt-0.5 rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 font-mono text-xs text-sky-400">
                  {i + 1}
                </kbd>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>

        {phase === 'answer' ? (
          <button
            type="button"
            onClick={() => commit(null)}
            className="self-start text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
          >
            Je ne sais pas <span className="font-mono">(0)</span> — 0 point, ni gain ni perte
          </button>
        ) : (
          <Correction q={q!} given={given} onNext={next} />
        )}
      </div>
    </div>
  );
}

function Correction({
  q,
  given,
  onNext,
}: {
  q: QuizQuestion;
  given: Given;
  onNext: () => void;
}) {
  const ok = given !== null && given === q.correctIndex;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className={`text-sm font-semibold ${ok ? 'text-green-400' : 'text-amber-400'}`}>
        {ok ? 'Juste' : given === null ? 'Passée' : 'Faux'} — {q.options[q.correctIndex]}
      </p>
      <p className="mt-2 text-zinc-300">{q.entry.explain}</p>
      <button
        onClick={onNext}
        className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
      >
        Suivante <span className="font-mono text-xs opacity-70">(espace)</span>
      </button>
    </div>
  );
}

function Debrief({
  questions,
  answers,
  title,
  onExit,
}: {
  questions: QuizQuestion[];
  answers: Given[];
  title: string;
  onExit: () => void;
}) {
  const score = useMemo(() => scoreOf(questions, answers), [questions, answers]);
  const rates = questions
    .map((q, i) => ({ q, given: answers[i] ?? null }))
    .filter(({ q, given }) => given !== q.correctIndex);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-xl font-bold">{title} — terminé</h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Points" value={`${score.raw} / ${score.max}`} accent="text-sky-400" />
        <Tile label="Justes" value={String(score.correct)} accent="text-green-400" />
        <Tile label="Fausses" value={String(score.wrong)} accent="text-red-400" />
        <Tile label="Passées" value={String(score.skipped)} accent="text-zinc-400" />
      </div>

      <p className="mt-3 text-sm text-zinc-500">
        Barème officiel : {POINTS.correct} point{POINTS.correct > 1 ? 's' : ''} par bonne réponse,{' '}
        {POINTS.wrong} par erreur, 0 pour une question passée.
      </p>

      {rates.length === 0 ? (
        <p className="mt-8 text-green-400">Sans faute. Reviens demain : la révision espacée s’en souvient.</p>
      ) : (
        <>
          <h3 className="mt-8 text-sm uppercase tracking-widest text-zinc-500">
            À revoir ({rates.length})
          </h3>
          <ul className="mt-3 space-y-3">
            {rates.map(({ q, given }) => (
              <li key={q.entry.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="font-medium text-zinc-100">{q.entry.prompt}</p>
                <p className="mt-1 text-sm text-green-400">→ {q.options[q.correctIndex]}</p>
                {given !== null && (
                  <p className="text-sm text-red-400">Tu as répondu : {q.options[given]}</p>
                )}
                <p className="mt-2 text-sm text-zinc-400">{q.entry.explain}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        onClick={onExit}
        className="mt-8 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
      >
        Retour
      </button>
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}
