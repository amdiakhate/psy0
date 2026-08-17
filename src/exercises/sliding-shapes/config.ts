/** Contrainte de placement de la solution de référence. */
export type OverlapMode = 'forbid' | 'require';

export interface SlidingLevel {
  /** Côté de la grille centrale (N×N). */
  size: number;
  /** Nombre de formes à glisser (3 à 4, comme au test). */
  shapes: number;
  /** Bornes de la boîte englobante d'une forme (2×2 à 3×3). */
  boxMin: number;
  boxMax: number;
  /**
   * `forbid` : les formes ne se recouvrent pas → chaque case grise vient d'une seule forme.
   * `require` : au moins deux formes posent une case grise au MÊME endroit → la case
   * se re-bascule en marine. C'est le vrai piège du XOR.
   */
  overlap: OverlapMode;
}

export const LEVELS: SlidingLevel[] = [
  { size: 5, shapes: 3, boxMin: 2, boxMax: 2, overlap: 'forbid' },
  { size: 6, shapes: 3, boxMin: 2, boxMax: 3, overlap: 'forbid' },
  { size: 6, shapes: 3, boxMin: 2, boxMax: 3, overlap: 'require' },
  { size: 6, shapes: 4, boxMin: 2, boxMax: 3, overlap: 'require' },
  { size: 7, shapes: 4, boxMin: 2, boxMax: 3, overlap: 'require' },
];

/** Proportion minimale de cases grises dans la cible (une cible trop vide est triviale). */
export const MIN_GREY_RATIO = 0.25;

/** Couleurs officielles : marine (neutre) et gris (bascule). */
export const MARINE = '#1e3a5f';
export const GREY = '#9ca3af';
