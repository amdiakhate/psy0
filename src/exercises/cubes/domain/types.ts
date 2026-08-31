export type FaceId = string;
export type FacePosition = 0 | 1 | 2 | 3 | 4 | 5;
export type QuarterTurn = 0 | 1 | 2 | 3;
export type FaceEdge = 'top' | 'right' | 'bottom' | 'left';
export type Vec3 = readonly [number, number, number];

export interface CubeFace {
  /** Identité physique stable, indépendante du symbole dessiné. */
  id: FaceId;
  sym: number;
  /** Quarts de tour anti-horaires dans le repère local de la face. */
  rot: QuarterTurn;
  /** Position de cette face dans le patron de référence avant toute rotation. */
  originalPosition: FacePosition;
}

/** Six positions dans l’ordre R, L, U, D, F, B. */
export type Cube = CubeFace[];

export interface FaceFrame {
  normal: Vec3;
  right: Vec3;
  up: Vec3;
}

export interface SharedEdge {
  aEdge: FaceEdge;
  bEdge: FaceEdge;
}

export function quarterTurn(value: number): QuarterTurn {
  return (((value % 4) + 4) % 4) as QuarterTurn;
}
