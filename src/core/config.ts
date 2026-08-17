/** Jalons du plan d'entraînement. Mois indexés à 0. */
export const TEST_DATE = new Date(2026, 8, 3); // 3 septembre 2026
export const MILESTONE_60MIN = new Date(2026, 7, 18); // passage aux sessions 60 min
export const MILESTONE_SIMULATIONS = new Date(2026, 7, 30); // simulations complètes

export function daysUntil(target: Date, from: Date = new Date()): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Phase d'entraînement courante, utilisée par le composer du coach. */
export type TrainingPhase = 'guided30' | 'guided60' | 'simulation-first';

export function currentPhase(now: Date = new Date()): TrainingPhase {
  if (now >= MILESTONE_SIMULATIONS) return 'simulation-first';
  if (now >= MILESTONE_60MIN) return 'guided60';
  return 'guided30';
}

/**
 * Période cadrée (à partir du 18/08) : le programme est écrit, les modes qui
 * permettent de le contourner disparaissent de la navigation. L'entraînement
 * libre reste accessible depuis Réglages — cadrer n'est pas interdire.
 */
export function isCadredPhase(now: Date = new Date()): boolean {
  return now >= MILESTONE_60MIN;
}

/**
 * La séance guidée de 2 h n'a de sens qu'en semaine de simulations (30/08 →
 * 01/09). Avant, elle contredit le protocole ; le 02/09 est un repos total.
 */
export const LONG_SESSION_LAST_DAY = '2026-09-01';

export function isLongSessionAllowed(dayKey: string): boolean {
  return dayKey >= '2026-08-30' && dayKey <= LONG_SESSION_LAST_DAY;
}
