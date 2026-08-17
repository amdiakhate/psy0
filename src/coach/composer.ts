import type { SessionPlan } from '../core/types';
import { rankWeakest } from '../analysis/scores';
import { weakestTagOf } from '../analysis/errorTaxonomy';
import { getExercise, hasExercise } from '../exercises';
import { composeGuidedFrom } from './composer-logic';
import type { GuidedDuration, RankedExercise } from './composer-logic';

/**
 * Câblage du composer : lit les stats et la taxonomie d'erreurs, puis délègue
 * la composition à `composer-logic.ts` (pur et testé).
 */

export type { GuidedDuration } from './composer-logic';

/** Classement du plus faible au plus fort, Psychomoteur exclu (il a son quota dédié). */
export function rankedForCoach(): RankedExercise[] {
  return rankWeakest()
    .filter((s) => s.exercise !== 'psychomotor')
    .map((s) => ({
      exercise: s.exercise,
      name: getExercise(s.exercise).name,
      items: s.items,
      accuracy: s.accuracy,
      weakTag: weakestTagOf(s.exercise),
    }));
}

export function composeGuided(durationMin: GuidedDuration): SessionPlan {
  return composeGuidedFrom({
    durationMin,
    ranked: rankedForCoach(),
    hasPsycho: hasExercise('psychomotor'),
  });
}
