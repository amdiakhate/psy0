import type { Item } from '../../core/types';
import type { StarAnswer, StarQuestion } from './generator';
import { SLOT_COUNT, conflictingIntersections, isPlacementCorrect } from './geometry';

/** Traduit une réponse (indices dans `words`) en mots posés par emplacement. */
export function placementOf(question: StarQuestion, answer: StarAnswer): (string | null)[] {
  return Array.from({ length: SLOT_COUNT }, (_, slot) => {
    const idx = answer[slot];
    if (idx === null || idx === undefined) return null;
    return question.words[idx] ?? null;
  });
}

/**
 * La règle officielle est explicite : toute configuration sans erreur vaut le
 * point, pas seulement la solution de référence. On ne vérifie donc QUE les
 * intersections (plus l'usage de 6 mots distincts).
 */
export function validate(item: Item<StarQuestion>, answer: StarAnswer): boolean {
  if (!Array.isArray(answer) || answer.length !== SLOT_COUNT) return false;
  const used = answer.filter((i): i is number => i !== null && i !== undefined);
  if (new Set(used).size !== used.length) return false;
  return isPlacementCorrect(placementOf(item.question, answer));
}

/** Intersections en conflit pour une réponse partielle — utilisé par l'UI. */
export function conflictsOf(question: StarQuestion, answer: StarAnswer): number[] {
  return conflictingIntersections(placementOf(question, answer));
}
