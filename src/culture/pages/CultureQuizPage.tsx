import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mulberry32, newSeed } from '../../core/rng';
import { QUESTIONS } from '../bank';
import { CULTURE_CATEGORIES } from '../data/categories';
import { CultureSession } from '../components/CultureSession';
import { useCultureStore } from '../hooks/useCultureStore';
import { selectReviewQuestions } from '../selection';
import type { CultureCategory } from '../types';

type Filter = 'all' | 'weak' | 'errors' | 'new' | 'traps' | 'extended';

export function CultureQuizPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { store } = useCultureStore();
  const initialCategory = params.get('category') as CultureCategory | null;
  const [count, setCount] = useState<5 | 10 | 20>(10);
  const [category, setCategory] = useState<CultureCategory | ''>(initialCategory ?? '');
  const [filter, setFilter] = useState<Filter>('all');
  const [running, setRunning] = useState(false);
  const seed = useMemo(() => newSeed(), [running]);
  const questions = useMemo(() => selectReviewQuestions(QUESTIONS, store, count, new Date(), mulberry32(seed), { category: category || undefined, filter }), [category, count, filter, seed, store]);

  if (running) return <CultureSession questions={questions} title="Quiz rapide" subtitle={`${questions.length} questions · correction après chaque réponse`} mode="quick-quiz" onExit={() => setRunning(false)} />;
  return (
    <section className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Session personnalisée</p><h3 className="mt-1 text-2xl font-bold">Quiz rapide</h3><p className="mt-2 text-zinc-400">Choisis le volume et le vivier. Le moteur conserve la priorité aux erreurs et aux échéances dans le filtre choisi.</p>
      <fieldset className="mt-6"><legend className="text-sm font-semibold text-zinc-300">Nombre de questions</legend><div className="mt-2 flex gap-2">{([5, 10, 20] as const).map((value) => <ChoiceButton key={value} active={count === value} onClick={() => setCount(value)}>{value} questions</ChoiceButton>)}</div></fieldset>
      <label className="mt-6 block text-sm font-semibold text-zinc-300">Catégorie<select value={category} onChange={(event) => setCategory(event.target.value as CultureCategory | '')} className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-sky-500"><option value="">Toutes les catégories</option>{CULTURE_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <fieldset className="mt-6"><legend className="text-sm font-semibold text-zinc-300">Vivier</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{([['all', 'Toutes catégories'], ['weak', 'Mes points faibles'], ['errors', 'Mes erreurs'], ['new', 'Jamais vues'], ['traps', 'Questions pièges'], ['extended', 'Extended uniquement']] as const).map(([value, label]) => <ChoiceButton key={value} active={filter === value} onClick={() => setFilter(value)}>{label}</ChoiceButton>)}</div></fieldset>
      <div className="mt-7 flex gap-3"><button type="button" disabled={questions.length === 0} onClick={() => setRunning(true)} className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-500 disabled:opacity-40">Lancer {questions.length} question{questions.length > 1 ? 's' : ''}</button><button type="button" onClick={() => navigate('/culture')} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-zinc-300 hover:bg-zinc-800">Annuler</button></div>
    </section>
  );
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-lg border px-3 py-2 text-sm ${active ? 'border-sky-500 bg-sky-950/40 text-sky-300' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-900'}`}>{children}</button>; }
