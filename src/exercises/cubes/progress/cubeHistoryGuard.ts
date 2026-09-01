import type { CubesQuestion } from '../generator';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCubesQuestionSnapshot(value: unknown): value is CubesQuestion {
  if (!isRecord(value) || !Array.isArray(value.reference) || value.reference.length !== 6) return false;
  if (!Array.isArray(value.target) || value.target.length !== 6 || !Array.isArray(value.holes) || !Array.isArray(value.pieces)) return false;
  if (!isRecord(value.solution) || !isRecord(value.expectedRot) || (value.family !== 'letters' && value.family !== 'shapes')) return false;
  const validPosition = (position: unknown) => Number.isInteger(position) && Number(position) >= 0 && Number(position) < 6;
  const validFace = (face: unknown) => isRecord(face) && typeof face.id === 'string' && validPosition(face.originalPosition) && Number.isInteger(face.sym) && Number(face.sym) >= 0 && Number.isInteger(face.rot) && Number(face.rot) >= 0 && Number(face.rot) < 4;
  const validPiece = (piece: unknown) => isRecord(piece) && Number.isInteger(piece.id) && typeof piece.faceId === 'string' && validPosition(piece.originalPosition) && Number.isInteger(piece.sym) && Number(piece.sym) >= 0;
  if (!value.reference.every(validFace) || !value.target.every((face) => face === null || validFace(face)) || !value.pieces.every(validPiece)) return false;
  if (!value.holes.every(validPosition) || value.holes.length === 0 || new Set(value.holes).size !== value.holes.length) return false;

  const references = value.reference as Array<{ id: string; originalPosition: number; sym: number }>;
  if (new Set(references.map((face) => face.id)).size !== 6 || new Set(references.map((face) => face.originalPosition)).size !== 6) return false;
  const holes = value.holes as number[];
  if (value.target.some((face, position) => holes.includes(position) ? face !== null : face === null)) return false;
  if (value.pieces.length !== holes.length) return false;

  const pieces = value.pieces as Array<{ id: number; faceId: string; originalPosition: number; sym: number }>;
  if (new Set(pieces.map((piece) => piece.id)).size !== pieces.length) return false;
  if (pieces.some((piece) => !references.some((face) => face.id === piece.faceId && face.originalPosition === piece.originalPosition && face.sym === piece.sym))) return false;

  const visibleFaces = value.target.filter((face): face is NonNullable<typeof face> => face !== null);
  if (visibleFaces.some((face) => !references.some((reference) => reference.id === face.id && reference.originalPosition === face.originalPosition && reference.sym === face.sym))) return false;
  const representedIds = [...visibleFaces.map((face) => face.id), ...pieces.map((piece) => piece.faceId)];
  if (representedIds.length !== 6 || new Set(representedIds).size !== 6) return false;

  const solution = value.solution as Record<string, unknown>;
  const expectedRot = value.expectedRot as Record<string, unknown>;
  const solutionPieceIds = holes.map((hole) => solution[String(hole)]);
  if (new Set(solutionPieceIds).size !== holes.length) return false;
  return holes.every((hole) => {
    const pieceId = solution[String(hole)];
    const rotation = expectedRot[String(hole)];
    return Number.isInteger(pieceId) && pieces.some((piece) => piece.id === pieceId) && Number.isInteger(rotation) && Number(rotation) >= 0 && Number(rotation) < 4;
  });
}
