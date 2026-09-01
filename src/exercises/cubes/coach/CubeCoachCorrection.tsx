import { useMemo, useState } from 'react';
import type { ExplainProps } from '../../../core/types';
import { getPrefs } from '../../../core/prefs';
import type { CubesAnswer, CubesQuestion } from '../generator';
import { completeCube } from '../generator';
import { FoldPlayer } from '../FoldingNet';
import { analyzeCubeAttempt } from '../domain/cubeAnalysis';
import type { CubeErrorCause } from '../domain/cubeAnalysis';
import type { ReasoningStep } from '../domain/reasoningPath';
import { solutionCubeFor } from '../domain/reasoningPath';
import { CoachNet, OppositePairsDiagram, RingDiagram, faceName, netPositionName } from './CubeCoachVisuals';
import { CubeRotationExplanation } from './CubeRotationExplanation';
import { CubeDebugPanel } from './CubeDebugPanel';

const CAUSE_LABEL: Record<CubeErrorCause, string> = {
  WRONG_OPPOSITE: 'Une paire de faces opposées a été cassée.',
  WRONG_ADJACENCY: 'Deux faces opposées se retrouvent en contact.',
  MIRROR_ORDER: 'Les opposées sont bonnes, mais l’anneau est inversé : c’est le cube miroir.',
  WRONG_ROTATION_90: 'Un symbole est décalé d’un quart de tour.',
  WRONG_ROTATION_180: 'Un symbole est retourné de 180°.',
  SWAPPED_OPPOSITE_PAIR: 'La bonne paire a été placée dans le mauvais ordre.',
  CORRECT_FACE_WRONG_ORIENTATION: 'La face est correcte, mais son symbole est mal orienté.',
  FACE_CORRECT_BY_ELIMINATION: 'Cette face se plaçait directement par élimination.',
};

const EMPTY_ANSWER: CubesAnswer = {};

export function CubeCoachCorrection({ item, answer, correct, rtMs }: ExplainProps<CubesQuestion, CubesAnswer>) {
  const safeAnswer = answer ?? EMPTY_ANSWER;
  const analysis = useMemo(() => analyzeCubeAttempt(item.question, safeAnswer), [item.question, safeAnswer]);
  const solution = useMemo(() => solutionCubeFor(item.question), [item.question]);
  const attempted = completeCube(item.question, safeAnswer);
  const [detailed, setDetailed] = useState(false);
  const [openRotation, setOpenRotation] = useState<number | null>(null);
  const [openFace, setOpenFace] = useState<number | null>(null);
  const coachEnabled = getPrefs().cubeCoachEnabled;
  const isCorrect = correct ?? analysis.isCorrect;

  if (!coachEnabled) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <CoachNet cube={attempted ?? item.question.target} label="Ta réponse" />
        <CoachNet cube={solution} label="Solution" highlights={Object.fromEntries(item.question.holes.map((position) => [position, 'correct']))} />
      </div>
    );
  }

  if (isCorrect) {
    return <section className="mx-auto max-w-3xl rounded-2xl border border-green-900 bg-green-950/20 p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-green-400">Planche correcte</p><div className="mt-3 flex flex-wrap items-baseline gap-5"><p className="text-2xl font-semibold">{rtMs === undefined ? 'Méthode validée' : `${(rtMs / 1000).toFixed(1)} s`}</p><p className="text-sm text-zinc-400">{analysis.reasoningPath.minimalSteps.length} déduction{analysis.reasoningPath.minimalSteps.length > 1 ? 's' : ''} dans le chemin minimal</p></div><p className="mt-3 text-sm text-zinc-300">Continue à commencer par les opposées ; n’ouvre l’anneau que lorsque deux candidats restent réellement.</p></section>;
  }

  const primary = analysis.incorrectFaces.find((face) => face.primaryCause)?.primaryCause;
  const placementSteps = analysis.reasoningPath.minimalSteps.filter((step) => step.kind !== 'orientation-anchor');
  const wrongHighlights = Object.fromEntries(
    analysis.incorrectFaces.map((face) => [face.position, face.identityCorrect ? 'focus' : 'wrong']),
  );
  const firstWrongFace = analysis.incorrectFaces[0];

  return (
    <div className="mx-auto max-w-5xl">
      <section className={`rounded-xl px-5 py-4 ${analysis.isCorrect ? 'bg-green-950/25' : 'bg-zinc-900'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-zinc-100">
              {analysis.isCorrect ? 'Planche correcte' : primary ? CAUSE_LABEL[primary] : 'Réponse incomplète'}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Méthode rapide : {analysis.reasoningPath.minimalSteps.length} déduction{analysis.reasoningPath.minimalSteps.length > 1 ? 's' : ''}.
              L’étape décisive est la n° {analysis.reasoningPath.decisiveStepIndex + 1}.
            </p>
          </div>
          {analysis.mirrorDetected && (
            <span className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-bold tracking-wide text-white">MIROIR DÉTECTÉ</span>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-5 rounded-2xl border border-zinc-800 bg-zinc-950/55 p-4 md:grid-cols-[.8fr_1.2fr]">
        <CoachNet cube={attempted ?? item.question.target} label={attempted ? 'Ta construction · première erreur surlignée' : 'Temps écoulé'} highlights={wrongHighlights} />
        <div className="self-center">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-red-400">Première erreur</p>
          <h4 className="mt-2 text-lg font-semibold text-zinc-100">{primary ? CAUSE_LABEL[primary] : 'La réponse est incomplète.'}</h4>
          {firstWrongFace && <p className="mt-2 text-sm text-zinc-400">Regarde d’abord {netPositionName(firstWrongFace.position)}. La correction complète reste masquée pour te laisser retrouver la règle.</p>}
          {firstWrongFace && !firstWrongFace.identityCorrect && <button type="button" onClick={() => setOpenFace(openFace === firstWrongFace.position ? null : firstWrongFace.position)} className="mt-4 rounded-lg border border-red-800 px-3 py-2 text-sm font-semibold text-red-200">{primary === 'WRONG_OPPOSITE' ? 'Revoir l’opposée' : 'Voir pourquoi'}</button>}
          {openFace === firstWrongFace?.position && <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-300"><p>{firstWrongFace.givenFaceId ? `Tu as placé ${faceName(attempted ?? solution, firstWrongFace.givenFaceId)} dans cette case.` : 'Cette case est restée vide.'}</p>{firstWrongFace.primaryCause && <p className="mt-1 font-medium text-amber-200">{CAUSE_LABEL[firstWrongFace.primaryCause]}</p>}</div>}
        </div>
      </section>

      {analysis.orientationErrors.length > 0 && (
        <section className="mt-5 rounded-xl bg-amber-950/20 p-4">
          <h4 className="font-semibold text-amber-200">Faces bien placées, symboles mal orientés</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.orientationErrors.map((diagnostic) => (
              <button
                key={diagnostic.position}
                onClick={() => setOpenRotation(openRotation === diagnostic.position ? null : diagnostic.position)}
                className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                Pourquoi cette face tourne ?
              </button>
            ))}
          </div>
          {analysis.orientationErrors.map((diagnostic) =>
            openRotation === diagnostic.position ? (
              <div key={diagnostic.position} className="mt-4">
                <CubeRotationExplanation diagnostic={diagnostic} reference={item.question.reference} target={solution} />
              </div>
            ) : null,
          )}
        </section>
      )}

      <button
        onClick={() => setDetailed((value) => !value)}
        className="mt-5 rounded-lg border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-950/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        {detailed ? 'Masquer la géométrie détaillée' : 'Comprendre en détail'}
      </button>

      {detailed && (
        <section className="mt-4 space-y-6 rounded-xl bg-zinc-900/60 p-5">
          <div className="grid gap-5 border-b border-zinc-800 pb-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-950/55 p-4"><CoachNet cube={attempted ?? item.question.target} label="Ta construction" highlights={wrongHighlights} compact /><CoachNet cube={solution} label="Solution" highlights={Object.fromEntries(item.question.holes.map((position) => [position, 'correct']))} compact /></div>
            <div><h4 className="font-semibold text-sky-300">Le chemin le plus court sur cette planche</h4><ol className="mt-3 space-y-3">{analysis.reasoningPath.minimalSteps.map((step, index) => <ReasoningStepRow key={`${step.kind}-${index}`} step={step} index={index} solution={solution} decisive={index === analysis.reasoningPath.decisiveStepIndex} />)}</ol></div>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100">Les trois paires opposées</h4>
            <p className="mt-1 text-sm text-zinc-400">Deux faces d’une même paire ne peuvent jamais se toucher.</p>
            <div className="mt-3"><OppositePairsDiagram cube={item.question.reference} /></div>
          </div>
          <div className="border-t border-zinc-800 pt-5">
            <h4 className="font-semibold text-zinc-100">Voir le patron se refermer</h4>
            <div className="mt-3"><FoldPlayer cube={item.question.reference} pairColors /></div>
          </div>
          {analysis.circularOrderErrors.map((error) => (
            <div key={error.centerPosition} className="grid gap-4 border-t border-zinc-800 pt-5 md:grid-cols-2">
              <RingDiagram center={error.centerFaceId} order={error.expectedOrder} cube={solution} tone="green" label="Ordre conservé par une rotation" />
              <RingDiagram center={error.centerFaceId} order={error.givenOrder} cube={solution} tone="red" label="Ordre construit dans ta réponse" />
            </div>
          ))}
          {placementSteps.some((step) => step.kind === 'ring-comparison') && <div className="grid gap-4 border-t border-zinc-800 pt-5 md:grid-cols-2">{placementSteps.filter((step): step is Extract<ReasoningStep, { kind: 'ring-comparison' }> => step.kind === 'ring-comparison').slice(0, 1).flatMap((step) => [<RingDiagram key="expected" center={step.chosenFaceId} order={step.expectedOrder} cube={solution} tone="green" label="Anneau autour du bon candidat" />,<RingDiagram key="target" center={step.chosenFaceId} order={step.targetOrder} cube={solution} tone={analysis.mirrorDetected ? 'red' : 'blue'} label="Ordre demandé par le patron cible" />])}</div>}
        </section>
      )}

      {import.meta.env.DEV && <CubeDebugPanel question={item.question} path={analysis.reasoningPath} />}
    </div>
  );
}

function ReasoningStepRow({
  step,
  index,
  solution,
  decisive,
}: {
  step: ReasoningStep;
  index: number;
  solution: ReturnType<typeof solutionCubeFor>;
  decisive: boolean;
}) {
  let text: string;
  if (step.kind === 'opposite-deduction') {
    text = `${faceName(solution, step.visibleFaceId)} est visible en face du trou. Son opposée est ${faceName(solution, step.placedFaceId)} : cette face est imposée.`;
  } else if (step.kind === 'elimination') {
    text = `Il ne reste que ${faceName(solution, step.placedFaceId)} pour cette case : placement par élimination.`;
  } else if (step.kind === 'two-candidates') {
    text = `Les opposées ne départagent plus ${step.candidateFaceIds.map((id) => faceName(solution, id)).join(' et ')}. Il faut lire l’ordre des voisins.`;
  } else if (step.kind === 'ring-comparison') {
    text = `Autour de ${faceName(solution, step.chosenFaceId)}, l’ordre circulaire correspond au patron cible. ${step.rejectedFaceIds.map((id) => faceName(solution, id)).join(', ')} produirait un ordre différent ou inversé.`;
  } else if (step.kind === 'mirror-rejection') {
    text = 'Une rotation conserve l’ordre circulaire ; cette proposition l’inverse et crée un miroir.';
  } else {
    text = `La face ${faceName(solution, step.faceId)} prend ${step.pieceTurn === 2 ? 'un demi-tour' : 'un quart de tour'} en gardant ${faceName(solution, step.anchorFaceId)} comme voisin ancre.`;
  }
  return (
    <li className={`grid grid-cols-[2rem_1fr] gap-3 rounded-lg px-2 py-2 ${decisive ? 'bg-sky-950/45' : ''}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-md text-sm font-bold ${decisive ? 'bg-sky-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>{index + 1}</span>
      <div>
        <p className="text-sm text-zinc-200">{text}</p>
        {decisive && <p className="mt-1 text-xs font-semibold text-sky-300">Étape décisive</p>}
      </div>
    </li>
  );
}
