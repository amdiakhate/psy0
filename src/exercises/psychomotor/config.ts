/**
 * Psychomoteur psy0 AF cadet (règle officielle) :
 * « Trois tâches de MÊME IMPORTANCE s'additionnent et doivent être menées de front.
 *   ① Suivre les mouvements du CERCLE avec les flèches du clavier, en MAINTENANT
 *      appuyée la flèche qui indique le sens de déplacement du cercle. Quand c'est
 *      correct, un ">" vert apparaît sur le côté du cercle.
 *   ② Des FORMES apparaissent régulièrement dans le cercle et dans l'encart de
 *      gauche entouré de pointillés. Quand ces deux formes sont IDENTIQUES,
 *      appuyer sur la BARRE D'ESPACE.
 *   ③ Des CALCULS défilent. Quand le calcul ENTOURÉ est FAUX, appuyer sur "F". »
 * Durée : 5 minutes.
 */

/** Durée officielle d'une séquence : 5 minutes exactement. */
export const SESSION_SEC = 300;

/** Nombre de calculs affichés simultanément dans le bandeau défilant. */
export const CALC_LANE_SIZE = 4;

export interface PsyLevel {
  /** Durée moyenne d'un segment de déplacement du cercle (ms). */
  driftSegmentMs: [number, number];
  /** Intervalle entre deux changements de formes (ms). */
  shapeIntervalMs: number;
  /** Probabilité que les deux formes soient identiques (→ Espace). */
  shapeMatchRate: number;
  /** Intervalle entre deux déplacements du cadre orange (ms). */
  calcIntervalMs: number;
  /** Probabilité que le calcul entouré soit faux (→ F). */
  calcWrongRate: number;
  /**
   * Vitesse de défilement du bandeau, en fraction de largeur par seconde.
   * Elle varie d'une vague à l'autre : le bandeau officiel n'avance pas à
   * rythme constant, et c'est ce qui empêche de se caler mécaniquement.
   */
  scrollSpeed: [number, number];
}

export const LEVELS: PsyLevel[] = [
  { driftSegmentMs: [2200, 3400], shapeIntervalMs: 3200, shapeMatchRate: 0.3, calcIntervalMs: 3800, calcWrongRate: 0.45, scrollSpeed: [0.030, 0.050] },
  { driftSegmentMs: [1900, 3000], shapeIntervalMs: 2900, shapeMatchRate: 0.3, calcIntervalMs: 3400, calcWrongRate: 0.47, scrollSpeed: [0.035, 0.058] },
  { driftSegmentMs: [1600, 2600], shapeIntervalMs: 2600, shapeMatchRate: 0.32, calcIntervalMs: 3000, calcWrongRate: 0.48, scrollSpeed: [0.042, 0.068] },
  { driftSegmentMs: [1300, 2200], shapeIntervalMs: 2300, shapeMatchRate: 0.33, calcIntervalMs: 2700, calcWrongRate: 0.50, scrollSpeed: [0.050, 0.080] },
  { driftSegmentMs: [1100, 1800], shapeIntervalMs: 2000, shapeMatchRate: 0.35, calcIntervalMs: 2400, calcWrongRate: 0.52, scrollSpeed: [0.058, 0.094] },
];

/** Horizon de génération du planning (s) — couvre les 5 min de l'épreuve. */
export const SCHEDULE_HORIZON_S = 330;

/** Les quatre directions de déplacement du cercle. */
export const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const ARROW_OF: Record<Direction, string> = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

/** Formes possibles dans le cercle et dans l'encart. */
export const SHAPES = ['rond', 'carre', 'triangle', 'etoile', 'losange'] as const;
export type ShapeName = (typeof SHAPES)[number];
