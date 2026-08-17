import type { ExerciseId, ItemEvent } from '../core/types';
import { getEvents } from '../core/eventlog';
import { getSessions } from '../core/session';
import { EXERCISES } from '../exercises';

export interface PlateauReport {
  exercise: ExerciseId;
  sessions: number;
  /** Pente de la régression (points de précision par session). */
  slope: number;
  suggestion: string;
}

/**
 * Détection de plateau : précision par session sur les 5+ dernières sessions
 * d'un exercice ; si la pente de la régression linéaire est ~nulle (voire
 * négative), l'exercice stagne → proposer un changement d'approche.
 */
export function detectPlateaus(events: ItemEvent[] = getEvents()): PlateauReport[] {
  const sessions = getSessions();
  const out: PlateauReport[] = [];

  for (const module_ of EXERCISES) {
    const perSession: number[] = [];
    for (const s of sessions) {
      const evts = events.filter((e) => e.sessionId === s.sessionId && e.exercise === module_.id);
      if (evts.length >= 8) perSession.push(evts.filter((e) => e.correct).length / evts.length);
    }
    const last = perSession.slice(-7);
    if (last.length < 5) continue;

    // Régression linéaire simple sur (index, précision).
    const n = last.length;
    const meanX = (n - 1) / 2;
    const meanY = last.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    last.forEach((y, x) => {
      num += (x - meanX) * (y - meanY);
      den += (x - meanX) ** 2;
    });
    const slope = num / den;

    if (slope < 0.01 && meanY < 0.9) {
      const suggestion =
        meanY < 0.6
          ? `Redescends d'un niveau en ${module_.name} et reconstruis la base : la difficulté actuelle entretient l'échec.`
          : `${module_.name} stagne depuis ${n} sessions : relis la page d'astuces, puis drille ton sous-type le plus faible plutôt que de rejouer en conditions normales.`;
      out.push({ exercise: module_.id, sessions: n, slope, suggestion });
    }
  }
  return out;
}
