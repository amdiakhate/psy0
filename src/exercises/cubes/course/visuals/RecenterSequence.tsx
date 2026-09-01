import { useEffect, useMemo, useState } from 'react';
import { ALL_ROTATIONS, POS, applyRotation } from '../../cube-model';
import type { FacePosition } from '../../domain/types';
import type { CourseFaceId } from '../courseModel';
import { COURSE_CUBE, COURSE_FACE_COLORS, COURSE_FACE_IDS, COURSE_FACE_TO_POSITION, getCourseOpposite } from '../courseFixtures';
import { TeachingCubeView } from './TeachingCubeView';
import { CourseNet } from './CourseNet';

export const RECENTER_STEPS = [
  'Patron original', 'Face sélectionnée', 'Le patron se plie',
  'Le cube est fermé', 'Le cube tourne', 'Nouveau dépliage',
] as const;

export function rotationPuttingFaceInFront(face: CourseFaceId) {
  const source = COURSE_FACE_TO_POSITION[face];
  const rotation = ALL_ROTATIONS.find((candidate) => candidate.dest[source] === POS.F);
  if (!rotation) throw new Error(`Aucune rotation ne place ${face} devant`);
  return rotation;
}

function foldForStage(stage: number, phase: number): number {
  if (stage <= 1) return 0;
  if (stage === 2) return phase;
  if (stage <= 4) return 1;
  return 1 - phase;
}

export function RecenterSequence() {
  const [center, setCenter] = useState<CourseFaceId>('E');
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const rotation = useMemo(() => rotationPuttingFaceInFront(center), [center]);
  const rotatedCube = useMemo(() => applyRotation(COURSE_CUBE, rotation), [rotation]);
  const stageCube = stage >= 4 ? rotatedCube : COURSE_CUBE;

  useEffect(() => {
    if (!playing) return;
    if (stage >= RECENTER_STEPS.length - 1) return;
    const timer = window.setTimeout(() => { setStage((value) => value + 1); setPhase(0); }, 800);
    return () => window.clearTimeout(timer);
  }, [playing, stage]);

  useEffect(() => {
    if (!playing || (stage !== 2 && stage !== 5)) return;
    const timer = window.setInterval(() => setPhase((value) => Math.min(1, value + .07)), 50);
    return () => window.clearInterval(timer);
  }, [playing, stage]);

  useEffect(() => {
    if (stage === 5 && phase >= 1) setPlaying(false);
  }, [phase, stage]);

  const chooseFace = (face: CourseFaceId) => {
    setCenter(face); setStage(0); setPhase(0); setPlaying(true);
  };
  const setStep = (next: number) => { const bounded = Math.max(0, Math.min(RECENTER_STEPS.length - 1, next)); setStage(bounded); setPhase(bounded === 2 || bounded === 5 ? .5 : 0); setPlaying(false); };

  return (
    <section className="cube-workshop" aria-labelledby="recenter-title">
      <header><p className="cube-kicker">Atelier 05</p><h3 id="recenter-title">Recentrer sans changer de cube</h3><p>Choisis une face, puis suis sa couleur du patron plat au cube fermé et jusqu’au nouveau dépliage.</p></header>

      <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Choisir la face centrale">
        {COURSE_FACE_IDS.map((face) => <button key={face} type="button" onClick={() => chooseFace(face)} aria-pressed={face === center}
          className={`rounded-lg border px-3 py-2 font-mono font-bold transition ${face === center ? 'bg-zinc-100 text-zinc-950' : 'border-zinc-700 bg-zinc-900'}`}
          style={face === center ? undefined : { color: COURSE_FACE_COLORS[face] }}>{face} au centre</button>)}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/55 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-zinc-500">Transformation · étape {stage + 1}/6</p>
          <ol className="mt-4 space-y-2">
            {RECENTER_STEPS.map((label, index) => (
              <li key={label} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${index === stage ? 'bg-sky-950/65 text-sky-100' : index < stage ? 'text-zinc-500' : 'text-zinc-700'}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-black ${index === stage ? 'bg-sky-400 text-sky-950' : 'border border-zinc-700'}`}>{index + 1}</span>
                {label}{index === 1 && <strong style={{ color: COURSE_FACE_COLORS[center] }}> · {center}</strong>}
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/55 p-2"><CourseNet label="Repère 2D original" focus={[center]} muted={COURSE_FACE_IDS.filter((face) => face !== center)} compact /></div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold">{playing ? 'Pause' : 'Lecture'}</button>
            <button type="button" onClick={() => setStep(stage - 1)} disabled={stage === 0} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm disabled:opacity-30">← Étape précédente</button>
            <button type="button" onClick={() => setStep(stage + 1)} disabled={stage === 5} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm disabled:opacity-30">Étape suivante →</button>
            <button type="button" onClick={() => { setStage(0); setPhase(0); setPlaying(true); }} className="rounded-lg border border-sky-800 px-3 py-2 text-sm text-sky-300">↻ Rejouer</button>
          </div>
        </div>

        <div className="relative">
          <TeachingCubeView cube={stageCube} fold={foldForStage(stage, phase)} focus={center} label={stage <= 2 ? 'Patron → cube' : stage === 3 ? 'Cube fermé' : stage === 4 ? 'Cube orienté' : 'Cube → patron recentré'} />
          {stage === 4 && <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center"><span className="cube-recenter-rotation rounded-full border border-sky-500/50 bg-zinc-950/90 px-4 py-2 text-sm font-semibold text-sky-200">Le cube tourne pour amener {center} devant ↻</span></div>}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Fact label="Face suivie" value={center} color={COURSE_FACE_COLORS[center]} />
        <Fact label="Toujours opposée à" value={getCourseOpposite(center)} color={COURSE_FACE_COLORS[getCourseOpposite(center)]} />
        <Fact label="Nouvelle position" value={stage >= 4 ? 'devant / centre' : 'en cours'} color="#7dd3fc" />
      </div>
      <p className="cube-rule"><strong>Le patron change, mais le cube ne change pas.</strong> L’identité colorée de {center} et son opposée restent les mêmes pendant toute la transformation.</p>
    </section>
  );
}

function Fact({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</span><strong className="mt-1 block font-mono" style={{ color }}>{value}</strong></div>;
}

export function faceAtFrontAfterRecentering(face: CourseFaceId): CourseFaceId {
  const cube = applyRotation(COURSE_CUBE, rotationPuttingFaceInFront(face));
  return cube[POS.F].id as CourseFaceId;
}

export function positionOfCourseFace(cube: typeof COURSE_CUBE, face: CourseFaceId): FacePosition {
  return cube.findIndex((candidate) => candidate.id === face) as FacePosition;
}
