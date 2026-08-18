/**
 * Coercition des champs numériques avant insertion Postgres.
 *
 * Extrait dans son propre module pour être testable : le bug qui a coûté une
 * séance entière venait de `performance.now()`, qui rend des décimales
 * (966.7999999998137) là où la colonne `rt_ms` est un INTEGER. Postgres
 * refusait alors le lot COMPLET — un seul event décimal faisait perdre toute
 * la synchronisation.
 */

/** `Number(null)` vaut 0 : sans ce filtre, une valeur absente passerait pour zéro. */
function absent(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function toInt(value: unknown, fallback = 0): number {
  if (absent(value)) return fallback;
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Un `ts` corrompu ne doit ni faire échouer le lot, ni devenir 1970 :
 * `new Date(0)` est une date VALIDE, et un event daté de 1970 fausserait
 * silencieusement la fatigue, les tendances et les créneaux horaires.
 */
export function toIso(value: unknown, now: () => number = Date.now): string {
  if (absent(value)) return new Date(now()).toISOString();
  const ms = Number(value);
  // 2001-09-09 : en deçà, l'horodatage n'est pas plausible pour cette app.
  if (!Number.isFinite(ms) || ms < 1_000_000_000_000) return new Date(now()).toISOString();
  return new Date(ms).toISOString();
}

/** Sans identifiant de session ni position, la ligne n'est pas identifiable. */
export function usable(e: { sessionId?: unknown; posInSession?: unknown }): boolean {
  return typeof e?.sessionId === 'string' && e.sessionId.length > 0 && Number.isFinite(Number(e.posInSession));
}
