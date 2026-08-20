import { loadJson, saveJson } from '../core/storage';
import type { CultureEntry } from './types';

/**
 * Révision espacée, façon boîtes de Leitner.
 *
 * Une banque de plusieurs centaines de faits ne s'apprend pas en la relisant en
 * boucle : au bout de trois passages on ne révise plus que ce qu'on sait déjà.
 * Chaque question porte donc une boîte, et une boîte porte un délai. Une
 * réponse juste la fait monter d'un cran et repousse la question ; une erreur
 * la renvoie au début. Ce qui résiste revient souvent, ce qui est acquis
 * s'efface du planning.
 *
 * Volontairement séparé du journal d'events des 16 exercices : la culture
 * aéronautique n'est pas une épreuve du PSY0, elle ne doit ni entrer dans les
 * rotations, ni peser sur les priorités, ni produire de stanine.
 */

export const STORAGE_KEY = 'culture';

/** Délai avant de revoir une question, en jours, selon sa boîte. */
export const BOX_DELAYS_DAYS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = BOX_DELAYS_DAYS.length - 1;

const DAY_MS = 86_400_000;

export interface CardState {
  box: number;
  /** Horodatage de la dernière réponse. */
  lastSeen: number;
  seen: number;
  ok: number;
}

export type CultureProgress = Record<string, CardState>;

export const EMPTY_CARD: CardState = { box: 0, lastSeen: 0, seen: 0, ok: 0 };

export function loadProgress(): CultureProgress {
  return loadJson<CultureProgress>(STORAGE_KEY, {});
}

export function saveProgress(progress: CultureProgress): void {
  saveJson(STORAGE_KEY, progress);
}

export function cardOf(progress: CultureProgress, id: string): CardState {
  return progress[id] ?? EMPTY_CARD;
}

/** Verdict d'une réponse, du point de vue de la RÉVISION. */
export type Outcome = 'correct' | 'wrong' | 'skip';

/**
 * Une erreur et une abstention ne valent pas la même chose.
 *
 * Se tromper, c'est tenir une fausse croyance : elle doit être reprise depuis
 * le début, sinon elle se réinstalle. Ne pas savoir, c'est un trou — désagréable
 * mais honnête, et il suffit de revoir la question plus tôt que prévu. D'où la
 * rétrogradation d'un seul cran, et non le retour à zéro.
 */
export function review(card: CardState, outcome: Outcome, now: number): CardState {
  const box =
    outcome === 'correct'
      ? Math.min(card.box + 1, MAX_BOX)
      : outcome === 'wrong'
        ? 0
        : Math.max(card.box - 1, 0);
  return {
    box,
    lastSeen: now,
    seen: card.seen + 1,
    ok: card.ok + (outcome === 'correct' ? 1 : 0),
  };
}

export function record(
  progress: CultureProgress,
  id: string,
  outcome: Outcome,
  now: number,
): CultureProgress {
  return { ...progress, [id]: review(cardOf(progress, id), outcome, now) };
}

/** Une question jamais vue est due par définition : on ne peut pas l'avoir oubliée. */
export function isDue(card: CardState, now: number): boolean {
  if (card.seen === 0) return true;
  return now - card.lastSeen >= BOX_DELAYS_DAYS[card.box] * DAY_MS;
}

/**
 * L'ordre de révision : le plus fragile d'abord.
 *
 * 1. les questions dues, boîte la plus basse en tête — ce qui résiste ;
 * 2. à boîte égale, la plus anciennement vue ;
 * 3. les questions jamais vues passent avant les questions déjà acquises, mais
 *    APRÈS les erreurs récentes : réparer vaut mieux qu'élargir.
 *
 * Les questions non dues ferment la marche : si le lot demandé dépasse ce qui
 * est réellement à revoir, autant réviser en avance que rendre une séance
 * courte.
 */
export function reviewOrder(
  pool: CultureEntry[],
  progress: CultureProgress,
  now: number,
): CultureEntry[] {
  const keyed = pool.map((entry) => {
    const card = cardOf(progress, entry.id);
    return { entry, card, due: isDue(card, now) };
  });
  return keyed
    .sort((a, b) => {
      if (a.due !== b.due) return a.due ? -1 : 1;
      // Jamais vue = boîte 0 mais sans erreur : on la place après les ratés,
      // dont la boîte 0 est la trace d'une réponse fausse.
      const rankA = a.card.seen === 0 ? 0.5 : a.card.box;
      const rankB = b.card.seen === 0 ? 0.5 : b.card.box;
      if (rankA !== rankB) return rankA - rankB;
      return a.card.lastSeen - b.card.lastSeen;
    })
    .map((k) => k.entry);
}

export interface Coverage {
  total: number;
  seen: number;
  /** Boîte 3 ou plus : trois bonnes réponses d'affilée au moins. */
  solid: number;
  due: number;
}

export function coverage(pool: CultureEntry[], progress: CultureProgress, now: number): Coverage {
  let seen = 0;
  let solid = 0;
  let due = 0;
  for (const entry of pool) {
    const card = cardOf(progress, entry.id);
    if (card.seen > 0) seen += 1;
    if (card.box >= 3) solid += 1;
    if (isDue(card, now)) due += 1;
  }
  return { total: pool.length, seen, solid, due };
}
