/**
 * Polycubes et groupe des rotations propres du cube.
 *
 * Un « empilement » est un polycube : un ensemble de cellules entières [x, y, z].
 * Deux empilements sont IDENTIQUES s'ils coïncident à une rotation près (les 24
 * rotations propres) ; le troisième empilement de l'exercice a en plus subi une
 * SYMÉTRIE (réflexion), inatteignable par rotation dès lors que la forme est chirale.
 *
 * Les rotations sont des matrices 3×3 (9 nombres, ligne par ligne) : on a besoin de
 * l'angle de rotation pour mesurer « à quel point » deux vues sont éloignées, ce que
 * de simples fonctions ne permettent pas.
 */

export type Cell = [number, number, number];
export type Shape = Cell[];
/** Matrice 3×3 stockée ligne par ligne. */
export type Mat3 = readonly number[];

export const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

/** Quart de tour autour de X : [x, y, z] → [x, −z, y]. */
const ROT_X: Mat3 = [1, 0, 0, 0, 0, -1, 0, 1, 0];
/** Quart de tour autour de Y : [x, y, z] → [z, y, −x]. */
const ROT_Y: Mat3 = [0, 0, 1, 0, 1, 0, -1, 0, 0];

export function matMul(a: Mat3, b: Mat3): Mat3 {
  const out = new Array<number>(9).fill(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[i * 3 + k] * b[k * 3 + j];
      out[i * 3 + j] = s;
    }
  }
  return out;
}

/** Transposée = inverse, pour une matrice de rotation. */
export function matInverse(m: Mat3): Mat3 {
  return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
}

export function applyMat(m: Mat3, c: Cell): Cell {
  return [
    m[0] * c[0] + m[1] * c[1] + m[2] * c[2],
    m[3] * c[0] + m[4] * c[1] + m[5] * c[2],
    m[6] * c[0] + m[7] * c[1] + m[8] * c[2],
  ];
}

const matKey = (m: Mat3): string => m.join(',');

/**
 * Les 24 rotations propres du cube, engendrées par ROT_X et ROT_Y.
 * Ordre trié par clé : l'énumération est totalement déterministe.
 */
export const ROTATIONS: Mat3[] = (() => {
  const seen = new Map<string, Mat3>();
  seen.set(matKey(IDENTITY), IDENTITY);
  const queue: Mat3[] = [IDENTITY];
  while (queue.length > 0) {
    const m = queue.shift() as Mat3;
    for (const g of [ROT_X, ROT_Y]) {
      const h = matMul(g, m);
      const k = matKey(h);
      if (!seen.has(k)) {
        seen.set(k, h);
        queue.push(h);
      }
    }
  }
  return [...seen.values()].sort((a, b) => (matKey(a) < matKey(b) ? -1 : 1));
})();

/** Angle de la rotation, en degrés (0, 90, 120 ou 180 dans le groupe du cube). */
export function rotationAngleDeg(m: Mat3): number {
  const trace = m[0] + m[4] + m[8];
  const cos = Math.max(-1, Math.min(1, (trace - 1) / 2));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

/** Translate la forme dans le coin positif et trie les cellules : représentation unique. */
export function normalize(cells: Shape): Shape {
  const mins = [0, 1, 2].map((i) => Math.min(...cells.map((c) => c[i])));
  return cells
    .map((c) => [c[0] - mins[0], c[1] - mins[1], c[2] - mins[2]] as Cell)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}

export function serialize(cells: Shape): string {
  return JSON.stringify(normalize(cells));
}

export function rotate(cells: Shape, m: Mat3): Shape {
  return normalize(cells.map((c) => applyMat(m, c)));
}

/** Forme canonique : la plus petite sérialisation parmi les 24 rotations. */
export function canonical(cells: Shape): string {
  return ROTATIONS.map((r) => serialize(cells.map((c) => applyMat(r, c)))).sort()[0];
}

/** Symétrie plane (miroir sur l'axe X). */
export function mirror(cells: Shape): Shape {
  return normalize(cells.map(([x, y, z]) => [-x, y, z] as Cell));
}

/** Même objet à rotation près. Un miroir ne passe PAS ce test si la forme est chirale. */
export function sameShape(a: Shape, b: Shape): boolean {
  return canonical(a) === canonical(b);
}

/** Chiral : le miroir n'est atteignable par aucune rotation — condition de l'exercice. */
export function isChiral(cells: Shape): boolean {
  return canonical(cells) !== canonical(mirror(cells));
}

/** Nombre de vues distinctes de la forme (24 / |stabilisateur|). */
export function orbitSize(cells: Shape): number {
  return new Set(ROTATIONS.map((r) => serialize(cells.map((c) => applyMat(r, c))))).size;
}

/** Les rotations qui laissent la forme inchangée (symétries propres). */
export function stabilizer(cells: Shape): Mat3[] {
  const key = serialize(cells);
  return ROTATIONS.filter((r) => serialize(cells.map((c) => applyMat(r, c))) === key);
}

/**
 * « Combien faut-il tourner la tête » pour passer de la vue Ri d'une forme à la vue Rj
 * d'une (autre) forme : angle minimal de Rj·h·(Ri·g)⁻¹ sur les stabilisateurs g et h.
 * Vaut 0 si et seulement si les deux vues sont pixel pour pixel la même (formes égales).
 */
export function minTurnDeg(ri: Mat3, stabI: Mat3[], rj: Mat3, stabJ: Mat3[]): number {
  let best = 360;
  for (const g of stabI) {
    const inv = matInverse(matMul(ri, g));
    for (const h of stabJ) {
      const a = rotationAngleDeg(matMul(matMul(rj, h), inv));
      if (a < best) best = a;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ *
 * Rendu isométrique — la source unique de vérité de ce que voit l'œil.
 * ------------------------------------------------------------------ */

/** 1 = dessus (+Y), 2 = avant-gauche (+Z), 3 = avant-droite (+X). */
export type IsoFaceKind = 1 | 2 | 3;

export interface IsoFace {
  kind: IsoFaceKind;
  points: Array<[number, number]>;
}

/** Projection isométrique d'un sommet du réseau, cube d'arête 1. */
export function isoProject(x: number, y: number, z: number): [number, number] {
  return [(x - z) * 0.866, (x + z) * 0.5 - y];
}

/**
 * Les faces visibles d'un empilement (3 par cellule : +Y, +Z, +X — le spectateur
 * est dans l'octant +X+Y+Z), triées dans l'ordre du peintre : les plus LOINTAINES
 * d'abord, pour que le dessin des suivantes les recouvre.
 */
export function isoFaces(shape: Shape): IsoFace[] {
  const cells = [...shape].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const faces: IsoFace[] = [];
  const quad = (kind: IsoFaceKind, pts: Array<[number, number, number]>) => {
    faces.push({ kind, points: pts.map(([x, y, z]) => isoProject(x, y, z)) });
  };
  for (const [x, y, z] of cells) {
    quad(1, [[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]]);
    quad(2, [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]]);
    quad(3, [[x + 1, y, z], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z]]);
  }
  return faces;
}

export function isoBounds(faces: IsoFace[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const f of faces) {
    for (const [x, y] of f.points) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, maxX, minY, maxY };
}

function pointInQuad(px: number, py: number, poly: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Empreinte de l'IMAGE isométrique, centrée comme le fait `PolycubeSvg`.
 *
 * C'est le garde-fou décisif de l'exercice : en isométrie certains cubes sont
 * cachés, et deux orientations différentes — voire un empilement ET son miroir —
 * peuvent produire exactement le même dessin. Un item construit sur une telle
 * forme n'aurait pas de réponse. Les tests exigent que chaque forme du pool
 * produise 48 (ou 24 si elle a un axe de symétrie) images DEUX À DEUX distinctes.
 */
export function isoImageKey(shape: Shape, resolution = 64, world = 9): string {
  // Du plus PROCHE au plus lointain : le premier quad touché gagne le pixel.
  const faces = isoFaces(shape).reverse();
  const boxes = faces.map((f) => {
    const xs = f.points.map((p) => p[0]);
    const ys = f.points.map((p) => p[1]);
    return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)] as const;
  });
  const { minX, maxX, minY, maxY } = isoBounds(faces);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const pixels: number[] = [];
  for (let iy = 0; iy < resolution; iy++) {
    const py = cy - world / 2 + ((iy + 0.5) * world) / resolution;
    for (let ix = 0; ix < resolution; ix++) {
      const px = cx - world / 2 + ((ix + 0.5) * world) / resolution;
      let hit = 0;
      for (let f = 0; f < faces.length; f++) {
        const b = boxes[f];
        if (px < b[0] || px > b[1] || py < b[2] || py > b[3]) continue;
        if (pointInQuad(px, py, faces[f].points)) {
          hit = faces[f].kind;
          break;
        }
      }
      pixels.push(hit);
    }
  }
  return pixels.join('');
}

/** Les images isométriques des 24 vues de la forme ET des 24 vues de son miroir. */
export function allIsoImageKeys(shape: Shape): string[] {
  const keys: string[] = [];
  for (const base of [normalize(shape), mirror(shape)]) {
    for (const r of ROTATIONS) keys.push(isoImageKey(rotate(base, r)));
  }
  return keys;
}

