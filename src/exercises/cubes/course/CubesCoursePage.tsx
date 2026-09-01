import { useMemo, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { COURSE_CHAPTERS } from './courseModel';
import { buildCourseExercises } from './courseDrills';
import { chapterAccuracy, getChapterStatus, loadCubeCourseProgress } from './courseProgress';
import { CourseExerciseCard } from './CourseExerciseCard';
import { ChapterVisual } from './ChapterVisuals';

export function CubesCoursePage() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const devPreview = import.meta.env.DEV && searchParams.get('preview') === '1';
  const [, refresh] = useState(0);
  const progress = loadCubeCourseProgress();
  const requested = chapterId ? COURSE_CHAPTERS.find((chapter) => chapter.id === chapterId) : undefined;
  const resumeChapter = COURSE_CHAPTERS.find((candidate) => getChapterStatus(progress, candidate.id) === 'available') ?? COURSE_CHAPTERS.at(-1)!;
  const chapter = requested ?? resumeChapter;
  if (requested && !devPreview && getChapterStatus(progress, requested.id) === 'locked') return <Navigate to={`/cubes/learn/${resumeChapter.id}`} replace />;
  const exercises = useMemo(() => buildCourseExercises(chapter.id), [chapter.id]);
  const accuracy = chapterAccuracy(progress, chapter.id);
  return <div className="max-w-7xl"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/cubes" className="text-sm text-sky-400 hover:underline">← Hub Cubes</Link><p className="mt-5 text-xs font-bold uppercase tracking-[.24em] text-sky-400">Cours visuel · chapitre {chapter.order}/10{devPreview ? ' · aperçu dev' : ''}</p><h2 className="mt-2 text-3xl font-bold tracking-tight">{chapter.title}</h2><p className="mt-2 max-w-2xl text-zinc-400">{chapter.description}</p></div><div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-right"><p className="text-xs text-zinc-500">Validation récente</p><p className="font-mono text-xl font-bold">{accuracy === null ? '—' : `${Math.round(accuracy*100)} %`}</p></div></div>
    <nav className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-10 lg:overflow-visible" aria-label="Chapitres Cubes">{COURSE_CHAPTERS.map((candidate)=>{const status=getChapterStatus(progress,candidate.id);const locked=status==='locked'&&!devPreview;return <Link key={candidate.id} to={locked?'#':`/cubes/learn/${candidate.id}${devPreview?'?preview=1':''}`} aria-disabled={locked} className={`min-w-[104px] rounded-xl border px-3 py-3 lg:min-w-0 ${candidate.id===chapter.id?'border-sky-400 bg-sky-950/45':locked?'pointer-events-none border-zinc-900 text-zinc-700':'border-zinc-800 bg-zinc-900/60 text-zinc-300'}`}><span className="font-mono text-[10px]">{String(candidate.order).padStart(2,'0')}</span><span className="mt-1 block truncate text-xs font-semibold">{candidate.shortTitle}</span></Link>;})}</nav>
    <div className="mt-6"><ChapterVisual order={chapter.order}/></div>
    <section className="mt-8"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">À toi</p><h3 className="mt-1 text-xl font-semibold">Valide la règle, pas ta vitesse</h3></div><div className="grid gap-4 lg:grid-cols-2">{exercises.map((exercise)=><CourseExerciseCard key={exercise.id} exercise={exercise} onRecorded={()=>refresh((value)=>value+1)}/>)}</div></section>
    <div className="mt-8 flex justify-between border-t border-zinc-800 pt-5">{chapter.order>1?<Link className="text-sm text-zinc-300 hover:text-white" to={`/cubes/learn/${COURSE_CHAPTERS[chapter.order-2].id}`}>← Chapitre précédent</Link>:<span/>}{chapter.order<10&&getChapterStatus(loadCubeCourseProgress(),COURSE_CHAPTERS[chapter.order].id)!=='locked'?<Link className="text-sm font-semibold text-sky-300" to={`/cubes/learn/${COURSE_CHAPTERS[chapter.order].id}`}>Chapitre suivant →</Link>:<span className="text-sm text-zinc-600">Valide ce chapitre pour continuer</span>}</div>
  </div>;
}
