import type { ExerciseId, ItemEvent } from '../core/types';
import { recentEvents } from './scores';

export interface TagStat {
  exercise: ExerciseId;
  tag: string;
  n: number;
  errors: number;
  errorRate: number;
  /** Taux d'erreur global de l'exercice, pour comparaison. */
  baseRate: number;
}

/** Effectif minimal avant de signaler un sous-type faible. */
const MIN_N = 10;

/**
 * Taxonomie d'erreurs : taux d'erreur par (exercice, tag) sur les events récents.
 * Un sous-type est « faible » si son taux d'erreur est à la fois ≥ 20 % et
 * nettement au-dessus du taux de base de l'exercice (× 1.3).
 */
export function tagStats(events: ItemEvent[] = recentEvents()): TagStat[] {
  const byExercise = new Map<ExerciseId, ItemEvent[]>();
  for (const e of events) {
    const list = byExercise.get(e.exercise) ?? [];
    list.push(e);
    byExercise.set(e.exercise, list);
  }

  const out: TagStat[] = [];
  for (const [exercise, evts] of byExercise) {
    const baseRate = evts.filter((e) => !e.correct).length / evts.length;
    const byTag = new Map<string, { n: number; errors: number }>();
    for (const e of evts) {
      for (const tag of e.tags) {
        const s = byTag.get(tag) ?? { n: 0, errors: 0 };
        s.n += 1;
        if (!e.correct) s.errors += 1;
        byTag.set(tag, s);
      }
    }
    for (const [tag, s] of byTag) {
      out.push({ exercise, tag, n: s.n, errors: s.errors, errorRate: s.errors / s.n, baseRate });
    }
  }
  return out;
}

export function weakSubtypes(events: ItemEvent[] = recentEvents()): TagStat[] {
  return tagStats(events)
    .filter((t) => t.n >= MIN_N && t.errorRate >= 0.2 && t.errorRate >= t.baseRate * 1.3)
    .sort((a, b) => b.errorRate - a.errorRate);
}

/** Le sous-type le plus faible d'un exercice donné, s'il y en a un. */
export function weakestTagOf(exercise: ExerciseId, events: ItemEvent[] = recentEvents()): TagStat | null {
  return weakSubtypes(events).find((t) => t.exercise === exercise) ?? null;
}
