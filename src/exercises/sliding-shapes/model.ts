/**
 * Formes glissées - II (PSY0 cadets) — règle officielle :
 * « Des règles de superposition sont présentées en haut à droite : deux cases marines
 *   superposées donnent une case marine, une case marine et une grise donnent une case
 *   grise, deux cases grises donnent une case marine. 3 à 4 formes sont disposées en bas
 *   de l'écran. En les glissant sur la grille de jeu centrale, le but est de reconstituer
 *   la grille "Figures à reproduire". L'ordre dans lequel vous glissez les formes n'a pas
 *   d'importance : seule compte la position des formes. »
 *
 * Lecture mathématique : marine = 0, gris = 1.
 *   0⊕0 = 0 (marine + marine → marine)
 *   0⊕1 = 1 (marine + gris   → gris)
 *   1⊕1 = 0 (gris   + gris   → marine)
 * C'est EXACTEMENT le XOR. Le XOR étant commutatif et associatif, l'ordre de dépose
 * n'a aucun effet sur le damier obtenu — la propriété annoncée par la règle officielle.
 *
 * La grille centrale démarre entièrement marine (que des 0) ; poser une forme
 * à une position donnée XOR ses cases grises sur la grille.
 */

/** 0 = marine (neutre), 1 = gris (bascule la case). */
export type Cell = 0 | 1;

/** Grille indexée [ligne][colonne]. */
export type Grid = Cell[][];

export interface Shape {
  id: number;
  /** Hauteur de la boîte englobante (lignes). */
  h: number;
  /** Largeur de la boîte englobante (colonnes). */
  w: number;
  /** Motif [ligne][colonne] : 1 = case grise (bascule), 0 = case marine (neutre). */
  cells: Cell[][];
}

/** Position du coin HAUT-GAUCHE de la boîte englobante d'une forme sur la grille. */
export interface Placement {
  shapeId: number;
  row: number;
  col: number;
}

export function emptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0 as Cell));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

/** La forme tient-elle entièrement dans la grille à cette position ? */
export function fits(size: number, shape: Shape, row: number, col: number): boolean {
  return row >= 0 && col >= 0 && row + shape.h <= size && col + shape.w <= size;
}

/** XOR du motif de `shape` sur `grid` (grille modifiée en place). */
export function xorShapeInto(grid: Grid, shape: Shape, row: number, col: number): void {
  for (let r = 0; r < shape.h; r++) {
    for (let c = 0; c < shape.w; c++) {
      if (shape.cells[r][c] === 1) {
        const gr = row + r;
        const gc = col + c;
        grid[gr][gc] = (grid[gr][gc] ^ 1) as Cell;
      }
    }
  }
}

/** Grille obtenue en partant du tout-marine et en posant les placements donnés. */
export function buildGrid(size: number, shapes: Shape[], placements: readonly Placement[]): Grid {
  const grid = emptyGrid(size);
  for (const p of placements) {
    const shape = shapes.find((s) => s.id === p.shapeId);
    if (!shape || !fits(size, shape, p.row, p.col)) continue;
    xorShapeInto(grid, shape, p.row, p.col);
  }
  return grid;
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, r) => row.length === b[r].length && row.every((v, c) => v === b[r][c]));
}

export function greyCount(grid: Grid): number {
  return grid.reduce((n, row) => n + row.reduce<number>((m, v) => m + v, 0), 0);
}

export function serializeGrid(grid: Grid): string {
  return grid.map((row) => row.join('')).join('/');
}

/** Cases où au moins DEUX formes posent une case grise (les cases qui se re-basculent). */
export function greyCollisions(
  size: number,
  shapes: Shape[],
  placements: readonly Placement[],
): number {
  const counts = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  for (const p of placements) {
    const shape = shapes.find((s) => s.id === p.shapeId);
    if (!shape) continue;
    for (let r = 0; r < shape.h; r++) {
      for (let c = 0; c < shape.w; c++) {
        if (shape.cells[r][c] === 1) counts[p.row + r][p.col + c] += 1;
      }
    }
  }
  let n = 0;
  for (const row of counts) for (const v of row) if (v >= 2) n += 1;
  return n;
}

/** Les boîtes englobantes des formes posées sont-elles deux à deux disjointes ? */
export function boxesDisjoint(shapes: Shape[], placements: readonly Placement[]): boolean {
  const boxes = placements.map((p) => {
    const s = shapes.find((x) => x.id === p.shapeId)!;
    return { r0: p.row, c0: p.col, r1: p.row + s.h, c1: p.col + s.w };
  });
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const overlap = a.r0 < b.r1 && b.r0 < a.r1 && a.c0 < b.c1 && b.c0 < a.c1;
      if (overlap) return false;
    }
  }
  return true;
}

/** Toutes les formes sont posées exactement une fois, dans la grille. */
export function isCompletePlacement(
  size: number,
  shapes: Shape[],
  placements: readonly Placement[],
): boolean {
  if (placements.length !== shapes.length) return false;
  const ids = new Set(placements.map((p) => p.shapeId));
  if (ids.size !== shapes.length) return false;
  return placements.every((p) => {
    const shape = shapes.find((s) => s.id === p.shapeId);
    return shape !== undefined && fits(size, shape, p.row, p.col);
  });
}
