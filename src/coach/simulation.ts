import type { ExerciseId, ItemEvent, SessionPlan, SessionRecord } from '../core/types';
import { FAMILIES } from '../core/types';
import type { Family } from '../core/types';
import { EXERCISES, getExercise } from '../exercises';
import { getEvents } from '../core/eventlog';
import { mulberry32, newSeed, shuffle } from '../core/rng';

/** Durée de chaque exercice en simulation (s) — le Psychomoteur pèse plus lourd. */
function simDuration(exercise: ExerciseId): number {
  if (exercise === 'psychomotor') return 240;
  const module_ = getExercise(exercise);
  return module_.timed === 'continuous' ? 150 : 150;
}

/**
 * Simulation PSY0 complète : les 16 exercices enchaînés sans pause,
 * ordre randomisé, niveau = niveau courant de l'utilisateur.
 */
export function composeSimulation(): SessionPlan {
  const rng = mulberry32(newSeed());
  const order = shuffle(rng, EXERCISES);
  return {
    mode: 'simulation',
    blocks: order.map((e) => ({
      exercise: e.id,
      level: 'adaptive' as const,
      durationSec: simDuration(e.id),
    })),
    briefing: [
      `Simulation complète : les ${EXERCISES.length} exercices enchaînés, sans pause, ordre aléatoire.`,
      'Conditions réelles : pas de retour arrière, pas de répit entre les blocs.',
      'Objectif : tenir la précision sur la durée — le rapport final donne un verdict par famille.',
    ],
  };
}

export type FamilyVerdict = 'acquis' | 'à consolider' | 'critique';

export interface FamilyReport {
  family: Family;
  items: number;
  accuracy: number;
  verdict: FamilyVerdict;
}

/** Rapport final par famille : acquis ≥ 75 %, à consolider 55-75 %, critique < 55 %. */
export function familyReport(record: SessionRecord): FamilyReport[] {
  const events: ItemEvent[] = getEvents().filter((e) => e.sessionId === record.sessionId);
  const out: FamilyReport[] = [];
  for (const family of FAMILIES) {
    const members = new Set(EXERCISES.filter((e) => e.families.includes(family)).map((e) => e.id));
    const evts = events.filter((e) => members.has(e.exercise));
    if (evts.length === 0) continue;
    const accuracy = evts.filter((e) => e.correct).length / evts.length;
    out.push({
      family,
      items: evts.length,
      accuracy,
      verdict: accuracy >= 0.75 ? 'acquis' : accuracy >= 0.55 ? 'à consolider' : 'critique',
    });
  }
  return out.sort((a, b) => a.accuracy - b.accuracy);
}
