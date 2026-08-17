import { mulberry32, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { LEVELS, MIN_GREY_RATIO } from './config';
import type { OverlapMode } from './config';
import {
  boxesDisjoint,
  buildGrid,
  greyCollisions,
  greyCount,
  gridsEqual,
  isCompletePlacement,
} from './model';
import type { Cell, Grid, Placement, Shape } from './model';

export interface SlidingQuestion {
  /** Côté de la grille centrale. */
  size: number;
  /** Les 3 ou 4 formes à glisser. */
  shapes: Shape[];
  /** « Figures à reproduire » : la grille obtenue en posant TOUTES les formes. */
  target: Grid;
  /**
   * Une solution de référence (celle qui a servi à construire la cible). Elle
   * garantit l'existence d'une solution ; elle n'est pas forcément unique.
   */
  solution: Placement[];
}

/** La liste des placements choisis par le joueur. */
export type SlidingAnswer = Placement[];

/**
 * Motif d'une forme : boîte h×w, majoritairement grise, boîte englobante TENDUE
 * (une case grise au moins sur la première/dernière ligne et colonne) pour qu'un
 * coin haut-gauche désigne sans ambiguïté la position de la forme.
 */
function randomShape(rng: Rng, id: number, boxMin: number, boxMax: number): Shape {
  const h = randInt(rng, boxMin, boxMax);
  const w = randInt(rng, boxMin, boxMax);
  const total = h * w;
  const minGrey = Math.max(2, Math.ceil(total * 0.55));
  const maxGrey = Math.max(minGrey, total - 1);
  const n = randInt(rng, minGrey, maxGrey);

  const cells: Cell[][] = Array.from({ length: h }, () => new Array<Cell>(w).fill(0));
  const indices = shuffle(
    rng,
    Array.from({ length: total }, (_, i) => i),
  );
  for (let k = 0; k < n; k++) cells[Math.floor(indices[k] / w)][indices[k] % w] = 1;

  // Réparation (terminaison garantie, n'ajoute que du gris) : tendre la boîte.
  const rowEmpty = (r: number) => cells[r].every((v) => v === 0);
  const colEmpty = (c: number) => cells.every((row) => row[c] === 0);
  if (rowEmpty(0)) cells[0][randInt(rng, 0, w - 1)] = 1;
  if (rowEmpty(h - 1)) cells[h - 1][randInt(rng, 0, w - 1)] = 1;
  if (colEmpty(0)) cells[randInt(rng, 0, h - 1)][0] = 1;
  if (colEmpty(w - 1)) cells[randInt(rng, 0, h - 1)][w - 1] = 1;

  return { id, h, w, cells };
}

/** Tire des positions pour toutes les formes jusqu'à satisfaire la contrainte de recouvrement. */
function tryPlacements(
  rng: Rng,
  size: number,
  shapes: Shape[],
  mode: OverlapMode,
): Placement[] | null {
  for (let attempt = 0; attempt < 300; attempt++) {
    const placements: Placement[] = shapes.map((s) => ({
      shapeId: s.id,
      row: randInt(rng, 0, size - s.h),
      col: randInt(rng, 0, size - s.w),
    }));
    if (mode === 'forbid') {
      // Boîtes disjointes ⇒ aucune case ne peut être basculée deux fois.
      if (boxesDisjoint(shapes, placements)) return placements;
    } else if (greyCollisions(size, shapes, placements) > 0) {
      return placements;
    }
  }
  return null;
}

export function generate(seed: number, level: number, forceTag?: string): Item<SlidingQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];
  const mode: OverlapMode =
    forceTag === 'overlap' ? 'require' : forceTag === 'no-overlap' ? 'forbid' : cfg.overlap;
  const minGrey = Math.ceil(cfg.size * cfg.size * MIN_GREY_RATIO);

  let best: { shapes: Shape[]; solution: Placement[]; target: Grid; grey: number } | null = null;

  for (let attempt = 0; attempt < 400; attempt++) {
    const shapes = Array.from({ length: cfg.shapes }, (_, i) =>
      randomShape(rng, i, cfg.boxMin, cfg.boxMax),
    );
    const solution = tryPlacements(rng, cfg.size, shapes, mode);
    if (!solution) continue;
    const target = buildGrid(cfg.size, shapes, solution);
    const grey = greyCount(target);
    if (best === null || grey > best.grey) best = { shapes, solution, target, grey };
    if (grey >= minGrey) break;
  }

  // `best` est non-null : `tryPlacements` en mode `forbid` réussit toujours (les
  // niveaux garantissent la place), et en mode `require` un recouvrement est
  // atteignable sur 300 tirages. Le fallback conserve la meilleure cible vue.
  const { shapes, solution, target } = best ?? {
    shapes: [] as Shape[],
    solution: [] as Placement[],
    target: buildGrid(cfg.size, [], []),
  };

  const overlaps = greyCollisions(cfg.size, shapes, solution) > 0;
  const tags = [
    `grid-${cfg.size}`,
    `shapes-${shapes.length}`,
    overlaps ? 'overlap' : 'no-overlap',
  ];

  return { question: { size: cfg.size, shapes, target, solution }, seed, level, tags };
}

/**
 * Toute disposition qui reconstitue exactement la grille cible est acceptée
 * (la règle officielle n'exige pas l'unicité), à condition que chaque forme
 * soit posée une et une seule fois, entièrement dans la grille.
 */
export function validate(item: Item<SlidingQuestion>, answer: SlidingAnswer): boolean {
  const q = item.question;
  if (!Array.isArray(answer)) return false;
  if (!isCompletePlacement(q.size, q.shapes, answer)) return false;
  return gridsEqual(buildGrid(q.size, q.shapes, answer), q.target);
}

export function placementsToString(placements: readonly Placement[]): string {
  return [...placements]
    .sort((a, b) => a.shapeId - b.shapeId)
    .map((p) => `F${p.shapeId + 1}→(${p.row + 1},${p.col + 1})`)
    .join(' ');
}
