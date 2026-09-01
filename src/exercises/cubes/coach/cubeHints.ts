import { symbolName } from '../CubeSvg';
import { getOppositePosition } from '../domain/cubeGeometry';
import type { CubesQuestion } from '../generator';
import type { FaceId, FacePosition } from '../domain/types';
import { netPositionName } from './CubeCoachVisuals';

export interface CubeProgressiveHint {
  level: 1 | 2 | 3 | 4;
  title: string;
  text: string;
  targetHole?: FacePosition;
  highlightReferenceFaceId?: FaceId;
}

export function getCubeHint(question: CubesQuestion, level: 1 | 2 | 3 | 4): CubeProgressiveHint {
  const hole = question.holes[0];
  const visiblePosition = getOppositePosition(hole);
  const visible = question.target[visiblePosition];
  const piece = question.pieces.find((candidate) => candidate.id === question.solution[hole]);
  if (level === 1) return { level, title: 'Famille de règle', text: 'Commence par les faces opposées.' };
  if (level === 2) return { level, title: 'Trou à observer', text: `Regarde ${netPositionName(hole)}.`, targetHole: hole };
  if (level === 3) return { level, title: 'Face visible', text: visible ? `Ce trou est opposé à ${symbolName(visible.sym)} dans le patron cible.` : 'Observe la face visible située en face de ce trou.', targetHole: hole };
  return piece
    ? { level, title: 'Face à repérer', text: 'La face utile est maintenant surlignée dans le patron de référence. À toi de la déplacer et de l’orienter.', targetHole: hole, highlightReferenceFaceId: piece.faceId }
    : { level, title: 'Face à repérer', text: 'Aucune face de référence ne peut être surlignée pour cette case.', targetHole: hole };
}
