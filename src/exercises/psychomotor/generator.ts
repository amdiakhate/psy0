import { mulberry32, pick } from '../../core/rng';
import type { Item } from '../../core/types';
import { CALC_LANE_SIZE, DIRECTIONS, LEVELS, SCHEDULE_HORIZON_S, SHAPES } from './config';
import type { Direction, ShapeName } from './config';
import { makeCalc } from './calc';
import type { Calc, Trap } from './calc';

/**
 * Les trois tâches sont planifiées à l'avance (déterministe depuis le seed) :
 * ① segments de déplacement du cercle, ② paires de formes, ③ calculs.
 */

export interface DriftSegment {
  /** Instant de début (s). */
  t: number;
  direction: Direction;
  /**
   * Fraction de la zone parcourue par seconde. Elle change à chaque segment :
   * le cercle officiel ne file pas au même rythme d'un déplacement à l'autre,
   * et c'est ce qui interdit de suivre au réflexe plutôt qu'à l'œil.
   */
  speed: number;
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
  /** Instant où ce calcul devient ENTOURÉ (s). */
  t: number;
  display: string;
  /** true si le calcul entouré est FAUX → touche F attendue. */
  wrong: boolean;
  /** Nature du faux, pour la taxonomie d'erreurs. */
  trap: Trap;
}

/**
 * Une vague du bandeau : CALC_LANE_SIZE calculs visibles simultanément, qui
 * défilent de droite à gauche à une vitesse propre à la vague.
 *
 * C'est la divergence majeure avec l'ancienne version, qui n'affichait qu'un
 * calcul à la fois : voir les suivants arriver permet de les LIRE À L'AVANCE,
 * et c'est précisément la compétence que l'épreuve mesure.
 */
export interface CalcWave {
  /** Instant d'entrée de la vague (s). */
  t: number;
  /** Fraction de largeur parcourue par seconde. */
  speed: number;
  calcs: CalcItem[];
}

export interface PsyQuestion {
  segments: DriftSegment[];
  shapes: ShapePair[];
  waves: CalcWave[];
  shapeIntervalMs: number;
  calcIntervalMs: number;
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
    const [slo, shi] = cfg.driftSpeed;
    segments.push({ t, direction, speed: slo + rng() * (shi - slo) });
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

  // ③ Bandeau de calculs : des vagues de CALC_LANE_SIZE calculs qui défilent,
  // le cadre orange passant de l'un au suivant à intervalle régulier.
  const wrongRate = forceTag === 'calc-wrong' ? 0.65 : cfg.calcWrongRate;
  const step = cfg.calcIntervalMs / 1000;
  const waves: CalcWave[] = [];
  let waveT = 2.5;
  while (waveT < SCHEDULE_HORIZON_S) {
    // Une vitesse propre à chaque vague : le bandeau officiel n'avance pas au
    // même rythme d'une vague à l'autre, ce qui interdit de se caler dessus.
    const [lo, hi] = cfg.scrollSpeed;
    const speed = lo + rng() * (hi - lo);
    const calcs: CalcItem[] = [];
    for (let k = 0; k < CALC_LANE_SIZE; k++) {
      const c: Calc = makeCalc(rng, { wrongRate });
      calcs.push({ t: waveT + k * step, display: c.display, wrong: c.wrong, trap: c.trap });
    }
    waves.push({ t: waveT, speed, calcs });
    waveT += CALC_LANE_SIZE * step;
  }

  return {
    question: {
      segments,
      shapes,
      waves,
      shapeIntervalMs: cfg.shapeIntervalMs,
      calcIntervalMs: cfg.calcIntervalMs,
    },
    seed,
    level,
    tags: ['tracking'],
  };
}

/** Tous les calculs, dans l'ordre où le cadre les entoure. */
export function allCalcs(waves: CalcWave[]): CalcItem[] {
  return waves.flatMap((w) => w.calcs);
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
/**
 * Marge gardée sur les bords, en fraction. Elle doit couvrir la DEMI-TAILLE du
 * cercle : à 0,08 il débordait de son cadre, la position étant celle de son
 * centre.
 */
export const DRIFT_MARGIN = 0.16;

export interface Point {
  x: number;
  y: number;
}

const STEP: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function clampToArena(v: number): number {
  return Math.min(1 - DRIFT_MARGIN, Math.max(DRIFT_MARGIN, v));
}

/**
 * Position du cercle à l'instant t, en fractions de la zone de jeu.
 *
 * Le cercle SE DÉPLACE réellement : c'est une tâche de POURSUITE. Une version
 * antérieure le laissait immobile avec une flèche indiquant la direction —
 * il n'y avait alors plus rien à poursuivre, seulement un symbole à lire.
 *
 * Contre un bord, la position est bornée plutôt que réfléchie : un rebond
 * inverserait le sens réel sans que la direction annoncée change, et la
 * consigne « maintiens la flèche du sens de déplacement » deviendrait fausse.
 */
export function positionAt(segments: DriftSegment[], t: number): Point {
  let x = 0.5;
  let y = 0.5;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.t >= t) break;
    const end = Math.min(t, segments[i + 1]?.t ?? t);
    const dt = Math.max(0, end - seg.t);
    const d = STEP[seg.direction];
    x = clampToArena(x + d.x * seg.speed * dt);
    y = clampToArena(y + d.y * seg.speed * dt);
  }
  return { x, y };
}

/**
 * Vague visible à l'instant t : celle dont le cadre parcourt les calculs.
 * `null` avant la première vague.
 */
export function waveAt(waves: CalcWave[], t: number, intervalMs: number): CalcWave | null {
  const span = (CALC_LANE_SIZE * intervalMs) / 1000;
  for (let i = waves.length - 1; i >= 0; i--) {
    if (waves[i].t <= t && t < waves[i].t + span) return waves[i];
  }
  return null;
}

/**
 * Décalage horizontal du bandeau, en fraction de largeur.
 *
 * Le défilement suit la PROGRESSION DU CADRE et non une vitesse libre : sinon
 * le bandeau file devant et les derniers calculs quittent l'écran avant même
 * d'être entourés — on ne pourrait plus les lire à l'avance, ce qui vide
 * l'exercice de son intérêt.
 *
 * `speed` module l'amplitude d'une vague à l'autre, pour qu'on ne puisse pas
 * se caler mécaniquement, mais elle reste bornée par SCROLL_MAX.
 */
export const SCROLL_MAX = 0.55;

/**
 * Décalage du bandeau, en fraction de largeur.
 *
 * Il amène le calcul ENTOURÉ à gauche, de sorte que les suivants restent
 * visibles à sa droite : c'est là toute la valeur du bandeau, pouvoir les lire
 * avant qu'ils soient entourés. Une version antérieure laissait l'entouré à
 * droite, avec uniquement des calculs déjà traités à gauche — il n'y avait
 * plus rien à anticiper.
 */
export function scrollOffsetAt(wave: CalcWave, t: number, intervalMs: number): number {
  const step = intervalMs / 1000;
  const elapsed = Math.max(0, t - wave.t);
  // Avance continue, d'un emplacement par intervalle.
  const progress = Math.min(CALC_LANE_SIZE, elapsed / step);
  return (progress / CALC_LANE_SIZE) * SCROLL_MAX;
}

export function calcIndexAt(calcs: CalcItem[], t: number, intervalMs: number): number {
  for (let i = calcs.length - 1; i >= 0; i--) {
    if (calcs[i].t <= t && t < calcs[i].t + intervalMs / 1000) return i;
  }
  return -1;
}
