import { ALL_ROTATIONS, applyRotation } from '../cube-model';
import type { Rotation } from '../cube-model';
import { normalizeRot } from '../cube-model';
import type {
  Cube,
  FaceEdge,
  FaceFrame,
  FacePosition,
  QuarterTurn,
  SharedEdge,
  Vec3,
} from './types';

const POSITIONS: readonly FacePosition[] = [0, 1, 2, 3, 4, 5];
const EDGES: readonly FaceEdge[] = ['top', 'right', 'bottom', 'left'];

/**
 * Repères locaux vus de l’extérieur. Cette définition est l’unique donnée
 * géométrique du patron ; toutes les relations publiques en sont dérivées.
 */
export const FACE_FRAMES: Readonly<Record<FacePosition, FaceFrame>> = {
  0: { normal: [1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] },
  1: { normal: [-1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] },
  2: { normal: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] },
  3: { normal: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] },
  4: { normal: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
  5: { normal: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] },
};

const negate = ([x, y, z]: Vec3): Vec3 => [-x, -y, -z];
const sameVector = (a: Vec3, b: Vec3): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

function positionWithNormal(normal: Vec3): FacePosition {
  const found = POSITIONS.find((position) => sameVector(FACE_FRAMES[position].normal, normal));
  if (found === undefined) throw new Error(`Normale de cube invalide : ${normal.join(',')}`);
  return found;
}

function edgeDirection(position: FacePosition, edge: FaceEdge): Vec3 {
  const frame = FACE_FRAMES[position];
  if (edge === 'top') return frame.up;
  if (edge === 'right') return frame.right;
  if (edge === 'bottom') return negate(frame.up);
  return negate(frame.right);
}

export function getOppositePosition(position: FacePosition): FacePosition {
  return positionWithNormal(negate(FACE_FRAMES[position].normal));
}

export function getNeighborAtEdge(position: FacePosition, edge: FaceEdge): FacePosition {
  return positionWithNormal(edgeDirection(position, edge));
}

export function getClockwiseNeighbors(position: FacePosition): readonly FacePosition[] {
  return EDGES.map((edge) => getNeighborAtEdge(position, edge));
}

export function getSharedEdge(a: FacePosition, b: FacePosition): SharedEdge | null {
  const aEdge = EDGES.find((edge) => getNeighborAtEdge(a, edge) === b);
  const bEdge = EDGES.find((edge) => getNeighborAtEdge(b, edge) === a);
  return aEdge && bEdge ? { aEdge, bEdge } : null;
}

export function rotateEdge(edge: FaceEdge, turn: QuarterTurn): FaceEdge {
  const index = EDGES.indexOf(edge);
  return EDGES[(index - turn + 4) % 4];
}

export function applyGeometryRotation(cube: Cube, rotation: Rotation): Cube {
  return applyRotation(cube, rotation);
}

export function serializeIdentityCube(cube: Cube): string {
  return cube.map((face) => `${face.id}.${normalizeRot(face.sym, face.rot)}`).join('|');
}

export function identityOrbitOf(cube: Cube): Set<string> {
  return new Set(ALL_ROTATIONS.map((rotation) => serializeIdentityCube(applyGeometryRotation(cube, rotation))));
}

export function sameCubeGeometry(a: Cube, b: Cube): boolean {
  return identityOrbitOf(a).has(serializeIdentityCube(b));
}
