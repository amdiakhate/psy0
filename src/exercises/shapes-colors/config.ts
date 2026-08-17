/** Attribut qui départage une branche de l'arbre : la couleur ou la forme. */
export type BranchAttr = 'color' | 'shape';

/**
 * Comment les deux branches (VIDE / REMPLI) se répartissent les attributs :
 * - 'canonical' : comme l'exemple officiel — les vides se départagent à la
 *   COULEUR, les remplis à la FORME, avec les valeurs les plus intuitives
 *   (bleu/orange, carré/triangle).
 * - 'different' : une branche par attribut, mais l'affectation est tirée au
 *   seed (elle peut donc être inversée) et les valeurs sont mélangées.
 * - 'free' : chaque branche tire son attribut librement — les deux peuvent
 *   utiliser le MÊME attribut avec d'autres valeurs, le cas le plus coûteux.
 */
export type RuleMode = 'canonical' | 'different' | 'free';

export interface ShapesColorsLevel {
  /** Intervalle entre deux stimuli (ms) — 3 s au test. */
  intervalMs: number;
  /** Durée d'affichage de la forme (ms) — 0,5 s au test : la réponse se donne sur écran vide. */
  visibleMs: number;
  /** Nombre de stimuli dans la série — 30 au test. */
  count: number;
  /** Valeurs couvertes par branche : 2 → une par touche, 3 → 2/1, 4 → 2/2. */
  valuesPerBranch: number;
  mode: RuleMode;
}

export const LEVELS: ShapesColorsLevel[] = [
  { intervalMs: 3000, visibleMs: 500, count: 30, valuesPerBranch: 2, mode: 'canonical' },
  { intervalMs: 3000, visibleMs: 500, count: 30, valuesPerBranch: 3, mode: 'canonical' },
  { intervalMs: 3000, visibleMs: 500, count: 30, valuesPerBranch: 3, mode: 'different' },
  { intervalMs: 2400, visibleMs: 500, count: 30, valuesPerBranch: 3, mode: 'different' },
  { intervalMs: 2000, visibleMs: 500, count: 30, valuesPerBranch: 4, mode: 'free' },
];

/** Probabilité de changer de branche (vide ↔ rempli) d'un stimulus au suivant. */
export const SWITCH_RATE = 0.5;
/** Idem, quand le drill cible le tag 'branch-switch'. */
export const FORCED_SWITCH_RATE = 0.85;
/** Part de stimuli orientés vers la touche ciblée par un drill 'key-N' / 'key-X'. */
export const FORCED_KEY_RATE = 0.85;
