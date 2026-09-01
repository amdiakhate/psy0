import { symbolName } from '../CubeSvg';
import { getOppositePosition } from '../domain/cubeGeometry';
import type { CubesQuestion } from '../generator';
import { netPositionName } from './CubeCoachVisuals';

export interface CubeProgressiveHint { level: 1 | 2 | 3 | 4; title: string; text: string; }

export function getCubeHint(question: CubesQuestion, level: 1 | 2 | 3 | 4): CubeProgressiveHint {
  const hole = question.holes[0];
  const visiblePosition = getOppositePosition(hole);
  const visible = question.target[visiblePosition];
  const piece = question.pieces.find((candidate) => candidate.id === question.solution[hole]);
  if (level === 1) return { level, title: 'Règle', text: 'Commence par la face visible qui se trouve à l’opposé d’un trou.' };
  if (level === 2) return { level, title: 'Où regarder', text: `Regarde ${netPositionName(hole)} : sa face opposée est ${netPositionName(visiblePosition)}.` };
  if (level === 3) return { level, title: 'Transfert', text: visible ? `Retrouve ${symbolName(visible.sym)} dans le patron de référence, puis cherche uniquement sa face opposée.` : 'Retrouve la face visible opposée au trou dans le patron de référence.' };
  return { level, title: 'Placement révélé', text: piece ? `Place ${symbolName(piece.sym)} dans ${netPositionName(hole)}. Il restera à vérifier son orientation.` : 'La solution de placement ne peut pas être déterminée.' };
}

