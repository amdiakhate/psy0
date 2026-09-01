import { useState } from 'react';
import type { CourseExercise } from './courseModel';
import { recordCubeCourseAttempt } from './courseProgress';
import { PhysicalEdgeQuestionDiagram } from './visuals/PhysicalEdgeJourney';

export function CourseExerciseCard({ exercise, onRecorded }: { exercise: CourseExercise; onRecorded(): void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const validate = () => {
    if (selected === null) return;
    const correct = selected === exercise.answerId;
    setVerdict(correct);
    recordCubeCourseAttempt({ exerciseId: exercise.id, chapterId: exercise.chapterId, skill: exercise.skill, correct, answeredAt: new Date().toISOString() });
    onRecorded();
  };
  return <article className="rounded-2xl border border-zinc-800 bg-zinc-950/45 p-5"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-sky-400">Validation</p><h4 className="mt-2 text-base font-semibold text-zinc-100">{exercise.prompt}</h4>{exercise.orientationContext && <PhysicalEdgeQuestionDiagram {...exercise.orientationContext} faceLabel={(faceId) => faceId} />}<div className="mt-4 grid gap-2 sm:grid-cols-2">{exercise.choices.map((answer, index) => <button type="button" key={answer.id} onClick={() => { setSelected(answer.id); setVerdict(null); }} className={`rounded-xl border px-4 py-3 text-left text-sm transition ${selected === answer.id ? 'border-sky-400 bg-sky-950/50 text-sky-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'}`}><span className="mr-2 font-mono text-xs text-zinc-500">{index + 1}</span>{answer.label}</button>)}</div><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" disabled={selected === null} onClick={validate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold disabled:opacity-40">Vérifier</button>{verdict !== null && <p role="status" className={`text-sm font-semibold ${verdict ? 'text-green-400' : 'text-red-400'}`}>{verdict ? 'Correct.' : 'Pas encore.'} <span className="font-normal text-zinc-300">{exercise.explanation}</span></p>}</div></article>;
}
