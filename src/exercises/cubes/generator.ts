import { mulberry32, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { LEVELS } from './config';
import type { SymbolFamily } from './config';
import { LETTER_SYMS, SHAPE_SYMS } from './CubeSvg';
import { ALL_ROTATIONS, applyRotation, POS, sameCube, serializeCube } from './cube-model';
import type { Cube, FaceState } from './cube-model';
import { quarterTurn } from './domain/types';
import type { FacePosition } from './domain/types';
import { sameCubeGeometry } from './domain/cubeGeometry';

/**
 * Cubes 2D/3D (règle officielle) : un patron COMPLET est donné à gauche ; un
 * second patron, dans une AUTRE orientation du même cube, a des faces manquantes.
 * Il faut y replacer les bonnes faces pour que le patron de droite représente le
 * même cube que celui de gauche.
 *
 * Les pièces sont proposées À L'ENDROIT et se tournent par clics d'un quart de
 * tour — c'est ce qu'affiche l'écran de jeu. Le candidat doit donc PRODUIRE
 * l'orientation, il ne la reçoit pas. Aucun retournement en miroir n'existe, et
 * il y a exactement autant de pièces que de trous.
 */

/** Une pièce proposée : un symbole, toujours présenté à l'endroit. */
export interface Piece {
  id: number;
  faceId: string;
  originalPosition: FacePosition;
  sym: number;
}

export interface CubesQuestion {
  /** Famille de symboles employée par cette question. */
  family: SymbolFamily;
  /** Le patron de référence, complet. */
  reference: Cube;
  /** Le patron à compléter : mêmes 6 positions, `null` pour les trous. */
  target: (FaceState | null)[];
  /** Positions (0-5) des trous, dans l'ordre d'affichage. */
  holes: FacePosition[];
  /** Pièces proposées, mélangées. Autant que de trous — aucun leurre. */
  pieces: Piece[];
  /** Pour chaque trou, l'id de la pièce qui convient. */
  solution: Record<number, number>;
  /** Pour chaque trou, le nombre de quarts de tour attendu. */
  expectedRot: Record<number, number>;
}

/** Une réponse = pour chaque trou, la pièce posée et le nombre de quarts de tour appliqués. */
export type CubesAnswer = Record<number, { pieceId: number; rot: number }>;

function randomCube(rng: Rng, family: SymbolFamily): Cube {
  const syms = shuffle(rng, family === 'letters' ? LETTER_SYMS : SHAPE_SYMS);
  return syms.map((sym, position) => ({
    id: `face-${position}`,
    originalPosition: position as FacePosition,
    sym,
    rot: quarterTurn(randInt(rng, 0, 3)),
  }));
}

export function generate(seed: number, level: number, forceTag?: string): Item<CubesQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  let family = cfg.family;
  if (forceTag === 'letters') family = 'letters';
  if (forceTag === 'shapes') family = 'shapes';

  const reference = randomCube(rng, family);
  // Le patron à compléter est le MÊME cube dans une autre orientation : c'est ce
  // qui force à raisonner sur le pliage plutôt qu'à recopier case par case.
  let oriented = applyRotation(reference, ALL_ROTATIONS[randInt(rng, 1, 23)]);
  // Sécurité : une orientation distincte du patron de référence.
  if (serializeCube(oriented) === serializeCube(reference)) {
    oriented = applyRotation(reference, ALL_ROTATIONS[1]);
  }

  // `holes` est une liste de positions 0-5 : on la type en number[] pour
  // pouvoir la confronter aux index de `oriented.map`/`filter`.
  const holes: FacePosition[] = shuffle(rng, [POS.F, POS.U, POS.R, POS.L, POS.D, POS.B])
    .slice(0, cfg.holes)
    .sort((a, b) => a - b);
  const target: (FaceState | null)[] = oriented.map((f, i) =>
    holes.includes(i as FacePosition) ? null : { ...f },
  );

  // Une pièce par trou, et rien de plus : Pilotest ne propose aucun leurre, ce
  // qui rend le raisonnement par élimination légitime — toutes les pièces
  // doivent servir. Elles sont présentées À L'ENDROIT ; c'est au candidat de
  // les tourner d'un quart de tour jusqu'à la bonne orientation.
  const pieces: Piece[] = [];
  const solution: Record<number, number> = {};
  const expectedRot: Record<number, number> = {};
  let nextId = 0;
  for (const hole of holes) {
    const piece: Piece = {
      id: nextId++,
      faceId: oriented[hole].id,
      originalPosition: oriented[hole].originalPosition,
      sym: oriented[hole].sym,
    };
    pieces.push(piece);
    solution[hole] = piece.id;
    expectedRot[hole] = oriented[hole].rot;
  }

  return {
    question: { family, reference, target, holes, pieces: shuffle(rng, pieces), solution, expectedRot },
    seed,
    level,
    tags: [`holes-${cfg.holes}`, family, 'symbol-orientation'],
  };
}

/**
 * Valide : chaque trou reçoit une pièce, tournée d'un certain nombre de quarts
 * de tour, et le patron ainsi complété doit représenter le même cube que la
 * référence. La comparaison passe par `sameCube`, qui normalise la rotation
 * selon la symétrie du symbole — l'orientation d'un carré ou d'un cercle ne
 * compte donc pas, celle d'une lettre si.
 */
export function completeCube(question: CubesQuestion, answer: CubesAnswer): Cube | null {
  const { holes, pieces, target } = question;
  const filled = target.map((f) => (f === null ? null : { ...f }));
  const used = new Set<number>();

  for (const hole of holes) {
    const placed = answer[hole];
    if (!placed) return null;
    if (used.has(placed.pieceId)) return null; // une pièce ne sert qu'une fois
    used.add(placed.pieceId);
    const piece = pieces.find((p) => p.id === placed.pieceId);
    if (!piece) return null;
    filled[hole] = {
      id: piece.faceId,
      originalPosition: piece.originalPosition,
      sym: piece.sym,
      rot: quarterTurn(placed.rot),
    };
  }

  if (filled.some((f) => f === null)) return null;
  return filled as Cube;
}

/** Ancienne source de vérité, gardée pendant et après la migration différentielle. */
export function validateLegacy(item: Item<CubesQuestion>, answer: CubesAnswer): boolean {
  const filled = completeCube(item.question, answer);
  return filled !== null && sameCube(filled, item.question.reference);
}

/** Nouveau verdict identitaire, exécuté en parallèle avant la bascule. */
export function validateGeometry(item: Item<CubesQuestion>, answer: CubesAnswer): boolean {
  const filled = completeCube(item.question, answer);
  return filled !== null && sameCubeGeometry(filled, item.question.reference);
}

export function validate(item: Item<CubesQuestion>, answer: CubesAnswer): boolean {
  return validateGeometry(item, answer);
}

/** La solution attendue, sous la forme d'une réponse valide. */
export function solutionAnswer(q: CubesQuestion): CubesAnswer {
  const out: CubesAnswer = {};
  for (const hole of q.holes) {
    const piece = q.pieces.find((p) => p.id === q.solution[hole])!;
    // L'orientation attendue est celle de la face du patron orienté ; elle a été
    // effacée de `target` (c'est un trou), on la relit donc dans la référence
    // via la face que la pièce doit reproduire.
    out[hole] = { pieceId: piece.id, rot: q.expectedRot[hole] };
  }
  return out;
}
