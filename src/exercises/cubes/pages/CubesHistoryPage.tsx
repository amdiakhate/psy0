import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { CubesAnswer } from '../generator';
import { CubeCoachCorrection } from '../coach/CubeCoachCorrection';
import { loadCubeCoachState } from '../progress/cubeCoachStorage';
import type { CubeAttemptRecord } from '../progress/cubeCoachStorage';
import { isCubesQuestionSnapshot } from '../progress/cubeHistoryGuard';

function isCubesAnswer(value: unknown): value is CubesAnswer {
  return typeof value === 'object' && value !== null;
}

export function CubesHistoryPage() {
  const [searchParams] = useSearchParams();
  const onlyErrors = searchParams.get('filter') === 'errors';
  const attempts = [...loadCubeCoachState().attempts].filter((attempt) => !onlyErrors || !attempt.correct).reverse();
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="max-w-5xl">
      <Link to="/cubes" className="text-sm text-sky-400 hover:underline">← Coach Cubes</Link>
      <h2 className="mt-3 text-3xl font-bold">{onlyErrors ? 'Mes erreurs Cubes' : 'Historique Cubes'}</h2>
      <p className="mt-2 text-zinc-400">Chaque planche complète conserve son patron, ta réponse et le diagnostic. Les drills et résolutions guidées sont identifiés séparément.</p>
      {attempts.length === 0 ? (
        <div className="mt-6 rounded-xl bg-zinc-900/60 p-6 text-zinc-400">Aucune tentative enregistrée. Fais un drill ou une planche complète pour alimenter cet historique.</div>
      ) : (
        <div className="mt-6 space-y-2">
          {attempts.slice(0, 100).map((attempt) => (
            <HistoryRow key={attempt.id} attempt={attempt} open={openId === attempt.id} onToggle={() => setOpenId(openId === attempt.id ? null : attempt.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ attempt, open, onToggle }: { attempt: CubeAttemptRecord; open: boolean; onToggle: () => void }) {
  const replayableQuestion = attempt.mode === 'full' && isCubesQuestionSnapshot(attempt.question)
    ? attempt.question
    : null;
  return (
    <article className="overflow-hidden rounded-xl bg-zinc-900/60">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-800/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-400">
        <div>
          <p className="font-semibold text-zinc-200">{attempt.mode === 'full' ? 'Planche complète' : attempt.mode === 'guided' ? 'Résolution guidée' : `Drill ${attempt.drillType ?? ''}`}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{new Date(attempt.answeredAt).toLocaleString('fr-FR')} · {(attempt.durationMs / 1000).toFixed(1)} s{attempt.hintsUsed ? ` · ${attempt.hintsUsed} niveau${attempt.hintsUsed > 1 ? 'x' : ''} d’indice` : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          {attempt.errorCauses.length > 0 && <span className="text-xs text-red-300">{attempt.errorCauses.length} type{attempt.errorCauses.length > 1 ? 's' : ''} d’erreur</span>}
          <span className={`rounded-md px-2 py-1 text-sm font-semibold ${attempt.correct ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'}`}>{attempt.correct ? 'Juste' : 'Faux'}</span>
          <svg viewBox="0 0 24 24" className={`h-5 w-5 text-zinc-500 transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-4">
          {replayableQuestion ? (
            <CubeCoachCorrection
              item={{ question: replayableQuestion, seed: attempt.seed, level: attempt.level, tags: [] }}
              answer={isCubesAnswer(attempt.answer) ? attempt.answer : ({} as CubesAnswer)}
              correct={attempt.correct}
              rtMs={attempt.durationMs}
            />
          ) : (
            <div>
              <p className="text-sm text-zinc-300">Compétences mesurées : {attempt.skills.map((skill) => `${skill.skill} ${skill.correct ? '✓' : '✗'}`).join(' · ') || 'aucune'}</p>
              {attempt.mode === 'full' && <p className="mt-2 text-sm text-amber-300">Cette ancienne entrée ne contient pas l’instantané nécessaire pour rejouer la correction.</p>}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
