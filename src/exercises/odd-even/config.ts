export interface OddEvenLevel {
  /** Nombre de nombres de la grille (tiré dans [minNumbers, maxNumbers]). */
  minNumbers: number;
  maxNumbers: number;
  /** Bornes de tirage avant retouches. */
  lo: number;
  hi: number;
  /** Écart minimal entre deux nombres consécutifs de même parité, hors piège. */
  minGap: number;
  /** Probabilité d'un piège de valeurs proches (deux nombres de même parité à 2 d'écart). */
  closeChance: number;
  /** Probabilité d'un mélange de nombres à 2 et à 4 chiffres. */
  mixedChance: number;
}

export const LEVELS: OddEvenLevel[] = [
  { minNumbers: 8, maxNumbers: 8, lo: 10, hi: 98, minGap: 8, closeChance: 0, mixedChance: 0 },
  { minNumbers: 8, maxNumbers: 10, lo: 10, hi: 998, minGap: 20, closeChance: 0.3, mixedChance: 0 },
  { minNumbers: 10, maxNumbers: 12, lo: 120, hi: 980, minGap: 20, closeChance: 0.6, mixedChance: 0 },
  { minNumbers: 12, maxNumbers: 12, lo: 120, hi: 980, minGap: 16, closeChance: 0.7, mixedChance: 0.7 },
  { minNumbers: 12, maxNumbers: 14, lo: 120, hi: 980, minGap: 12, closeChance: 1, mixedChance: 1 },
];

export const MIN_NUMBERS = 8;
export const MAX_NUMBERS = 14;

/** Bande à 3 chiffres utilisée dès qu'on force un mélange 2/4 chiffres. */
export const MIXED_LO = 120;
export const MIXED_HI = 980;

/** Deux nombres de même parité sont « proches » en dessous de cet écart. */
export const CLOSE_GAP = 6;

/** Grille de placement : 16 emplacements pour 14 nombres max. */
export const GRID_COLS = 4;
export const GRID_ROWS = 4;
export const JITTER_X = 3;
export const JITTER_Y = 4;

/** Étiquettes clavier, dans l'ordre de lecture de la grille. */
export const LABELS = '123456789ABCDE';
