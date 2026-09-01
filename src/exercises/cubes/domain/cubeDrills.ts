import { mulberry32, randInt, shuffle } from '../../../core/rng';
import { generate, solutionAnswer } from '../generator';
import type { CubesAnswer, CubesQuestion, Piece } from '../generator';
import { ALL_ROTATIONS, applyRotation, POS } from '../cube-model';
import { symbolName } from '../CubeSvg';
import { getClockwiseNeighbors, getOppositePosition } from './cubeGeometry';
import type { Cube, CubeFace, FaceId, FacePosition, QuarterTurn } from './types';
import { quarterTurn } from './types';

export type CubeDrillType =
  | 'opposites'
  | 'adjacency'
  | 'rings'
  | 'mirror'
  | 'rotation'
  | 'full-puzzle'
  | 'two-remaining'
  | 'orientation-only';

export interface DrillChoice {
  id: string;
  label: string;
  faceIds?: readonly FaceId[];
}

interface DrillBase {
  id: string;
  type: CubeDrillType;
  prompt: string;
  reference: Cube;
  ambiguityLocation: 'center' | 'non-center' | null;
  orientationTargets: readonly FacePosition[];
}

export interface ChoiceCubeDrill extends DrillBase {
  type: 'opposites' | 'adjacency' | 'rings' | 'mirror' | 'rotation';
  choices: readonly DrillChoice[];
  answer: { choiceId: string };
  focusPosition: FacePosition;
  ringA?: readonly FaceId[];
  ringB?: readonly FaceId[];
  target?: Cube;
}

export interface TwoRemainingCubeDrill extends DrillBase {
  type: 'two-remaining';
  target: readonly (CubeFace | null)[];
  pieces: readonly Piece[];
  focusPosition: FacePosition;
  choices: readonly DrillChoice[];
  answer: { choiceId: string };
  ambiguityLocation: 'center' | 'non-center';
}

export interface OrientationOnlyCubeDrill extends DrillBase {
  type: 'orientation-only';
  target: Cube;
  displayedRotations: Readonly<Record<number, QuarterTurn>>;
  answer: { rotations: Readonly<Record<number, QuarterTurn>> };
}

export interface FullPuzzleCubeDrill extends DrillBase {
  type: 'full-puzzle';
  question: CubesQuestion;
  answer: CubesAnswer;
}

export type CubeDrillQuestion =
  | ChoiceCubeDrill
  | TwoRemainingCubeDrill
  | OrientationOnlyCubeDrill
  | FullPuzzleCubeDrill;

const FACE_IDS: Readonly<Record<FacePosition, FaceId>> = {
  [POS.R]: 'C',
  [POS.L]: 'A',
  [POS.U]: 'E',
  [POS.D]: 'F',
  [POS.F]: 'B',
  [POS.B]: 'D',
};

const POSITIONS: readonly FacePosition[] = [POS.R, POS.L, POS.U, POS.D, POS.F, POS.B];

function labeledCube(): Cube {
  return POSITIONS.map((position, sym) => ({
    id: FACE_IDS[position],
    originalPosition: position,
    sym,
    rot: 0,
  }));
}

const faceId = (cube: Cube, position: FacePosition): FaceId => cube[position].id;
const faceLabel = (cube: Cube, position: FacePosition): string => symbolName(cube[position].sym);
const labelForId = (cube: Cube, id: FaceId): string => {
  const face = cube.find((candidate) => candidate.id === id);
  return face ? symbolName(face.sym) : id;
};
const choice = (id: string, label = id, faceIds?: readonly FaceId[]): DrillChoice => ({
  id,
  label,
  ...(faceIds ? { faceIds } : {}),
});

function choiceDrill(seed: number, type: ChoiceCubeDrill['type']): ChoiceCubeDrill {
  const rng = mulberry32(seed);
  const reference = labeledCube();
  const focusPosition = POSITIONS[randInt(rng, 0, POSITIONS.length - 1)];
  const focusId = faceId(reference, focusPosition);
  const focusLabel = faceLabel(reference, focusPosition);
  const base = {
    id: `${type}-${seed}`,
    type,
    reference,
    focusPosition,
    ambiguityLocation: null,
    orientationTargets: [],
  } as const;

  if (type === 'opposites') {
    const correct = faceId(reference, getOppositePosition(focusPosition));
    const distractors = shuffle(rng, reference.map((face) => face.id).filter((id) => id !== correct)).slice(0, 3);
    return {
      ...base,
      prompt: `Quelle face est opposée à ${focusLabel} ?`,
      choices: shuffle(rng, [correct, ...distractors]).map((id) => choice(id, labelForId(reference, id))),
      answer: { choiceId: correct },
    };
  }

  if (type === 'adjacency') {
    const neighbors = getClockwiseNeighbors(focusPosition).map((position) => faceId(reference, position));
    const opposite = faceId(reference, getOppositePosition(focusPosition));
    const validId = neighbors.join('-');
    const variants: DrillChoice[] = [
      choice(validId, neighbors.map((id) => labelForId(reference, id)).join(' · '), neighbors),
      choice(`bad-1-${seed}`, [opposite, ...neighbors.slice(1)].map((id) => labelForId(reference, id)).join(' · '), [opposite, ...neighbors.slice(1)]),
      choice(`bad-2-${seed}`, [...neighbors.slice(0, 3), focusId].map((id) => labelForId(reference, id)).join(' · '), [...neighbors.slice(0, 3), focusId]),
      choice(`bad-3-${seed}`, [neighbors[0], opposite, neighbors[2], focusId].map((id) => labelForId(reference, id)).join(' · '), [neighbors[0], opposite, neighbors[2], focusId]),
    ];
    return {
      ...base,
      prompt: `Quelles sont les quatre faces adjacentes à ${focusLabel} ?`,
      choices: shuffle(rng, variants),
      answer: { choiceId: validId },
    };
  }

  if (type === 'rings') {
    const ring = getClockwiseNeighbors(focusPosition).map((position) => faceId(reference, position));
    const validId = ring.join('-');
    const reversed = [ring[0], ring[3], ring[2], ring[1]];
    const swapped = [ring[0], ring[2], ring[1], ring[3]];
    const shiftedWrong = [ring[1], ring[0], ring[2], ring[3]];
    return {
      ...base,
      prompt: `Quel ordre circulaire est possible autour de ${focusLabel} ?`,
      choices: shuffle(rng, [
        choice(validId, ring.map((id) => labelForId(reference, id)).join(' → '), ring),
        choice(`reverse-${seed}`, reversed.map((id) => labelForId(reference, id)).join(' → '), reversed),
        choice(`swap-${seed}`, swapped.map((id) => labelForId(reference, id)).join(' → '), swapped),
        choice(`shift-${seed}`, shiftedWrong.map((id) => labelForId(reference, id)).join(' → '), shiftedWrong),
      ]),
      answer: { choiceId: validId },
      ringA: ring,
    };
  }

  if (type === 'mirror') {
    const ring = getClockwiseNeighbors(focusPosition).map((position) => faceId(reference, position));
    const mirrored = [ring[0], ring[3], ring[2], ring[1]];
    const isMirror = seed % 2 === 1;
    return {
      ...base,
      prompt: 'Le second anneau représente-t-il une rotation du même cube ou un miroir ?',
      choices: [choice('same', 'Même cube'), choice('mirror', 'Miroir')],
      answer: { choiceId: isMirror ? 'mirror' : 'same' },
      ringA: ring,
      ringB: isMirror ? mirrored : [...ring.slice(2), ...ring.slice(0, 2)],
    };
  }

  const rotated = applyRotation(reference, ALL_ROTATIONS[1 + (seed % 23)]);
  const expectedRot = rotated[focusPosition].rot;
  return {
    ...base,
    prompt: `Quelle rotation faut-il appliquer à la face ${symbolName(rotated[focusPosition].sym)} ?`,
    choices: [0, 1, 2, 3].map((rot) => choice(String(rot), rot === 0 ? 'Aucune' : rot === 2 ? '180°' : rot === 1 ? '90° antihoraire' : '90° horaire')),
    answer: { choiceId: String(expectedRot) },
    target: rotated,
  };
}

function twoRemainingDrill(seed: number): TwoRemainingCubeDrill {
  const rng = mulberry32(seed);
  const reference = labeledCube();
  const oriented = applyRotation(reference, ALL_ROTATIONS[1 + (seed % 23)]);
  const center = seed % 2 === 0;
  const holes: readonly [FacePosition, FacePosition] = center ? [POS.F, POS.B] : [POS.L, POS.R];
  const target = oriented.map((face, position) =>
    holes.includes(position as FacePosition) ? null : { ...face },
  );
  const pieces: Piece[] = holes.map((position, id) => ({
    id,
    faceId: oriented[position].id,
    originalPosition: oriented[position].originalPosition,
    sym: oriented[position].sym,
  }));
  const focusPosition = center ? POS.F : holes[seed % holes.length];
  const expectedId = oriented[focusPosition].id;
  return {
    id: `two-remaining-${seed}`,
    type: 'two-remaining',
    prompt: `Deux faces restent. Laquelle va sur la case ${focusPosition === POS.F ? 'centrale' : 'indiquée'} ?`,
    reference,
    target,
    pieces: shuffle(rng, pieces),
    focusPosition,
    choices: shuffle(rng, pieces.map((piece) => choice(piece.faceId, symbolName(piece.sym)))),
    answer: { choiceId: expectedId },
    ambiguityLocation: center ? 'center' : 'non-center',
    orientationTargets: [],
  };
}

function orientationOnlyDrill(seed: number): OrientationOnlyCubeDrill {
  const rng = mulberry32(seed);
  const reference = labeledCube();
  const target = applyRotation(reference, ALL_ROTATIONS[1 + (seed % 23)]);
  const count = 1 + (seed % 3);
  const orientationTargets = shuffle(rng, [...POSITIONS]).slice(0, count);
  const rotations: Record<number, QuarterTurn> = {};
  const displayedRotations: Record<number, QuarterTurn> = {};
  for (const position of orientationTargets) {
    rotations[position] = target[position].rot;
    displayedRotations[position] = quarterTurn(target[position].rot + 1 + (seed % 3));
  }
  return {
    id: `orientation-only-${seed}`,
    type: 'orientation-only',
    prompt: `Oriente ${count} symbole${count > 1 ? 's' : ''} sans déplacer les faces.`,
    reference,
    target,
    displayedRotations,
    orientationTargets,
    answer: { rotations },
    ambiguityLocation: null,
  };
}

export function generateCubeDrill(seed: number, type: 'two-remaining'): TwoRemainingCubeDrill;
export function generateCubeDrill(seed: number, type: 'orientation-only'): OrientationOnlyCubeDrill;
export function generateCubeDrill(seed: number, type: 'full-puzzle'): FullPuzzleCubeDrill;
export function generateCubeDrill(seed: number, type: ChoiceCubeDrill['type']): ChoiceCubeDrill;
export function generateCubeDrill(seed: number, type: CubeDrillType): CubeDrillQuestion;
export function generateCubeDrill(seed: number, type: CubeDrillType): CubeDrillQuestion {
  if (type === 'two-remaining') return twoRemainingDrill(seed);
  if (type === 'orientation-only') return orientationOnlyDrill(seed);
  if (type === 'full-puzzle') {
    const item = generate(seed, 3, 'letters');
    return {
      id: `full-puzzle-${seed}`,
      type,
      prompt: 'Complète le patron.',
      reference: item.question.reference,
      question: item.question,
      answer: solutionAnswer(item.question),
      ambiguityLocation: null,
      orientationTargets: [],
    };
  }
  return choiceDrill(seed, type);
}

export function validateCubeDrill(question: CubeDrillQuestion, answer: unknown): boolean {
  if (question.type === 'orientation-only') {
    if (typeof answer !== 'object' || answer === null || !('rotations' in answer)) return false;
    const rotations = (answer as { rotations: Readonly<Record<number, number>> }).rotations;
    return question.orientationTargets.every(
      (position) => Number.isInteger(rotations[position]) && quarterTurn(rotations[position]) === question.answer.rotations[position],
    );
  }
  if (question.type === 'full-puzzle') {
    if (typeof answer !== 'object' || answer === null) return false;
    return JSON.stringify(answer) === JSON.stringify(question.answer);
  }
  if (typeof answer !== 'object' || answer === null || !('choiceId' in answer)) return false;
  return (answer as { choiceId: unknown }).choiceId === question.answer.choiceId;
}
