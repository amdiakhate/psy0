import { ALL_ROTATIONS, POS, applyRotation } from '../cube-model';
import {
  FACE_FRAMES,
  getClockwiseNeighbors,
  getOppositePosition,
} from '../domain/cubeGeometry';
import type { FacePosition, QuarterTurn, Vec3 } from '../domain/types';
import {
  COURSE_CUBE,
  COURSE_FACE_IDS,
  COURSE_FACE_TO_POSITION,
  COURSE_POSITION_TO_FACE,
} from './courseFixtures';
import type { CourseFaceId } from './courseModel';

export type RingMatrix = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

export type RingOrder = readonly [CourseFaceId, CourseFaceId, CourseFaceId, CourseFaceId];
export type RingDirection = 'top' | 'right' | 'bottom' | 'left';

export interface RingScene {
  centerFaceId: CourseFaceId;
  centerPosition: FacePosition;
  oppositeFaceId: CourseFaceId;
  clockwiseNeighbors: RingOrder;
  displayedNeighbors: RingOrder;
  quarterTurn: QuarterTurn;
  cubeTransform: RingMatrix;
}

export interface MentalRingOption {
  id: string;
  order: RingOrder;
}

export interface MentalRingQuestion {
  id: string;
  centerFaceId: CourseFaceId;
  referenceOrder: RingOrder;
  correctOrder: RingOrder;
  options: readonly MentalRingOption[];
  answerId: string;
}

export interface DirectionalRingQuestion {
  id: string;
  centerFaceId: CourseFaceId;
  direction: RingDirection;
  directionIndex: 0 | 1 | 2 | 3;
  answerFaceId: CourseFaceId;
  choices: readonly CourseFaceId[];
}

const DIRECTIONS = ['top', 'right', 'bottom', 'left'] as const;

function tuple<T>(values: readonly T[]): readonly [T, T, T, T] {
  if (values.length !== 4) throw new Error(`Anneau invalide : ${values.length} voisins`);
  return [values[0], values[1], values[2], values[3]];
}

function multiplyMatrices(a: RingMatrix, b: RingMatrix): RingMatrix {
  const output: number[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      let value = 0;
      for (let index = 0; index < 3; index += 1) value += a[row * 3 + index] * b[index * 3 + col];
      output.push(Math.abs(value) < 1e-12 ? 0 : value);
    }
  }
  return output as unknown as RingMatrix;
}

export function multiplyRingMatrix(matrix: RingMatrix, vector: Vec3): Vec3 {
  return [
    matrix[0] * vector[0] + matrix[1] * vector[1] + matrix[2] * vector[2],
    matrix[3] * vector[0] + matrix[4] * vector[1] + matrix[5] * vector[2],
    matrix[6] * vector[0] + matrix[7] * vector[1] + matrix[8] * vector[2],
  ];
}

function faceToCameraMatrix(position: FacePosition): RingMatrix {
  const frame = FACE_FRAMES[position];
  return [
    ...frame.right,
    ...frame.up,
    ...frame.normal,
  ] as RingMatrix;
}

function clockwiseScreenRotation(turn: QuarterTurn): RingMatrix {
  const angle = (turn * Math.PI) / 2;
  const cos = Math.round(Math.cos(angle));
  const sin = Math.round(Math.sin(angle));
  return [cos, sin, 0, -sin, cos, 0, 0, 0, 1];
}

export function rotateRing(order: RingOrder, turn: QuarterTurn): RingOrder {
  return tuple(order.map((_, index) => order[(index - turn + 4) % 4]));
}

export function buildRingScene(centerFaceId: CourseFaceId, quarterTurn: QuarterTurn): RingScene {
  const centerPosition = COURSE_FACE_TO_POSITION[centerFaceId];
  const clockwiseNeighbors = tuple(
    getClockwiseNeighbors(centerPosition).map((position) => COURSE_POSITION_TO_FACE[position]),
  );
  return {
    centerFaceId,
    centerPosition,
    oppositeFaceId: COURSE_POSITION_TO_FACE[getOppositePosition(centerPosition)],
    clockwiseNeighbors,
    displayedNeighbors: rotateRing(clockwiseNeighbors, quarterTurn),
    quarterTurn,
    cubeTransform: multiplyMatrices(clockwiseScreenRotation(quarterTurn), faceToCameraMatrix(centerPosition)),
  };
}

export function isRingRotation(candidate: readonly CourseFaceId[], reference: readonly CourseFaceId[]): boolean {
  if (candidate.length !== 4 || reference.length !== 4) return false;
  return [0, 1, 2, 3].some((offset) =>
    candidate.every((face, index) => face === reference[(index + offset) % 4]),
  );
}

export function isMirrorOrder(candidate: readonly CourseFaceId[], reference: readonly CourseFaceId[]): boolean {
  const mirrored = [reference[0], reference[3], reference[2], reference[1]];
  return isRingRotation(candidate, mirrored);
}

export function reachableFrontRings(centerFaceId: CourseFaceId): readonly RingOrder[] {
  return ALL_ROTATIONS
    .map((rotation) => applyRotation(COURSE_CUBE, rotation))
    .filter((cube) => cube[POS.F].id === centerFaceId)
    .map((cube) => tuple([
      cube[POS.U].id as CourseFaceId,
      cube[POS.R].id as CourseFaceId,
      cube[POS.D].id as CourseFaceId,
      cube[POS.L].id as CourseFaceId,
    ]));
}

function rngFor(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: readonly T[], rng: () => number): T[] {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng() * (index + 1));
    [output[index], output[other]] = [output[other], output[index]];
  }
  return output;
}

function permutations(order: RingOrder): RingOrder[] {
  const output: RingOrder[] = [];
  const visit = (prefix: CourseFaceId[], remaining: CourseFaceId[]) => {
    if (remaining.length === 0) {
      output.push(tuple(prefix));
      return;
    }
    remaining.forEach((face, index) => visit(
      [...prefix, face],
      [...remaining.slice(0, index), ...remaining.slice(index + 1)],
    ));
  };
  visit([], [...order]);
  return output;
}

export function buildMentalRingQuestion(seed: number): MentalRingQuestion {
  const rng = rngFor(seed);
  const centerFaceId = COURSE_FACE_IDS[Math.floor(rng() * COURSE_FACE_IDS.length)];
  const referenceOrder = buildRingScene(centerFaceId, 0).clockwiseNeighbors;
  const correctOrder = rotateRing(referenceOrder, Math.floor(rng() * 4) as QuarterTurn);
  const invalid = shuffled(
    permutations(referenceOrder).filter((candidate) => !isRingRotation(candidate, referenceOrder)),
    rng,
  ).slice(0, 3);
  const orders = shuffled([correctOrder, ...invalid], rng);
  const options = orders.map((order, index) => ({ id: `ring-${seed}-${index}`, order }));
  const answer = options.find((option) => isRingRotation(option.order, referenceOrder));
  if (!answer) throw new Error('Question anneau sans réponse valide');
  return {
    id: `mental-ring-${seed}`,
    centerFaceId,
    referenceOrder,
    correctOrder: answer.order,
    options,
    answerId: answer.id,
  };
}

export function buildDirectionalRingQuestion(seed: number): DirectionalRingQuestion {
  const rng = rngFor(seed);
  const centerFaceId = COURSE_FACE_IDS[Math.floor(rng() * COURSE_FACE_IDS.length)];
  const directionIndex = Math.floor(rng() * 4) as 0 | 1 | 2 | 3;
  const scene = buildRingScene(centerFaceId, 0);
  return {
    id: `directional-ring-${seed}`,
    centerFaceId,
    direction: DIRECTIONS[directionIndex],
    directionIndex,
    answerFaceId: scene.clockwiseNeighbors[directionIndex],
    choices: shuffled(scene.clockwiseNeighbors, rng),
  };
}
