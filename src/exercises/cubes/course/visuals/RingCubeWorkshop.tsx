import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { FacePosition } from '../../domain/types';
import { FoldingNet } from '../../FoldingNet';
import type { QuarterTurn } from '../../domain/types';
import {
  COURSE_CUBE,
  COURSE_FACE_COLORS,
  COURSE_FACE_IDS,
  COURSE_POSITION_TO_FACE,
} from '../courseFixtures';
import type { CourseFaceId } from '../courseModel';
import {
  getMentalRingMastery,
  getMentalRingStats,
  loadCubeCourseProgress,
} from '../courseProgress';
import { buildRingScene, rotateRing } from '../ringSceneModel';
import type { RingOrder } from '../ringSceneModel';
import { CourseNet } from './CourseNet';
import { MentalRingCube3D } from './MentalRingCube3D';
import type { MentalRingCubeLayers } from './MentalRingCube3D';
import { MentalRingDrill } from './MentalRingDrill';

export function rotateCourseRing(ring: readonly CourseFaceId[], offset: number): readonly CourseFaceId[] {
  const normalized = (((offset % 4) + 4) % 4) as QuarterTurn;
  return rotateRing(ring as RingOrder, normalized);
}

export function mirrorCourseRing(ring: readonly CourseFaceId[]): readonly CourseFaceId[] {
  return [ring[0], ring[3], ring[2], ring[1]];
}

const DEFAULT_LAYERS: MentalRingCubeLayers = {
  neighbors: true,
  opposite: true,
  numbers: true,
  edges: true,
  neighborLabels: true,
};

const HELP_LEVELS = [
  { level: 1 as const, title: 'Guidé', description: 'Cube, lettres et numéros visibles.' },
  { level: 2 as const, title: 'Semi-guidé', description: 'Cube visible, voisins à identifier.' },
  { level: 3 as const, title: 'Faire de tête', description: 'Cube caché avant la correction.' },
];

export function RingCubeWorkshop({ onProgress }: { onProgress?(): void }) {
  const [center, setCenter] = useState<CourseFaceId>('A');
  const [quarterTurn, setQuarterTurn] = useState<QuarterTurn>(0);
  const [aidLevel, setAidLevel] = useState<1 | 2 | 3>(1);
  const [mentalReveal, setMentalReveal] = useState(false);
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [pickedFace, setPickedFace] = useState<CourseFaceId | null>(null);
  const [layers, setLayers] = useState<MentalRingCubeLayers>(DEFAULT_LAYERS);
  const [revision, setRevision] = useState(0);
  const scene = useMemo(() => buildRingScene(center, quarterTurn), [center, quarterTurn]);
  const cubeHidden = aidLevel === 3 && !mentalReveal;
  const effectiveLayers: MentalRingCubeLayers = aidLevel === 2
    ? { ...layers, numbers: true, neighborLabels: false }
    : layers;

  const chooseCenter = (face: CourseFaceId) => {
    setCenter(face);
    setPickedFace(null);
    setQuarterTurn(0);
    setMentalReveal(false);
  };

  const recorded = () => {
    setRevision((value) => value + 1);
    onProgress?.();
  };

  return (
    <section className="cube-workshop" aria-labelledby="ring-title">
      <header><p className="cube-kicker">Atelier 06</p><h3 id="ring-title">Reconstruire l’anneau de tête</h3><p>Le patron, le cube 3D et le cercle ci-dessous sont trois vues du même état calculé. L’aide disparaît progressivement jusqu’à la reconstruction mentale.</p></header>

      <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Progression de l’aide">
        {HELP_LEVELS.map(({ level, title, description }) => <button key={level} type="button" onClick={() => { setAidLevel(level); setMentalReveal(false); }} aria-pressed={aidLevel === level} className={`rounded-xl border p-4 text-left ${aidLevel === level ? 'border-sky-400 bg-sky-950/35' : 'border-zinc-800 bg-zinc-950/45'}`}><span className="font-mono text-xs text-sky-400">Niveau {level}</span><strong className="mt-1 block">{title}</strong><span className="mt-1 block text-xs text-zinc-500">{description}</span></button>)}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Mettre une face devant moi">
          {COURSE_FACE_IDS.map((face) => <button key={face} type="button" onClick={() => chooseCenter(face)} aria-pressed={face === center} className={`rounded-lg border px-3 py-2 font-mono font-bold ${face === center ? 'border-white bg-zinc-100 text-zinc-950' : 'border-zinc-700'}`} style={face === center ? undefined : { color: COURSE_FACE_COLORS[face] }}>{face}</button>)}
        </div>
        <p className="rounded-full border border-zinc-800 bg-zinc-950/65 px-4 py-2 text-sm">Face opposée : <strong style={{ color: COURSE_FACE_COLORS[scene.oppositeFaceId] }}>{scene.oppositeFaceId}</strong></p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[.78fr_1.25fr_1fr]">
        <PanelTitle title="1 · Patron 2D de référence"><CourseNet label="Patron neutre A–F" focus={[center]} muted={[scene.oppositeFaceId]} /></PanelTitle>
        <PanelTitle title="2 · Cube 3D manipulable">
          <MentalRingCube3D scene={scene} hidden={cubeHidden} layers={effectiveLayers} onFaceClick={setPickedFace} />
          {pickedFace && pickedFace !== center && <button type="button" onClick={() => chooseCenter(pickedFace)} className="mt-3 w-full rounded-lg border border-sky-700 px-3 py-2 text-sm font-semibold text-sky-200">Mettre {pickedFace} devant moi</button>}
          {aidLevel === 3 && !mentalReveal && <button type="button" onClick={() => setMentalReveal(true)} className="mt-3 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold">Révéler après mon effort</button>}
        </PanelTitle>
        <PanelTitle title="3 · Anneau aplati">{cubeHidden ? <HiddenRing /> : <FlattenedRing center={center} ring={scene.displayedNeighbors} />}</PanelTitle>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => setQuarterTurn((value) => ((value + 1) % 4) as QuarterTurn)} className="rounded-lg bg-sky-600 px-4 py-2 font-semibold">Tourner de 90°</button>
        <button type="button" onClick={() => setMirrorOpen((value) => !value)} aria-expanded={mirrorOpen} className="rounded-lg border border-amber-700 px-4 py-2 font-semibold text-amber-300">{mirrorOpen ? 'Masquer l’ordre miroir' : 'Voir l’ordre miroir'}</button>
      </div>
      <p className="mt-3 text-center text-sm text-sky-200"><strong>Le point de départ change. L’ordre circulaire reste le même.</strong></p>

      <LayerControls layers={layers} onChange={setLayers} />
      <RingOriginSequence center={center} />
      {mirrorOpen && <MirrorComparison center={center} valid={scene.displayedNeighbors} />}
      <MentalRingDrill initialAidLevel={aidLevel} initialSeed={601 + revision} onRecorded={recorded} />
      <MentalRingStatsPanel revision={revision} />

      <section className="mt-6 rounded-2xl border border-sky-900/70 bg-sky-950/15 p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-400">Pour trouver un anneau de tête</p><ol className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2"><li>1. Choisis la face centrale.</li><li>2. Élimine son opposée.</li><li>3. Imagine cette face devant toi.</li><li>4. Lis haut → droite → bas → gauche.</li><li>5. Une rotation décale le départ.</li><li>6. Elle n’inverse jamais le sens.</li></ol></section>
    </section>
  );
}

function PanelTitle({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-zinc-800 bg-zinc-950/45 p-3"><h4 className="mb-3 text-center text-[11px] font-bold uppercase tracking-[.16em] text-zinc-500">{title}</h4>{children}</section>;
}

function HiddenRing() {
  return <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-zinc-700 p-6 text-center"><p className="text-sm text-zinc-400"><strong className="block text-zinc-200">Anneau masqué</strong>Écris mentalement haut → droite → bas → gauche.</p></div>;
}

function FlattenedRing({ center, ring }: { center: CourseFaceId; ring: readonly CourseFaceId[] }) {
  const positions = [{ x: 145, y: 38 }, { x: 252, y: 145 }, { x: 145, y: 252 }, { x: 38, y: 145 }] as const;
  return <figure><figcaption className="sr-only">anneau aplati autour de {center}</figcaption><svg viewBox="0 0 290 290" className="mx-auto w-full max-w-[360px]" role="img" aria-label={`Anneau aplati ${ring.join(', ')}`}><defs><marker id="mental-ring-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#38bdf8" /></marker></defs><circle cx="145" cy="145" r="105" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5 7" /><path d="M163 42 A105 105 0 0 1 248 127" fill="none" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#mental-ring-arrow)" />{ring.map((face, index) => { const point = positions[index]; return <g key={face} transform={`translate(${point.x} ${point.y})`} className="cube-synced-ring"><circle r="31" fill="#18181b" stroke={COURSE_FACE_COLORS[face]} strokeWidth="3" /><circle cx="-23" cy="-23" r="12" fill="#38bdf8" /><text x="-23" y="-19" textAnchor="middle" fill="#082f49" fontSize="11" fontWeight="900">{index + 1}</text><text y="9" textAnchor="middle" fill={COURSE_FACE_COLORS[face]} fontSize="28" fontWeight="900">{face}</text></g>; })}<circle cx="145" cy="145" r="43" fill="#18181b" stroke={COURSE_FACE_COLORS[center]} strokeWidth="4" /><text x="145" y="157" textAnchor="middle" fill={COURSE_FACE_COLORS[center]} fontSize="38" fontWeight="900">{center}</text></svg><p className="text-center font-mono text-sm font-semibold text-sky-300">{ring.join(' → ')}</p></figure>;
}

function LayerControls({ layers, onChange }: { layers: MentalRingCubeLayers; onChange(layers: MentalRingCubeLayers): void }) {
  const entries = [['neighbors', 'Voisins'], ['opposite', 'Opposée'], ['numbers', 'Numéros 1–4'], ['edges', 'Arêtes']] as const;
  return <section className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/45 p-4"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Explorer le cube</p><div className="mt-3 flex flex-wrap gap-2">{entries.map(([key, label]) => <button key={key} type="button" aria-pressed={layers[key]} onClick={() => onChange({ ...layers, [key]: !layers[key] })} className={`rounded-lg border px-3 py-2 text-sm ${layers[key] ? 'border-sky-700 bg-sky-950/35 text-sky-200' : 'border-zinc-700 text-zinc-500'}`}>{layers[key] ? '✓ ' : ''}{label}</button>)}</div></section>;
}

function RingOriginSequence({ center }: { center: CourseFaceId }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const scene = buildRingScene(center, 0);
  const labels = Object.fromEntries(Object.entries(COURSE_POSITION_TO_FACE).map(([position, face]) => [Number(position), face])) as Partial<Record<FacePosition, string>>;
  const colors = Object.fromEntries(Object.entries(COURSE_POSITION_TO_FACE).map(([position, face]) => [Number(position), COURSE_FACE_COLORS[face]])) as Partial<Record<FacePosition, string>>;
  const steps = ['Patron neutre', `Face ${center} repérée`, 'Pliage du patron', `${center} tourne vers la caméra`, 'Quatre voisines', 'Numéros 1–4', 'Anneau aplati'];
  return <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/45 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Transfert spatial</p><h4 className="mt-1 font-semibold">Montre-moi d’où vient l’anneau</h4></div><button type="button" onClick={() => { setOpen((value) => !value); setStep(0); }} className="rounded-lg border border-sky-700 px-3 py-2 text-sm text-sky-200">{open ? 'Fermer' : 'Lancer la séquence'}</button></div>{open && <><div className="mt-4 flex gap-2 overflow-x-auto pb-2">{steps.map((label, index) => <button key={label} type="button" onClick={() => setStep(index)} className={`min-w-fit rounded-lg border px-3 py-2 text-xs ${step === index ? 'border-sky-400 bg-sky-950' : 'border-zinc-800 text-zinc-500'}`}>{index + 1}. {label}</button>)}</div><div className="mt-4">{step <= 1 && <CourseNet label={steps[step]} focus={step === 1 ? [center] : []} muted={step === 1 ? COURSE_FACE_IDS.filter((face) => face !== center) : []} />}{step === 2 && <div className="flex justify-center"><FoldingNet cube={COURSE_CUBE} t={0.72} faceLabels={labels} faceColors={colors} px={320} /></div>}{step >= 3 && step <= 5 && <MentalRingCube3D scene={scene} layers={{ neighbors: step >= 4, opposite: true, numbers: step >= 5, edges: true, neighborLabels: step >= 4 }} interactive={false} />}{step === 6 && <FlattenedRing center={center} ring={scene.displayedNeighbors} />}</div><div className="mt-4 flex justify-between"><button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm disabled:opacity-30">← Précédent</button><button type="button" disabled={step === 6} onClick={() => setStep((value) => Math.min(6, value + 1))} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm disabled:opacity-30">Suivant →</button></div></>}</section>;
}

function MirrorComparison({ center, valid }: { center: CourseFaceId; valid: RingOrder }) {
  const [tested, setTested] = useState(0);
  const mirrored = mirrorCourseRing(valid);
  useEffect(() => {
    if (tested <= 0 || tested >= 24) return;
    const timer = window.setTimeout(() => setTested((value) => value + 1), 90);
    return () => window.clearTimeout(timer);
  }, [tested]);
  return <section className="mt-5 rounded-2xl border border-amber-900/70 bg-amber-950/15 p-4"><div className="grid gap-4 lg:grid-cols-2"><div><p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-green-400">Cube réel</p><MentalRingCube3D scene={buildRingScene(center, 0)} interactive={false} /><div className="mt-2"><OrderStrip order={valid} tone="green" /></div></div><div><p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-red-400">Configuration miroir</p><div className="grid min-h-[320px] place-items-center rounded-2xl border border-red-900 bg-red-950/20 p-5"><div className="w-full"><p className="text-center text-5xl text-red-400">⇄</p><OrderStrip order={mirrored} tone="red" /><p className="mt-3 text-center text-sm text-red-300">Le sens circulaire est inversé.</p></div></div></div></div><div className="mt-4 flex flex-wrap items-center justify-center gap-3"><button type="button" onClick={() => setTested(1)} className="rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-200">Tester les 24 rotations</button>{tested > 0 && <span className="font-mono text-sm text-zinc-300">{tested}/24 testées</span>}</div>{tested === 24 && <p role="status" className="mt-3 text-center text-sm font-semibold text-red-300">Aucune rotation du cube réel n’atteint cet ordre inversé.</p>}</section>;
}

function OrderStrip({ order, tone }: { order: readonly CourseFaceId[]; tone: 'green' | 'red' }) {
  return <div className={`rounded-xl border p-3 text-center font-mono font-bold ${tone === 'green' ? 'border-green-800 bg-green-950/20 text-green-300' : 'border-red-900 bg-red-950/20 text-red-300'}`}>{order.join(' → ')}</div>;
}

const STAT_LABELS = { top: 'Voisin haut', right: 'Voisin droite', bottom: 'Voisin bas', left: 'Voisin gauche', 'full-ring': 'Anneau complet', mirror: 'Rotation / miroir' } as const;

function MentalRingStatsPanel({ revision }: { revision: number }) {
  void revision;
  const progress = loadCubeCourseProgress();
  const mastery = getMentalRingMastery(progress);
  const stats = getMentalRingStats(progress);
  const historical = progress.historicallyCompletedChapterIds.includes('anneau-des-voisins');
  return <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Compétence distincte</p><h4 className="mt-1 text-lg font-semibold">Anneau de tête</h4>{historical && <p className="mt-1 text-xs text-zinc-500">Chapitre 6 validé historiquement · nouvelle maîtrise à acquérir</p>}</div><span className={`rounded-full border px-3 py-1 text-sm font-semibold ${mastery.mastered ? 'border-green-700 text-green-300' : 'border-amber-800 text-amber-300'}`}>{mastery.mastered ? 'Acquise' : `${mastery.correct}/${mastery.attempts} récents`}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{stats.map((stat) => <div key={stat.kind} className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm"><span className="text-zinc-400">{STAT_LABELS[stat.kind]}</span><strong className="font-mono">{stat.accuracy === null ? '—' : `${Math.round(stat.accuracy * 100)} %`}</strong></div>)}</div><div className="mt-4 grid gap-2 text-xs text-zinc-400 sm:grid-cols-4"><span>{mastery.attempts}/12 tentatives</span><span>{mastery.accuracy === null ? '—' : `${Math.round(mastery.accuracy * 100)} %`} / 80 %</span><span>{mastery.distinctFaces}/4 faces</span><span>{mastery.lastFiveMental ? '✓ 5 dernières mentales' : '5 dernières sans aide requises'}</span></div></section>;
}
