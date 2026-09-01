import { useMemo, useState } from 'react';
import type { CourseFaceId } from '../courseModel';
import { COURSE_FACE_COLORS, COURSE_FACE_IDS, getCourseOpposite, getCourseRing } from '../courseFixtures';

export function rotateCourseRing(ring: readonly CourseFaceId[], offset: number): readonly CourseFaceId[] {
  return ring.map((_, index) => ring[(index + offset) % 4]);
}

export function mirrorCourseRing(ring: readonly CourseFaceId[]): readonly CourseFaceId[] {
  return [ring[0], ring[3], ring[2], ring[1]];
}

export function RingCubeWorkshop() {
  const [center, setCenter] = useState<CourseFaceId>('E');
  const [offset, setOffset] = useState(0);
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [drill, setDrill] = useState(0);
  const ring = useMemo(() => getCourseRing(center), [center]);
  const shown = rotateCourseRing(ring, offset);

  return (
    <section className="cube-workshop" aria-labelledby="ring-title">
      <header><p className="cube-kicker">Atelier 06</p><h3 id="ring-title">Lire l’anneau directement sur le cube</h3><p>Place la face centrale devant toi. Les numéros 1–4 désignent le haut, la droite, le bas et la gauche dans les deux vues.</p></header>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Face centrale">{COURSE_FACE_IDS.map((face) => <button key={face} type="button" onClick={() => { setCenter(face); setOffset(0); }} aria-pressed={face === center} className={`rounded-lg border px-3 py-2 font-mono font-bold ${face === center ? 'border-sky-400 bg-sky-950' : 'border-zinc-700'}`} style={{ color: COURSE_FACE_COLORS[face] }}>{face}</button>)}</div>
        <p className="text-sm text-zinc-400">Face exclue : <strong style={{ color: COURSE_FACE_COLORS[getCourseOpposite(center)] }}>{getCourseOpposite(center)}</strong>, l’opposée</p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ExplodedRingCube center={center} ring={shown} offset={offset} />
        <CircularRing center={center} ring={shown} offset={offset} />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setOffset((value) => (value + 1) % 4)} className="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">Tourner cube + anneau de 90°</button>
        <button type="button" onClick={() => setMirrorOpen((value) => !value)} aria-expanded={mirrorOpen} className="rounded-lg border border-amber-700 px-4 py-2 font-semibold text-amber-300">{mirrorOpen ? 'Masquer le miroir' : 'Voir l’ordre miroir'}</button>
      </div>
      <p className="mt-3 text-center text-sm text-sky-200"><strong>Le point de départ change. Le sens reste le même.</strong></p>

      {mirrorOpen && <MirrorComparison valid={shown} mirrored={mirrorCourseRing(shown)} />}
      <RingMiniDrill center={center} ring={shown} index={drill} onNext={() => setDrill((value) => (value + 1) % 4)} />
      <p className="cube-rule"><strong>Lecture face à toi :</strong> {shown.join(' → ')} → {shown[0]}. Le cercle est la version aplatie des quatre bords de la face {center}.</p>
    </section>
  );
}

function ExplodedRingCube({ center, ring, offset }: { center: CourseFaceId; ring: readonly CourseFaceId[]; offset: number }) {
  const positions = [{ x: 145, y: 44 }, { x: 244, y: 145 }, { x: 145, y: 244 }, { x: 46, y: 145 }] as const;
  const directionLabels = [{ x: 145, y: 91 }, { x: 244, y: 199 }, { x: 145, y: 286 }, { x: 46, y: 199 }] as const;
  return <figure className="rounded-2xl border border-zinc-800 bg-zinc-950/55 p-4"><figcaption className="text-center text-[11px] font-bold uppercase tracking-[.16em] text-zinc-500">Cube éclaté · face {center} vers toi</figcaption><svg viewBox="0 0 290 290" className="mx-auto mt-2 w-full max-w-[390px]" role="img" aria-label={`Cube face ${center}, voisins ${ring.join(', ')}`}>
    <defs><filter id="ring-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g key={offset} className="cube-synced-ring" style={{ transformOrigin: '145px 145px' }}>
      {ring.map((face, index) => { const p = positions[index]; return <g key={face} transform={`translate(${p.x} ${p.y})`}><path d="M-30 -30 L30 -30 L25 25 L-25 25 Z" fill="#18181b" stroke={COURSE_FACE_COLORS[face]} strokeWidth="3" transform={`rotate(${index * 90})`} opacity=".95"/><circle cx="-23" cy="-23" r="12" fill="#38bdf8"/><text x="-23" y="-19" textAnchor="middle" fill="#082f49" fontSize="11" fontWeight="900">{index + 1}</text><text y="8" textAnchor="middle" fill={COURSE_FACE_COLORS[face]} fontSize="28" fontWeight="900">{face}</text></g>; })}
    </g>
    <rect x="101" y="101" width="88" height="88" rx="12" fill="#18181b" stroke={COURSE_FACE_COLORS[center]} strokeWidth="5" filter="url(#ring-glow)"/><text x="145" y="158" textAnchor="middle" fill={COURSE_FACE_COLORS[center]} fontSize="40" fontWeight="900">{center}</text>
    {['HAUT','DROITE','BAS','GAUCHE'].map((label,index) => { const p=directionLabels[index]; return <text key={label} x={p.x} y={p.y} textAnchor="middle" fill="#71717a" fontSize="9" fontWeight="800">{label}</text>; })}
  </svg></figure>;
}

function CircularRing({ center, ring, offset }: { center: CourseFaceId; ring: readonly CourseFaceId[]; offset: number }) {
  const positions = [{ x: 145, y: 38 }, { x: 252, y: 145 }, { x: 145, y: 252 }, { x: 38, y: 145 }] as const;
  return <figure className="rounded-2xl border border-zinc-800 bg-zinc-950/55 p-4"><figcaption className="text-center text-[11px] font-bold uppercase tracking-[.16em] text-zinc-500">Même lecture · anneau aplati</figcaption><svg viewBox="0 0 290 290" className="mx-auto mt-2 w-full max-w-[390px]" role="img" aria-label={`Anneau ${ring.join(', ')}`}><defs><marker id="ring-arrow-v2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#38bdf8"/></marker></defs><circle cx="145" cy="145" r="105" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5 7"/><path d="M163 42 A105 105 0 0 1 248 127" fill="none" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#ring-arrow-v2)"/>
    <g key={offset} className="cube-synced-ring" style={{ transformOrigin: '145px 145px' }}>{ring.map((face,index) => { const p=positions[index]; return <g key={face} transform={`translate(${p.x} ${p.y})`}><circle r="31" fill="#18181b" stroke={COURSE_FACE_COLORS[face]} strokeWidth="3"/><circle cx="-23" cy="-23" r="12" fill="#38bdf8"/><text x="-23" y="-19" textAnchor="middle" fill="#082f49" fontSize="11" fontWeight="900">{index+1}</text><text y="9" textAnchor="middle" fill={COURSE_FACE_COLORS[face]} fontSize="28" fontWeight="900">{face}</text></g>;})}</g>
    <circle cx="145" cy="145" r="43" fill="#18181b" stroke={COURSE_FACE_COLORS[center]} strokeWidth="4"/><text x="145" y="157" textAnchor="middle" fill={COURSE_FACE_COLORS[center]} fontSize="38" fontWeight="900">{center}</text></svg></figure>;
}

function MirrorComparison({ valid, mirrored }: { valid: readonly CourseFaceId[]; mirrored: readonly CourseFaceId[] }) {
  return <section className="mt-5 rounded-2xl border border-amber-900/70 bg-amber-950/15 p-4"><div className="grid gap-3 sm:grid-cols-2"><OrderStrip title="Rotation valide" ring={valid} tone="green"/><OrderStrip title="Miroir impossible" ring={mirrored} tone="red"/></div><p className="mt-4 text-center text-sm text-zinc-300">Aucune rotation du cube réel ne produit l’ordre miroir.</p><a href="/cubes/learn/rotation-ou-miroir" className="mt-3 block text-center text-sm font-semibold text-sky-300 hover:underline">Continuer vers le chapitre Miroir →</a></section>;
}

function OrderStrip({ title, ring, tone }: { title: string; ring: readonly CourseFaceId[]; tone: 'green' | 'red' }) {
  return <div className={`rounded-xl border p-3 ${tone === 'green' ? 'border-green-800 bg-green-950/20' : 'border-red-900 bg-red-950/20'}`}><p className="text-center text-xs font-bold uppercase tracking-wider text-zinc-400">{title}</p><div className="mt-3 flex items-center justify-center gap-2 font-mono font-bold">{ring.map((face,index)=><span key={`${face}-${index}`} className="contents"><span style={{ color: COURSE_FACE_COLORS[face] }}>{face}</span>{index<3&&<span className="text-zinc-600">→</span>}</span>)}</div></div>;
}

function RingMiniDrill({ center, ring, index, onNext }: { center: CourseFaceId; ring: readonly CourseFaceId[]; index: number; onNext(): void }) {
  const prompts = [
    `Quel voisin est à droite de ${center} ?`,
    `Après ${ring[2]}, quel voisin referme l’anneau ?`,
    `Quel ordre peut être obtenu en tournant le cube ?`,
    `L’ordre inverse est-il une rotation ou un miroir ?`,
  ];
  return <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/45 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">Mini-drill visuel · {index + 1}/4</p><p className="mt-1 text-sm font-semibold text-zinc-200">{prompts[index]}</p></div><button type="button" onClick={onNext} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm">Question suivante →</button></section>;
}
