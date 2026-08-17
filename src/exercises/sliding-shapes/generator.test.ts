import { describe, expect, it } from 'vitest';
import { generate } from './generator';
import { validate } from './validator';
import { LEVELS, MIN_GREY_RATIO } from './config';
import {
  boxesDisjoint,
  buildGrid,
  emptyGrid,
  fits,
  greyCollisions,
  greyCount,
  gridsEqual,
  serializeGrid,
  xorShapeInto,
} from './model';
import type { Cell, Grid, Placement, Shape } from './model';

const SEEDS = 150;

/** Application naïve, indépendante de `buildGrid` : XOR case par case. */
function naiveBuild(size: number, shapes: Shape[], placements: readonly Placement[]): Grid {
  const grid: Grid = Array.from({ length: size }, () => new Array<Cell>(size).fill(0));
  for (const p of placements) {
    const s = shapes.find((x) => x.id === p.shapeId)!;
    for (let r = 0; r < s.h; r++) {
      for (let c = 0; c < s.w; c++) {
        if (s.cells[r][c] === 1) {
          grid[p.row + r][p.col + c] = grid[p.row + r][p.col + c] === 1 ? 0 : 1;
        }
      }
    }
  }
  return grid;
}

describe('modèle de superposition (XOR)', () => {
  it('la table officielle est le XOR : marine+marine=marine, marine+gris=gris, gris+gris=marine', () => {
    const shape: Shape = { id: 0, h: 1, w: 1, cells: [[1]] };
    const g = emptyGrid(1);
    expect(g[0][0]).toBe(0); // marine + rien = marine
    xorShapeInto(g, shape, 0, 0);
    expect(g[0][0]).toBe(1); // marine + gris = gris
    xorShapeInto(g, shape, 0, 0);
    expect(g[0][0]).toBe(0); // gris + gris = marine
  });

  it('l’ordre de dépose n’a AUCUNE importance sur le damier obtenu', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        const reversed = [...q.solution].reverse();
        const rotated = [...q.solution.slice(1), q.solution[0]];
        expect(serializeGrid(buildGrid(q.size, q.shapes, reversed))).toBe(serializeGrid(q.target));
        expect(serializeGrid(buildGrid(q.size, q.shapes, rotated))).toBe(serializeGrid(q.target));
      }
    }
  });
});

describe('sliding-shapes generator', () => {
  it('est déterministe : même (seed, level) → même item', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('la solution de référence, appliquée par XOR, reproduit EXACTEMENT la cible', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        expect(q.solution).toHaveLength(q.shapes.length);
        expect(new Set(q.solution.map((p) => p.shapeId)).size).toBe(q.shapes.length);
        // implémentation naïve, indépendante de buildGrid
        expect(serializeGrid(naiveBuild(q.size, q.shapes, q.solution))).toBe(
          serializeGrid(q.target),
        );
        expect(gridsEqual(buildGrid(q.size, q.shapes, q.solution), q.target)).toBe(true);
        // une solution existe donc toujours, et le validateur l'accepte
        expect(validate(item, q.solution)).toBe(true);
      }
    }
  });

  it('toutes les formes tiennent dans la grille, motifs non vides et boîtes tendues', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        expect(q.size).toBe(cfg.size);
        expect(q.shapes).toHaveLength(cfg.shapes);
        for (const s of q.shapes) {
          expect(s.h).toBeGreaterThanOrEqual(cfg.boxMin);
          expect(s.h).toBeLessThanOrEqual(cfg.boxMax);
          expect(s.w).toBeGreaterThanOrEqual(cfg.boxMin);
          expect(s.w).toBeLessThanOrEqual(cfg.boxMax);
          const grey = s.cells.flat().reduce<number>((n, v) => n + v, 0);
          expect(grey).toBeGreaterThanOrEqual(2);
          // boîte englobante tendue : du gris sur la 1re/dernière ligne et colonne
          expect(s.cells[0].some((v) => v === 1)).toBe(true);
          expect(s.cells[s.h - 1].some((v) => v === 1)).toBe(true);
          expect(s.cells.some((row) => row[0] === 1)).toBe(true);
          expect(s.cells.some((row) => row[s.w - 1] === 1)).toBe(true);
        }
        for (const p of q.solution) {
          const s = q.shapes.find((x) => x.id === p.shapeId)!;
          expect(fits(q.size, s, p.row, p.col)).toBe(true);
        }
      }
    }
  });

  it('la cible n’est jamais triviale : au moins une case grise et 25 % de gris', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      const min = Math.ceil(cfg.size * cfg.size * MIN_GREY_RATIO);
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        const grey = greyCount(q.target);
        expect(grey, `seed ${seed} niveau ${level}`).toBeGreaterThan(0);
        expect(grey, `seed ${seed} niveau ${level}`).toBeGreaterThanOrEqual(min);
      }
    }
  });

  it('le tag overlap/no-overlap correspond à un VRAI chevauchement de cases grises', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        const collisions = greyCollisions(q.size, q.shapes, q.solution);
        expect(item.tags).toContain(`grid-${q.size}`);
        expect(item.tags).toContain(`shapes-${q.shapes.length}`);
        expect(item.tags).toContain(collisions > 0 ? 'overlap' : 'no-overlap');
        expect(item.tags).not.toContain(collisions > 0 ? 'no-overlap' : 'overlap');
      }
    }
  });

  it('niveaux 1-2 : aucun chevauchement (boîtes disjointes) ; niveaux 3-5 : chevauchement réel', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      for (const level of [1, 2]) {
        const item = generate(seed, level);
        const q = item.question;
        expect(boxesDisjoint(q.shapes, q.solution)).toBe(true);
        expect(greyCollisions(q.size, q.shapes, q.solution)).toBe(0);
        expect(item.tags).toContain('no-overlap');
      }
      for (const level of [3, 4, 5]) {
        const item = generate(seed, level);
        const q = item.question;
        expect(greyCollisions(q.size, q.shapes, q.solution)).toBeGreaterThan(0);
        expect(item.tags).toContain('overlap');
      }
    }
  });

  it('forceTag overlap / no-overlap oriente le placement', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 100; seed++) {
        const over = generate(seed, level, 'overlap');
        expect(greyCollisions(over.question.size, over.question.shapes, over.question.solution))
          .toBeGreaterThan(0);
        expect(over.tags).toContain('overlap');
        const flat = generate(seed, level, 'no-overlap');
        expect(greyCollisions(flat.question.size, flat.question.shapes, flat.question.solution))
          .toBe(0);
        expect(flat.tags).toContain('no-overlap');
      }
    }
  });

  it('parité : cases grises de la cible = somme des gris des formes − 2 × recouvrements', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        // Vrai uniquement quand aucune case n'est couverte plus de deux fois :
        // on recompte donc la parité case par case, ce qui est la propriété générale.
        const counts = Array.from({ length: q.size }, () => new Array<number>(q.size).fill(0));
        for (const p of q.solution) {
          const s = q.shapes.find((x) => x.id === p.shapeId)!;
          for (let r = 0; r < s.h; r++)
            for (let c = 0; c < s.w; c++)
              if (s.cells[r][c] === 1) counts[p.row + r][p.col + c] += 1;
        }
        for (let r = 0; r < q.size; r++) {
          for (let c = 0; c < q.size; c++) {
            expect(q.target[r][c]).toBe(counts[r][c] % 2);
          }
        }
      }
    }
  });

  it('le validateur refuse une solution incomplète, hors grille, ou fausse', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 60; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        expect(validate(item, [])).toBe(false);
        expect(validate(item, q.solution.slice(1))).toBe(false);
        // doublon de forme au lieu d'une forme distincte
        const dup = q.solution.map((p, i) => (i === 0 ? { ...p, shapeId: q.solution[1].shapeId } : p));
        expect(validate(item, dup)).toBe(false);
        // hors grille
        expect(validate(item, q.solution.map((p, i) => (i === 0 ? { ...p, row: q.size } : p)))).toBe(
          false,
        );
        // décalage d'une case : la grille ne peut plus coïncider (cible non triviale)
        const shifted = q.solution.map((p, i) =>
          i === 0 && p.col + 1 + q.shapes.find((s) => s.id === p.shapeId)!.w <= q.size
            ? { ...p, col: p.col + 1 }
            : p,
        );
        if (serializeGrid(buildGrid(q.size, q.shapes, shifted)) !== serializeGrid(q.target)) {
          expect(validate(item, shifted)).toBe(false);
        }
      }
    }
  });

  it('les exemples d’astuces sont de vrais items du sous-type annoncé', () => {
    const flat = generate(7, 1, 'no-overlap');
    expect(flat.tags).toContain('no-overlap');
    expect(flat.question.shapes).toHaveLength(3);
    const over = generate(12, 4, 'overlap');
    expect(over.tags).toContain('overlap');
    expect(over.question.shapes).toHaveLength(4);
    for (const item of [flat, over]) {
      expect(validate(item, item.question.solution)).toBe(true);
    }
  });
});
