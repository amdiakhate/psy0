import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { newSeed, mulberry32 } from '../../core/rng';
import { useKeys } from '../../hooks/useKeys';
import { CULTURE_CATEGORY_BY_ID } from '../data/categories';
import { useCultureStore } from '../hooks/useCultureStore';
import { checkAnswer } from '../answers';
import type { CultureGivenAnswer } from '../answers';
import { presentQuestion, scoreByCategory, scoreOf } from '../quiz';
import type { PresentedCultureQuestion } from '../quiz';
import { recordCultureAnswer, recordCultureSession, toggleFavoriteQuestion } from '../storage';
import type { CultureQuestion, CultureReviewVerdict, CultureSessionMode } from '../types';
import { reinsertWithinPassageLimit } from '../sessionQueue';

interface SessionResult {
  item: PresentedCultureQuestion;
  given: CultureGivenAnswer;
  correct: boolean;
}

export interface CultureSessionProps {
  questions: CultureQuestion[];
  title: string;
  subtitle: string;
  mode: CultureSessionMode;
  exam?: boolean;
  tracked?: boolean;
  onExit: () => void;
  onReviewErrors?: (questions: CultureQuestion[]) => void;
  onAttempt?: (attempt: { question: CultureQuestion; given: Exclude<CultureGivenAnswer, null>; correct: boolean; responseTimeMs: number }) => void;
}

export function CultureSession({ questions, title, subtitle, mode, exam = false, tracked = true, onExit, onReviewErrors, onAttempt }: CultureSessionProps) {
  const seed = useRef(newSeed());
  const sessionId = useRef(`culture-${Date.now()}-${seed.current}`);
  const startedAt = useRef(new Date());
  const questionStartedAt = useRef(Date.now());
  const initial = useMemo(() => questions.map((question, index) => presentQuestion(question, mulberry32(seed.current + index))), [questions]);
  const [queue, setQueue] = useState(initial);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<CultureGivenAnswer>(null);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer');
  const [results, setResults] = useState<SessionResult[]>([]);
  const [reinserted, setReinserted] = useState<string[]>([]);
  const { store, updateStore } = useCultureStore();
  const finishedRef = useRef(false);

  const done = index >= queue.length;
  const item = done ? null : queue[index];
  const result = results[results.length - 1];

  const persist = useCallback((question: CultureQuestion, verdict: CultureReviewVerdict) => {
    if (!tracked) return;
    updateStore((current) => recordCultureAnswer({
      store: current,
      questionId: question.id,
      category: question.category,
      verdict,
      sessionId: sessionId.current,
      mode,
      now: new Date(),
    }));
  }, [mode, tracked, updateStore]);

  const next = useCallback(() => {
    setSelected(null);
    setInput('');
    setPhase('answer');
    setIndex((current) => current + 1);
    questionStartedAt.current = Date.now();
  }, []);

  const submit = useCallback(() => {
    if (!item || phase !== 'answer') return;
    const given = item.question.type === 'numeric' || item.question.type === 'short-answer' ? input : selected;
    if (given === null || given === '') return;
    const correct = checkAnswer(item.question, given);
    onAttempt?.({ question: item.question, given, correct, responseTimeMs: Date.now() - questionStartedAt.current });
    setResults((current) => [...current, { item, given, correct }]);
    if (exam) {
      persist(item.question, correct ? 'known' : 'wrong');
      next();
      return;
    }
    if (!correct) {
      persist(item.question, 'wrong');
      if (!reinserted.includes(item.question.id)) {
        setQueue((current) => reinsertWithinPassageLimit(current, item, index));
        setReinserted((current) => [...current, item.question.id]);
      }
    }
    setPhase('feedback');
  }, [exam, index, input, item, next, onAttempt, persist, phase, reinserted, selected]);

  const confidence = useCallback((verdict: 'guessed' | 'known' | 'review') => {
    if (!item || !result?.correct) return;
    persist(item.question, verdict);
    next();
  }, [item, next, persist, result]);

  useKeys((event) => {
    if (!item || done) return;
    if (phase === 'feedback') {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (result?.correct) confidence('known');
        else next();
      }
      return;
    }
    if (item.choices) {
      const choice = Number(event.key);
      if (Number.isInteger(choice) && choice >= 1 && choice <= item.choices.length) {
        event.preventDefault();
        setSelected(item.choices[choice - 1]);
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  });

  useEffect(() => {
    if (!done || finishedRef.current || results.length === 0) return;
    finishedRef.current = true;
    if (!tracked) return;
    updateStore((current) => recordCultureSession(current, {
      id: sessionId.current,
      mode,
      startedAt: startedAt.current.toISOString(),
      endedAt: new Date().toISOString(),
      questionIds: results.map((entry) => entry.item.question.id),
      correct: results.filter((entry) => entry.correct).length,
      total: results.length,
    }));
  }, [done, mode, results, tracked, updateStore]);

  if (done) {
    return <CultureDebrief title={title} results={results} onExit={onExit} onReviewErrors={onReviewErrors} />;
  }
  if (!item) return null;

  const favorite = store.favoriteQuestionIds.includes(item.question.id);
  return (
    <section className="mx-auto max-w-3xl" aria-live="polite">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="font-mono tabular-nums">{index + 1}/{queue.length}</span>
          <button type="button" onClick={onExit} className="hover:text-zinc-200">Quitter</button>
        </div>
      </header>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-sky-500 transition-[width]" style={{ width: `${Math.round(index / queue.length * 100)}%` }} />
      </div>

      <div className="py-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">{CULTURE_CATEGORY_BY_ID[item.question.category].label}</p>
          <button
            type="button"
            aria-label={favorite ? 'Retirer la question des favoris' : 'Ajouter la question aux favoris'}
            aria-pressed={favorite}
            onClick={() => updateStore((current) => toggleFavoriteQuestion(current, item.question.id))}
            className={`rounded-md px-2 py-1 text-sm ${favorite ? 'text-amber-300' : 'text-zinc-600 hover:text-amber-300'}`}
          >
            {favorite ? '★ Favori' : '☆ Favori'}
          </button>
        </div>
        <h4 className="mt-3 text-2xl font-semibold leading-snug text-zinc-100">{item.question.question}</h4>

        {item.choices ? (
          <div className="mt-7 grid gap-2">
            {item.choices.map((choice, choiceIndex) => {
              const picked = selected === choice;
              const correctChoice = String(item.question.answer) === choice;
              const tone = phase === 'feedback'
                ? correctChoice ? 'border-green-600 bg-green-950/30 text-green-100' : picked ? 'border-red-600 bg-red-950/30 text-red-100' : 'border-zinc-800 text-zinc-600'
                : picked ? 'border-sky-500 bg-sky-950/40 text-zinc-100' : 'border-zinc-700 bg-zinc-900/60 hover:border-sky-600';
              return (
                <button key={choice} type="button" disabled={phase === 'feedback'} onClick={() => setSelected(choice)} className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${tone}`}>
                  <kbd className="rounded border border-zinc-600 bg-zinc-900 px-2 py-0.5 font-mono text-xs text-sky-400">{choiceIndex + 1}</kbd>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-7">
            <label htmlFor="culture-answer" className="text-sm text-zinc-400">Ta réponse{item.question.type === 'numeric' ? ' (nombre uniquement)' : ''}</label>
            <input
              id="culture-answer"
              autoFocus
              inputMode={item.question.type === 'numeric' ? 'decimal' : 'text'}
              value={input}
              readOnly={phase === 'feedback'}
              onChange={(event) => setInput(event.target.value)}
              className="mt-2 block w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-lg outline-none focus:border-sky-500"
            />
          </div>
        )}

        {phase === 'answer' ? (
          <div className="mt-6 flex items-center gap-3">
            <button type="button" disabled={item.choices ? selected === null : input.trim() === ''} onClick={submit} className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40">Valider</button>
            <span className="text-xs text-zinc-600">Entrée pour valider</span>
          </div>
        ) : (
          <CultureCorrection item={item} result={result} onConfidence={confidence} onNext={next} />
        )}
      </div>
    </section>
  );
}

function CultureCorrection({ item, result, onConfidence, onNext }: { item: PresentedCultureQuestion; result: SessionResult; onConfidence: (verdict: 'guessed' | 'known' | 'review') => void; onNext: () => void }) {
  return (
    <div className={`mt-6 rounded-xl border p-5 ${result.correct ? 'border-green-800 bg-green-950/20' : 'border-red-800 bg-red-950/20'}`}>
      <p className={`text-sm font-bold uppercase tracking-wider ${result.correct ? 'text-green-400' : 'text-red-400'}`}>{result.correct ? 'Bonne réponse' : 'Mauvaise réponse'}</p>
      <p className="mt-2 font-semibold text-zinc-100">Réponse : {String(item.question.answer)}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.question.explanation}</p>
      {item.question.trap && <p className="mt-3 rounded-lg border border-amber-900/60 bg-amber-950/20 p-3 text-sm text-amber-200"><span className="font-semibold">Piège classique :</span> {item.question.trap}</p>}
      {item.question.memoryTip && <p className="mt-3 text-sm text-sky-300"><span className="font-semibold">Mémo :</span> {item.question.memoryTip}</p>}
      {item.question.isTimeSensitive && <p className="mt-3 text-xs text-zinc-500">Information vérifiée le {new Date(item.question.verifiedAt!).toLocaleDateString('fr-FR')} · {item.question.source}</p>}
      {result.correct ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => onConfidence('guessed')} className="rounded-lg border border-amber-700 px-3 py-2 text-sm text-amber-300 hover:bg-amber-950/40">J’avais deviné</button>
          <button type="button" onClick={() => onConfidence('known')} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">Je savais</button>
          <button type="button" onClick={() => onConfidence('review')} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">À revoir</button>
        </div>
      ) : (
        <button type="button" onClick={onNext} className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Continuer <span className="font-mono text-xs opacity-70">(espace)</span></button>
      )}
    </div>
  );
}

function CultureDebrief({ title, results, onExit, onReviewErrors }: { title: string; results: SessionResult[]; onExit: () => void; onReviewErrors?: (questions: CultureQuestion[]) => void }) {
  const questions = results.map((result) => result.item);
  const answers = results.map((result) => result.given);
  const score = scoreOf(questions, answers);
  const categories = scoreByCategory(questions, answers);
  const errors = results.filter((result) => !result.correct);
  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Session terminée</p>
      <h3 className="mt-1 text-2xl font-bold">{title}</h3>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreTile label="Score" value={`${score.correct}/${score.total}`} tone="text-sky-400" />
        <ScoreTile label="Réussite" value={`${score.percent} %`} tone={score.percent >= 80 ? 'text-green-400' : 'text-amber-400'} />
        <ScoreTile label="Justes" value={String(score.correct)} tone="text-green-400" />
        <ScoreTile label="Erreurs" value={String(score.wrong)} tone="text-red-400" />
      </div>
      <h4 className="mt-8 text-sm font-semibold uppercase tracking-widest text-zinc-500">Performance par catégorie</h4>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {categories.map((category) => <div key={category.category} className="flex justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm"><span>{CULTURE_CATEGORY_BY_ID[category.category].shortLabel}</span><span className="font-mono text-zinc-400">{category.correct}/{category.total} · {category.percent}%</span></div>)}
      </div>
      {errors.length > 0 && <><h4 className="mt-8 text-sm font-semibold uppercase tracking-widest text-zinc-500">Corrections</h4><div className="mt-3 space-y-3">{errors.map((error, index) => <article key={`${error.item.question.id}-${index}`} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><p className="font-medium">{error.item.question.question}</p><p className="mt-1 text-sm text-green-400">→ {String(error.item.question.answer)}</p><p className="mt-2 text-sm text-zinc-400">{error.item.question.explanation}</p></article>)}</div></>}
      <div className="mt-8 flex flex-wrap gap-3">
        {errors.length > 0 && onReviewErrors && <button type="button" onClick={() => onReviewErrors(errors.map((error) => error.item.question))} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Réviser uniquement mes erreurs</button>}
        <button type="button" onClick={onExit} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Retour</button>
      </div>
    </section>
  );
}

function ScoreTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"><p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p><p className={`mt-1 font-mono text-2xl font-bold ${tone}`}>{value}</p></div>;
}
