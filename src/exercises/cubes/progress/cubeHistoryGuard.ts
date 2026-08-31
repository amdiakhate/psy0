import type { CubesQuestion } from '../generator';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCubesQuestionSnapshot(value: unknown): value is CubesQuestion {
  if (!isRecord(value) || !Array.isArray(value.reference) || value.reference.length !== 6) return false;
  if (!Array.isArray(value.target) || value.target.length !== 6 || !Array.isArray(value.holes) || !Array.isArray(value.pieces)) return false;
  if (!isRecord(value.solution) || !isRecord(value.expectedRot) || (value.family !== 'letters' && value.family !== 'shapes')) return false;
  const validFace = (face: unknown) => isRecord(face) && typeof face.id === 'string' && typeof face.originalPosition === 'number' && typeof face.sym === 'number' && typeof face.rot === 'number';
  const validPiece = (piece: unknown) => isRecord(piece) && typeof piece.id === 'number' && typeof piece.faceId === 'string' && typeof piece.originalPosition === 'number' && typeof piece.sym === 'number';
  return value.reference.every(validFace) && value.target.every((face) => face === null || validFace(face)) && value.pieces.every(validPiece) && value.holes.every((hole) => Number.isInteger(hole) && hole >= 0 && hole < 6);
}
