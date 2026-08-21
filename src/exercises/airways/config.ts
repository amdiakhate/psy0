/**
 * Airways — le test tel qu'il est, pas tel qu'on l'imagine.
 *
 * L'erreur de la version précédente était de modèle, pas de réglage : elle
 * traitait la zone grise comme un obstacle à éviter et le joueur comme un
 * pilote qui écarte les avions un par un. Airways n'est pas un jeu d'esquive,
 * c'est un problème d'optimisation de flux. On ne clique pas sur un avion ; on
 * FERME une voie, définitivement, et on paie pour ça. Le score ne récompense
 * pas la survie, il récompense la survie au moindre coût.
 *
 * Source : pilotest.com/fr/tests/airways (test remanié le 17/12/2019,
 * calibration du 10/11/2022). Voir REGLES-OFFICIELLES.md.
 */

export interface AirwaysLevel {
  /** Durée d'un pas de simulation (ms). */
  tickMs: number;
  /** Durée d'une série en pas. */
  durationTicks: number;
  /** Probabilité d'apparition par ligne et par pas, à la PREMIÈRE série. */
  spawnRate: number;
  /** Part d'avions rapides (double chevron). */
  fastShare: number;
}

/** Largeur du plateau en cases. */
export const COLS = 34;
/** Deux groupes de 6 lignes, comme au test. */
export const GROUPS = 2;
export const LINES_PER_GROUP = 6;

/** Compteurs affichés à l'extérieur du groupe : au-delà, accident. */
export const MAX_TOTAL = 4;
export const MAX_BLUE = 2;

/** Une passation = 10 séries successives. C'est l'unité de score. */
export const SERIES_PER_PASSATION = 10;

/**
 * Densité croissante d'une série à l'autre : la dixième doit être infaisable
 * sans fermer plusieurs voies. C'est ce qui rend le 100 % — donc la classe 9 —
 * pratiquement inatteignable, comme au test.
 */
export const DENSITY_RAMP = 0.055;

/**
 * Vitesses hétérogènes : un avion rapide traverse la zone en deux fois moins de
 * temps. Ce n'est pas cosmétique — c'est ce qui interdit de compter les avions
 * et force à lire les TEMPS d'arrivée.
 */
export const FAST_SPEED = 2;
export const NORMAL_SPEED = 1;

export const LEVELS: AirwaysLevel[] = [
  { tickMs: 820, durationTicks: 34, spawnRate: 0.055, fastShare: 0.15 },
  { tickMs: 740, durationTicks: 36, spawnRate: 0.065, fastShare: 0.22 },
  { tickMs: 660, durationTicks: 38, spawnRate: 0.075, fastShare: 0.3 },
  { tickMs: 580, durationTicks: 40, spawnRate: 0.085, fastShare: 0.36 },
  { tickMs: 520, durationTicks: 42, spawnRate: 0.095, fastShare: 0.42 },
];
