import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mulberry32, newSeed } from '../../core/rng';
import { CultureSession } from '../components/CultureSession';
import { generateFlightMathQuestion } from '../generators/flightMath';
import { generateHeadingQuestion } from '../generators/headings';
import { useCultureStore } from '../hooks/useCultureStore';
import { recordCultureDrillAttempt } from '../storage';
import type { CultureDrillType } from '../types';

type Drill = 'flight-math' | 'headings';
const FLIGHT_TYPES = new Set<CultureDrillType>(['distance', 'time', 'speed']);
const HEADING_TYPES = new Set<CultureDrillType>(['heading-turn', 'opposite-heading', 'angular-difference', 'qfu', 'cardinal-heading']);

function validRequestedType(value: string | null): CultureDrillType | undefined {
  if (!value) return undefined;
  return FLIGHT_TYPES.has(value as CultureDrillType) || HEADING_TYPES.has(value as CultureDrillType) ? value as CultureDrillType : undefined;
}

export function CultureDrillsPage() {
  const [params, setParams] = useSearchParams();
  const requestedType = validRequestedType(params.get('type'));
  const requestedCount = Number(params.get('count'));
  const initialCount: 5 | 10 | 20 = requestedCount === 5 || requestedCount === 10 || requestedCount === 20 ? requestedCount : 10;
  const initialDrill: Drill | null = requestedType ? FLIGHT_TYPES.has(requestedType) ? 'flight-math' : 'headings' : null;
  const [drill, setDrill] = useState<Drill | null>(initialDrill);
  const [count, setCount] = useState<5 | 10 | 20>(initialCount);
  const { updateStore } = useCultureStore();
  const questions = useMemo(() => drill ? Array.from({ length: count }, (_, index) => {
    const rng = mulberry32(newSeed() + index);
    return drill === 'flight-math'
      ? generateFlightMathQuestion(rng, requestedType && FLIGHT_TYPES.has(requestedType) ? requestedType as 'distance' | 'time' | 'speed' : undefined)
      : generateHeadingQuestion(rng, requestedType && HEADING_TYPES.has(requestedType) ? requestedType as 'heading-turn' | 'opposite-heading' | 'angular-difference' | 'qfu' | 'cardinal-heading' : undefined);
  }) : [], [count, drill, requestedType]);
  const recordAttempt = useCallback(({ question, given, correct, responseTimeMs }: Parameters<NonNullable<React.ComponentProps<typeof CultureSession>['onAttempt']>>[0]) => {
    const drillType = question.drillType;
    if (!drillType) return;
    updateStore((store) => recordCultureDrillAttempt({ store, drillType, correct, expectedAnswer: question.answer, givenAnswer: given, responseTimeMs, now: new Date() }));
  }, [updateStore]);
  const exitDrill = () => {
    setDrill(null);
    if (requestedType) setParams({}, { replace: true });
  };
  if (drill) return <CultureSession questions={questions} title={drill === 'flight-math' ? 'Calculs aéro' : 'Caps'} subtitle={`${count} exercices générés · méthode mentale après chaque réponse`} mode={drill} tracked={false} onAttempt={recordAttempt} onExit={exitDrill} />;
  return <section><p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Drills générés localement</p><h3 className="mt-1 text-2xl font-bold">Calculs aéro & caps</h3><p className="mt-1 max-w-2xl text-zinc-400">Valeurs conçues pour être calculées de tête. Aucune calculatrice et aucune donnée externe.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><DrillCard title="Calculs aéro" detail="Distance, temps, vitesse et fractions simples de 5 à 45 minutes." example="240 kt × 15 min → 240 ÷ 4 = 60 NM" onClick={() => setDrill('flight-math')} /><DrillCard title="Caps" detail="Virages, passage par 360°, opposés, points cardinaux et QFU." example="310° + 80° à droite → 030°" onClick={() => setDrill('headings')} /></div><fieldset className="mt-6"><legend className="text-sm font-semibold">Longueur du drill</legend><div className="mt-2 flex gap-2">{([5,10,20] as const).map((value) => <button type="button" key={value} aria-pressed={count === value} onClick={() => setCount(value)} className={`rounded-lg border px-3 py-2 text-sm ${count === value ? 'border-sky-500 bg-sky-950/30 text-sky-300' : 'border-zinc-700 text-zinc-400'}`}>{value} questions</button>)}</div></fieldset></section>;
}

function DrillCard({ title, detail, example, onClick }: { title: string; detail: string; example: string; onClick: () => void }) { return <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"><h4 className="text-xl font-semibold">{title}</h4><p className="mt-2 text-sm text-zinc-400">{detail}</p><p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-sm text-zinc-300">{example}</p><button type="button" onClick={onClick} className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">Lancer</button></article>; }
