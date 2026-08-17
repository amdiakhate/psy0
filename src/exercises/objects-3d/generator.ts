import { mulberry32, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { FALLBACK_LAYOUTS, LEVELS, SCENE_RADIUS, VIEWPOINT_COUNT } from './config';
import { OBJECT_KINDS, layoutIsUnique } from './scene';
import type { ObjectKind, SceneObject } from './scene';

export type LayoutKind = 'symmetric' | 'spread';

export interface Objects3dQuestion {
  /** Les objets posés dans le désert (plan du sol, x/z). */
  objects: SceneObject[];
  /** Index 0-7 du point de vue depuis lequel la scène est montrée — la réponse. */
  viewpoint: number;
  layout: LayoutKind;
}

/** Index 0-7 du point de vue désigné. */
export type Objects3dAnswer = number;

interface Position {
  x: number;
  z: number;
}

const round2 = (v: number): number => Math.round(v * 100) / 100;

/**
 * Disposition symétrique : quasi-polygone régulier (rayons et angles presque égaux),
 * donc peu de repères pour départager les points de vue.
 * Disposition étalée : angles irréguliers et rayons stratifiés du proche au lointain.
 * `jitter` croît avec les tentatives pour garantir la convergence du tirage rejeté.
 */
function drawLayout(rng: Rng, n: number, kind: LayoutKind, jitter: number): Position[] {
  const base = rng() * Math.PI * 2;
  // Couronnes de rayon distinctes, attribuées dans un ordre aléatoire : les objets
  // s'étalent en profondeur sans jamais s'agglutiner.
  const rings = shuffle(
    rng,
    Array.from({ length: n }, (_, i) => i),
  );
  const out: Position[] = [];
  for (let i = 0; i < n; i++) {
    const angle =
      base +
      (i * 2 * Math.PI) / n +
      (kind === 'symmetric' ? (rng() - 0.5) * jitter : (rng() - 0.5) * 0.9);
    const radius =
      kind === 'symmetric'
        ? 3.8 + (rng() - 0.5) * jitter * 2.4
        : 2.2 + (rings[i] + rng()) * (2.8 / n);
    const r = Math.min(radius, SCENE_RADIUS);
    out.push({ x: round2(r * Math.cos(angle)), z: round2(r * Math.sin(angle)) });
  }
  return out;
}

function withKinds(positions: readonly Position[], kinds: readonly ObjectKind[]): SceneObject[] {
  return positions.map((p, i) => ({ kind: kinds[i], x: p.x, z: p.z }));
}

export function generate(seed: number, level: number, forceTag?: string): Item<Objects3dQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  let n: number = cfg.nObjects;
  if (forceTag?.startsWith('objects-')) {
    const forced = Number(forceTag.slice(8));
    if (forced >= 3 && forced <= 5) n = forced;
  }

  let layout: LayoutKind = rng() < cfg.symmetricRatio ? 'symmetric' : 'spread';
  if (forceTag === 'symmetric-layout') layout = 'symmetric';
  if (forceTag === 'spread-layout') layout = 'spread';

  const kinds = shuffle(rng, OBJECT_KINDS).slice(0, n);

  // Tirage rejeté : on ne retient qu'une disposition dont les 8 vues sont
  // deux à deux discernables. Le jitter croît lentement pour finir par converger.
  let objects: SceneObject[] | null = null;
  for (let attempt = 0; attempt < 3000; attempt++) {
    const jitter = 0.22 + (attempt / 3000) * 0.8;
    const candidate = withKinds(drawLayout(rng, n, layout, jitter), kinds);
    if (layoutIsUnique(candidate)) {
      objects = candidate;
      break;
    }
  }
  if (objects === null) {
    // La disposition de secours n'est validée que pour SON attribution d'objets :
    // la lisibilité dépend de l'encombrement de chacun.
    objects = withKinds(FALLBACK_LAYOUTS[n], OBJECT_KINDS.slice(0, n));
  }

  const viewpoint = randInt(rng, 0, VIEWPOINT_COUNT - 1);

  return {
    question: { objects, viewpoint, layout },
    seed,
    level,
    tags: [`objects-${n}`, layout === 'symmetric' ? 'symmetric-layout' : 'spread-layout'],
  };
}

export function validate(item: Item<Objects3dQuestion>, answer: Objects3dAnswer): boolean {
  return answer === item.question.viewpoint;
}
