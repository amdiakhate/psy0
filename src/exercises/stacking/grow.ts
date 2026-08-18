import { randInt } from '../../core/rng';
import type { Rng } from '../../core/rng';
import { canonical, isChiral, normalize, orbitSize } from './model';
import type { Cell, Shape } from './model';

/**
 * Fabrique des empilements à la demande, au lieu de piocher dans une liste
 * écrite à la main.
 *
 * Les empilements de Pilotest font une dizaine de cubes : impossible d'en
 * énumérer un catalogue crédible à la main, et un catalogue court se reconnaît
 * au bout de quelques séances — on finit par apprendre les figures au lieu de
 * les tourner mentalement. On les fait donc pousser cube par cube, à partir de
 * la graine de l'item : chaque question a sa propre forme, et le stock est
 * inépuisable.
 */

const NEIGHBOURS: Cell[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const key = (c: Cell) => `${c[0]},${c[1]},${c[2]}`;

/** Croissance par accrétion : on part d'un cube et on en colle un de plus, au hasard, sur une face libre. */
export function growPolycube(rng: Rng, size: number): Shape {
  const cells: Cell[] = [[0, 0, 0]];
  const taken = new Set([key([0, 0, 0])]);

  while (cells.length < size) {
    const frontier: Cell[] = [];
    const seen = new Set<string>();
    for (const c of cells) {
      for (const d of NEIGHBOURS) {
        const n: Cell = [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
        const k = key(n);
        if (taken.has(k) || seen.has(k)) continue;
        seen.add(k);
        frontier.push(n);
      }
    }
    const chosen = frontier[randInt(rng, 0, frontier.length - 1)];
    cells.push(chosen);
    taken.add(key(chosen));
  }
  return normalize(cells);
}

/** Étendue de la forme sur les trois axes. */
export function extent(cells: Shape): [number, number, number] {
  return [0, 1, 2].map((i) => {
    const values = cells.map((c) => c[i]);
    return Math.max(...values) - Math.min(...values) + 1;
  }) as [number, number, number];
}

/**
 * Deux conditions, toutes deux éliminatoires :
 *
 * - CHIRALE — si le miroir est atteignable par une rotation, les trois
 *   empilements sont identiques et la question n'a tout simplement pas de
 *   réponse. C'est la condition d'existence de l'exercice ;
 * - VRAIMENT en trois dimensions — une forme plate se compare de face, comme un
 *   dessin, et l'épreuve mesure alors autre chose que la rotation mentale.
 */
export function isPlayable(cells: Shape): boolean {
  const [dx, dy, dz] = extent(cells);
  if (Math.min(dx, dy, dz) < 2) return false;
  return isChiral(cells);
}

export interface GrownShape {
  cells: Shape;
  /** Identifiant stable de la forme, pour le journal et les tests. */
  name: string;
  size: number;
  /** Orbite de 24 vues : condition des items où les trois vues sont très éloignées. */
  supportsHard: boolean;
}

/**
 * Une forme jouable de la taille demandée. Toujours la même pour une graine
 * donnée — les items doivent rester reproductibles à l'identique.
 */
export function makeShape(rng: Rng, size: number, requireHard = false): GrownShape {
  for (let attempt = 0; attempt < 400; attempt++) {
    const cells = growPolycube(rng, size);
    if (!isPlayable(cells)) continue;
    const orbit = orbitSize(cells);
    if (requireHard && orbit !== 24) continue;
    return { cells, name: shapeName(cells, size), size, supportsHard: orbit === 24 };
  }
  // Inatteignable en pratique : au-delà de 6 cubes, la quasi-totalité des
  // polycubes tirés sont chiraux et d'orbite pleine.
  throw new Error(`Aucune forme jouable de taille ${size} après 400 tirages`);
}

/** Empreinte courte et stable de la forme, invariante par rotation. */
export function shapeName(cells: Shape, size: number): string {
  const c = canonical(cells);
  let h = 2166136261;
  for (let i = 0; i < c.length; i++) {
    h ^= c.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `p${size}-${(h >>> 0).toString(36)}`;
}
