import { useMemo, useState } from 'react';
import { CourseNet } from './CourseNet';
import { MentalRingCube3D } from './MentalRingCube3D';
import {
  buildDirectionalRingQuestion,
  buildMentalRingQuestion,
  buildRingScene,
  isMirrorOrder,
  isRingRotation,
  rotateRing,
} from '../ringSceneModel';
import type { MentalRingQuestion, RingOrder } from '../ringSceneModel';
import type { QuarterTurn } from '../../domain/types';
import type { CourseFaceId } from '../courseModel';
import {
  getMentalRingMastery,
  loadCubeCourseProgress,
  recordMentalRingAttempt,
} from '../courseProgress';
import type { MentalRingAttemptKind } from '../courseProgress';

type DrillKind = 'full-ring' | 'direction' | 'mirror';

const DIRECTION_LABELS = ['en haut', 'à droite', 'en bas', 'à gauche'] as const;
const KIND_BY_DIRECTION: readonly MentalRingAttemptKind[] = ['top', 'right', 'bottom', 'left'];

function turnForOrder(reference: RingOrder, order: RingOrder): QuarterTurn {
  return ([0, 1, 2, 3] as const).find((turn) => rotateRing(reference, turn).join() === order.join()) ?? 0;
}

function suggestedAidLevel(): 1 | 2 | 3 {
  const attempts = getMentalRingMastery(loadCubeCourseProgress()).attempts;
  return attempts < 4 ? 1 : attempts < 8 ? 2 : 3;
}

function Order({ order, tone = 'neutral' }: { order: readonly CourseFaceId[]; tone?: 'neutral' | 'green' | 'red' }) {
  const toneClass = tone === 'green' ? 'border-green-800 bg-green-950/20 text-green-300' : tone === 'red' ? 'border-red-900 bg-red-950/20 text-red-300' : 'border-zinc-700 bg-zinc-950/55 text-zinc-200';
  return <div className={`rounded-xl border px-3 py-3 text-center font-mono text-sm font-bold ${toneClass}`}>{order.join(' → ')}</div>;
}

export function MentalRingCorrection({ question, selectedId }: { question: MentalRingQuestion; selectedId: string | null }) {
  const selected = question.options.find((option) => option.id === selectedId);
  const turn = turnForOrder(question.referenceOrder, question.correctOrder);
  const scene = buildRingScene(question.centerFaceId, turn);
  return (
    <section className="mt-4 rounded-2xl border border-sky-900 bg-sky-950/15 p-4" aria-label="Correction 3D Anneau de tête">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Ton ordre</p>{selected ? <Order order={selected.order} tone={isRingRotation(selected.order, question.referenceOrder) ? 'green' : 'red'} /> : <p className="text-sm text-zinc-500">Aucune réponse.</p>}</div>
        <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Ordre réel possible</p><Order order={question.correctOrder} tone="green" /></div>
      </div>
      {selected && isMirrorOrder(selected.order, question.referenceOrder) && <p className="mt-3 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">Ordre miroir : aucune des 24 rotations propres ne peut l’atteindre.</p>}
      <div className="mt-4"><MentalRingCube3D scene={scene} interactive /></div>
      <p className="mt-3 text-center text-sm text-sky-200">Face centrale {question.centerFaceId} · {question.correctOrder.join(' → ')}</p>
    </section>
  );
}

export function MentalRingDrill({
  initialAidLevel,
  initialSeed = 601,
  onRecorded,
}: {
  initialAidLevel?: 1 | 2 | 3;
  initialSeed?: number;
  onRecorded?(): void;
}) {
  const [aidLevel, setAidLevel] = useState<1 | 2 | 3>(() => initialAidLevel ?? suggestedAidLevel());
  const [kind, setKind] = useState<DrillKind>('full-ring');
  const [seed, setSeed] = useState(initialSeed);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [reveal, setReveal] = useState(false);
  const ringQuestion = useMemo(() => buildMentalRingQuestion(seed), [seed]);
  const directionQuestion = useMemo(() => buildDirectionalRingQuestion(seed), [seed]);
  const mirrorShown = seed % 2 === 0
    ? ([ringQuestion.referenceOrder[0], ringQuestion.referenceOrder[3], ringQuestion.referenceOrder[2], ringQuestion.referenceOrder[1]] as RingOrder)
    : rotateRing(ringQuestion.referenceOrder, (seed % 4) as QuarterTurn);
  const cubeVisibleBeforeAnswer = aidLevel !== 3;
  const center = kind === 'direction' ? directionQuestion.centerFaceId : ringQuestion.centerFaceId;
  const previewScene = buildRingScene(center, 0);
  const layers = {
    neighbors: true,
    opposite: true,
    numbers: aidLevel === 1,
    edges: true,
    neighborLabels: aidLevel === 1,
  };

  const resetQuestion = (nextSeed = seed + 1) => {
    setSeed(nextSeed);
    setSelected(null);
    setChecked(false);
    setReveal(false);
  };

  const validate = () => {
    if (selected === null) return;
    let correct = false;
    let attemptKind: MentalRingAttemptKind = 'full-ring';
    if (kind === 'full-ring') correct = selected === ringQuestion.answerId;
    if (kind === 'direction') {
      correct = selected === directionQuestion.answerFaceId;
      attemptKind = KIND_BY_DIRECTION[directionQuestion.directionIndex];
    }
    if (kind === 'mirror') {
      correct = selected === (isMirrorOrder(mirrorShown, ringQuestion.referenceOrder) ? 'mirror' : 'rotation');
      attemptKind = 'mirror';
    }
    recordMentalRingAttempt({
      id: `${Date.now()}-${seed}-${kind}`,
      answeredAt: new Date().toISOString(),
      centerFaceId: center,
      kind: attemptKind,
      correct,
      cubeVisibleBeforeAnswer,
      aidLevel,
    });
    setChecked(true);
    onRecorded?.();
  };

  const correct = checked && (
    kind === 'full-ring' ? selected === ringQuestion.answerId
      : kind === 'direction' ? selected === directionQuestion.answerFaceId
        : selected === (isMirrorOrder(mirrorShown, ringQuestion.referenceOrder) ? 'mirror' : 'rotation')
  );

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/55 p-5" aria-labelledby="mental-ring-drill-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-400">Drill dédié</p><h4 id="mental-ring-drill-title" className="mt-1 text-xl font-semibold">Anneau de tête</h4><p className="mt-1 text-sm text-zinc-400">Reconstruis depuis le patron ; la 3D devient une correction, pas une béquille.</p></div>
        <div className="flex flex-wrap gap-2" aria-label="Niveau d’aide">
          {([1, 2, 3] as const).map((level) => <button key={level} type="button" onClick={() => { setAidLevel(level); resetQuestion(seed); }} aria-pressed={aidLevel === level} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${aidLevel === level ? 'border-sky-400 bg-sky-950 text-sky-100' : 'border-zinc-700 text-zinc-400'}`}>{level === 1 ? 'Guidé' : level === 2 ? 'Semi-guidé' : 'Faire de tête'}</button>)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Type de drill">
        {([['full-ring', 'Anneau complet'], ['direction', 'Voisin directionnel'], ['mirror', 'Rotation ou miroir']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => { setKind(value); resetQuestion(seed + 17); }} aria-pressed={kind === value} className={`rounded-lg border px-3 py-2 text-sm ${kind === value ? 'border-amber-400 bg-amber-950/30 text-amber-200' : 'border-zinc-700 text-zinc-400'}`}>{label}</button>)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
          <CourseNet label="Patron neutre A–F" focus={[center]} muted={[previewScene.oppositeFaceId]} compact />
          <p className="mt-3 text-center text-sm font-semibold text-zinc-100">Face centrale : <span className="font-mono text-sky-300">{center}</span></p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
          {kind === 'full-ring' && <><p className="font-semibold">Quel ordre horaire est possible autour de {center} ?</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{ringQuestion.options.map((option, index) => <button key={option.id} type="button" disabled={checked} onClick={() => setSelected(option.id)} className={`rounded-xl border p-3 text-left font-mono text-sm ${selected === option.id ? 'border-sky-400 bg-sky-950/40' : 'border-zinc-700'}`}><span className="mr-2 text-zinc-600">{String.fromCharCode(65 + index)}.</span>{option.order.join(' → ')}</button>)}</div></>}
          {kind === 'direction' && <><p className="font-semibold">Si {center} est face à toi, qui est {DIRECTION_LABELS[directionQuestion.directionIndex]} ?</p><div className="mt-3 grid grid-cols-2 gap-2">{directionQuestion.choices.map((faceId) => <button key={faceId} type="button" disabled={checked} onClick={() => setSelected(faceId)} className={`rounded-xl border p-3 font-mono font-bold ${selected === faceId ? 'border-sky-400 bg-sky-950/40' : 'border-zinc-700'}`}>{faceId}</button>)}</div></>}
          {kind === 'mirror' && <><p className="font-semibold">Cet ordre est-il une rotation réelle ou un miroir ?</p><div className="mt-3"><Order order={mirrorShown} /></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={checked} onClick={() => setSelected('rotation')} className={`rounded-xl border p-3 ${selected === 'rotation' ? 'border-sky-400 bg-sky-950/40' : 'border-zinc-700'}`}>Rotation</button><button type="button" disabled={checked} onClick={() => setSelected('mirror')} className={`rounded-xl border p-3 ${selected === 'mirror' ? 'border-sky-400 bg-sky-950/40' : 'border-zinc-700'}`}>Miroir</button></div></>}
          <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" disabled={selected === null || checked} onClick={validate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold disabled:opacity-40">Valider</button>{checked && <span role="status" className={correct ? 'text-sm font-semibold text-green-400' : 'text-sm font-semibold text-red-400'}>{correct ? 'Correct.' : 'Incorrect.'}</span>}{checked && !reveal && <button type="button" onClick={() => setReveal(true)} className="rounded-lg border border-sky-700 px-3 py-2 text-sm font-semibold text-sky-200">Vérifier sur le cube 3D</button>}{checked && <button type="button" onClick={() => resetQuestion()} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm">Question suivante →</button>}</div>
        </div>
      </div>

      {cubeVisibleBeforeAnswer && !checked && <div className="mt-5"><MentalRingCube3D scene={previewScene} layers={layers} /></div>}
      {!cubeVisibleBeforeAnswer && !reveal && <div className="mt-5"><MentalRingCube3D scene={previewScene} hidden /></div>}
      {reveal && kind === 'full-ring' && <MentalRingCorrection question={ringQuestion} selectedId={selected} />}
      {reveal && kind !== 'full-ring' && <div className="mt-5"><MentalRingCube3D scene={previewScene} /><p className="mt-3 text-center text-sm text-sky-200">{kind === 'direction' ? `${DIRECTION_LABELS[directionQuestion.directionIndex]} : ${directionQuestion.answerFaceId}` : isMirrorOrder(mirrorShown, ringQuestion.referenceOrder) ? 'Ordre miroir impossible par rotation propre.' : 'Ordre obtenu par rotation propre.'}</p></div>}
    </section>
  );
}
