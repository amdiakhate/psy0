import { useMemo, useState } from 'react';
import { CubesExercise } from '../CubesExercise';
import { generate, validate } from '../generator';
import type { CubesAnswer } from '../generator';
import { CubeCoachCorrection } from '../coach/CubeCoachCorrection';
import { FoldPlayer } from '../FoldingNet';
import { COURSE_CUBE, COURSE_FACE_COLORS, COURSE_FACE_IDS, COURSE_POSITION_TO_FACE, getCourseOpposite, getCourseRing } from './courseFixtures';
import { CourseFace, CourseNet } from './visuals/CourseNet';
import { PhysicalEdgeRotation, RecenterWorkshop, RingWorkshop } from './visuals/PriorityWorkshops';

export function ChapterVisual({ order }: { order: number }) {
  if (order === 1) return <FoldIntro />;
  if (order === 2) return <Opposites />;
  if (order === 3) return <Adjacency />;
  if (order === 4) return <Belt />;
  if (order === 5) return <RecenterWorkshop />;
  if (order === 6) return <RingWorkshop />;
  if (order === 7) return <Mirror />;
  if (order === 8) return <PhysicalEdgeRotation />;
  if (order === 9) return <RealBoards />;
  return <TimingRoutine />;
}

function FoldIntro() {
  const labels = Object.fromEntries(Object.entries(COURSE_POSITION_TO_FACE).map(([position, face]) => [Number(position), face]));
  const colors = Object.fromEntries(Object.entries(COURSE_POSITION_TO_FACE).map(([position, face]) => [Number(position), COURSE_FACE_COLORS[face]]));
  return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 01</p><h3>Du patron plat au cube</h3><p>Pilote le vrai pliage géométrique. Les lettres et les couleurs restent attachées à leur face physique.</p></header><div className="mt-6 grid items-center gap-6 lg:grid-cols-2"><CourseNet label="Patron à plat" focus={COURSE_FACE_IDS}/><div><FoldPlayer cube={COURSE_CUBE} faceLabels={labels} faceColors={colors}/><p className="mt-2 text-center text-xs text-zinc-500">Pause puis déplace le curseur dans les deux sens.</p></div></div><p className="cube-rule"><strong>Cube fermé :</strong> B reste devant, D ferme l’arrière, E et F deviennent dessus et dessous.</p></section>;
}

function Opposites() {
  const pairs = [['A','C'],['B','D'],['E','F']] as const;
  return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 02</p><h3>Trois paires, zéro contact</h3><p>Chaque trait relie deux faces qui finissent face à face. Elles ne partagent jamais d’arête.</p></header><CourseNet label="Patron de référence" focus={COURSE_FACE_IDS}/><div className="mt-5 grid gap-3 sm:grid-cols-3">{pairs.map(([a,b])=><div key={a} className="flex items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"><CourseFace face={a} size={52}/><span className="text-zinc-500">↔</span><CourseFace face={b} size={52}/></div>)}</div></section>;
}

function Adjacency() {
  const [face, setFace] = useState<'B'|'E'>('B'); const ring=getCourseRing(face);
  return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 03</p><h3>Une arête commune = deux faces voisines</h3><p>Choisis la face centrale. Ses quatre voisines s’allument ; son opposée reste éteinte.</p></header><div className="mt-5 flex justify-center gap-2">{(['B','E'] as const).map((id)=><button onClick={()=>setFace(id)} className="rounded-lg border border-zinc-700 px-4 py-2" key={id}>{id}</button>)}</div><CourseNet label={`Voisines de ${face}`} focus={[face,...ring]} muted={[getCourseOpposite(face)]}/><p className="cube-rule">{face} touche {ring.join(', ')}. Elle ne touche jamais {getCourseOpposite(face)}.</p></section>;
}

function Belt() {
  return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 04</p><h3>La ceinture se referme</h3><p>A–B–C–D forme une bande circulaire. L’arête cachée D–A apparaît seulement quand le cube se ferme.</p></header><div className="mt-7 flex items-center justify-center gap-2">{(['A','B','C','D'] as const).map((face,index)=><div key={face} className="flex items-center gap-2"><CourseFace face={face} size={64}/>{index<3&&<span className="text-zinc-600">—</span>}</div>)}</div><div className="mx-auto mt-5 flex max-w-md items-center justify-between rounded-full border border-dashed border-amber-500/60 px-6 py-3 text-sm text-amber-300"><span>D</span><span>fermeture cachée D–A</span><span>A</span></div></section>;
}

function Mirror() {
  const ring=getCourseRing('E'); const mirrored=[ring[0],ring[3],ring[2],ring[1]];
  return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 07</p><h3>Une rotation décale. Un miroir inverse.</h3><p>Compare les flèches. Les mêmes quatre voisins ne suffisent pas : leur sens circulaire décide.</p></header><div className="mt-6 grid gap-5 sm:grid-cols-2"><MiniRing label="Rotation valide" ring={ring} tone="green"/><MiniRing label="Miroir impossible" ring={mirrored} tone="red"/></div><p className="cube-rule">Aucune des 24 rotations propres du cube ne peut transformer une flèche horaire en flèche antihoraire.</p></section>;
}
function MiniRing({label,ring,tone}:{label:string;ring:readonly string[];tone:'green'|'red'}) { return <div className={`rounded-2xl border p-5 ${tone==='green'?'border-green-800 bg-green-950/15':'border-red-900 bg-red-950/15'}`}><p className="text-center font-semibold">{label}</p><div className="mt-4 grid grid-cols-4 gap-2">{ring.map((face,index)=><div key={`${face}-${index}`} className="text-center"><span className="text-[10px] text-zinc-500">{index+1}</span><div className="mt-1 rounded-lg border border-zinc-700 p-3 font-mono font-black">{face}</div></div>)}</div><p className={`mt-3 text-center text-sm ${tone==='green'?'text-green-400':'text-red-400'}`}>{ring.join(' → ')}</p></div>; }

function RealBoards() {
  const [seed,setSeed]=useState(9051); const item=useMemo(()=>generate(seed,3,'letters'),[seed]); const [answer,setAnswer]=useState<CubesAnswer|null>(null);
  return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 09</p><h3>Une vraie planche, sans chrono</h3><p>Prends le temps. Opposées, placements certains, deux candidats, anneau, puis orientation.</p></header><div className="mt-5 min-h-[430px] rounded-2xl border border-zinc-800 bg-zinc-950/35 p-4"><CubesExercise item={item} onAnswer={setAnswer}/></div>{answer&&<div className="mt-5"><CubeCoachCorrection item={item} answer={answer}/><button onClick={()=>{setSeed((value)=>value+1);setAnswer(null);}} className="mt-4 rounded-lg bg-sky-600 px-4 py-2 font-semibold">Planche suivante</button><p className={`mt-2 text-sm ${validate(item,answer)?'text-green-400':'text-red-400'}`}>{validate(item,answer)?'Planche correcte.':'La correction cible ta première erreur utile.'}</p></div>}</section>;
}

function TimingRoutine() { const [active,setActive]=useState(0); const phases=[['0–10 s','Opposées'],['10–30 s','Placements'],['30–45 s','Anneau'],['45–55 s','Orientations'],['55–60 s','Contrôle']]; return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 10</p><h3>Routine de 60 secondes</h3><p>Le chrono arrive après la méthode. Clique chaque fenêtre pour mémoriser l’action attendue.</p></header><div className="mt-6 grid gap-2 sm:grid-cols-5">{phases.map(([time,label],index)=><button key={time} onClick={()=>setActive(index)} className={`rounded-xl border p-4 text-left ${active===index?'border-sky-400 bg-sky-950/50':'border-zinc-800 bg-zinc-950/40'}`}><span className="font-mono text-xs text-sky-300">{time}</span><strong className="mt-2 block text-sm">{label}</strong></button>)}</div></section>; }
