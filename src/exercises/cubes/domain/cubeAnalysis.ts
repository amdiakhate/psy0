import type { CubesAnswer, CubesQuestion } from '../generator';
import { completeCube, validateGeometry } from '../generator';
import { normalizeRot } from '../cube-model';
import {
  getClockwiseNeighbors,
  getNeighborAtEdge,
  getOppositePosition,
  getSharedEdge,
} from './cubeGeometry';
import type { FaceEdge, FaceId, FacePosition, QuarterTurn } from './types';
import { quarterTurn } from './types';
import { buildReasoningPath, solutionCubeFor } from './reasoningPath';
import type { ReasoningPath } from './reasoningPath';

export type CubeErrorCause =
  | 'WRONG_OPPOSITE'
  | 'WRONG_ADJACENCY'
  | 'MIRROR_ORDER'
  | 'WRONG_ROTATION_90'
  | 'WRONG_ROTATION_180'
  | 'SWAPPED_OPPOSITE_PAIR'
  | 'CORRECT_FACE_WRONG_ORIENTATION'
  | 'FACE_CORRECT_BY_ELIMINATION';

export interface FaceDiagnostic {
  position: FacePosition;
  expectedFaceId: FaceId;
  givenFaceId: FaceId | null;
  identityCorrect: boolean;
  orientationCorrect: boolean;
  primaryCause?: CubeErrorCause;
}

export interface OppositePairDiagnostic {
  positions: readonly [FacePosition, FacePosition];
  faceIds: readonly [FaceId, FaceId];
  valid: boolean;
}

export interface AdjacencyDiagnostic {
  positions: readonly [FacePosition, FacePosition];
  faceIds: readonly [FaceId, FaceId];
  valid: false;
}

export interface CircularOrderDiagnostic {
  centerPosition: FacePosition;
  centerFaceId: FaceId;
  expectedOrder: readonly FaceId[];
  givenOrder: readonly FaceId[];
  reversed: boolean;
}

export interface OrientationDiagnostic {
  position: FacePosition;
  faceId: FaceId;
  givenRot: QuarterTurn;
  referenceRot: QuarterTurn;
  expectedRot: QuarterTurn;
  correction: QuarterTurn;
  cause: 'WRONG_ROTATION_90' | 'WRONG_ROTATION_180';
  anchorPosition: FacePosition;
  anchorFaceId: FaceId;
  sourceEdge: FaceEdge;
  targetEdge: FaceEdge;
}

export interface CubeAttemptAnalysis {
  isCorrect: boolean;
  correctFaces: FaceDiagnostic[];
  incorrectFaces: FaceDiagnostic[];
  oppositePairs: OppositePairDiagnostic[];
  adjacencyErrors: AdjacencyDiagnostic[];
  circularOrderErrors: CircularOrderDiagnostic[];
  orientationErrors: OrientationDiagnostic[];
  mirrorDetected: boolean;
  reasoningPath: ReasoningPath;
}

const POSITIONS: readonly FacePosition[] = [0, 1, 2, 3, 4, 5];

function cyclicEqual(a: readonly FaceId[], b: readonly FaceId[]): boolean {
  if (a.length !== b.length) return false;
  return a.some((_, offset) => a.every((value, index) => value === b[(index + offset) % b.length]));
}

export function analyzeCubeAttempt(question: CubesQuestion, answer: CubesAnswer): CubeAttemptAnalysis {
  const solution = solutionCubeFor(question);
  const candidate = completeCube(question, answer);
  const attempted = candidate ?? solution.map((face, position) =>
    question.target[position] === null ? { ...face, id: `missing-${position}` } : face,
  );

  const oppositePairs: OppositePairDiagnostic[] = [];
  for (const position of POSITIONS) {
    const opposite = getOppositePosition(position);
    if (position > opposite) continue;
    const a = attempted[position];
    const b = attempted[opposite];
    oppositePairs.push({
      positions: [position, opposite],
      faceIds: [a.id, b.id],
      valid: getOppositePosition(a.originalPosition) === b.originalPosition,
    });
  }

  const adjacencyErrors: AdjacencyDiagnostic[] = [];
  for (const position of POSITIONS) {
    for (const edge of ['right', 'bottom'] as const) {
      const neighbor = getNeighborAtEdge(position, edge);
      const a = attempted[position];
      const b = attempted[neighbor];
      if (getOppositePosition(a.originalPosition) === b.originalPosition) {
        adjacencyErrors.push({ positions: [position, neighbor], faceIds: [a.id, b.id], valid: false });
      }
    }
  }

  const circularOrderErrors: CircularOrderDiagnostic[] = [];
  for (const position of POSITIONS) {
    const center = attempted[position];
    const expectedOrder = getClockwiseNeighbors(center.originalPosition).map(
      (neighbor) => question.reference[neighbor].id,
    );
    const givenOrder = getClockwiseNeighbors(position).map((neighbor) => attempted[neighbor].id);
    const sameMembers = expectedOrder.every((id) => givenOrder.includes(id));
    if (!sameMembers || cyclicEqual(expectedOrder, givenOrder)) continue;
    const reversed = cyclicEqual([...expectedOrder].reverse(), givenOrder);
    circularOrderErrors.push({
      centerPosition: position,
      centerFaceId: center.id,
      expectedOrder,
      givenOrder,
      reversed,
    });
  }

  const mirrorDetected = oppositePairs.every((pair) => pair.valid) && circularOrderErrors.some((error) => error.reversed);
  const orientationErrors: OrientationDiagnostic[] = [];
  const faceDiagnostics: FaceDiagnostic[] = POSITIONS.map((position) => {
    const expected = solution[position];
    const given = attempted[position];
    const identityCorrect = expected.id === given.id;
    const orientationCorrect =
      identityCorrect && normalizeRot(expected.sym, expected.rot) === normalizeRot(given.sym, given.rot);
    let primaryCause: CubeErrorCause | undefined;

    if (candidate === null) {
      primaryCause = undefined;
    } else if (!identityCorrect) {
      const badOpposite = oppositePairs.some(
        (pair) => !pair.valid && pair.positions.includes(position),
      );
      const badAdjacency = adjacencyErrors.some((pair) => pair.positions.includes(position));
      primaryCause = mirrorDetected
        ? 'MIRROR_ORDER'
        : badOpposite
          ? 'WRONG_OPPOSITE'
          : badAdjacency
            ? 'WRONG_ADJACENCY'
            : 'SWAPPED_OPPOSITE_PAIR';
    } else if (!orientationCorrect) {
      primaryCause = 'CORRECT_FACE_WRONG_ORIENTATION';
      const givenRot = quarterTurn(given.rot);
      const expectedRot = quarterTurn(expected.rot);
      const correction = quarterTurn(expectedRot - givenRot);
      const anchorPosition =
        getClockwiseNeighbors(position).find((neighbor) => question.target[neighbor] !== null) ??
        getClockwiseNeighbors(position)[0];
      const anchor = solution[anchorPosition];
      const source = getSharedEdge(expected.originalPosition, anchor.originalPosition);
      const target = getSharedEdge(position, anchorPosition);
      if (source && target) {
        const referenceFace = question.reference.find((face) => face.id === expected.id);
        if (!referenceFace) throw new Error(`Face de référence absente : ${expected.id}`);
        orientationErrors.push({
          position,
          faceId: expected.id,
          givenRot,
          referenceRot: referenceFace.rot,
          expectedRot,
          correction,
          cause: correction === 2 ? 'WRONG_ROTATION_180' : 'WRONG_ROTATION_90',
          anchorPosition,
          anchorFaceId: anchor.id,
          sourceEdge: source.aEdge,
          targetEdge: target.aEdge,
        });
      }
    }

    return {
      position,
      expectedFaceId: expected.id,
      givenFaceId: candidate ? given.id : null,
      identityCorrect,
      orientationCorrect,
      ...(primaryCause ? { primaryCause } : {}),
    };
  });

  return {
    isCorrect: candidate !== null && validateGeometry({ question, seed: 0, level: 1, tags: [] }, answer),
    correctFaces: faceDiagnostics.filter((face) => face.identityCorrect && face.orientationCorrect),
    incorrectFaces: faceDiagnostics.filter((face) => !face.identityCorrect || !face.orientationCorrect),
    oppositePairs,
    adjacencyErrors,
    circularOrderErrors,
    orientationErrors,
    mirrorDetected,
    reasoningPath: buildReasoningPath(question),
  };
}
