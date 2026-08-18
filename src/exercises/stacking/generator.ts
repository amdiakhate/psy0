import { mulberry32, randInt } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import {
  EASY_MAX_TURN_DEG,
  HARD_MIN_TURN_DEG,
  LEVELS,
  MIN_IMAGE_DIFF,
  RASTER_RESOLUTION,
  TILT_PITCH_MAX_DEG,
  TILT_ROLL_MAX_DEG,
} from './config';
import { makeShape } from './grow';
import {
  IDENTITY,
  ROTATIONS,
  imageDistance,
  matMul,
  minTurnDeg,
  mirror,
  rasterize,
  rotate,
  stabilizer,
  tiltMatrix,
  worldSizeFor,
} from './model';
import type { Mat3, Shape } from './model';

export interface StackingQuestion {
  /** Les 3 empilements affichés, dans l'ordre 1, 2, 3. Cellules entières normalisées. */
  stacks: Shape[];
  /** Inclinaison de présentation propre à chaque empilement (voir config). */
  tilts: Mat3[];
  /** Index 0-2 de l'empilement qui a subi la SYMÉTRIE — la réponse. */
  answerIndex: number;
  /** Empreinte de la forme de base (traçabilité / tests). */
  shapeName: string;
  size: number;
  /** Écart PERÇU entre les deux empilements identiques, inclinaison comprise. */
  pairTurnDeg: number;
  /** Écart perçu minimal entre les trois vues. */
  minTurnDeg: number;
}

/** Index 0-2 de l'empilement désigné. */
export type StackingAnswer = number;

interface Triple {
  /** Rotations des deux empilements IDENTIQUES. */
  i: number;
  j: number;
  /** Rotation de l'empilement MIROIR. */
  k: number;
}

interface Context {
  cells: Shape;
  stabBase: Mat3[];
  stabMirror: Mat3[];
  viewsBase: Shape[];
  viewsMirror: Shape[];
  gapBB: number[][];
  gapBM: number[][];
}

function contextFor(cells: Shape): Context {
  const mirrored = mirror(cells);
  const stabBase = stabilizer(cells);
  const stabMirror = stabilizer(mirrored);
  const viewsBase = ROTATIONS.map((r) => rotate(cells, r));
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
  return { cells, stabBase, stabMirror, viewsBase, viewsMirror, gapBB, gapBM };
}

function tripleOk(c: Context, t: Triple, hard: boolean): boolean {
  const gij = c.gapBB[t.i][t.j];
  // Les deux copies doivent être visiblement différentes : écart nul = même image.
  if (gij === 0) return false;
  if (!hard) return gij <= EASY_MAX_TURN_DEG;
  return Math.min(gij, c.gapBM[t.i][t.k], c.gapBM[t.j][t.k]) >= HARD_MIN_TURN_DEG;
}

/** Recherche aléatoire (déterministe) puis balayage exhaustif : ne renvoie jamais null. */
function findTriple(rng: Rng, c: Context, hard: boolean): Triple {
  const n = ROTATIONS.length;
  for (let attempt = 0; attempt < 500; attempt++) {
    const t: Triple = { i: randInt(rng, 0, n - 1), j: randInt(rng, 0, n - 1), k: randInt(rng, 0, n - 1) };
    if (tripleOk(c, t, hard)) return t;
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (tripleOk(c, { i, j, k }, hard)) return { i, j, k };
      }
    }
  }
  throw new Error(`Aucune orientation valide (hard=${hard})`);
}

function sampleTilt(rng: Rng, amplitude: number): Mat3 {
  return tiltMatrix(
    rng() * 360,
    (rng() * 2 - 1) * TILT_PITCH_MAX_DEG * amplitude,
    (rng() * 2 - 1) * TILT_ROLL_MAX_DEG * amplitude,
  );
}

interface Layout {
  stacks: Shape[];
  tilts: Mat3[];
  /** Orientation effective de chaque empilement affiché : inclinaison ∘ rotation. */
  poses: Mat3[];
  stabs: Mat3[][];
}

/** Écart perçu entre deux empilements affichés — c'est celui que l'œil doit franchir. */
function perceivedGap(layout: Layout, a: number, b: number): number {
  return minTurnDeg(layout.poses[a], layout.stabs[a], layout.poses[b], layout.stabs[b]);
}

function layoutOk(layout: Layout, hard: boolean, pairA: number, pairB: number): boolean {
  const gij = perceivedGap(layout, pairA, pairB);
  if (gij === 0) return false;
  if (hard) {
    const others = [0, 1, 2].filter((s) => s !== pairA && s !== pairB);
    const k = others[0];
    if (Math.min(gij, perceivedGap(layout, pairA, k), perceivedGap(layout, pairB, k)) < HARD_MIN_TURN_DEG) {
      return false;
    }
  } else if (gij > EASY_MAX_TURN_DEG) {
    return false;
  }

  // Garde-fou décisif : trois DESSINS trop proches rendent l'item indécidable.
  const world = worldSizeFor(layout.stacks.map((shape, s) => ({ shape, tilt: layout.tilts[s] })));
  const images = layout.stacks.map((shape, s) =>
    rasterize(shape, layout.tilts[s], RASTER_RESOLUTION, world),
  );
  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 3; b++) {
      if (imageDistance(images[a], images[b]) < MIN_IMAGE_DIFF) return false;
    }
  }
  return true;
}

export function generate(seed: number, level: number, forceTag?: string): Item<StackingQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  let hard = rng() < cfg.hardRatio;
  if (forceTag === 'hard-orientation') hard = true;
  if (forceTag === 'easy-orientation') hard = false;

  const forcedSize = forceTag?.startsWith('size-') ? Number(forceTag.slice(5)) : null;
  const size =
    forcedSize !== null && Number.isFinite(forcedSize) && forcedSize >= 4
      ? forcedSize
      : cfg.sizes[randInt(rng, 0, cfg.sizes.length - 1)];

  const shape = makeShape(rng, size, hard);
  const ctx = contextFor(shape.cells);
  const t = findTriple(rng, ctx, hard);

  const mirrorSlot = randInt(rng, 0, 2);
  const pairOrder = rng() < 0.5 ? [t.i, t.j] : [t.j, t.i];

  const stacks: Shape[] = [];
  const rotations: Mat3[] = [];
  const stabs: Mat3[][] = [];
  let taken = 0;
  for (let slot = 0; slot < 3; slot++) {
    if (slot === mirrorSlot) {
      stacks.push(ctx.viewsMirror[t.k]);
      rotations.push(ROTATIONS[t.k]);
      stabs.push(ctx.stabMirror);
    } else {
      const r = pairOrder[taken++];
      stacks.push(ctx.viewsBase[r]);
      rotations.push(ROTATIONS[r]);
      stabs.push(ctx.stabBase);
    }
  }
  const [pairA, pairB] = [0, 1, 2].filter((s) => s !== mirrorSlot);

  const build = (tilts: Mat3[]): Layout => ({
    stacks,
    tilts,
    poses: tilts.map((tilt, s) => matMul(tilt, rotations[s])),
    stabs,
  });

  // L'inclinaison peut rapprocher ou éloigner deux vues au point de sortir de la
  // difficulté visée, voire de rendre deux dessins presque identiques. On la
  // retire donc progressivement jusqu'à retomber sur un item valide, plutôt que
  // de servir un item que le candidat ne pourrait pas trancher.
  let layout: Layout | null = null;
  for (let attempt = 0; attempt < 120 && layout === null; attempt++) {
    const amplitude = attempt < 90 ? 1 : 1 - (attempt - 90) / 30;
    const candidate = build([0, 1, 2].map(() => sampleTilt(rng, amplitude)));
    if (layoutOk(candidate, hard, pairA, pairB)) layout = candidate;
  }
  // Dernier recours : pas d'inclinaison du tout. La contrainte de réseau, elle,
  // est garantie par construction du triplet.
  if (layout === null) layout = build([IDENTITY, IDENTITY, IDENTITY]);

  const others = [0, 1, 2].filter((s) => s !== pairA && s !== pairB);
  const pairTurnDeg = perceivedGap(layout, pairA, pairB);
  const minTurn = Math.min(
    pairTurnDeg,
    perceivedGap(layout, pairA, others[0]),
    perceivedGap(layout, pairB, others[0]),
  );

  return {
    question: {
      stacks,
      tilts: layout.tilts,
      answerIndex: mirrorSlot,
      shapeName: shape.name,
      size: shape.size,
      pairTurnDeg,
      minTurnDeg: minTurn,
    },
    seed,
    level,
    tags: [`size-${shape.size}`, hard ? 'hard-orientation' : 'easy-orientation'],
  };
}

export function validate(item: Item<StackingQuestion>, answer: StackingAnswer): boolean {
  return answer === item.question.answerIndex;
}
