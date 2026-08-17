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

export const LEVELS: AirwaysLevel[] = [
  { tickMs: 900, durationTicks: 55, spawnRate: 0.045, maxStagger: 0 },
  { tickMs: 800, durationTicks: 60, spawnRate: 0.055, maxStagger: 3 },
  { tickMs: 700, durationTicks: 65, spawnRate: 0.065, maxStagger: 3 },
  { tickMs: 620, durationTicks: 70, spawnRate: 0.075, maxStagger: 4 },
  { tickMs: 540, durationTicks: 75, spawnRate: 0.085, maxStagger: 4 },
];
