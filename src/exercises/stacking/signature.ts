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

/* ------------------------------------------------- le repère, sur une figure réelle */

/**
 * Le trièdre effectivement TRAÇABLE sur une figure quelconque.
 *
 * `findLessonTrihedron` ne sait lire que la figure de la leçon : bras de trois
 * cubes plus exactement deux cellules. Les items réels en comptent huit à onze,
 * il rend `null` dessus. Voici la version générale.
 *
 * Toute la difficulté est le choix du repère. Il doit être ÉQUIVARIANT : tourner
 * la figure doit tourner le repère (sinon le sens changerait sans raison), et la
 * refléter doit le refléter (sinon le sens ne basculerait pas). Un départ « du
 * point le plus haut » échoue aux deux : « haut » est une propriété de l'écran,
 * pas de l'objet, et les trois figures sont basculées d'angles différents.
 *
 * D'où le choix de départager par le PROFIL DE DISTANCES d'une cellule — la
 * liste triée des distances qui la séparent de toutes les autres. C'est une
 * grandeur purement métrique : invariante par rotation ET par symétrie, donc
 * elle ne peut pas introduire de chiralité parasite dans la sélection.
 */
export interface TracedTrihedron {
  /** Le bras : les cellules alignées, du point d'ancrage vers l'autre bout. */
  armIndices: number[];
  anchorIndex: number;
  farIndex: number;
  /** Les deux branchements retenus, et la cellule du bras où chacun s'accroche. */
  firstIndex: number;
  firstBaseIndex: number;
  secondIndex: number;
  secondBaseIndex: number;
  u: Cell;
  v: Cell;
  w: Cell;
}

const sub3 = (a: Cell, b: Cell): Cell => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const d2 = (a: Cell, b: Cell) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const adjacent = (a: Cell, b: Cell) => d2(a, b) === 1;

/** Distances (au carré) d'une cellule à toutes les autres, triées. Isométrique par nature. */
function profile(cells: Shape, i: number): string {
  return cells
    .map((c) => d2(cells[i], c))
    .sort((a, b) => a - b)
    .join(',');
}

/** Toutes les suites alignées maximales de longueur ≥ 2, en index. */
function straightRuns(cells: Shape): number[][] {
  const index = new Map(cells.map((c, i) => [c.join(','), i]));
  const runs: number[][] = [];
  for (const axis of [0, 1, 2] as const) {
    for (let i = 0; i < cells.length; i++) {
      const before: Cell = [...cells[i]];
      before[axis] -= 1;
      if (index.has(before.join(','))) continue; // on ne part que d'un début de suite
      const run = [i];
      const cursor: Cell = [...cells[i]];
      for (;;) {
        cursor[axis] += 1;
        const next = index.get(cursor.join(','));
        if (next === undefined) break;
        run.push(next);
      }
      if (run.length >= 2) runs.push(run);
    }
  }
  return runs;
}

export function findTrihedron(cells: Shape): TracedTrihedron | null {
  const runs = straightRuns(cells);
  if (runs.length === 0) return null;
  const longest = Math.max(...runs.map((r) => r.length));
  const candidates = runs.filter((r) => r.length === longest);
  const prof = cells.map((_, i) => profile(cells, i));

  // Bras : à longueur égale, celui dont les profils sont les plus « petits ».
  const armKey = (run: number[]) => run.map((i) => prof[i]).sort().join('|');
  const arm = [...candidates].sort((a, b) => (armKey(a) < armKey(b) ? -1 : armKey(a) > armKey(b) ? 1 : 0))[0];
  if (candidates.filter((r) => armKey(r) === armKey(arm)).length > 1) return null; // bras ambigu

  const ends = [arm[0], arm[arm.length - 1]];
  if (prof[ends[0]] === prof[ends[1]]) return null; // bout de départ indécidable
  const anchorIndex = prof[ends[0]] < prof[ends[1]] ? ends[0] : ends[1];
  const farIndex = anchorIndex === ends[0] ? ends[1] : ends[0];
  const ordered = arm[0] === anchorIndex ? arm : [...arm].reverse();

  const onArm = new Set(arm);
  const u = sub3(cells[ordered[1]], cells[anchorIndex]);

  // Branchements : cellules collées au bras sans lui appartenir. On les classe
  // par profil, puis par distance à l'ancrage — deux critères métriques.
  const branches = cells
    .map((_, i) => i)
    .filter((i) => !onArm.has(i) && arm.some((a) => adjacent(cells[i], cells[a])))
    .map((i) => ({
      i,
      base: arm.find((a) => adjacent(cells[i], cells[a]))!,
      key: `${prof[i]}#${d2(cells[i], cells[anchorIndex])}`,
    }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  // Un branchement dont la clé est partagée par un autre n'est pas désignable
  // sans arbitraire : deux vues de la même figure choisiraient des cellules
  // différentes, et le sens basculerait sans raison. On ne garde donc que les
  // branchements UNIQUES — mesuré, c'est ce qui séparait un repère fiable d'un
  // repère qui se contredit une fois sur trente.
  const uniques = branches.filter((x) => branches.filter((y) => y.key === x.key).length === 1);

  // Le trio doit être non coplanaire, sinon il ne décide de rien.
  for (let a = 0; a < uniques.length; a++) {
    for (let b = 0; b < uniques.length; b++) {
      if (a === b) continue;
      const v = sub3(cells[uniques[a].i], cells[uniques[a].base]);
      const w = sub3(cells[uniques[b].i], cells[uniques[b].base]);
      if (tripleSign({ origin: cells[anchorIndex], u, v, w }) === 0) continue;
      return {
        armIndices: ordered,
        anchorIndex,
        farIndex,
        firstIndex: uniques[a].i,
        firstBaseIndex: uniques[a].base,
        secondIndex: uniques[b].i,
        secondBaseIndex: uniques[b].base,
        u,
        v,
        w,
      };
    }
  }
  return null;
}

/** Le sens de circulation lu sur la figure, ou null si le repère n'est pas décidable. */
export function tracedSign(cells: Shape): -1 | 1 | null {
  const t = findTrihedron(cells);
  if (t === null) return null;
  const s = tripleSign({ origin: [0, 0, 0], u: t.u, v: t.v, w: t.w });
  return s === 0 ? null : s;
}
