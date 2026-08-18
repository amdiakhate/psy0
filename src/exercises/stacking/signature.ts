import { canonical, mirror } from './model';
import type { Cell, Mat3, Shape } from './model';

/**
 * La signature de chiralité, rendue exacte.
 *
 * L'ancienne méthode enseignée — « oriente le bras vers toi et regarde de quel
 * côté part le décrochage » — reposait sur la position des faces à l'écran.
 * Elle tenait tant que toutes les figures partageaient la même projection ;
 * depuis qu'elles sont basculées d'un angle quelconque, elle ne veut plus rien
 * dire.
 *
 * Ce qui la remplace est INTRINSÈQUE à la figure, donc insensible au
 * basculement : on repère trois directions dans un ordre imposé — le bras, la
 * saillie, le cube du dessus — et on lit le SENS DE CIRCULATION qui les
 * enchaîne. Ce sens est le signe du produit mixte : il ne change pas par
 * rotation, il s'inverse par symétrie. C'est exactement la propriété qu'on
 * cherche, et les tests la vérifient sur les 24 rotations.
 */

export interface Trihedron {
  /** Le cube d'ancrage — celui d'où partent les trois directions. */
  origin: Cell;
  /** 1ʳᵉ direction : le long du bras. */
  u: Cell;
  /** 2ᵉ direction : la saillie. */
  v: Cell;
  /** 3ᵉ direction : le cube du dessus. */
  w: Cell;
}

/** Symétrie plane utilisée par `mirror` : inversion de l'axe X. */
export const MIRROR_MAT: Mat3 = [-1, 0, 0, 0, 1, 0, 0, 0, 1];

/**
 * Signe du produit mixte u · (v ∧ w).
 *
 * +1 = le trio tourne dans un sens, −1 = dans l'autre, 0 = les trois directions
 * sont coplanaires et ne décident de rien (trièdre mal choisi).
 */
export function tripleSign(t: Trihedron): -1 | 0 | 1 {
  const [ux, uy, uz] = t.u;
  const [vx, vy, vz] = t.v;
  const [wx, wy, wz] = t.w;
  const det = ux * (vy * wz - vz * wy) - uy * (vx * wz - vz * wx) + uz * (vx * wy - vy * wx);
  return det > 0 ? 1 : det < 0 ? -1 : 0;
}

function applyDir(m: Mat3, c: Cell): Cell {
  return [
    m[0] * c[0] + m[1] * c[1] + m[2] * c[2],
    m[3] * c[0] + m[4] * c[1] + m[5] * c[2],
    m[6] * c[0] + m[7] * c[1] + m[8] * c[2],
  ];
}

/** Le trièdre vu après une rotation — ou après la symétrie. */
export function mapTrihedron(t: Trihedron, m: Mat3): Trihedron {
  return {
    origin: applyDir(m, t.origin),
    u: applyDir(m, t.u),
    v: applyDir(m, t.v),
    w: applyDir(m, t.w),
  };
}

/**
 * La main de la figure, calculée sans passer par aucun repère visuel : on
 * compare la forme canonique de l'objet à celle de son miroir. Rotation-
 * invariant par construction, et inversé par symétrie puisque les deux termes
 * s'échangent.
 *
 * Sert de VÉRITÉ DE RÉFÉRENCE : les tests exigent que la méthode enseignée —
 * lire le sens de circulation du trièdre — donne toujours le même verdict.
 * Une méthode d'apprentissage qui divergerait de la vérité serait pire
 * qu'absente.
 */
export function handOf(cells: Shape): 1 | -1 {
  return canonical(cells) < canonical(mirror(cells)) ? 1 : -1;
}


/* ------------------------------------------------------------------ leçon */

function sub(a: Cell, b: Cell): Cell {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function isNeighbour(a: Cell, b: Cell): boolean {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) === 1;
}

export interface FoundTrihedron extends Trihedron {
  /** Indices (dans la forme) des cellules de chaque rôle — pour les colorer. */
  armIndices: number[];
  overhangIndex: number;
  topIndex: number;
  /** Index de la cellule support (le bout du bras qui porte le dessus). */
  supportIndex: number;
}

/**
 * Retrouve le trièdre sur une figure de leçon (bras de 3 + dessus sur un bout
 * + saillie au milieu), quelle que soit sa présentation. C'est la détection
 * qu'utilise la leçon pour DESSINER les flèches sur chaque vue, et que les
 * tests utilisent pour prouver que le sens lu coïncide avec la main réelle.
 */
export function findLessonTrihedron(cells: Shape): FoundTrihedron | null {
  const set = new Set(cells.map((c) => c.join(',')));
  for (const axis of [0, 1, 2] as const) {
    for (let start = 0; start < cells.length; start++) {
      const c = cells[start];
      const step: Cell = [0, 0, 0];
      step[axis] = 1;
      const arm: Cell[] = [
        c,
        [c[0] + step[0], c[1] + step[1], c[2] + step[2]],
        [c[0] + 2 * step[0], c[1] + 2 * step[1], c[2] + 2 * step[2]],
      ];
      if (!arm.every((s) => set.has(s.join(',')))) continue;
      const armKeys = new Set(arm.map((s) => s.join(',')));
      const restIdx = cells.map((_, i) => i).filter((i) => !armKeys.has(cells[i].join(',')));
      if (restIdx.length !== 2) continue;
      const [midCell, endA, endB] = [arm[1], arm[0], arm[2]];
      const top = restIdx.find((i) => isNeighbour(cells[i], endA) || isNeighbour(cells[i], endB));
      const overhang = restIdx.find((i) => isNeighbour(cells[i], midCell));
      if (top === undefined || overhang === undefined || top === overhang) continue;
      const support = isNeighbour(cells[top], endA) ? endA : endB;
      const armIndices = cells
        .map((_, i) => i)
        .filter((i) => armKeys.has(cells[i].join(',')));
      return {
        origin: midCell,
        u: sub(support, midCell).map((v) => Math.sign(v)) as Cell,
        v: sub(cells[overhang], midCell) as Cell,
        w: sub(cells[top], support) as Cell,
        armIndices,
        overhangIndex: overhang,
        topIndex: top,
        supportIndex: cells.findIndex((x) => x.join(',') === support.join(',')),
      };
    }
  }
  return null;
}
