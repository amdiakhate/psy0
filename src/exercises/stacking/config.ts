export interface StackingLevel {
  /** Tailles de polycubes autorisées. */
  sizes: ReadonlyArray<4 | 5 | 6 | 7>;
  /** Proportion d'items dont les 3 vues sont TOUTES très éloignées (≥ 120°). */
  hardRatio: number;
}

/**
 * Difficulté = taille de l'empilement ET écart entre les orientations montrées.
 * `easy` : les deux empilements identiques sont à un quart de tour l'un de l'autre.
 * `hard` : les trois vues sont deux à deux à 120° ou plus — aucune n'est « presque » une autre.
 */
export const LEVELS: StackingLevel[] = [
  { sizes: [4], hardRatio: 0 },
  { sizes: [4, 5], hardRatio: 0 },
  { sizes: [5, 6], hardRatio: 0.4 },
  { sizes: [6], hardRatio: 0.8 },
  { sizes: [6, 7], hardRatio: 1 },
];

/** Seuil « quart de tour » : écart maximal entre les deux vues identiques d'un item facile. */
export const EASY_MAX_TURN_DEG = 90;
/** Seuil « très éloigné » : écart minimal entre TOUTES les vues d'un item difficile. */
export const HARD_MIN_TURN_DEG = 120;
