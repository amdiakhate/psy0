import { Link } from 'react-router-dom';
import { loadCubeCoachState } from '../progress/cubeCoachStorage';
import { computeCubeCoachStats, dominantCubeWeakness } from '../progress/cubeCoachStats';
import { COURSE_CHAPTERS } from '../course/courseModel';
import { getCourseEvaluation, getChapterStatus, loadCubeCourseProgress } from '../course/courseProgress';

export function CubesHubPage() {
  const course=loadCubeCourseProgress(); const evaluation=getCourseEvaluation(course); const attempts=loadCubeCoachState().attempts; const stats=computeCubeCoachStats(attempts); const weak=dominantCubeWeakness(attempts); const current=COURSE_CHAPTERS.find((chapter)=>getChapterStatus(course,chapter.id)==='available')??COURSE_CHAPTERS.at(-1)!;
  return <div className="max-w-6xl"><div className="cube-hero"><div><p className="cube-kicker">Atelier spatial</p><h2>Cubes 2D/3D</h2><p>Comprends le pliage une fois. Ensuite, résous avec les opposées, l’anneau et le bord physique.</p></div><Link to={`/cubes/learn/${current.id}`} className="cube-primary">{evaluation.completedChapters===0?'Commencer le cours':'Reprendre le cours'}</Link></div>
    <div className="mt-6 grid gap-4 md:grid-cols-3"><Metric label="Cours guidé" value={`${evaluation.completedChapters}/10`} detail={`prochain : ${current.shortTitle}`}/><Metric label="Planches réelles" value={String(attempts.filter((attempt)=>attempt.mode==='full').length)} detail="séparées du cours"/><Metric label="Point faible réel" value={weak?.accuracy===null||!weak?'—':`${Math.round(weak.accuracy*100)} %`} detail={weak?weak.skill:'5 observations nécessaires'}/></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[['Apprendre',`/cubes/learn/${current.id}`],['S’entraîner','/cubes/train'],['Drills','/cubes/drills'],['Mes erreurs','/cubes/history?filter=errors'],['Progression','/cubes/progress']].map(([label,to])=><Link key={label} to={to} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 font-semibold text-zinc-200 hover:border-sky-700 hover:bg-sky-950/25">{label}<span className="float-right text-sky-500">→</span></Link>)}</div>
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"><h3 className="font-semibold">Sous-compétences réelles</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat)=><div key={stat.skill} className="border-l-2 border-zinc-700 pl-3"><p className="text-xs text-zinc-500">{stat.skill}</p><p className="mt-1 font-mono font-bold">{stat.accuracy===null?'—':`${Math.round(stat.accuracy*100)} %`}</p></div>)}</div></section>
  </div>;
}
function Metric({label,value,detail}:{label:string;value:string;detail:string}){return <div className="rounded-2xl border border-zinc-800 bg-zinc-950/45 p-5"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-2 font-mono text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></div>}

