export interface Objects3dLevel {
  /** Nombre d'objets posés dans le désert. Moins d'objets = moins de repères = plus dur. */
  nObjects: 3 | 4 | 5;
  /** Proportion de dispositions quasi régulières (plus symétrique = plus dur). */
  symmetricRatio: number;
}

export const LEVELS: Objects3dLevel[] = [
  { nObjects: 5, symmetricRatio: 0 },
  { nObjects: 5, symmetricRatio: 0.4 },
  { nObjects: 4, symmetricRatio: 0.5 },
  { nObjects: 4, symmetricRatio: 0.85 },
  { nObjects: 3, symmetricRatio: 0.85 },
];

/** Rayon du cercle sur lequel sont placés les 8 points de vue. */
export const VIEW_RADIUS = 10;

/** Nombre de points de vue, régulièrement répartis (0°, 45°, …, 315°). */
export const VIEWPOINT_COUNT = 8;

/** Les objets restent dans ce rayon autour du centre. */
export const SCENE_RADIUS = 5;

/** Hauteur de l'œil et hauteur visée au centre — cadrage de la caméra 3D. */
export const CAMERA_HEIGHT = 3.5;
export const LOOK_AT_HEIGHT = 0.9;

/**
 * Écart minimal, en tangente d'angle horizontal, entre deux objets à l'écran :
 * garantit que l'ordre gauche→droite est franc depuis CHACUN des 8 points de vue
 * (0,05 ≈ 2,9° ≈ 15 px sur une vue de 300 px de large).
 */
export const MIN_SCREEN_GAP = 0.05;

/**
 * Écart de profondeur (unités monde) à partir duquel un « qui est devant qui »
 * compte comme lisible. Une inversion de profondeur plus fine que ça n'est pas
 * une preuve exploitable par le candidat, donc elle ne compte pas.
 */
export const MIN_DEPTH_GAP = 0.8;

/** Distance minimale entre deux objets au sol : pas d'amas illisible. */
export const MIN_OBJECT_GAP = 1.9;

/** Tolérance (tangente d'angle) du test d'occlusion totale. */
export const OCCLUSION_MARGIN = 0.03;

/**
 * Dispositions de secours, utilisées seulement si le tirage rejeté n'a rien produit
 * (≈ 1 cas sur 80 au niveau le plus contraint). Elles imposent AUSSI l'attribution
 * des objets (les n premiers de OBJECT_KINDS, dans l'ordre) : la validité dépend de
 * l'encombrement de chaque objet, elle ne serait pas garantie pour une attribution
 * quelconque. Les tests vérifient exactement cette configuration.
 */
export const FALLBACK_LAYOUTS: Record<number, ReadonlyArray<{ x: number; z: number }>> = {
  3: [
    { x: 2.23, z: -2.47 },
    { x: -2.58, z: 0.59 },
    { x: 0.36, z: 3.06 },
  ],
  4: [
    { x: -2.37, z: 2.41 },
    { x: -2.64, z: -2.72 },
    { x: 2.96, z: 0.83 },
    { x: 2.28, z: -3.89 },
  ],
  5: [
    { x: 4.1, z: -1.25 },
    { x: 1.17, z: 1.57 },
    { x: -3.83, z: -0.07 },
    { x: 1.21, z: -3.99 },
    { x: 0.16, z: 4.41 },
  ],
};
