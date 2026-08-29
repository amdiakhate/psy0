import { useMemo, useState } from 'react';
import { QUESTIONS } from '../bank';
import { CULTURE_CATEGORY_BY_ID } from '../data/categories';
import { CultureSession } from '../components/CultureSession';
import { useCultureStore } from '../hooks/useCultureStore';
import { hasActiveError } from '../progress';
import { markQuestionUnderstood } from '../storage';
import type { CultureQuestion } from '../types';

type Sort = 'frequency' | 'recent' | 'category' | 'difficulty';

export function CultureErrorsPage() {
  const { store, updateStore } = useCultureStore();
  const [sort, setSort] = useState<Sort>('frequency');
  const [running, setRunning] = useState<CultureQuestion[] | null>(null);
  const errors = useMemo(() => QUESTIONS.filter((question) => hasActiveError(store.progress[question.id])).sort((a, b) => {
    const pa = store.progress[a.id]!; const pb = store.progress[b.id]!;
    if (sort === 'frequency') return pb.incorrectCount - pa.incorrectCount;
    if (sort === 'recent') return String(pb.lastIncorrectAt).localeCompare(String(pa.lastIncorrectAt));
    if (sort === 'difficulty') return b.difficulty - a.difficulty;
    return CULTURE_CATEGORY_BY_ID[a.category].label.localeCompare(CULTURE_CATEGORY_BY_ID[b.category].label, 'fr');
  }), [sort, store]);
  const groups = [...new Set(errors.map((question) => question.category))].map((category) => ({ category, questions: errors.filter((question) => question.category === category) }));
  if (running) return <CultureSession questions={running} title="Mes erreurs" subtitle="Une erreur reste active jusqu’à deux réussites ou validation explicite" mode="errors" onExit={() => setRunning(null)} />;
  return <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-red-400">Consolider</p><h3 className="mt-1 text-2xl font-bold">Mes erreurs</h3><p className="mt-1 text-zinc-400">Une réussite isolée ne suffit pas à faire disparaître une erreur.</p></div><select aria-label="Trier les erreurs" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"><option value="frequency">Fréquence d’erreur</option><option value="recent">Plus récentes</option><option value="category">Catégorie</option><option value="difficulty">Difficulté</option></select></div>{errors.length === 0 ? <div className="mt-6 rounded-xl border border-green-900/50 bg-green-950/20 p-5 text-green-300">Aucune erreur active. Lance un quiz : cette page se remplira automatiquement.</div> : <><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => setRunning(errors)} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Rejouer toutes mes erreurs · {errors.length}</button>{groups.map((group) => <button key={group.category} type="button" onClick={() => setRunning(group.questions)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">{CULTURE_CATEGORY_BY_ID[group.category].shortLabel} · {group.questions.length}</button>)}</div><div className="mt-6 space-y-5">{groups.map((group) => <div key={group.category}><div className="flex items-baseline justify-between"><h4 className="font-semibold">{CULTURE_CATEGORY_BY_ID[group.category].label}</h4><span className="font-mono text-sm text-red-400">{group.questions.reduce((sum, question) => sum + store.progress[question.id]!.incorrectCount, 0)} erreurs</span></div><div className="mt-2 space-y-2">{group.questions.map((question) => { const progress = store.progress[question.id]!; return <article key={question.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="max-w-2xl"><p className="font-medium">{question.question}</p><p className="mt-1 text-sm text-green-400">→ {String(question.answer)}</p><p className="mt-2 text-sm text-zinc-500">{question.explanation}</p></div><div className="text-right"><p className="font-mono text-sm text-red-400">{progress.incorrectCount} erreur{progress.incorrectCount > 1 ? 's' : ''}</p><button type="button" onClick={() => updateStore((current) => markQuestionUnderstood(current, question.id, new Date()))} className="mt-2 text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline">Marquer comme comprise</button></div></div></article>; })}</div></div>)}</div></>}</section>;
}
