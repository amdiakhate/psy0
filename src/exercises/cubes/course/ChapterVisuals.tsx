import { useEffect, useState } from 'react';
import { ALL_ROTATIONS, applyRotation, POS } from '../cube-model';
import { FoldPlayer } from '../FoldingNet';
import { COURSE_CUBE, COURSE_FACE_COLORS, COURSE_FACE_IDS, COURSE_POSITION_TO_FACE, getCourseOpposite, getCourseRing } from './courseFixtures';
import { CourseFace, CourseNet } from './visuals/CourseNet';
import { PhysicalEdgeRotation, RecenterWorkshop, RingWorkshop } from './visuals/PriorityWorkshops';
import { GuidedRealBoards } from './visuals/GuidedRealBoards';

export function ChapterVisual({ order }: { order: number }) {
  if (order === 1) return <FoldIntro />;
  if (order === 2) return <Opposites />;
  if (order === 3) return <Adjacency />;
  if (order === 4) return <Belt />;
  if (order === 5) return <RecenterWorkshop />;
  if (order === 6) return <RingWorkshop />;
  if (order === 7) return <Mirror />;
  if (order === 8) return <PhysicalEdgeRotation />;
  if (order === 9) return <GuidedRealBoards />;
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
  return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 07</p><h3>Une rotation décale. Un miroir inverse.</h3><p>Compare les flèches. Les mêmes quatre voisins ne suffisent pas : leur sens circulaire décide.</p></header><div className="mt-6 grid gap-5 sm:grid-cols-2"><MiniRing label="Rotation valide" ring={ring} tone="green"/><MiniRing label="Miroir impossible" ring={mirrored} tone="red"/></div><RotationOrbit/><p className="cube-rule">Parcours les 24 rotations : aucune ne transforme une flèche horaire en flèche antihoraire.</p></section>;
}
function MiniRing({label,ring,tone}:{label:string;ring:readonly string[];tone:'green'|'red'}) { return <div className={`rounded-2xl border p-5 ${tone==='green'?'border-green-800 bg-green-950/15':'border-red-900 bg-red-950/15'}`}><p className="text-center font-semibold">{label}</p><div className="mt-4 grid grid-cols-4 gap-2">{ring.map((face,index)=><div key={`${face}-${index}`} className="text-center"><span className="text-[10px] text-zinc-500">{index+1}</span><div className="mt-1 rounded-lg border border-zinc-700 p-3 font-mono font-black">{face}</div></div>)}</div><p className={`mt-3 text-center text-sm ${tone==='green'?'text-green-400':'text-red-400'}`}>{ring.join(' → ')}</p></div>; }
function RotationOrbit(){const [index,setIndex]=useState(0);const cube=applyRotation(COURSE_CUBE,ALL_ROTATIONS[index]);const visible=[cube[POS.U].id,cube[POS.F].id,cube[POS.R].id];return <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/45 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Explorateur des rotations propres</p><p className="mt-1 font-mono text-sm text-sky-300">Rotation {index+1}/24</p></div><div className="flex gap-2"><button onClick={()=>setIndex((value)=>(value+23)%24)} className="rounded-lg border border-zinc-700 px-3 py-2">←</button><button onClick={()=>setIndex((value)=>(value+1)%24)} className="rounded-lg border border-zinc-700 px-3 py-2">→</button></div></div><div className="mt-4 flex items-end justify-center gap-4">{visible.map((face,index)=><div key={`${face}-${index}`} className="text-center"><CourseFace face={face as typeof COURSE_FACE_IDS[number]} size={58}/><span className="mt-2 block text-[10px] uppercase tracking-wider text-zinc-500">{['dessus','avant','droite'][index]}</span></div>)}</div></div>}

function TimingRoutine() { const [active,setActive]=useState(0);const [remaining,setRemaining]=useState(60);const [running,setRunning]=useState(false);const phases=[['0–10 s','Opposées'],['10–30 s','Placements'],['30–45 s','Anneau'],['45–55 s','Orientations'],['55–60 s','Contrôle']];useEffect(()=>{if(!running||remaining<=0)return;const timer=window.setInterval(()=>setRemaining((value)=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer)},[running,remaining]);useEffect(()=>{const elapsed=60-remaining;setActive(elapsed<10?0:elapsed<30?1:elapsed<45?2:elapsed<55?3:4);if(remaining===0)setRunning(false)},[remaining]);return <section className="cube-workshop"><header><p className="cube-kicker">Atelier 10</p><h3>Routine de 60 secondes</h3><p>Le chrono arrive après la méthode. Lance la simulation pour voir chaque phase prendre le relais.</p></header><div className="mt-5 flex items-center gap-4"><span className="font-mono text-4xl font-black text-sky-300">{remaining}s</span><button onClick={()=>setRunning((value)=>!value)} className="rounded-lg bg-sky-600 px-4 py-2 font-semibold">{running?'Pause':remaining===60?'Lancer':'Reprendre'}</button><button onClick={()=>{setRunning(false);setRemaining(60);setActive(0)}} className="rounded-lg border border-zinc-700 px-4 py-2">Réinitialiser</button></div><div className="mt-6 grid gap-2 sm:grid-cols-5">{phases.map(([time,label],index)=><button key={time} onClick={()=>setActive(index)} className={`rounded-xl border p-4 text-left ${active===index?'border-sky-400 bg-sky-950/50':'border-zinc-800 bg-zinc-950/40'}`}><span className="font-mono text-xs text-sky-300">{time}</span><strong className="mt-2 block text-sm">{label}</strong></button>)}</div></section>; }
