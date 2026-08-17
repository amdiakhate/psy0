import { mulberry32, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { LEVELS } from './config';
import { ALL_ROTATIONS, applyRotation, POS, sameCube, serializeCube } from './cube-model';
import type { Cube, FaceState } from './cube-model';

/**
 * Cubes 2D/3D (règle officielle) : un patron COMPLET est donné à gauche ; un
 * second patron, dans une AUTRE orientation du même cube, a des faces manquantes.
 * Il faut replacer les bonnes faces (parfois RETOURNÉES) pour que le patron de
 * droite représente bien le même cube que celui de gauche.
 */

/** Une pièce proposée : un symbole avec son orientation, éventuellement à retourner. */
export interface Piece {
  id: number;
  sym: number;
  rot: number;
  /** true si la pièce est présentée en miroir : il faudra la retourner (clic) pour l'utiliser. */
  mirrored: boolean;
}

export interface CubesQuestion {
  /** Le patron de référence, complet. */
  reference: Cube;
  /** Le patron à compléter : mêmes 6 positions, `null` pour les trous. */
  target: (FaceState | null)[];
  /** Positions (0-5) des trous, dans l'ordre d'affichage. */
  holes: number[];
  /** Pièces proposées (utiles + leurres), mélangées. */
  pieces: Piece[];
  /** Pour chaque trou, l'id de la pièce qui convient. */
  solution: Record<number, number>;
}

/** Une réponse = pour chaque trou, la pièce posée et son état retourné ou non. */
export type CubesAnswer = Record<number, { pieceId: number; flipped: boolean }>;

function randomCube(rng: Rng): Cube {
  const syms = shuffle(rng, [0, 1, 2, 3, 4, 5]);
  return syms.map((sym) => ({ sym, rot: randInt(rng, 0, 3) }));
}

export function generate(seed: number, level: number, forceTag?: string): Item<CubesQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  let flippable = cfg.flippable;
  if (forceTag === 'flip') flippable = true;
  if (forceTag === 'no-flip') flippable = false;

  const reference = randomCube(rng);
  // Le patron à compléter est le MÊME cube dans une autre orientation : c'est ce
  // qui force à raisonner sur le pliage plutôt qu'à recopier case par case.
  let oriented = applyRotation(reference, ALL_ROTATIONS[randInt(rng, 1, 23)]);
  // Sécurité : une orientation distincte du patron de référence.
  if (serializeCube(oriented) === serializeCube(reference)) {
    oriented = applyRotation(reference, ALL_ROTATIONS[1]);
  }

  // `holes` est une liste de positions 0-5 : on la type en number[] pour
  // pouvoir la confronter aux index de `oriented.map`/`filter`.
  const holes: number[] = shuffle(rng, [POS.F, POS.U, POS.R, POS.L, POS.D, POS.B])
    .slice(0, cfg.holes)
    .sort((a, b) => a - b);
  const target: (FaceState | null)[] = oriented.map((f, i) => (holes.includes(i) ? null : { ...f }));

  // Une pièce utile par trou : le symbole ET son orientation exacte.
  const pieces: Piece[] = [];
  const solution: Record<number, number> = {};
  let nextId = 0;
  for (const hole of holes) {
    const face = oriented[hole];
    const mirrored = flippable && rng() < 0.5;
    const piece: Piece = { id: nextId++, sym: face.sym, rot: face.rot, mirrored };
    pieces.push(piece);
    solution[hole] = piece.id;
  }

  // Leurres : même symbole mais mauvaise orientation, ou symbole d'une face déjà
  // posée. Deux pièces de même (symbole, orientation) seraient interchangeables —
  // la solution ne serait plus unique — donc on dédoublonne sur cette clé.
  const taken = new Set(pieces.map((p) => `${p.sym}.${p.rot}`));
  const visible = oriented.filter((_, idx) => !holes.includes(idx));
  for (let i = 0; i < cfg.decoys; i++) {
    let candidate: { sym: number; rot: number } | null = null;
    for (let attempt = 0; attempt < 30 && candidate === null; attempt++) {
      const useOrientationTrap = rng() < 0.6;
      const c = useOrientationTrap
        ? (() => {
            const base = pieces[randInt(rng, 0, pieces.length - 1)];
            return { sym: base.sym, rot: (base.rot + randInt(rng, 1, 3)) % 4 };
          })()
        : (() => {
            const f = visible[randInt(rng, 0, visible.length - 1)];
            return { sym: f.sym, rot: f.rot };
          })();
      if (!taken.has(`${c.sym}.${c.rot}`)) candidate = c;
    }
    if (candidate === null) continue;
    taken.add(`${candidate.sym}.${candidate.rot}`);
    pieces.push({
      id: nextId++,
      sym: candidate.sym,
      rot: candidate.rot,
      mirrored: flippable && rng() < 0.5,
    });
  }

  return {
    question: { reference, target, holes, pieces: shuffle(rng, pieces), solution },
    seed,
    level,
    tags: [
      `holes-${cfg.holes}`,
      flippable ? 'flip' : 'no-flip',
      'symbol-orientation',
    ],
  };
}

/**
 * Valide : chaque trou doit recevoir une pièce dont le symbole ET l'orientation
 * correspondent à la face attendue, la pièce miroir devant avoir été retournée.
 */
export function validate(item: Item<CubesQuestion>, answer: CubesAnswer): boolean {
  const { holes, pieces, target, reference } = item.question;
  const filled = target.map((f) => (f === null ? null : { ...f }));
  const used = new Set<number>();

  for (const hole of holes) {
    const placed = answer[hole];
    if (!placed) return false;
    if (used.has(placed.pieceId)) return false; // une pièce ne sert qu'une fois
    used.add(placed.pieceId);
    const piece = pieces.find((p) => p.id === placed.pieceId);
    if (!piece) return false;
    // Une pièce présentée en miroir n'est utilisable QUE retournée, et inversement.
    if (piece.mirrored !== placed.flipped) return false;
    filled[hole] = { sym: piece.sym, rot: piece.rot };
  }

  if (filled.some((f) => f === null)) return false;
  // Le patron complété doit représenter le même cube que la référence.
  return sameCube(filled as Cube, reference);
}

/** La solution attendue, sous la forme d'une réponse valide. */
export function solutionAnswer(q: CubesQuestion): CubesAnswer {
  const out: CubesAnswer = {};
  for (const hole of q.holes) {
    const piece = q.pieces.find((p) => p.id === q.solution[hole])!;
    out[hole] = { pieceId: piece.id, flipped: piece.mirrored };
  }
  return out;
}
