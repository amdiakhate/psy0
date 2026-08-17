import { mulberry32, pick, randInt } from '../../core/rng';
import type { Item } from '../../core/types';
import { EASY_MAX_TURN_DEG, HARD_MIN_TURN_DEG, LEVELS } from './config';
import { SHAPES } from './data';
import type { PolycubeDef } from './data';
import { ROTATIONS, minTurnDeg, mirror, rotate, stabilizer } from './model';
import type { Mat3, Shape } from './model';

export interface StackingQuestion {
  /** Les 3 empilements affichés, dans l'ordre 1, 2, 3. Cellules entières normalisées. */
  stacks: Shape[];
  /** Index 0-2 de l'empilement qui a subi la SYMÉTRIE — la réponse. */
  answerIndex: number;
  /** Polycube de base (traçabilité / tests). */
  shapeName: string;
  size: number;
  /** Écart de rotation entre les deux empilements identiques, en degrés. */
  pairTurnDeg: number;
  /** Écart minimal entre les trois vues, en degrés. */
  minTurnDeg: number;
}

/** Index 0-2 de l'empilement désigné. */
export type StackingAnswer = number;

interface ShapeCache {
  def: PolycubeDef;
  /** Les 24 vues du polycube de base et de son miroir. */
  viewsBase: Shape[];
  viewsMirror: Shape[];
  /** gapBB[i][j] : rotation minimale menant de la vue i à la vue j du polycube. */
  gapBB: number[][];
  /** gapBM[i][k] : écart d'orientation entre la vue i du polycube et la vue k du miroir. */
  gapBM: number[][];
}

const CACHE = new Map<string, ShapeCache>();

function cacheFor(def: PolycubeDef): ShapeCache {
  const hit = CACHE.get(def.name);
  if (hit) return hit;

  const mirrored = mirror(def.cells);
  const stabBase: Mat3[] = stabilizer(def.cells);
  const stabMirror: Mat3[] = stabilizer(mirrored);

  const viewsBase = ROTATIONS.map((r) => rotate(def.cells, r));
  const viewsMirror = ROTATIONS.map((r) => rotate(mirrored, r));

  const gapBB: number[][] = [];
  const gapBM: number[][] = [];
  for (let i = 0; i < ROTATIONS.length; i++) {
    gapBB.push([]);
    gapBM.push([]);
    for (let j = 0; j < ROTATIONS.length; j++) {
      gapBB[i].push(minTurnDeg(ROTATIONS[i], stabBase, ROTATIONS[j], stabBase));
      gapBM[i].push(minTurnDeg(ROTATIONS[i], stabBase, ROTATIONS[j], stabMirror));
    }
  }

  const entry: ShapeCache = { def, viewsBase, viewsMirror, gapBB, gapBM };
  CACHE.set(def.name, entry);
  return entry;
}

interface Triple {
  /** Rotations des deux empilements IDENTIQUES. */
  i: number;
  j: number;
  /** Rotation de l'empilement MIROIR. */
  k: number;
}

function tripleOk(c: ShapeCache, t: Triple, hard: boolean): boolean {
  const gij = c.gapBB[t.i][t.j];
  // Les deux copies doivent être visiblement différentes : écart nul = même image.
  if (gij === 0) return false;
  if (!hard) return gij <= EASY_MAX_TURN_DEG;
  const gik = c.gapBM[t.i][t.k];
  const gjk = c.gapBM[t.j][t.k];
  return Math.min(gij, gik, gjk) >= HARD_MIN_TURN_DEG;
}

/** Recherche aléatoire (déterministe) puis balayage exhaustif : ne renvoie jamais null. */
function findTriple(rng: () => number, c: ShapeCache, hard: boolean): Triple {
  const n = ROTATIONS.length;
  for (let attempt = 0; attempt < 500; attempt++) {
    const t: Triple = { i: randInt(rng, 0, n - 1), j: randInt(rng, 0, n - 1), k: randInt(rng, 0, n - 1) };
    if (tripleOk(c, t, hard)) return t;
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        const t = { i, j, k };
        if (tripleOk(c, t, hard)) return t;
      }
    }
  }
  // Inatteignable : un quart de tour existe toujours pour toute forme non symétrique.
  throw new Error(`Aucune orientation valide pour ${c.def.name} (hard=${hard})`);
}

export function generate(seed: number, level: number, forceTag?: string): Item<StackingQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  let hard = rng() < cfg.hardRatio;
  if (forceTag === 'hard-orientation') hard = true;
  if (forceTag === 'easy-orientation') hard = false;

  const forcedSize = forceTag?.startsWith('size-') ? Number(forceTag.slice(5)) : null;

  let pool = SHAPES.filter((s) => cfg.sizes.includes(s.size) && (!hard || s.supportsHard));
  if (forcedSize != null) {
    const bySize = SHAPES.filter((s) => s.size === forcedSize && (!hard || s.supportsHard));
    if (bySize.length > 0) pool = bySize;
  }
  // Le tétracube « vis » ne peut pas produire trois vues deux à deux ≥ 120° :
  // un item difficile remonte alors au premier pool capable de le faire.
  if (pool.length === 0) pool = SHAPES.filter((s) => s.supportsHard);

  const def = pick(rng, pool);
  const cache = cacheFor(def);
  const t = findTriple(rng, cache, hard);

  const mirrorSlot = randInt(rng, 0, 2);
  const pairOrder = rng() < 0.5 ? [t.i, t.j] : [t.j, t.i];

  const stacks: Shape[] = [];
  let taken = 0;
  for (let slot = 0; slot < 3; slot++) {
    stacks.push(slot === mirrorSlot ? cache.viewsMirror[t.k] : cache.viewsBase[pairOrder[taken++]]);
  }

  const pairTurnDeg = cache.gapBB[t.i][t.j];
  const minTurn = Math.min(pairTurnDeg, cache.gapBM[t.i][t.k], cache.gapBM[t.j][t.k]);

  return {
    question: {
      stacks,
      answerIndex: mirrorSlot,
      shapeName: def.name,
      size: def.size,
      pairTurnDeg,
      minTurnDeg: minTurn,
    },
    seed,
    level,
    tags: [`size-${def.size}`, hard ? 'hard-orientation' : 'easy-orientation'],
  };
}

export function validate(item: Item<StackingQuestion>, answer: StackingAnswer): boolean {
  return answer === item.question.answerIndex;
}
