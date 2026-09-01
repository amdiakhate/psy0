import { Link } from 'react-router-dom';
import { COURSE_CHAPTERS } from '../course/courseModel';
import {
  getChapterStatus,
  getCourseEvaluation,
  getMentalRingMastery,
  getMentalRingStats,
  loadCubeCourseProgress,
} from '../course/courseProgress';
import { computeCubeCoachStats } from '../progress/cubeCoachStats';
import { loadCubeCoachState } from '../progress/cubeCoachStorage';

const RING_LABELS = {
  top: 'Voisin haut', right: 'Voisin droite', bottom: 'Voisin bas', left: 'Voisin gauche',
  'full-ring': 'Anneau complet', mirror: 'Rotation / miroir',
} as const;

export function CubesProgressPage() {
  const progress = loadCubeCourseProgress();
  const evaluation = getCourseEvaluation(progress);
  const stats = computeCubeCoachStats(loadCubeCoachState().attempts);
  const ringMastery = getMentalRingMastery(progress);
  const ringStats = getMentalRingStats(progress);
  return (
    <div className="max-w-5xl">
      <Link to="/cubes" className="text-sm text-sky-400">← Hub Cubes</Link>
      <h2 className="mt-4 text-3xl font-bold">Progression Cubes</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-sky-900 bg-sky-950/15 p-5">
          <h3 className="font-semibold text-sky-200">Cours guidé · {evaluation.completedChapters}/10</h3>
          <p className="mt-1 text-xs text-zinc-500">Cours V2 : {evaluation.courseComplete ? 'validé' : 'à compléter'}</p>
          <div className="mt-4 space-y-2">{COURSE_CHAPTERS.map((chapter) => (
            <div key={chapter.id} className="flex justify-between border-b border-zinc-800 py-2 text-sm">
              <span>{chapter.order}. {chapter.shortTitle}</span><span className="text-zinc-500">{getChapterStatus(progress, chapter.id)}</span>
            </div>
          ))}</div>
        </section>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="font-semibold">Entraînement réel</h3>
          <div className="mt-4 space-y-2">{stats.map((stat) => (
            <div key={stat.skill} className="flex justify-between border-b border-zinc-800 py-2 text-sm">
              <span>{stat.skill}</span><span>{stat.accuracy === null ? '—' : `${Math.round(stat.accuracy * 100)} %`} · {stat.attempts}</span>
            </div>
          ))}</div>
        </section>
      </div>
      <section className="mt-5 rounded-2xl border border-amber-900/70 bg-amber-950/15 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-400">Nouvelle compétence V2</p><h3 className="mt-1 text-lg font-semibold">Anneau de tête</h3></div>
          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${ringMastery.mastered ? 'border-green-700 text-green-300' : 'border-amber-700 text-amber-300'}`}>{ringMastery.mastered ? 'Acquise' : 'À acquérir'}</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{ringStats.map((stat) => (
          <div key={stat.kind} className="flex justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm">
            <span className="text-zinc-400">{RING_LABELS[stat.kind]}</span><strong>{stat.accuracy === null ? '—' : `${Math.round(stat.accuracy * 100)} %`}</strong>
          </div>
        ))}</div>
        <p className="mt-4 text-xs text-zinc-400">{ringMastery.attempts}/12 tentatives · {ringMastery.distinctFaces}/4 faces · dernières 5 sans aide 3D : {ringMastery.lastFiveMental ? 'oui' : 'non'}</p>
        <Link to="/cubes/learn/anneau-des-voisins" className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950">Travailler l’anneau de tête</Link>
      </section>
    </div>
  );
}
