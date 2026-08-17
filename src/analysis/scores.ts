import type { ExerciseId, ItemEvent } from '../core/types';
import { getEvents } from '../core/eventlog';
import { EXERCISES } from '../exercises';

export interface ExerciseStats {
  exercise: ExerciseId;
  items: number;
  accuracy: number;
  medianRtMs: number;
  /** Score pondéré 0-100 = précision × facteur vitesse (clampé). */
  score: number;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function recentEvents(sinceDays = 14): ItemEvent[] {
  const cutoff = Date.now() - sinceDays * 86_400_000;
  return getEvents().filter((e) => e.ts >= cutoff);
}

/**
 * Stats par exercice sur les events récents. Un exercice jamais joué a un
 * score de 0 : il est « le plus faible » tant qu'on n'a pas de données —
 * c'est voulu, le coach doit le faire jouer.
 */
export function computeStats(events: ItemEvent[] = recentEvents()): ExerciseStats[] {
  return EXERCISES.map((module_) => {
    const evts = events.filter((e) => e.exercise === module_.id);
    if (evts.length === 0) {
      return { exercise: module_.id, items: 0, accuracy: 0, medianRtMs: 0, score: 0 };
    }
    const accuracy = evts.filter((e) => e.correct).length / evts.length;
    const medianRtMs = median(evts.map((e) => e.rtMs));
    // Facteur vitesse : uniquement pour les exercices per-item (les fenêtres
    // des exercices continus ont un rythme imposé, la précision suffit).
    let factor = 1;
    if (module_.timed === 'per-item' && medianRtMs > 0) {
      const expected = module_.defaultItemSeconds * 1000;
      factor = Math.max(0.6, Math.min(1.2, expected / medianRtMs));
    }
    const score = Math.min(100, Math.round(100 * accuracy * factor));
    return { exercise: module_.id, items: evts.length, accuracy, medianRtMs, score };
  });
}

/** Classement du plus faible au plus fort (les non-joués d'abord). */
export function rankWeakest(stats: ExerciseStats[] = computeStats()): ExerciseStats[] {
  return [...stats].sort((a, b) => a.score - b.score);
}
