import { useMemo, useState } from 'react';
import { mulberry32, newSeed } from '../../core/rng';
import { QUESTIONS } from '../bank';
import { CultureSession } from '../components/CultureSession';
import { useCultureStore } from '../hooks/useCultureStore';
import { selectReviewQuestions } from '../selection';

type Duration = 10 | 20 | 30;

export function CultureExpressPage() {
  const { store } = useCultureStore();
  const [duration, setDuration] = useState<Duration>(10);
  const [essential, setEssential] = useState(true);
  const [running, setRunning] = useState(false);
  const questions = useMemo(() => selectReviewQuestions(QUESTIONS, store, duration, new Date(), mulberry32(newSeed()), { onlyHighYield: essential, finalStretch: true }), [duration, essential, running, store]);
  if (running) return <CultureSession questions={questions} title="Révision express" subtitle={`${duration} minutes ciblées · ${essential ? 'essentiels et erreurs' : 'toute la banque'}`} mode="express" onExit={() => setRunning(false)} />;
  return <section className="max-w-2xl"><div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5 md:p-6"><p className="text-xs font-semibold uppercase tracking-widest text-amber-400">J-5 / J-1</p><h3 className="mt-1 text-2xl font-bold">Révision express</h3><p className="mt-2 text-zinc-400">Pas de notion obscure en ouverture : erreurs personnelles, Air France, navigation, météo, instruments, réglementation et calculs simples.</p></div><fieldset className="mt-6"><legend className="text-sm font-semibold">Temps disponible</legend><div className="mt-2 grid grid-cols-3 gap-2">{([10,20,30] as const).map((value) => <button key={value} type="button" aria-pressed={duration === value} onClick={() => setDuration(value)} className={`rounded-xl border px-3 py-4 ${duration === value ? 'border-amber-500 bg-amber-950/30 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}><span className="block font-mono text-2xl font-bold">{value}</span><span className="text-xs">minutes</span></button>)}</div></fieldset><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><input type="checkbox" checked={essential} onChange={(event) => setEssential(event.target.checked)} className="mt-1 accent-sky-500"/><span><span className="font-medium">Essentiels uniquement</span><span className="mt-1 block text-sm text-zinc-500">Questions highYield, complétées par tes erreurs si nécessaire.</span></span></label><div className="mt-6 rounded-xl border border-zinc-800 p-4"><p className="text-sm text-zinc-400">Programme généré : <span className="font-semibold text-zinc-100">{questions.length} questions</span></p><p className="mt-1 text-xs text-zinc-600">Le volume est une estimation pratique, pas un chronomètre contraignant.</p></div><button type="button" disabled={questions.length === 0} onClick={() => setRunning(true)} className="mt-5 rounded-lg bg-amber-700 px-5 py-2.5 font-semibold text-white hover:bg-amber-600 disabled:opacity-40">Lancer la révision express</button></section>;
}
