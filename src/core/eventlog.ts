import type { ItemEvent } from './types';
import { loadJson, saveJson } from './storage';

/**
 * Event log append-only, cache mémoire + flush debouncé vers localStorage.
 * TODO compaction : si > 50 000 events, agréger les plus anciens en résumés
 * journaliers par (exercice, tag). Non nécessaire avant le 3 septembre.
 */

let cache: ItemEvent[] | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function getEvents(): ItemEvent[] {
  if (cache === null) cache = loadJson<ItemEvent[]>('events', []);
  return cache;
}

function flush(): void {
  if (cache !== null) saveJson('events', cache);
  flushTimer = null;
}

export function appendEvent(event: ItemEvent): void {
  getEvents().push(event);
  if (flushTimer === null) flushTimer = setTimeout(flush, 1000);
}

export function flushNow(): void {
  if (flushTimer !== null) clearTimeout(flushTimer);
  flush();
}

/**
 * Abandonne le cache mémoire SANS l'écrire : la prochaine lecture repartira du
 * localStorage. Indispensable après un import ou une réinitialisation — sinon
 * le `beforeunload` du rechargement réécrit les anciens events par-dessus les
 * nouveaux, et la sauvegarde restaurée disparaît sans un message d'erreur.
 */
export function discardCache(): void {
  if (flushTimer !== null) clearTimeout(flushTimer);
  flushTimer = null;
  cache = null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushNow);
}
