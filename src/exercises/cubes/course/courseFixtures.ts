import { POS } from '../cube-model';
import {
  getClockwiseNeighbors,
  getNeighborAtEdge,
  getOppositePosition,
  getSharedEdge,
} from '../domain/cubeGeometry';
import type { Cube, FaceEdge, FacePosition } from '../domain/types';
import type { CourseFaceId } from './courseModel';

export const COURSE_FACE_IDS: readonly CourseFaceId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export const COURSE_FACE_TO_POSITION: Readonly<Record<CourseFaceId, FacePosition>> = {
  A: POS.L,
  B: POS.F,
  C: POS.R,
  D: POS.B,
  E: POS.U,
  F: POS.D,
};

export const COURSE_POSITION_TO_FACE: Readonly<Record<FacePosition, CourseFaceId>> = {
  [POS.R]: 'C',
  [POS.L]: 'A',
  [POS.U]: 'E',
  [POS.D]: 'F',
  [POS.F]: 'B',
  [POS.B]: 'D',
};

export const COURSE_FACE_COLORS: Readonly<Record<CourseFaceId, string>> = {
  A: '#f87171',
  B: '#38bdf8',
  C: '#4ade80',
  D: '#facc15',
  E: '#c084fc',
  F: '#fb923c',
};

export const COURSE_CUBE: Cube = ([POS.R, POS.L, POS.U, POS.D, POS.F, POS.B] as const).map(
  (position, sym) => ({
    id: COURSE_POSITION_TO_FACE[position],
    originalPosition: position,
    sym,
    rot: 0,
  }),
);

export const COURSE_NET_CELLS: ReadonlyArray<{
  faceId: CourseFaceId;
  position: FacePosition;
  col: number;
  row: number;
}> = [
  { faceId: 'E', position: POS.U, col: 1, row: 0 },
  { faceId: 'A', position: POS.L, col: 0, row: 1 },
  { faceId: 'B', position: POS.F, col: 1, row: 1 },
  { faceId: 'C', position: POS.R, col: 2, row: 1 },
  { faceId: 'D', position: POS.B, col: 3, row: 1 },
  { faceId: 'F', position: POS.D, col: 1, row: 2 },
];

export function getCourseOpposite(faceId: CourseFaceId): CourseFaceId {
  return COURSE_POSITION_TO_FACE[getOppositePosition(COURSE_FACE_TO_POSITION[faceId])];
}

export function getCourseNeighbor(faceId: CourseFaceId, edge: FaceEdge): CourseFaceId {
  return COURSE_POSITION_TO_FACE[getNeighborAtEdge(COURSE_FACE_TO_POSITION[faceId], edge)];
}

export function getCourseRing(faceId: CourseFaceId): readonly CourseFaceId[] {
  return getClockwiseNeighbors(COURSE_FACE_TO_POSITION[faceId]).map(
    (position) => COURSE_POSITION_TO_FACE[position],
  );
}

export function getCourseSharedEdge(a: CourseFaceId, b: CourseFaceId) {
  return getSharedEdge(COURSE_FACE_TO_POSITION[a], COURSE_FACE_TO_POSITION[b]);
}

