export interface AirwaysLevel {
  /** Durée d'un pas de simulation (ms) — les avions avancent d'une case par pas. */
  tickMs: number;
  /** Durée d'une série en pas. */
  durationTicks: number;
  /** Probabilité d'apparition d'un avion par ligne et par pas. */
  spawnRate: number;
  /** Décalage possible de la zone grise entre les lignes 0-2 et 3-5 (effet escalier). */
  maxStagger: number;
}

/** Largeur du plateau en cases. */
export const COLS = 34;
/** Deux blocs de 6 lignes, comme au test. */
export const GROUPS = 2;
export const LINES_PER_GROUP = 6;
/** Critères de fluidité du test : dans la zone grise d'un bloc, jamais plus de… */
export const MAX_TOTAL = 4;
export const MAX_BLUE = 2;

/**
 * Densité calibrée sur Pilotest, où le plateau est nettement plus chargé.
 *
 * L'ancienne échelle démarrait à 0,045 : une douzaine d'avions simultanés sur
 * douze lignes, soit un par ligne, et 0,9 déroutage nécessaire par série. Il n'y
 * avait donc quasiment rien à décider — or c'est la DÉCISION que le test note
 * depuis 2019, pas la survie.
 *
 * La borne haute n'est pas libre : la série doit rester gagnable. C'est un test
 * qui le vérifie, en rejouant les déroutages de référence sur chaque pas.
 *
 * Contrepartie mesurée, et inévitable : le « par » — le minimum de déroutages
 * pour survivre — monte avec la densité, de 0,9 à 3,7 au niveau 1. C'est de la
 * géométrie, pas un réglage : plus d'avions convergent vers la zone grise, plus
 * il faut en écarter. Un plateau chargé où presque rien ne serait à dérouter
 * n'existe pas.
 */
export const LEVELS: AirwaysLevel[] = [
  { tickMs: 850, durationTicks: 60, spawnRate: 0.07, maxStagger: 0 },
  { tickMs: 760, durationTicks: 65, spawnRate: 0.08, maxStagger: 3 },
  { tickMs: 680, durationTicks: 70, spawnRate: 0.09, maxStagger: 3 },
  { tickMs: 600, durationTicks: 75, spawnRate: 0.1, maxStagger: 4 },
  { tickMs: 520, durationTicks: 80, spawnRate: 0.11, maxStagger: 4 },
];
