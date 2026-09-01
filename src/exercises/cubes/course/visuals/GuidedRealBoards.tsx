import { useMemo, useState } from 'react';
import { CubesExercise } from '../../CubesExercise';
import { CubeCoachCorrection } from '../../coach/CubeCoachCorrection';
import type { CubesAnswer } from '../../generator';
import { rotateEdge } from '../../domain/cubeGeometry';
import type { FaceEdge, FacePosition, QuarterTurn } from '../../domain/types';
import type { ReasoningStep } from '../../domain/reasoningPath';
import { solutionCubeFor } from '../../domain/reasoningPath';
import { CoachNet, RingDiagram, faceName, netPositionName } from '../../coach/CubeCoachVisuals';
import { PhysicalEdgeJourney } from './PhysicalEdgeJourney';
import { getGuidedFixture, type GuidedFixtureKind } from '../guidedFixtures';

const TABS: ReadonlyArray<{ kind: GuidedFixtureKind; label: string; description: string }> = [
  { kind: 'opposites', label: 'A · Opposées', description: 'Les opposées suffisent : place uniquement ce qui est certain.' },
  { kind: 'two-candidates', label: 'B · Deux candidats', description: 'Arrête-toi exactement quand les opposées ne tranchent plus.' },
  { kind: 'orientation', label: 'C · Orientations', description: 'Les identités sont posées ; fais voyager chaque bord physique.' },
];

export function GuidedRealBoards() {
  const [kind, setKind] = useState<GuidedFixtureKind>('opposites');
  const fixture = useMemo(() => getGuidedFixture(kind), [kind]);
  const correctionPreview = import.meta.env.DEV && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('capture') === 'orientation-correction';
  return (
    <section className="cube-workshop" aria-labelledby="guided-board-title">
      <header><p className="cube-kicker">Atelier 09</p><h3 id="guided-board-title">Résoudre une vraie planche avec la méthode</h3><p>Trois planches viennent du générateur réel. Le Coach te demande une déduction à la fois et ne remplit jamais une case à ta place.</p></header>
      <div className="mt-5 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Exemples pédagogiques">
        {TABS.map((tab) => <button key={tab.kind} type="button" role="tab" aria-selected={kind === tab.kind} onClick={() => setKind(tab.kind)} className={`rounded-xl border p-3 text-left ${kind === tab.kind ? 'border-sky-400 bg-sky-950/45' : 'border-zinc-800 bg-zinc-950/35'}`}><strong className="block text-sm">{tab.label}</strong><span className="mt-1 block text-xs text-zinc-500">{tab.description}</span></button>)}
      </div>
      {correctionPreview && <OrientationCorrectionPreview />}
      <GuidedBoard key={fixture.item.seed} fixture={fixture} />
      <FreeBoard key={`free-${fixture.item.seed}`} fixture={fixture} />
    </section>
  );
}

function OrientationCorrectionPreview() {
  const fixture = getGuidedFixture('orientation');
  const firstHole = fixture.item.question.holes[0];
  const answer: CubesAnswer = Object.fromEntries(fixture.item.question.holes.map((hole) => [hole, {
    pieceId: fixture.item.question.solution[hole],
    rot: hole === firstHole ? (fixture.item.question.expectedRot[hole] + 1) % 4 : fixture.item.question.expectedRot[hole],
  }]));
  return <section className="mt-6 rounded-2xl border border-amber-800/60 bg-amber-950/10 p-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">Aperçu dev · vraie erreur d’orientation</p><CubeCoachCorrection item={fixture.item} answer={answer}/></section>;
}

function FreeBoard({ fixture }: { fixture: ReturnType<typeof getGuidedFixture> }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<CubesAnswer | null>(null);
  return <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/35 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">Exercice complet · sans chrono</p><h4 className="mt-1 font-semibold">Refais cette vraie planche sans guidage</h4></div><button type="button" onClick={() => { setOpen((value) => !value); setAnswer(null); }} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold">{open ? 'Fermer la planche' : 'Ouvrir la planche complète'}</button></div>
    {open && <div className="mt-5 min-h-[430px] rounded-xl border border-zinc-800 bg-zinc-950/45 p-4"><CubesExercise item={fixture.item} onAnswer={setAnswer}/></div>}
    {answer && <div className="mt-5"><CubeCoachCorrection item={fixture.item} answer={answer}/></div>}
  </section>;
}

function GuidedBoard({ fixture }: { fixture: ReturnType<typeof getGuidedFixture> }) {
  const question = fixture.item.question;
  const solution = useMemo(() => solutionCubeFor(question), [question]);
  const relevantSteps = useMemo(() => {
    if (fixture.kind === 'orientation') {
      return fixture.path.minimalSteps.filter((step) => step.kind === 'orientation-anchor');
    }
    return fixture.path.minimalSteps.filter((step) => step.kind !== 'orientation-anchor');
  }, [fixture]);
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const step = relevantSteps[stepIndex];
  const completed = stepIndex >= relevantSteps.length;
  const revealed = question.target.map((face) => face);
  for (const finished of relevantSteps.slice(0, stepIndex)) {
    if ('hole' in finished) revealed[finished.hole] = solution[finished.hole];
    if (finished.kind === 'orientation-anchor') revealed[finished.position] = solution[finished.position];
  }

  const answer = (valid: boolean) => {
    if (!valid) { setFeedback('wrong'); return; }
    setFeedback('correct');
    window.setTimeout(() => { setStepIndex((value) => value + 1); setFeedback(null); }, 520);
  };

  return <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">Planche réelle · graine {fixture.item.seed}</p><p className="mt-1 text-sm text-zinc-300">Sans chrono · étape {Math.min(stepIndex + 1, relevantSteps.length)}/{relevantSteps.length}</p></div><span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">Le Coach ne déplace aucune pièce</span></div>
    <div className="mt-5 grid gap-5 md:grid-cols-2"><CoachNet cube={question.reference} label="Patron de référence"/><CoachNet cube={revealed} label="Patron à compléter · déductions validées" highlights={step && 'hole' in step && step.kind !== 'opposite-deduction' ? { [step.hole]: 'focus' } : {}}/></div>
    {completed ? <div className="mt-5 rounded-xl border border-green-800 bg-green-950/25 p-5 text-center"><strong className="text-green-300">Méthode terminée</strong><p className="mt-1 text-sm text-zinc-400">Tu as franchi chaque étape décisive sans recevoir la solution complète.</p><button type="button" onClick={() => setStepIndex(0)} className="mt-3 rounded-lg border border-green-700 px-3 py-2 text-sm text-green-300">Rejouer cette planche</button></div>
      : <GuidedStep step={step} question={question} solution={solution} feedback={feedback} answer={answer} />}
  </div>;
}

function GuidedStep({ step, question, solution, feedback, answer }: {
  step: ReasoningStep; question: ReturnType<typeof getGuidedFixture>['item']['question']; solution: ReturnType<typeof solutionCubeFor>;
  feedback: 'correct' | 'wrong' | null; answer(valid: boolean): void;
}) {
  const base = 'rounded-lg border px-3 py-2 text-sm font-semibold hover:border-sky-500';
  let content: React.ReactNode;
  if (step.kind === 'opposite-deduction') {
    content = <OppositeGuidance step={step} question={question} solution={solution} answer={answer} className={base} />;
  } else if (step.kind === 'elimination') {
    content = <><Prompt title="Dernière pièce" text={`Il ne reste qu’une identité pour ${netPositionName(step.hole)}.`}/><button type="button" onClick={() => answer(true)} className={`${base} mt-3 border-sky-700 text-sky-200`}>Placer par élimination</button></>;
  } else if (step.kind === 'two-candidates') {
    content = <><Prompt title="Les opposées ne suffisent plus" text={`Il reste ${step.candidateFaceIds.map((id) => faceName(solution, id)).join(' et ')} pour deux cases. Quelle règle doit trancher ?`}/><Choices values={['ring','opposites'] as const} label={(value) => value === 'ring' ? 'Comparer les anneaux' : 'Recommencer les opposées'} correct="ring" answer={answer} className={base}/></>;
  } else if (step.kind === 'ring-comparison') {
    content = <><Prompt title="Comparer les deux candidats" text="Lis l’ordre haut → droite → bas → gauche autour de la face testée."/><div className="mt-4"><RingDiagram center={step.chosenFaceId} order={step.expectedOrder} cube={solution} label="Anneau exigé par le cube"/></div><Choices values={[step.chosenFaceId,...step.rejectedFaceIds]} label={(id) => `${faceName(solution,id)} ici`} correct={step.chosenFaceId} answer={answer} className={base}/></>;
  } else if (step.kind === 'mirror-rejection') {
    content = <><Prompt title="Rotation ou miroir ?" text="Le second ordre parcourt les mêmes voisins dans le sens inverse."/><Choices values={['mirror','rotation'] as const} label={(value) => value === 'mirror' ? 'Miroir' : 'Rotation valide'} correct="mirror" answer={answer} className={base}/></>;
  } else {
    const referenceFace = question.reference.find((face) => face.id === step.faceId)!;
    content = <><Prompt title="Face correcte, orientation à produire" text={`Choisis un voisin ancre puis tourne ${faceName(solution, step.faceId)} jusqu’à ce que le même bord physique rejoigne ${faceName(solution, step.anchorFaceId)}.`}/><PhysicalEdgeJourney originalCube={question.reference} targetCube={solution} faceId={step.faceId} anchorFaceId={step.anchorFaceId} sourceEdge={step.sourceEdge} targetEdge={step.targetEdge} referenceRot={step.referenceRot} expectedRot={step.expectedRot} faceLabel={(id) => faceName(solution,id)} interactive/><Choices values={[0,1,2,3] as const} label={turnLabel} correct={edgeTurn(step.sourceEdge,step.targetEdge)} answer={answer} className={base}/><span className="sr-only">Symbole de référence {referenceFace.sym}</span></>;
  }
  return <section className="mt-5 rounded-xl border border-sky-900/60 bg-sky-950/15 p-4">{content}{feedback && <p role="status" className={`mt-3 text-sm font-semibold ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback === 'correct' ? '✓ Déduction validée — la face rejoint la case.' : '✗ Cette action brise la règle observée. Regarde les éléments surlignés.'}</p>}</section>;
}

function Prompt({ title, text }: { title: string; text: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-sky-400">Résoudre avec moi</p><h4 className="mt-1 font-semibold text-zinc-100">{title}</h4><p className="mt-1 text-sm text-zinc-400">{text}</p></div>; }

function OppositeGuidance({ step, question, solution, answer, className }: {
  step: Extract<ReasoningStep, { kind: 'opposite-deduction' }>;
  question: ReturnType<typeof getGuidedFixture>['item']['question'];
  solution: ReturnType<typeof solutionCubeFor>;
  answer(valid: boolean): void;
  className: string;
}) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [localError, setLocalError] = useState(false);
  const choose = (valid: boolean, next: 1 | 2 | 'done') => {
    if (!valid) { setLocalError(true); return; }
    setLocalError(false);
    if (next === 'done') answer(true); else setPhase(next);
  };
  const visiblePositions = question.target.map((face, position) => ({ face, position: position as FacePosition })).filter((entry): entry is { face: NonNullable<typeof entry.face>; position: FacePosition } => entry.face !== null);
  return <>
    <Prompt title="Placement par déduction" text={phase === 0 ? 'Quelle est la première case que tu peux remplir avec certitude ?' : phase === 1 ? 'Quelle face visible se trouve exactement à l’opposé de ce trou ?' : 'Quelle face est opposée à celle-ci dans le patron de référence ?'} />
    {phase === 0 && <Choices values={question.holes} label={netPositionName} correct={step.hole} answer={(valid) => choose(valid, 1)} className={className}/>} 
    {phase === 1 && <Choices values={visiblePositions.map((entry) => entry.position)} label={(position) => faceName(solution, question.target[position]!.id)} correct={step.visibleOppositePosition} answer={(valid) => choose(valid, 2)} className={className}/>} 
    {phase === 2 && <Choices values={question.pieces.map((piece) => piece.faceId)} label={(id) => faceName(solution,id)} correct={step.placedFaceId} answer={(valid) => choose(valid, 'done')} className={className}/>} 
    <div className="mt-4 flex gap-2" aria-label="Progression de la déduction">{['Trou','Face visible','Face opposée'].map((label,index)=><span key={label} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${index === phase ? 'border-sky-500 text-sky-300' : index < phase ? 'border-green-800 text-green-500' : 'border-zinc-800 text-zinc-600'}`}>{index + 1} · {label}</span>)}</div>
    {localError && <p className="mt-3 text-sm font-semibold text-red-400">✗ Ce choix ne forme pas la paire opposée indiquée par la planche.</p>}
  </>;
}

function Choices<T extends string | number>({ values, label, correct, answer, className }: { values: readonly T[]; label(value: T): string; correct: T; answer(valid: boolean): void; className: string }) {
  return <div className="mt-4 flex flex-wrap gap-2">{values.map((value) => <button key={value} type="button" onClick={() => answer(value === correct)} className={`${className} border-zinc-700`}>{label(value)}</button>)}</div>;
}

function edgeTurn(source: FaceEdge, target: FaceEdge): QuarterTurn {
  return ([0, 1, 2, 3] as const).find((turn) => rotateEdge(source, turn) === target) ?? 0;
}
function turnLabel(turn: number): string { return turn === 0 ? '0°' : turn === 1 ? '90° antihoraire' : turn === 2 ? '180°' : '90° horaire'; }
