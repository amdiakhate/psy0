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
import { CoachNet, OppositePairsDiagram, RingDiagram, faceName } from './CubeCoachVisuals';
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

export function CubeCoachCorrection({ item, answer }: ExplainProps<CubesQuestion, CubesAnswer>) {
  const safeAnswer = answer ?? EMPTY_ANSWER;
  const analysis = useMemo(() => analyzeCubeAttempt(item.question, safeAnswer), [item.question, safeAnswer]);
  const solution = useMemo(() => solutionCubeFor(item.question), [item.question]);
  const attempted = completeCube(item.question, safeAnswer);
  const [detailed, setDetailed] = useState(false);
  const [openRotation, setOpenRotation] = useState<number | null>(null);
  const [openFace, setOpenFace] = useState<number | null>(null);
  const coachEnabled = getPrefs().cubeCoachEnabled;

  if (!coachEnabled) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <CoachNet cube={attempted ?? item.question.target} label="Ta réponse" />
        <CoachNet cube={solution} label="Solution" highlights={Object.fromEntries(item.question.holes.map((position) => [position, 'correct']))} />
      </div>
    );
  }

  const primary = analysis.incorrectFaces.find((face) => face.primaryCause)?.primaryCause;
  const placementSteps = analysis.reasoningPath.minimalSteps.filter((step) => step.kind !== 'orientation-anchor');
  const wrongHighlights = Object.fromEntries(
    analysis.incorrectFaces.map((face) => [face.position, face.identityCorrect ? 'focus' : 'wrong']),
  );

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

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-950/55 p-4">
          <CoachNet cube={attempted ?? item.question.target} label={attempted ? 'Ta construction' : 'Temps écoulé'} highlights={wrongHighlights} compact />
          <CoachNet cube={solution} label="Solution" highlights={Object.fromEntries(item.question.holes.map((position) => [position, 'correct']))} compact />
        </div>
        <section className="rounded-xl bg-zinc-900/70 p-4">
          <h4 className="font-semibold text-sky-300">Le chemin le plus court sur cette planche</h4>
          <ol className="mt-3 space-y-3">
            {analysis.reasoningPath.minimalSteps.map((step, index) => (
              <ReasoningStepRow key={`${step.kind}-${index}`} step={step} index={index} solution={solution} decisive={index === analysis.reasoningPath.decisiveStepIndex} />
            ))}
          </ol>
        </section>
      </div>

      {analysis.incorrectFaces.length > 0 && (
        <section className="mt-5 rounded-xl bg-zinc-900/70 p-4">
          <h4 className="font-semibold text-zinc-100">Pourquoi ma réponse est fausse ?</h4>
          <p className="mt-1 text-sm text-zinc-500">Ouvre une face pour isoler la règle qui a été cassée.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.incorrectFaces.map((face) => (
              <button
                key={face.position}
                onClick={() => setOpenFace(openFace === face.position ? null : face.position)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${openFace === face.position ? 'border-sky-500 bg-sky-950/50 text-sky-200' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
              >
                Case {face.position + 1} · {face.givenFaceId ? faceName(attempted ?? solution, face.givenFaceId) : 'vide'}
              </button>
            ))}
          </div>
          {analysis.incorrectFaces.map((face) => openFace === face.position ? (
            <div key={face.position} className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/55 p-3 text-sm text-zinc-300">
              <p>
                {face.identityCorrect
                  ? `Tu as placé la bonne face (${faceName(solution, face.expectedFaceId)}), mais son symbole n’a pas suivi la bonne arête physique.`
                  : `Tu as placé ${face.givenFaceId ? faceName(attempted ?? solution, face.givenFaceId) : 'aucune face'} ici ; cette case attend ${faceName(solution, face.expectedFaceId)}.`}
              </p>
              {face.primaryCause && <p className="mt-1 font-medium text-amber-200">{CAUSE_LABEL[face.primaryCause]}</p>}
            </div>
          ) : null)}
        </section>
      )}

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
                <CubeRotationExplanation diagnostic={diagnostic} cube={solution} />
              </div>
            ) : null,
          )}
        </section>
      )}

      {placementSteps.some((step) => step.kind === 'ring-comparison') && (
        <section className="mt-5 grid gap-4 md:grid-cols-2">
          {placementSteps.filter((step): step is Extract<ReasoningStep, { kind: 'ring-comparison' }> => step.kind === 'ring-comparison').slice(0, 1).flatMap((step) => [
            <RingDiagram key="expected" center={step.chosenFaceId} order={step.expectedOrder} cube={solution} tone="green" label="Anneau autour du bon candidat" />,
            <RingDiagram key="target" center={step.chosenFaceId} order={step.targetOrder} cube={solution} tone={analysis.mirrorDetected ? 'red' : 'blue'} label="Ordre demandé par le patron cible" />,
          ])}
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
