import type { StarAnswer, StarQuestion } from './generator';
import { INTERSECTIONS, SLOT_COUNT } from './geometry';
import { conflictsOf, placementOf } from './validator';

export type StarDiagnosis =
  | { kind: 'incomplete'; placedCount: number }
  | { kind: 'duplicate'; placedCount: number }
  | {
      kind: 'conflict';
      placedCount: number;
      conflict: {
        wordA: string;
        wordB: string;
        letterA: string;
        letterB: string;
        positionA: number;
        positionB: number;
      };
    }
  | { kind: 'valid'; placedCount: number };

/** Ramène aussi les réponses absentes (chrono écoulé) à une grille vide. */
export function normaliseStarAnswer(answer: unknown): StarAnswer {
  if (!Array.isArray(answer)) return Array.from({ length: SLOT_COUNT }, () => null);
  return Array.from({ length: SLOT_COUNT }, (_, slot) => {
    const value = answer[slot];
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
  });
}

/** Diagnostic court utilisé par la correction visuelle. */
export function diagnoseStarAnswer(question: StarQuestion, rawAnswer: unknown): StarDiagnosis {
  const answer = normaliseStarAnswer(rawAnswer);
  const used = answer.filter((value): value is number => value !== null);
  const placedCount = used.length;
  if (placedCount < SLOT_COUNT) return { kind: 'incomplete', placedCount };
  if (new Set(used).size !== used.length) return { kind: 'duplicate', placedCount };

  const conflictIndex = conflictsOf(question, answer)[0];
  if (conflictIndex !== undefined) {
    const intersection = INTERSECTIONS[conflictIndex];
    const placement = placementOf(question, answer);
    const wordA = placement[intersection.wordA]!;
    const wordB = placement[intersection.wordB]!;
    return {
      kind: 'conflict',
      placedCount,
      conflict: {
        wordA,
        wordB,
        letterA: wordA[intersection.indexA],
        letterB: wordB[intersection.indexB],
        positionA: intersection.indexA + 1,
        positionB: intersection.indexB + 1,
      },
    };
  }

  return { kind: 'valid', placedCount };
}
