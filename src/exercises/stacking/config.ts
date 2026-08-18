export interface StackingLevel {
  /** Tailles d'empilement autorisées, en nombre de cubes. */
  sizes: readonly number[];
  /** Proportion d'items dont les 3 vues sont TOUTES très éloignées (≥ 120°). */
  hardRatio: number;
}

/**
 * Difficulté = taille de l'empilement ET écart entre les orientations montrées.
 *
 * Les tailles suivent l'épreuve réelle : Pilotest affiche une dizaine de cubes,
 * pas quatre. Un tétracube se compare de mémoire visuelle ; à dix cubes il faut
 * réellement tourner la figure dans sa tête, ce qui est l'objet du test. Les
 * premiers niveaux restent plus petits pour apprendre la méthode, pas parce que
 * le test le serait.
 *
 * `easy` : les deux empilements identiques sont à un quart de tour l'un de l'autre.
 * `hard` : les trois vues sont deux à deux à 120° ou plus — aucune n'est « presque » une autre.
 */
export const LEVELS: StackingLevel[] = [
  { sizes: [7], hardRatio: 0 },
  { sizes: [8], hardRatio: 0.25 },
  { sizes: [9], hardRatio: 0.5 },
  { sizes: [10], hardRatio: 0.8 },
  { sizes: [10, 11], hardRatio: 1 },
];

/** Seuil « quart de tour » : écart maximal entre les deux vues identiques d'un item facile. */
export const EASY_MAX_TURN_DEG = 90;
/** Seuil « très éloigné » : écart minimal entre TOUTES les vues d'un item difficile. */
export const HARD_MIN_TURN_DEG = 120;

/**
 * Inclinaison de présentation, tirée indépendamment pour chaque empilement.
 *
 * Chez Pilotest aucune figure n'est posée droite : elles sont basculées d'un
 * angle quelconque. Sans cela, les trois empilements partagent la même grille
 * isométrique et se comparent contour à contour, sans rotation mentale — c'est
 * un autre exercice, beaucoup plus facile.
 *
 * Le lacet est libre ; tangage et roulis sont bornés pour que le dessus des
 * cubes reste visible et que la figure ne se réduise pas à une tranche.
 */
export const TILT_PITCH_MAX_DEG = 20;
export const TILT_ROLL_MAX_DEG = 26;

/**
 * Proportion minimale de pixels devant différer entre deux empilements affichés.
 * Deux dessins trop proches rendent l'item indécidable — et c'est le cas qu'il
 * faut craindre, puisque des cubes en cachent d'autres à la projection.
 */
export const MIN_IMAGE_DIFF = 0.08;
export const RASTER_RESOLUTION = 44;
