import { useEffect, useState } from 'react';
import { Glyph } from '../../CubeSvg';
import type { FaceEdge } from '../../domain/types';
import { rotateEdge } from '../../domain/cubeGeometry';
import type { CourseFaceId } from '../courseModel';
import { COURSE_FACE_COLORS, COURSE_FACE_IDS, getCourseOpposite, getCourseRing } from '../courseFixtures';
import { CourseFace, CourseNet } from './CourseNet';
import { MotionControls } from './MotionControls';

const EDGE_LINE: Record<FaceEdge, { x1: number; y1: number; x2: number; y2: number }> = {
  top: { x1: 12, y1: 5, x2: 88, y2: 5 }, right: { x1: 95, y1: 12, x2: 95, y2: 88 },
  bottom: { x1: 12, y1: 95, x2: 88, y2: 95 }, left: { x1: 5, y1: 12, x2: 5, y2: 88 },
};
const EDGE_POINT: Record<FaceEdge, [number, number]> = { top: [50, -14], right: [114, 50], bottom: [50, 114], left: [-14, 50] };
const EDGE_LABEL: Record<FaceEdge, string> = { top: 'supérieur', right: 'droit', bottom: 'inférieur', left: 'gauche' };

export function RecenterWorkshop() {
  const [center, setCenter] = useState<CourseFaceId>('E');
  const ring = getCourseRing(center);
  const positions = [ring[0], ring[3], center, ring[1], getCourseOpposite(center), ring[2]] as const;
  return (
    <section className="cube-workshop" aria-labelledby="recenter-title">
      <header><p className="cube-kicker">Atelier 05</p><h3 id="recenter-title">Même cube, nouvelle face centrale</h3><p>Choisis une face. Sa couleur garde son identité pendant que le cube est redéplié autour d’elle.</p></header>
      <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <CourseNet label="Patron de départ" focus={[center]} muted={COURSE_FACE_IDS.filter((face) => face !== center)} />
        <div className="cube-axis" aria-label={`La face ${center} traverse le cube sans changer d’identité`}><CourseFace face={center} size={84} /><span>même face physique</span><span aria-hidden>⟶</span></div>
        <figure><figcaption className="mb-3 text-center text-[11px] font-bold uppercase tracking-[.18em] text-zinc-500">Patron recentré sur {center}</figcaption><svg viewBox="0 0 410 310" className="mx-auto w-full max-w-[430px]" role="img" aria-label={`Patron avec ${center} au centre, entourée de ${ring.join(', ')}`}>
          {[[105,5,positions[0]],[5,105,positions[1]],[105,105,positions[2]],[205,105,positions[3]],[305,105,positions[4]],[105,205,positions[5]]].map(([x,y,face], index) => {
            const px = Number(x); const py = Number(y);
            const id = face as CourseFaceId; const color = COURSE_FACE_COLORS[id];
            return <g key={`${id}-${index}`} transform={`translate(${px} ${py})`} className="cube-recenter-face" style={{ animationDelay: `${index * 70}ms` }}><rect width="94" height="94" rx="9" fill="#202126" stroke={color} strokeWidth={id === center ? 4 : 2}/><text x="47" y="57" textAnchor="middle" fill={color} fontSize="30" fontWeight="900">{id}</text></g>;
          })}
        </svg></figure>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">{COURSE_FACE_IDS.map((face) => <button key={face} type="button" onClick={() => setCenter(face)} aria-pressed={face === center} className={`rounded-lg border px-3 py-2 font-mono font-bold ${face === center ? 'bg-zinc-100 text-zinc-950' : 'border-zinc-700 bg-zinc-900'}`} style={face === center ? undefined : { color: COURSE_FACE_COLORS[face] }}>{face} au centre</button>)}</div>
      <p className="cube-rule"><strong>Ce qui ne change jamais :</strong> {center} reste opposée à {getCourseOpposite(center)}. Seules les cases à l’écran changent.</p>
    </section>
  );
}

export function RingWorkshop() {
  const [center, setCenter] = useState<CourseFaceId>('E');
  const [offset, setOffset] = useState(0);
  const ring = getCourseRing(center);
  const shown = ring.map((_, index) => ring[(index + offset) % 4]);
  const coords = [[130,28],[232,130],[130,232],[28,130]] as const;
  return (
    <section className="cube-workshop" aria-labelledby="ring-title"><header><p className="cube-kicker">Atelier 06</p><h3 id="ring-title">L’anneau des quatre voisins</h3><p>Le point de départ peut tourner. Le sens haut → droite → bas → gauche ne s’inverse jamais.</p></header>
      <div className="mt-5 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div><label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Face centrale</label><div className="mt-2 flex flex-wrap gap-2">{COURSE_FACE_IDS.map((face) => <button key={face} onClick={() => { setCenter(face); setOffset(0); }} className="rounded-md border border-zinc-700 px-3 py-2 font-mono" style={{ color: COURSE_FACE_COLORS[face] }}>{face}</button>)}</div><p className="mt-5 text-sm text-zinc-400">Opposée exclue de l’anneau : <strong style={{ color: COURSE_FACE_COLORS[getCourseOpposite(center)] }}>{getCourseOpposite(center)}</strong></p><button onClick={() => setOffset((value) => (value + 1) % 4)} className="mt-4 rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">Tourner l’anneau de 90°</button></div>
        <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-[420px]" role="img" aria-label={`Autour de ${center}, ordre horaire ${shown.join(', ')}`}><defs><marker id="course-ring-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#38bdf8"/></marker></defs><circle cx="130" cy="130" r="96" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 6"/><path d="M146 34 A98 98 0 0 1 226 114" fill="none" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#course-ring-arrow)"/><rect x="92" y="92" width="76" height="76" rx="12" fill="#18181b" stroke={COURSE_FACE_COLORS[center]} strokeWidth="4"/><text x="130" y="143" textAnchor="middle" fill={COURSE_FACE_COLORS[center]} fontSize="38" fontWeight="900">{center}</text>{shown.map((face,index) => { const [x,y]=coords[index]; return <g key={`${face}-${index}`} className="cube-ring-node"><circle cx={x} cy={y} r="28" fill="#202126" stroke={COURSE_FACE_COLORS[face]} strokeWidth="3"/><text x={x} y={y+8} textAnchor="middle" fill={COURSE_FACE_COLORS[face]} fontSize="25" fontWeight="900">{face}</text><circle cx={x-20} cy={y-20} r="10" fill="#38bdf8"/><text x={x-20} y={y-16} textAnchor="middle" fill="#082f49" fontSize="10" fontWeight="900">{index+1}</text></g>;})}</svg></div>
      <p className="cube-rule"><strong>Lecture actuelle :</strong> {shown.join(' → ')} → {shown[0]}. Un décalage est une rotation valide ; l’ordre inverse serait un miroir.</p>
    </section>
  );
}

export function PhysicalEdgeRotation() {
  const [turn, setTurn] = useState<0|1|2|3>(1);
  const [playing, setPlaying] = useState(true);
  const [replay, setReplay] = useState(0);
  const sourceEdge: FaceEdge = 'top';
  const targetEdge = rotateEdge(sourceEdge, turn);
  useEffect(() => { if (!playing) return; const timer = window.setTimeout(() => setPlaying(false), 850); return () => window.clearTimeout(timer); }, [playing, replay, turn]);
  const label = turn === 0 ? 'aucune rotation' : turn === 2 ? '180°' : turn === 1 ? '90° antihoraire' : '90° horaire';
  return (
    <section className="cube-workshop" aria-labelledby="edge-title"><header><p className="cube-kicker">Atelier 08</p><h3 id="edge-title">Le même bord physique doit retrouver son voisin</h3><p>Le trait rouge appartient à la face. Il tourne avec le carré et avec le symbole — il ne reste pas collé en haut de l’écran.</p></header>
      <div className="mt-7 grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]"><EdgeGlyph label="Avant — bord supérieur" edge={sourceEdge} rot={0}/><div className="text-center"><span className="text-4xl text-sky-400">⟶</span><p className="mt-2 font-mono text-sm text-sky-300">{label}</p></div><EdgeGlyph key={replay} label={`Après — bord ${EDGE_LABEL[targetEdge]}`} edge={sourceEdge} rot={0} animated playing={playing} turn={turn}/></div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">{([0,1,2,3] as const).map((value) => <button key={value} onClick={() => { setTurn(value); setReplay((v)=>v+1); setPlaying(true); }} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${value===turn?'border-sky-400 bg-sky-950 text-sky-200':'border-zinc-700'}`}>{value===0?'0°':value===1?'90° ↶':value===2?'180°':'90° ↷'}</button>)}</div><div className="mt-4"><MotionControls playing={playing} onToggle={() => setPlaying((value)=>!value)} onReplay={() => { setReplay((value)=>value+1); setPlaying(true); }} label="rotation du bord physique"/></div>
      <p className="cube-rule"><strong>Voisin ancre : E.</strong> Avant, E touche le bord rouge supérieur. Après la rotation, le même bord apparaît côté {targetEdge} ; le symbole a tourné exactement avec lui.</p>
    </section>
  );
}

function EdgeGlyph({ label, edge, rot, animated = false, playing = false, turn = 0 }: { label: string; edge: FaceEdge; rot: number; animated?: boolean; playing?: boolean; turn?: number }) {
  const anchorEdge = animated ? rotateEdge(edge, turn as 0 | 1 | 2 | 3) : edge;
  const point = EDGE_POINT[anchorEdge]; const line = EDGE_LINE[edge];
  return <figure className="text-center"><svg viewBox="-28 -28 156 156" className="mx-auto w-full max-w-[220px]" role="img" aria-label={`${label}; le bord rouge touche E`}><g className={animated ? 'cube-physical-turn' : undefined} style={animated ? { '--cube-course-turn': `${-90*turn}deg`, transformOrigin: '50px 50px', animationPlayState: playing ? 'running' : 'paused' } as React.CSSProperties : undefined}><rect width="100" height="100" rx="10" fill="#202126" stroke="#71717a" strokeWidth="2"/><Glyph sym={1} rot={rot}/><line {...line} stroke="#fb7185" strokeWidth="7" strokeLinecap="round"/></g><circle cx={point[0]} cy={point[1]} r="18" fill="#18181b" stroke={COURSE_FACE_COLORS.E} strokeWidth="3"/><text x={point[0]} y={point[1]+6} textAnchor="middle" fill={COURSE_FACE_COLORS.E} fontSize="18" fontWeight="900">E</text></svg><figcaption className="mt-2 text-xs font-semibold text-zinc-400">{label}</figcaption></figure>;
}
