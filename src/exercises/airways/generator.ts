import { mulberry32, randInt } from '../../core/rng';
import type { Item } from '../../core/types';
import { COLS, GROUPS, LEVELS, LINES_PER_GROUP, MAX_BLUE, MAX_TOTAL } from './config';

/**
 * Airways (PSY0 cadets). Des triangles évoluent sur les airways : les bleus vont
 * vers la GAUCHE, les violets vers la DROITE, une case par pas.
 *
 * Déroutage (les avions déroutés quittent définitivement le plateau) :
 *  - petite croix en bout de ligne → déroute UN avion de cette ligne/couleur ;
 *  - grosse croix latérale → déroute TOUS les avions de cette couleur, partout.
 *
 * Critères de fluidité, par bloc de 6 lignes : jamais plus de MAX_TOTAL avions
 * ni plus de MAX_BLUE bleus dans la zone grise du bloc. Sinon : accident.
 * Le but est de dérouter le MOINS d'avions possible.
 */

export type PlaneColor = 'blue' | 'purple';

export interface Plane {
  id: number;
  group: number;
  /** Ligne 0-5 dans le bloc. */
  line: number;
  color: PlaneColor;
  spawnTick: number;
}

/** Zone grise : un intervalle de colonnes PAR LIGNE (d'où la forme en escalier). */
export interface GreyZone {
  /** [start, end] inclus, indexé par ligne (0-5). */
  perLine: Array<{ start: number; end: number }>;
}

export interface AirwaysQuestion {
  zones: GreyZone[];
  planes: Plane[];
  cols: number;
  tickMs: number;
  durationTicks: number;
  maxTotal: number;
  maxBlue: number;
  /** Déroutages nécessaires avec une stratégie chirurgicale (référence de score). */
  par: number;
}

/** Colonne d'un avion à l'instant t (hors plateau si < 0 ou ≥ cols). */
export function planeCol(plane: Plane, tick: number, cols: number): number {
  const age = tick - plane.spawnTick;
  return plane.color === 'blue' ? cols - 1 - age : age;
}

export function isOnBoard(plane: Plane, tick: number, cols: number): boolean {
  if (tick < plane.spawnTick) return false;
  const col = planeCol(plane, tick, cols);
  return col >= 0 && col < cols;
}

export function inGreyZone(
  plane: Plane,
  tick: number,
  q: Pick<AirwaysQuestion, 'cols' | 'zones'>,
): boolean {
  if (tick < plane.spawnTick) return false;
  const col = planeCol(plane, tick, q.cols);
  const span = q.zones[plane.group].perLine[plane.line];
  return col >= span.start && col <= span.end;
}

/** Dernier pas où l'avion est encore dans sa zone grise. */
function zoneExitTick(plane: Plane, q: AirwaysQuestion): number {
  const span = q.zones[plane.group].perLine[plane.line];
  return plane.color === 'blue'
    ? plane.spawnTick + (q.cols - 1 - span.start)
    : plane.spawnTick + span.end;
}

/** Violation d'un critère à l'instant t, en ignorant les avions déroutés. */
export function violationAt(
  q: AirwaysQuestion,
  tick: number,
  removed: ReadonlySet<number>,
): { group: number; reason: 'flow-total' | 'flow-blue' } | null {
  for (let g = 0; g < q.zones.length; g++) {
    const occupants = q.planes.filter(
      (p) => p.group === g && !removed.has(p.id) && inGreyZone(p, tick, q),
    );
    if (occupants.filter((p) => p.color === 'blue').length > q.maxBlue) {
      return { group: g, reason: 'flow-blue' };
    }
    if (occupants.length > q.maxTotal) return { group: g, reason: 'flow-total' };
  }
  return null;
}

/**
 * Stratégie chirurgicale de référence : à chaque pas, tant qu'un critère est
 * dépassé, déroute l'avion qui resterait le plus longtemps dans la zone.
 * Le résultat est un ensemble SUFFISANT de déroutages (testé : zéro accident).
 */
export function minimalRemovals(q: AirwaysQuestion): number[] {
  const removed = new Set<number>();
  for (let t = 0; t <= q.durationTicks; t++) {
    for (let g = 0; g < q.zones.length; g++) {
      const inZone = () =>
        q.planes
          .filter((p) => p.group === g && !removed.has(p.id) && inGreyZone(p, t, q))
          .sort((a, b) => zoneExitTick(b, q) - zoneExitTick(a, q));

      let occupants = inZone();
      // Critère bleu d'abord (le plus serré), puis le total.
      let blues = occupants.filter((p) => p.color === 'blue');
      while (blues.length > q.maxBlue) {
        removed.add(blues[0].id);
        blues = blues.slice(1);
      }
      occupants = inZone();
      while (occupants.length > q.maxTotal) {
        removed.add(occupants[0].id);
        occupants = occupants.slice(1);
      }
    }
  }
  return [...removed];
}

export function generate(seed: number, level: number, forceTag?: string): Item<AirwaysQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(level, LEVELS.length) - 1];
  const spawnRate = forceTag === 'flow-blue' ? cfg.spawnRate * 1.25 : cfg.spawnRate;

  // Zones grises : un palier pour les lignes 0-2, un autre (décalé) pour 3-5.
  const zones: GreyZone[] = [];
  for (let g = 0; g < GROUPS; g++) {
    const width = randInt(rng, 4, 5);
    const baseStart = randInt(rng, 10, COLS - width - 11);
    const stagger = cfg.maxStagger > 0 ? randInt(rng, 0, cfg.maxStagger) : 0;
    const perLine = Array.from({ length: LINES_PER_GROUP }, (_, line) => {
      const start = line < 3 ? baseStart : baseStart + stagger;
      return { start, end: start + width };
    });
    zones.push({ perLine });
  }

  const planes: Plane[] = [];
  let id = 0;
  const lastSpawn = new Map<string, number>();
  const blueBias = forceTag === 'flow-blue' ? 0.68 : 0.5;
  for (let t = 0; t < cfg.durationTicks - 10; t++) {
    for (let g = 0; g < GROUPS; g++) {
      for (let line = 0; line < LINES_PER_GROUP; line++) {
        if (rng() >= spawnRate) continue;
        const color: PlaneColor = rng() < blueBias ? 'blue' : 'purple';
        // Espacement minimal entre deux avions d'une même trajectoire.
        const key = `${g}:${line}:${color}`;
        if (t - (lastSpawn.get(key) ?? -20) < 4) continue;
        lastSpawn.set(key, t);
        planes.push({ id: id++, group: g, line, color, spawnTick: t });
      }
    }
  }

  const question: AirwaysQuestion = {
    zones,
    planes,
    cols: COLS,
    tickMs: cfg.tickMs,
    durationTicks: cfg.durationTicks,
    maxTotal: MAX_TOTAL,
    maxBlue: MAX_BLUE,
    par: 0,
  };
  question.par = minimalRemovals(question).length;

  return { question, seed, level, tags: ['flow'] };
}
