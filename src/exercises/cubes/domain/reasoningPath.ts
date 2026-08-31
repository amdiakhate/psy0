import type { CubesQuestion } from '../generator';
import { POS, SYMBOL_QUARTER_SYMMETRY } from '../cube-model';
import { getClockwiseNeighbors, getOppositePosition, getSharedEdge } from './cubeGeometry';
import type { Cube, CubeFace, FaceEdge, FaceId, FacePosition, QuarterTurn } from './types';
import { quarterTurn } from './types';

export interface OppositeDeductionStep {
  kind: 'opposite-deduction';
  hole: FacePosition;
  visibleOppositePosition: FacePosition;
  visibleFaceId: FaceId;
  placedFaceId: FaceId;
}

export interface EliminationStep {
  kind: 'elimination';
  hole: FacePosition;
  placedFaceId: FaceId;
}

export interface TwoCandidatesStep {
  kind: 'two-candidates';
  holes: readonly FacePosition[];
  candidateFaceIds: readonly FaceId[];
  ambiguityLocation: 'center' | 'non-center';
}

export interface RingComparisonStep {
  kind: 'ring-comparison';
  hole: FacePosition;
  chosenFaceId: FaceId;
  rejectedFaceIds: readonly FaceId[];
  expectedOrder: readonly FaceId[];
  targetOrder: readonly FaceId[];
}

export interface MirrorRejectionStep {
  kind: 'mirror-rejection';
  centerFaceId: FaceId;
  normalOrder: readonly FaceId[];
  mirroredOrder: readonly FaceId[];
}

export interface OrientationAnchorStep {
  kind: 'orientation-anchor';
  position: FacePosition;
  faceId: FaceId;
  anchorPosition: FacePosition;
  anchorFaceId: FaceId;
  sourceEdge: FaceEdge;
  targetEdge: FaceEdge;
  referenceRot: QuarterTurn;
  expectedRot: QuarterTurn;
  pieceTurn: QuarterTurn;
}

export type ReasoningStep =
  | OppositeDeductionStep
  | EliminationStep
  | TwoCandidatesStep
  | RingComparisonStep
  | MirrorRejectionStep
  | OrientationAnchorStep;

export interface ReasoningPath {
  minimalSteps: ReasoningStep[];
  decisiveStepIndex: number;
  alternativeValidSteps?: ReasoningStep[];
}

export function solutionCubeFor(question: CubesQuestion): Cube {
  return question.target.map((visible, position) => {
    if (visible !== null) return { ...visible };
    const pieceId = question.solution[position];
    const piece = question.pieces.find((candidate) => candidate.id === pieceId);
    if (!piece) throw new Error(`Solution sans pièce pour la position ${position}`);
    return {
      id: piece.faceId,
      originalPosition: piece.originalPosition,
      sym: piece.sym,
      rot: quarterTurn(question.expectedRot[position]),
    };
  });
}

function faceAt(
  question: CubesQuestion,
  solved: ReadonlyMap<FacePosition, CubeFace>,
  position: FacePosition,
): CubeFace | null {
  return question.target[position] ?? solved.get(position) ?? null;
}

function pieceFace(question: CubesQuestion, faceId: FaceId): CubeFace {
  const piece = question.pieces.find((candidate) => candidate.faceId === faceId);
  if (!piece) throw new Error(`Pièce physique absente : ${faceId}`);
  const position = question.holes.find((hole) => question.solution[hole] === piece.id);
  if (position === undefined) throw new Error(`Pièce sans trou de solution : ${faceId}`);
  return {
    id: piece.faceId,
    originalPosition: piece.originalPosition,
    sym: piece.sym,
    rot: quarterTurn(question.expectedRot[position]),
  };
}

function addOrientationSteps(question: CubesQuestion, solution: Cube, steps: ReasoningStep[]): void {
  for (const position of question.holes) {
    const face = solution[position];
    if (SYMBOL_QUARTER_SYMMETRY[face.sym] === 4 || face.rot === 0) continue;
    const neighborPositions = getClockwiseNeighbors(position);
    const anchorPosition =
      neighborPositions.find((neighbor) => question.target[neighbor] !== null) ?? neighborPositions[0];
    const anchor = solution[anchorPosition];
    const source = getSharedEdge(face.originalPosition, anchor.originalPosition);
    const target = getSharedEdge(position, anchorPosition);
    if (!source || !target) continue;
    const referenceFace = question.reference.find((candidate) => candidate.id === face.id);
    if (!referenceFace) continue;
    steps.push({
      kind: 'orientation-anchor',
      position,
      faceId: face.id,
      anchorPosition,
      anchorFaceId: anchor.id,
      sourceEdge: source.aEdge,
      targetEdge: target.aEdge,
      referenceRot: referenceFace.rot,
      expectedRot: face.rot,
      pieceTurn: face.rot,
    });
  }
}

export function buildReasoningPath(question: CubesQuestion): ReasoningPath {
  const solution = solutionCubeFor(question);
  const remainingHoles = new Set<FacePosition>(question.holes);
  const remainingIds = new Set(question.pieces.map((piece) => piece.faceId));
  const solved = new Map<FacePosition, CubeFace>();
  const steps: ReasoningStep[] = [];
  const alternatives: ReasoningStep[] = [];

  let progressed = true;
  while (progressed && remainingHoles.size > 0) {
    progressed = false;
    const deductions: OppositeDeductionStep[] = [];
    for (const hole of remainingHoles) {
      const oppositePosition = getOppositePosition(hole);
      const oppositeFace = faceAt(question, solved, oppositePosition);
      if (!oppositeFace) continue;
      const wantedOriginal = getOppositePosition(oppositeFace.originalPosition);
      const piece = question.pieces.find(
        (candidate) => remainingIds.has(candidate.faceId) && candidate.originalPosition === wantedOriginal,
      );
      if (!piece) continue;
      deductions.push({
        kind: 'opposite-deduction',
        hole,
        visibleOppositePosition: oppositePosition,
        visibleFaceId: oppositeFace.id,
        placedFaceId: piece.faceId,
      });
    }
    if (deductions.length > 0) {
      const chosen = deductions[0];
      steps.push(chosen);
      alternatives.push(...deductions.slice(1));
      const face = pieceFace(question, chosen.placedFaceId);
      solved.set(chosen.hole, face);
      remainingHoles.delete(chosen.hole);
      remainingIds.delete(chosen.placedFaceId);
      progressed = true;
    }
  }

  while (remainingHoles.size > 0) {
    const holes = [...remainingHoles];
    const ids = [...remainingIds];
    if (holes.length === 1) {
      const hole = holes[0];
      const faceId = ids[0];
      steps.push({ kind: 'elimination', hole, placedFaceId: faceId });
      solved.set(hole, pieceFace(question, faceId));
      remainingHoles.delete(hole);
      remainingIds.delete(faceId);
      continue;
    }

    if (holes.length === 2) {
      steps.push({
        kind: 'two-candidates',
        holes,
        candidateFaceIds: ids,
        ambiguityLocation: holes.includes(POS.F) ? 'center' : 'non-center',
      });
    }

    const hole = holes[0];
    const expected = solution[hole];
    const rejected = ids.filter((id) => id !== expected.id);
    const expectedOrder = getClockwiseNeighbors(expected.originalPosition).map(
      (position) => question.reference[position].id,
    );
    const targetOrder = getClockwiseNeighbors(hole).map((position) => solution[position].id);
    steps.push({
      kind: 'ring-comparison',
      hole,
      chosenFaceId: expected.id,
      rejectedFaceIds: rejected,
      expectedOrder,
      targetOrder,
    });
    if (holes.length === 2) {
      steps.push({
        kind: 'mirror-rejection',
        centerFaceId: expected.id,
        normalOrder: expectedOrder,
        mirroredOrder: [expectedOrder[0], expectedOrder[3], expectedOrder[2], expectedOrder[1]],
      });
    }
    solved.set(hole, expected);
    remainingHoles.delete(hole);
    remainingIds.delete(expected.id);
  }

  const placementDecisiveIndex = Math.max(0, steps.length - 1);
  addOrientationSteps(question, solution, steps);
  return {
    minimalSteps: steps,
    decisiveStepIndex: placementDecisiveIndex,
    ...(alternatives.length > 0 ? { alternativeValidSteps: alternatives } : {}),
  };
}
