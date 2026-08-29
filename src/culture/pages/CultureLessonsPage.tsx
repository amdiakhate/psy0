import { useState } from 'react';
import { LESSONS, questionById } from '../bank';
import { CULTURE_CATEGORIES, CULTURE_CATEGORY_BY_ID } from '../data/categories';
import { CultureDiagramView } from '../components/CultureDiagrams';
import { CultureSession } from '../components/CultureSession';
import { useCultureStore } from '../hooks/useCultureStore';
import { toggleFavoriteLesson } from '../storage';
import type { CultureCategory, CultureLesson } from '../types';

export function CultureLessonsPage() {
  const { store, updateStore } = useCultureStore();
  const [category, setCategory] = useState<CultureCategory | ''>('');
  const [open, setOpen] = useState<string | null>(LESSONS[0]?.id ?? null);
  const [running, setRunning] = useState<CultureLesson | null>(null);
  if (running) {
    const questions = running.questionIds.map(questionById).filter((item): item is NonNullable<typeof item> => Boolean(item));
    return <CultureSession questions={questions} title={running.title} subtitle="Questions associées à cette fiche" mode="lesson" onExit={() => setRunning(null)} />;
  }
  const visible = category ? LESSONS.filter((lesson) => lesson.category === category) : LESSONS;
  return <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Cours courts</p><h3 className="mt-1 text-2xl font-bold">Fiches</h3><p className="mt-1 text-zinc-400">Une notion, quelques points, un piège et un mémo. Pas de lecture passive interminable.</p></div><select aria-label="Filtrer les fiches par catégorie" value={category} onChange={(event) => setCategory(event.target.value as CultureCategory | '')} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"><option value="">Toutes les catégories</option>{CULTURE_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div><div className="mt-6 space-y-3">{visible.map((lesson) => { const expanded = open === lesson.id; const favorite = store.favoriteLessonIds.includes(lesson.id); return <article key={lesson.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"><div className="flex items-center gap-3 p-4"><button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : lesson.id)} className="min-w-0 flex-1 text-left"><p className="text-xs uppercase tracking-widest text-zinc-500">{CULTURE_CATEGORY_BY_ID[lesson.category].shortLabel}</p><h4 className="mt-1 font-semibold text-zinc-100">{lesson.title}</h4></button><button type="button" aria-label={favorite ? 'Retirer la fiche des favoris' : 'Ajouter la fiche aux favoris'} onClick={() => updateStore((current) => toggleFavoriteLesson(current, lesson.id))} className={favorite ? 'text-amber-300' : 'text-zinc-600 hover:text-amber-300'}>{favorite ? '★' : '☆'}</button></div>{expanded && <div className="border-t border-zinc-800 p-4 md:p-5"><p className="text-xs font-semibold uppercase tracking-widest text-sky-400">À retenir</p><ul className="mt-3 space-y-2 text-sm text-zinc-300">{lesson.takeaways.map((item) => <li key={item} className="flex gap-2"><span className="text-sky-500">—</span><span>{item}</span></li>)}</ul>{lesson.diagram && <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950/50 p-3"><CultureDiagramView diagram={lesson.diagram} /></div>}{lesson.example && <Box label="Exemple" tone="text-green-400">{lesson.example}</Box>}{lesson.trap && <Box label="Piège classique" tone="text-amber-400">{lesson.trap}</Box>}{lesson.memoryTip && <Box label="Mémo" tone="text-sky-400">{lesson.memoryTip}</Box>}{lesson.isTimeSensitive && <p className="mt-4 text-xs text-zinc-600">Information vérifiée le {new Date(lesson.verifiedAt!).toLocaleDateString('fr-FR')} · {lesson.source}</p>}<button type="button" disabled={lesson.questionIds.length === 0} onClick={() => setRunning(lesson)} className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-40">Questions associées · {lesson.questionIds.length}</button></div>}</article>; })}</div></section>;
}

function Box({ label, tone, children }: { label: string; tone: string; children: React.ReactNode }) { return <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3"><p className={`text-xs font-semibold uppercase tracking-widest ${tone}`}>{label}</p><p className="mt-1 text-sm text-zinc-300">{children}</p></div>; }
