import { mulberry32, pick, randInt } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { DIRECTIONS, LEVELS, SCHEDULE_HORIZON_S, SHAPES } from './config';
import type { Direction, ShapeName } from './config';

/**
 * Les trois tâches sont planifiées à l'avance (déterministe depuis le seed) :
 * ① segments de déplacement du cercle, ② paires de formes, ③ calculs.
 */

export interface DriftSegment {
  /** Instant de début (s). */
  t: number;
  direction: Direction;
}

export interface ShapePair {
  t: number;
  /** Forme dans l'encart pointillé (gauche). */
  left: ShapeName;
  /** Forme dans le cercle. */
  inCircle: ShapeName;
  /** true si identiques → barre d'espace attendue. */
  match: boolean;
}

export interface CalcItem {
  t: number;
  display: string;
  /** true si le calcul entouré est FAUX → touche F attendue. */
  wrong: boolean;
}

export interface PsyQuestion {
  segments: DriftSegment[];
  shapes: ShapePair[];
  calcs: CalcItem[];
  shapeIntervalMs: number;
  calcIntervalMs: number;
}

/** Calcul simple avec un résultat affiché, parfois faux (erreur plausible ±1/±2/±10). */
function makeCalc(rng: Rng, wrong: boolean): { display: string; wrong: boolean } {
  const kind = randInt(rng, 0, 2);
  let a: number;
  let b: number;
  let op: string;
  let truth: number;
  if (kind === 0) {
    a = randInt(rng, 11, 79);
    b = randInt(rng, 4, 29);
    op = '+';
    truth = a + b;
  } else if (kind === 1) {
    a = randInt(rng, 25, 95);
    b = randInt(rng, 4, 24);
    op = '−';
    truth = a - b;
  } else {
    a = randInt(rng, 3, 12);
    b = randInt(rng, 3, 9);
    op = '×';
    truth = a * b;
  }
  const deltas = [1, -1, 2, -2, 10, -10];
  const shown = wrong ? truth + pick(rng, deltas) : truth;
  return { display: `${a} ${op} ${b} = ${shown}`, wrong: shown !== truth };
}

export function generate(seed: number, level: number, forceTag?: string): Item<PsyQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  // ① Déplacement du cercle : segments successifs, jamais deux fois la même
  // direction d'affilée (sinon le changement passerait inaperçu).
  const segments: DriftSegment[] = [];
  let t = 0;
  let previous: Direction | null = null;
  while (t < SCHEDULE_HORIZON_S) {
    let direction = pick(rng, DIRECTIONS);
    while (direction === previous) direction = pick(rng, DIRECTIONS);
    segments.push({ t, direction });
    previous = direction;
    t += (cfg.driftSegmentMs[0] + rng() * (cfg.driftSegmentMs[1] - cfg.driftSegmentMs[0])) / 1000;
  }

  // ② Paires de formes, à intervalle régulier.
  const matchRate = forceTag === 'shape-match' ? 0.6 : cfg.shapeMatchRate;
  const shapes: ShapePair[] = [];
  for (let s = 1.2; s < SCHEDULE_HORIZON_S; s += cfg.shapeIntervalMs / 1000) {
    const left = pick(rng, SHAPES);
    const match = rng() < matchRate;
    let inCircle = left;
    if (!match) {
      inCircle = pick(rng, SHAPES);
      while (inCircle === left) inCircle = pick(rng, SHAPES);
    }
    shapes.push({ t: s, left, inCircle, match: left === inCircle });
  }

  // ③ Calculs, à intervalle régulier.
  const wrongRate = forceTag === 'calc-wrong' ? 0.6 : cfg.calcWrongRate;
  const calcs: CalcItem[] = [];
  for (let s = 2.5; s < SCHEDULE_HORIZON_S; s += cfg.calcIntervalMs / 1000) {
    const c = makeCalc(rng, rng() < wrongRate);
    calcs.push({ t: s, display: c.display, wrong: c.wrong });
  }

  return {
    question: {
      segments,
      shapes,
      calcs,
      shapeIntervalMs: cfg.shapeIntervalMs,
      calcIntervalMs: cfg.calcIntervalMs,
    },
    seed,
    level,
    tags: ['tracking'],
  };
}

/** Direction attendue à l'instant t (s). */
export function directionAt(segments: DriftSegment[], t: number): Direction {
  let current = segments[0].direction;
  for (const seg of segments) {
    if (seg.t > t) break;
    current = seg.direction;
  }
  return current;
}

/** Index de la paire de formes active à l'instant t, ou -1. */
export function shapeIndexAt(shapes: ShapePair[], t: number, intervalMs: number): number {
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].t <= t && t < shapes[i].t + intervalMs / 1000) return i;
  }
  return -1;
}

/** Index du calcul entouré à l'instant t, ou -1. */
export function calcIndexAt(calcs: CalcItem[], t: number, intervalMs: number): number {
  for (let i = calcs.length - 1; i >= 0; i--) {
    if (calcs[i].t <= t && t < calcs[i].t + intervalMs / 1000) return i;
  }
  return -1;
}
