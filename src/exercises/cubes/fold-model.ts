import { POS } from './cube-model';

/**
 * Pliage 3D du patron en croix, paramétré par t ∈ [0, 1].
 *
 * t = 0 : le patron à plat, exactement la disposition de `NetSvg` ;
 * t = 1 : le cube fermé. Entre les deux, chaque face tourne autour de son arête
 * de charnière — et B, accroché au bord extérieur de R, cumule la rotation de R
 * et la sienne, comme en vrai.
 *
 * C'est LE geste que l'épreuve demande d'imaginer. L'animation ne remplace pas
 * la règle des opposées, elle la fonde : on voit une fois pourquoi deux cases
 * séparées d'une case finissent face à face, et la règle cesse d'être un dogme.
 *
 * Le patron est posé dans le plan XZ (x = colonnes, z = lignes), et se plie
 * vers +Y. Les tests vérifient qu'à t = 1 les six faces forment exactement le
 * cube unité [0,1]³ — la géométrie n'est pas « à peu près » : elle est prouvée.
 */

export type V3 = readonly [number, number, number];

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Rotation de Rodrigues du point p autour de la droite (origine o, direction unitaire u). */
export function rotateAboutLine(p: V3, o: V3, u: V3, angleRad: number): V3 {
  const q = sub(p, o);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const term = add(
    add(scale(q, cos), scale(cross(u, q), sin)),
    scale(u, dot(u, q) * (1 - cos)),
  );
  return add(term, o);
}

interface FaceSpec {
  pos: number;
  /** Coin haut-gauche de la case dans le patron À PLAT (repère glyphe : x → colonnes, z → lignes). */
  topLeft: V3;
  /** Charnière : un point de la droite, sa direction, et le signe du pliage. */
  hingePoint: V3;
  hingeDir: V3;
  sign: 1 | -1;
  /** B se plie PAR-DESSUS R : sa charnière vit dans le repère déjà plié de R. */
  parent?: number;
}

/**
 * Disposition de `NetSvg` :   U(1,0) / L(0,1) F(1,1) R(2,1) B(3,1) / D(1,2),
 * transposée en XZ avec F sur [0,1]×[0,1].
 *
 * Tout se plie vers −Y — la face imprimée du patron regarde le lecteur, donc
 * les parois plongent SOUS le plan pour que les symboles finissent à
 * l'extérieur du cube. Plier vers le haut les mettrait dedans, et le cube
 * fermé serait vierge : c'est le test des normales qui garde cette propriété.
 */
export const FACE_SPECS: FaceSpec[] = [
  { pos: POS.F, topLeft: [0, 0, 0], hingePoint: [0, 0, 0], hingeDir: [0, 0, 1], sign: 1 },
  { pos: POS.U, topLeft: [0, 0, -1], hingePoint: [0, 0, 0], hingeDir: [1, 0, 0], sign: -1 },
  { pos: POS.D, topLeft: [0, 0, 1], hingePoint: [0, 0, 1], hingeDir: [1, 0, 0], sign: 1 },
  { pos: POS.L, topLeft: [-1, 0, 0], hingePoint: [0, 0, 0], hingeDir: [0, 0, 1], sign: 1 },
  { pos: POS.R, topLeft: [1, 0, 0], hingePoint: [1, 0, 0], hingeDir: [0, 0, 1], sign: -1 },
  { pos: POS.B, topLeft: [2, 0, 0], hingePoint: [2, 0, 0], hingeDir: [0, 0, 1], sign: -1, parent: POS.R },
];

export interface FoldedFace {
  pos: number;
  /** Les 4 coins dans l'ordre : haut-gauche, haut-droite, bas-droite, bas-gauche (sens du patron). */
  corners: V3[];
  /** Repère du glyphe : origine haut-gauche, u = x du glyphe, v = y du glyphe (vers le bas de la case). */
  origin: V3;
  u: V3;
  v: V3;
  /** Normale sortante (côté face imprimée) — sert à l'éclairage. */
  normal: V3;
}

function transformOf(specByPos: Map<number, FaceSpec>, pos: number, angleRad: number): (p: V3) => V3 {
  const spec = specByPos.get(pos)!;
  const own = (p: V3) => rotateAboutLine(p, spec.hingePoint, spec.hingeDir, spec.sign * angleRad);
  if (spec.parent === undefined) return spec.pos === POS.F ? (p) => p : own;
  const parentT = transformOf(specByPos, spec.parent, angleRad);
  return (p) => parentT(own(p));
}

/** Les six faces pliées à t ∈ [0,1] (0 = à plat, 1 = cube fermé). */
export function foldedFaces(t: number): FoldedFace[] {
  const angle = (Math.min(Math.max(t, 0), 1) * Math.PI) / 2;
  const byPos = new Map(FACE_SPECS.map((s) => [s.pos, s]));

  return FACE_SPECS.map((spec) => {
    const T = transformOf(byPos, spec.pos, angle);
    const [x0, , z0] = spec.topLeft;
    const flat: V3[] = [
      [x0, 0, z0],
      [x0 + 1, 0, z0],
      [x0 + 1, 0, z0 + 1],
      [x0, 0, z0 + 1],
    ];
    const corners = flat.map(T);
    const u = sub(corners[1], corners[0]);
    const v = sub(corners[3], corners[0]);
    // La face imprimée regarde le lecteur quand le patron est à plat (+Y) :
    // l'ordre des coins donne u ∧ v vers −Y, donc la normale imprimée est v ∧ u.
    const n = cross(v, u);
    return { pos: spec.pos, corners, origin: corners[0], u, v, normal: n };
  });
}

/** Centre du cube fermé — sert au tri du peintre et aux tests. */
export const CUBE_CENTER: V3 = [0.5, -0.5, 0.5];
