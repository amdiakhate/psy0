export interface WordSkipLevel {
  /** Nombre de mots de la grille (tiré dans [minWords, maxWords]). */
  minWords: number;
  maxWords: number;
  /** Probabilité que les deux thématiques soient sémantiquement proches. */
  closeChance: number;
  /** Probabilité d'un piège de tri : deux mots d'une même thématique à même initiale. */
  trapChance: number;
}

export const LEVELS: WordSkipLevel[] = [
  { minWords: 8, maxWords: 8, closeChance: 0, trapChance: 0 },
  { minWords: 8, maxWords: 10, closeChance: 0, trapChance: 0.35 },
  { minWords: 10, maxWords: 12, closeChance: 0.35, trapChance: 0.6 },
  { minWords: 12, maxWords: 12, closeChance: 0.7, trapChance: 0.85 },
  { minWords: 12, maxWords: 14, closeChance: 1, trapChance: 1 },
];

export const MIN_WORDS = 8;
export const MAX_WORDS = 14;

/** Grille de placement : 16 emplacements pour 14 mots max, donc jamais de chevauchement. */
export const GRID_COLS = 4;
export const GRID_ROWS = 4;
/** Décalage aléatoire (en % de la zone) appliqué au centre de l'emplacement. */
export const JITTER_X = 3;
export const JITTER_Y = 4;

/** Étiquettes clavier, dans l'ordre de lecture de la grille. */
export const LABELS = '123456789ABCDE';
