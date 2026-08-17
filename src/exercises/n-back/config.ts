/** N est FIXE au test : on compare toujours au chiffre de 2 coups avant. */
export const N = 2;
/** Une série contient 42 chiffres. */
export const SEQ_LENGTH = 42;
/** Le chiffre est affiché 1 s, puis il s'efface et les deux boutons paraissent. */
export const DIGIT_MS = 1000;

export interface NBackLevel {
  /** Fenêtre de décision « Oui / Non » (ms) — 3 s au test, raccourcie en haut de gamme. */
  responseMs: number;
  /** Proportion de matches parmi les positions évaluables. */
  matchRate: number;
  /** Proportion de lures (répétition à N±1) — forcée, sinon quasi inexistante en tirage aléatoire. */
  lureRate: number;
}

/**
 * La difficulté ne vient plus de N (fixé à 2) mais de la densité des pièges :
 * plus de lures N±1, moins de matches francs, et une fenêtre de décision qui
 * se resserre aux deux derniers niveaux.
 */
export const LEVELS: NBackLevel[] = [
  { responseMs: 3000, matchRate: 0.32, lureRate: 0.12 },
  { responseMs: 3000, matchRate: 0.3, lureRate: 0.22 },
  { responseMs: 3000, matchRate: 0.28, lureRate: 0.34 },
  { responseMs: 2500, matchRate: 0.27, lureRate: 0.42 },
  { responseMs: 2000, matchRate: 0.25, lureRate: 0.5 },
];
