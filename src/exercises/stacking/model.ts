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

/**
 * La figure REMISE dans son orientation canonique.
 *
 * Deux figures qui ne diffèrent que d'une rotation donnent ici EXACTEMENT le
 * même résultat ; leur miroir en donne un autre. C'est ce qui permet de
 * démontrer une réponse sans rien demander à l'œil : une fois les trois
 * empilements ramenés à la même orientation, la paire devient superposable au
 * pixel près, et le symétrique ne l'est pas.
 */
export function alignToCanonical(cells: Shape): Shape {
  const target = canonical(cells);
  for (const r of ROTATIONS) {
    const turned = normalize(cells.map((c) => applyMat(r, c)));
    if (serialize(turned) === target) return turned;
  }
  return normalize(cells); // inatteignable : la canonique EST l'une des 24.
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
  /** Éclairement de la face, dans [0, 1] — 0 à l'ombre, 1 en pleine lumière. */
  shade: number;
  /** Index (dans la forme) de la cellule qui porte cette face — pour colorer un cube isolément. */
  cell: number;
  points: Array<[number, number]>;
}

export type Vec3 = readonly [number, number, number];

/**
 * Direction du spectateur dans la projection isométrique : l'octant +X+Y+Z.
 * (Une direction v se projette sur (0,0) ssi v est colinéaire à (1,1,1).)
 */
export const VIEW_DIR: Vec3 = [1, 1, 1];

/**
 * Lumière unique, haute et légèrement décalée : elle sépare nettement le dessus
 * des deux flancs, et c'est ce contraste franc qui donne le relief — sur cet
 * exercice, lire le relief EST la tâche.
 *
 * Une seconde source placée côté spectateur avait été essayée pour éviter qu'un
 * empilement mal incliné ne s'assombrisse : elle rattrapait bien la luminosité,
 * mais en rapprochant les trois familles de faces d'un même rouge moyen, elle
 * aplatissait les figures. Un simple plancher suffit : rien ne tombe au noir
 * pur, et l'écart entre les faces reste entier.
 */
const LIGHT: Vec3 = [0.2, 1, 0.45];
const AMBIENT = 0.1;

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function unit(v: Vec3): Vec3 {
  const n = Math.hypot(v[0], v[1], v[2]);
  return n === 0 ? v : [v[0] / n, v[1] / n, v[2] / n];
}

const LIGHT_UNIT = unit(LIGHT);

/**
 * Rotation CONTINUE, hors du groupe des 24 : lacet autour de la verticale,
 * tangage, puis roulis. C'est l'inclinaison de PRÉSENTATION — celle qui, chez
 * Pilotest, fait qu'aucun empilement n'est posé bien droit et qu'on ne peut pas
 * apparier les figures en comparant des contours familiers.
 */
export function tiltMatrix(yawDeg: number, pitchDeg: number, rollDeg: number): Mat3 {
  const [cy, sy] = [Math.cos((yawDeg * Math.PI) / 180), Math.sin((yawDeg * Math.PI) / 180)];
  const [cp, sp] = [Math.cos((pitchDeg * Math.PI) / 180), Math.sin((pitchDeg * Math.PI) / 180)];
  const [cr, sr] = [Math.cos((rollDeg * Math.PI) / 180), Math.sin((rollDeg * Math.PI) / 180)];
  const ry: Mat3 = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const rx: Mat3 = [1, 0, 0, 0, cp, -sp, 0, sp, cp];
  const rz: Mat3 = [cr, -sr, 0, sr, cr, 0, 0, 0, 1];
  return matMul(rz, matMul(rx, ry));
}

/** Applique une matrice à un point à coordonnées réelles (les cellules sont entières). */
function applyReal(m: Mat3, p: Vec3): Vec3 {
  return [
    m[0] * p[0] + m[1] * p[1] + m[2] * p[2],
    m[3] * p[0] + m[4] * p[1] + m[5] * p[2],
    m[6] * p[0] + m[7] * p[1] + m[8] * p[2],
  ];
}

/** Les 6 faces d'un cube unité : normale sortante, famille d'axe, sommets. */
const CUBE_FACES: Array<{ n: Vec3; d: Cell; kind: IsoFaceKind; corners: Vec3[] }> = [
  { n: [0, 1, 0], d: [0, 1, 0], kind: 1, corners: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
  { n: [0, -1, 0], d: [0, -1, 0], kind: 1, corners: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
  { n: [0, 0, 1], d: [0, 0, 1], kind: 2, corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { n: [0, 0, -1], d: [0, 0, -1], kind: 2, corners: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] },
  { n: [1, 0, 0], d: [1, 0, 0], kind: 3, corners: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]] },
  { n: [-1, 0, 0], d: [-1, 0, 0], kind: 3, corners: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
];

/** Projection isométrique d'un sommet du réseau, cube d'arête 1. */
export function isoProject(x: number, y: number, z: number): [number, number] {
  return [(x - z) * 0.866, (x + z) * 0.5 - y];
}

/**
 * Les faces visibles d'un empilement, incliné de `tilt`, dans l'ordre du
 * peintre — les plus lointaines d'abord.
 *
 * Trois filtres successifs, dans cet ordre :
 *  1. les faces INTERNES (collées à un cube voisin) ne sont pas émises ;
 *  2. les faces tournant le DOS au spectateur sont écartées ;
 *  3. le reste est trié par profondeur le long de l'axe de vue.
 *
 * Avec `tilt = IDENTITY` on retrouve exactement les trois faces +Y, +Z, +X de
 * la projection isométrique classique : la généralisation ne change rien au cas
 * particulier d'où elle vient.
 */
export function isoFaces(shape: Shape, tilt: Mat3 = IDENTITY): IsoFace[] {
  const occupied = new Set(shape.map(([x, y, z]) => `${x},${y},${z}`));
  // La vue est fixe et l'objet tourne : on incline l'objet, pas le regard.
  const viewFixed: Vec3 = unit(VIEW_DIR);

  const out: Array<{ face: IsoFace; depth: number }> = [];
  for (let ci = 0; ci < shape.length; ci++) {
    const [x, y, z] = shape[ci];
    for (const f of CUBE_FACES) {
      if (occupied.has(`${x + f.d[0]},${y + f.d[1]},${z + f.d[2]}`)) continue;
      const n = unit(applyReal(tilt, f.n) as Vec3);
      if (dot(n, viewFixed) <= 1e-9) continue;
      const pts = f.corners.map((c) => applyReal(tilt, [x + c[0], y + c[1], z + c[2]] as Vec3));
      const depth = pts.reduce((sum, p) => sum + dot(p as Vec3, viewFixed), 0) / pts.length;
      out.push({
        face: {
          kind: f.kind,
          shade: AMBIENT + (1 - AMBIENT) * Math.max(0, dot(n, LIGHT_UNIT)),
          cell: ci,
          points: pts.map((p) => isoProject(p[0], p[1], p[2])),
        },
        depth,
      });
    }
  }
  out.sort((a, b) => a.depth - b.depth);
  return out.map((o) => o.face);
}

/**
 * Côté du viewBox (en unités cube) contenant toutes ces figures inclinées.
 * Une échelle COMMUNE est indispensable : si chaque empilement était mis à sa
 * propre échelle, la taille des cubes deviendrait un indice — et le candidat
 * apparierait les figures sans les tourner.
 */
export function worldSizeFor(entries: Array<{ shape: Shape; tilt?: Mat3 }>): number {
  let side = 0;
  for (const e of entries) {
    const { minX, maxX, minY, maxY } = isoBounds(isoFaces(e.shape, e.tilt ?? IDENTITY));
    side = Math.max(side, maxX - minX, maxY - minY);
  }
  return side + 0.7;
}

/** Centre du cube d'une cellule — les flèches de la leçon partent des centres, pas des coins. */
export function cellCenterOf(c: Cell): [number, number, number] {
  return [c[0] + 0.5, c[1] + 0.5, c[2] + 0.5];
}

/** Projette un point réel (coordonnées cube) après inclinaison — pour dessiner PAR-DESSUS les faces. */
export function projectPoint(p: readonly [number, number, number], tilt: Mat3 = IDENTITY): [number, number] {
  const q = [
    tilt[0] * p[0] + tilt[1] * p[1] + tilt[2] * p[2],
    tilt[3] * p[0] + tilt[4] * p[1] + tilt[5] * p[2],
    tilt[6] * p[0] + tilt[7] * p[1] + tilt[8] * p[2],
  ] as const;
  return isoProject(q[0], q[1], q[2]);
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
/**
 * Rasterise l'IMAGE réellement affichée : un octet par pixel, 0 pour le vide et
 * la famille de face sinon.
 *
 * C'est le garde-fou décisif de l'exercice. En projection, des cubes en cachent
 * d'autres : deux orientations différentes — voire un empilement ET son miroir —
 * peuvent se dessiner exactement pareil. Un item construit là-dessus n'aurait
 * pas de réponse, et le candidat chercherait une différence qui n'existe pas.
 */
export function rasterize(shape: Shape, tilt: Mat3 = IDENTITY, resolution = 48, world = 9): Uint8Array {
  // Du plus PROCHE au plus lointain : le premier quad touché gagne le pixel.
  const faces = isoFaces(shape, tilt).reverse();
  const boxes = faces.map((f) => {
    const xs = f.points.map((p) => p[0]);
    const ys = f.points.map((p) => p[1]);
    return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)] as const;
  });
  const { minX, maxX, minY, maxY } = isoBounds(faces);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const pixels = new Uint8Array(resolution * resolution);
  for (let iy = 0; iy < resolution; iy++) {
    const py = cy - world / 2 + ((iy + 0.5) * world) / resolution;
    for (let ix = 0; ix < resolution; ix++) {
      const px = cx - world / 2 + ((ix + 0.5) * world) / resolution;
      for (let f = 0; f < faces.length; f++) {
        const b = boxes[f];
        if (px < b[0] || px > b[1] || py < b[2] || py > b[3]) continue;
        if (pointInQuad(px, py, faces[f].points)) {
          pixels[iy * resolution + ix] = faces[f].kind;
          break;
        }
      }
    }
  }
  return pixels;
}

/** Proportion de pixels qui diffèrent entre deux images de même taille. */
export function imageDistance(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) throw new Error('Images de tailles différentes');
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff / a.length;
}

export function isoImageKey(shape: Shape, resolution = 64, world = 9): string {
  return rasterize(shape, IDENTITY, resolution, world).join('');
}

/** Les images isométriques des 24 vues de la forme ET des 24 vues de son miroir. */
export function allIsoImageKeys(shape: Shape): string[] {
  const keys: string[] = [];
  for (const base of [normalize(shape), mirror(shape)]) {
    for (const r of ROTATIONS) keys.push(isoImageKey(rotate(base, r)));
  }
  return keys;
}
