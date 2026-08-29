import { useMemo, useState } from 'react';
import { mulberry32, newSeed } from '../../core/rng';
import { CultureSession } from '../components/CultureSession';
import { generateFlightMathQuestion } from '../generators/flightMath';
import { generateHeadingQuestion } from '../generators/headings';

type Drill = 'flight-math' | 'headings';

export function CultureDrillsPage() {
  const [drill, setDrill] = useState<Drill | null>(null);
  const [count, setCount] = useState<5 | 10 | 20>(10);
  const questions = useMemo(() => drill ? Array.from({ length: count }, (_, index) => {
    const rng = mulberry32(newSeed() + index);
    return drill === 'flight-math' ? generateFlightMathQuestion(rng) : generateHeadingQuestion(rng);
  }) : [], [count, drill]);
  if (drill) return <CultureSession questions={questions} title={drill === 'flight-math' ? 'Calculs aéro' : 'Caps'} subtitle={`${count} exercices générés · méthode mentale après chaque réponse`} mode={drill} tracked={false} onExit={() => setDrill(null)} />;
  return <section><p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Drills générés localement</p><h3 className="mt-1 text-2xl font-bold">Calculs aéro & caps</h3><p className="mt-1 max-w-2xl text-zinc-400">Valeurs conçues pour être calculées de tête. Aucune calculatrice et aucune donnée externe.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><DrillCard title="Calculs aéro" detail="Distance, temps, vitesse et fractions simples de 5 à 45 minutes." example="240 kt × 15 min → 240 ÷ 4 = 60 NM" onClick={() => setDrill('flight-math')} /><DrillCard title="Caps" detail="Virages, passage par 360°, opposés, points cardinaux et QFU." example="310° + 80° à droite → 030°" onClick={() => setDrill('headings')} /></div><fieldset className="mt-6"><legend className="text-sm font-semibold">Longueur du drill</legend><div className="mt-2 flex gap-2">{([5,10,20] as const).map((value) => <button type="button" key={value} aria-pressed={count === value} onClick={() => setCount(value)} className={`rounded-lg border px-3 py-2 text-sm ${count === value ? 'border-sky-500 bg-sky-950/30 text-sky-300' : 'border-zinc-700 text-zinc-400'}`}>{value} questions</button>)}</div></fieldset></section>;
}

function DrillCard({ title, detail, example, onClick }: { title: string; detail: string; example: string; onClick: () => void }) { return <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"><h4 className="text-xl font-semibold">{title}</h4><p className="mt-2 text-sm text-zinc-400">{detail}</p><p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-sm text-zinc-300">{example}</p><button type="button" onClick={onClick} className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Lancer</button></article>; }
