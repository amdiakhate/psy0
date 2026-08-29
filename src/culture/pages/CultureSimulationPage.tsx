import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mulberry32, newSeed } from '../../core/rng';
import { QUESTIONS } from '../bank';
import { CultureSession } from '../components/CultureSession';
import { selectBalancedSimulation } from '../selection';
import type { CultureQuestion } from '../types';

export function CultureSimulationPage() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [review, setReview] = useState<CultureQuestion[] | null>(null);
  const questions = useMemo(() => selectBalancedSimulation(QUESTIONS, 20, mulberry32(newSeed())), [running]);
  if (review) return <CultureSession questions={review} title="Erreurs de la simulation" subtitle="Correction immédiate · consolidation ciblée" mode="errors" onExit={() => navigate('/culture/errors')} />;
  if (running) return <CultureSession questions={questions} title="Simulation Culture" subtitle="20 questions équilibrées · aucune correction pendant l’épreuve" mode="simulation" exam onExit={() => setRunning(false)} onReviewErrors={setReview} />;
  return <section className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Conditions test</p><h3 className="mt-1 text-2xl font-bold">Simulation Culture</h3><div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"><p className="font-semibold">20 questions · répartition équilibrée</p><ul className="mt-3 space-y-2 text-sm text-zinc-400"><li>— Aucun feedback pendant l’épreuve.</li><li>— Score global et détail par catégorie à la fin.</li><li>— Toutes les corrections regroupées au débrief.</li><li>— Aucune classe ou stanine.</li></ul></div><button type="button" onClick={() => setRunning(true)} className="mt-6 rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-500">Commencer la simulation</button></section>;
}
