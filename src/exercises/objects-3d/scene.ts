import {
  CAMERA_HEIGHT,
  MIN_DEPTH_GAP,
  MIN_OBJECT_GAP,
  MIN_SCREEN_GAP,
  OCCLUSION_MARGIN,
  VIEWPOINT_COUNT,
  VIEW_RADIUS,
} from './config';

/**
 * Géométrie pure de la scène du désert : ni React ni three.js ici, tout ce qui
 * décide de la validité d'un item est testable en isolation.
 *
 * Repère : plan du sol (x, z). La caméra du point de vue k est à l'angle
 * θ = k·45°, en position (R·cosθ, R·sinθ), et REGARDE LE CENTRE.
 *
 *   direction de visée      f = (−cosθ, −sinθ)
 *   axe « droite de l'image » r = f × up = (sinθ, −cosθ)     (up = +Y)
 *
 * D'où, pour un objet en (x, z) :
 *   latéral    = x·sinθ − z·cosθ
 *   profondeur = R − (x·cosθ + z·sinθ)          (> 0 : les objets sont dans le cercle)
 *   abscisse écran = latéral / profondeur       (tangente de l'angle horizontal)
 *
 * L'abscisse écran est la projection PERSPECTIVE exacte de la caméra three.js :
 * l'ordre gauche→droite calculé ici est donc littéralement celui que le candidat lit.
 */

export type ObjectKind = 'pyramide' | 'tour' | 'cube' | 'cactus' | 'rocher' | 'antenne';

export const OBJECT_KINDS: readonly ObjectKind[] = [
  'pyramide',
  'tour',
  'cube',
  'cactus',
  'rocher',
  'antenne',
];

export const OBJECT_LABELS: Record<ObjectKind, string> = {
  pyramide: 'pyramide',
  tour: 'tour',
  cube: 'cube',
  cactus: 'cactus',
  rocher: 'rocher',
  antenne: 'antenne',
};

/**
 * TOUS les objets partagent le même violet, comme chez Pilotest.
 *
 * Une palette par type rendait l'exercice bien plus facile que le test : la
 * couleur suffisait à apparier un objet entre la photo et la vue aérienne, sans
 * jamais avoir à le reconnaître à sa forme. Or c'est exactement la lecture que
 * l'épreuve mesure — et la vue aérienne, désormais fidèle, n'en donne aucune.
 */
export const OBJECT_COLORS: Record<ObjectKind, string> = {
  pyramide: '#a021a0',
  tour: '#a021a0',
  cube: '#a021a0',
  cactus: '#a021a0',
  rocher: '#a021a0',
  antenne: '#a021a0',
};

/**
 * Encombrement de chaque objet, en unités monde : demi-largeur et hauteur totale.
 * Ces valeurs DOIVENT rester le majorant des maillages de `DesertView.tsx` — c'est
 * sur elles que repose le test « aucun objet n'est totalement caché ».
 */
export const OBJECT_RADIUS: Record<ObjectKind, number> = {
  pyramide: 0.85, // cône de rayon 0,85
  tour: 0.45, // chapeau 0,62 × 0,62 → demi-diagonale 0,44
  cube: 0.78, // boîte 1,2 tournée de 0,35 rad → 0,77
  cactus: 0.6, // bras vertical décalé de 0,45, rayon 0,15
  rocher: 0.8, // icosaèdre de rayon 0,8
  antenne: 0.3, // sphère de tête, rayon 0,28
};

/** Hauteurs franchement étagées : la silhouette identifie l'objet même de loin. */
export const OBJECT_HEIGHT: Record<ObjectKind, number> = {
  cube: 1.2,
  rocher: 1.5,
  pyramide: 1.9,
  cactus: 2,
  tour: 2.72,
  antenne: 3.13,
};

export interface SceneObject {
  kind: ObjectKind;
  x: number;
  z: number;
}

export type Ground = { x: number; z: number };

/** Angle du point de vue k, en radians. */
export function viewpointAngle(k: number): number {
  return (k * 2 * Math.PI) / VIEWPOINT_COUNT;
}

/** Position au sol du point de vue k. */
export function viewpointPosition(k: number): Ground {
  const a = viewpointAngle(k);
  return { x: VIEW_RADIUS * Math.cos(a), z: VIEW_RADIUS * Math.sin(a) };
}

/** Décalage latéral (croissant vers la droite de l'image). */
export function lateralOf(o: Ground, angle: number): number {
  return o.x * Math.sin(angle) - o.z * Math.cos(angle);
}

/** Distance le long de l'axe de visée (croissante vers le fond). */
export function depthOf(o: Ground, angle: number): number {
  return VIEW_RADIUS - (o.x * Math.cos(angle) + o.z * Math.sin(angle));
}

/** Abscisse à l'écran en perspective : tangente de l'angle horizontal. */
export function screenXOf(o: Ground, angle: number): number {
  return lateralOf(o, angle) / depthOf(o, angle);
}

export interface ViewProjection {
  screenX: number[];
  depth: number[];
}

export function project(objects: readonly Ground[], angle: number): ViewProjection {
  const depth = objects.map((o) => depthOf(o, angle));
  return { depth, screenX: objects.map((o, i) => lateralOf(o, angle) / depth[i]) };
}

export interface ViewOrders {
  /** Indices des objets, de la GAUCHE vers la DROITE de l'image. */
  leftToRight: number[];
  /** Indices des objets, du plus PROCHE au plus LOINTAIN. */
  nearToFar: number[];
}

export function viewOrders(objects: readonly Ground[], angle: number): ViewOrders {
  const { screenX, depth } = project(objects, angle);
  const idx = objects.map((_, i) => i);
  return {
    leftToRight: [...idx].sort((a, b) => screenX[a] - screenX[b]),
    nearToFar: [...idx].sort((a, b) => depth[a] - depth[b]),
  };
}

/**
 * Signature d'une vue : l'ordre gauche→droite des objets projetés, plus leur ordre
 * de profondeur. C'est exactement l'information lisible sur l'image (qui est à
 * gauche de qui, qui est devant qui). Deux points de vue de même signature seraient
 * indiscernables et l'item n'aurait pas de réponse unique.
 */
export function viewSignature(objects: readonly Ground[], angle: number): string {
  const { leftToRight, nearToFar } = viewOrders(objects, angle);
  return `${leftToRight.join('')}|${nearToFar.join('')}`;
}

export function allSignatures(objects: readonly Ground[]): string[] {
  return Array.from({ length: VIEWPOINT_COUNT }, (_, k) => viewSignature(objects, viewpointAngle(k)));
}

const projections = (objects: readonly Ground[]): ViewProjection[] =>
  Array.from({ length: VIEWPOINT_COUNT }, (_, k) => project(objects, viewpointAngle(k)));

/** Pas d'amas au sol : deux objets ne se collent jamais. */
export function spacingOk(objects: readonly Ground[]): boolean {
  for (let p = 0; p < objects.length; p++) {
    for (let q = p + 1; q < objects.length; q++) {
      if (Math.hypot(objects[p].x - objects[q].x, objects[p].z - objects[q].z) < MIN_OBJECT_GAP) {
        return false;
      }
    }
  }
  return true;
}

/** L'ordre gauche→droite est franc depuis les 8 points de vue : aucun quasi-alignement. */
export function separationOk(objects: readonly Ground[]): boolean {
  for (const { screenX } of projections(objects)) {
    for (let p = 0; p < objects.length; p++) {
      for (let q = p + 1; q < objects.length; q++) {
        if (Math.abs(screenX[p] - screenX[q]) < MIN_SCREEN_GAP) return false;
      }
    }
  }
  return true;
}

/**
 * Deux points de vue sont DISCERNABLES s'il existe une paire d'objets dont l'ordre
 * s'inverse de façon LISIBLE entre les deux vues : soit un échange gauche/droite
 * (toujours franc, `separationOk` l'impose), soit un échange devant/derrière d'au
 * moins MIN_DEPTH_GAP des deux côtés.
 */
export function discernable(objects: readonly Ground[], k1: number, k2: number): boolean {
  const a = project(objects, viewpointAngle(k1));
  const b = project(objects, viewpointAngle(k2));
  for (let p = 0; p < objects.length; p++) {
    for (let q = p + 1; q < objects.length; q++) {
      if (Math.sign(a.screenX[p] - a.screenX[q]) !== Math.sign(b.screenX[p] - b.screenX[q])) {
        return true;
      }
      const da = a.depth[p] - a.depth[q];
      const db = b.depth[p] - b.depth[q];
      if (
        Math.sign(da) !== Math.sign(db) &&
        Math.abs(da) >= MIN_DEPTH_GAP &&
        Math.abs(db) >= MIN_DEPTH_GAP
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Aucun objet n'est TOTALEMENT caché derrière un autre, depuis aucun point de vue.
 *
 * Un objet lointain disparaît si son intervalle angulaire est contenu dans celui
 * de l'objet devant lui ET si son sommet ne dépasse pas. Sans cette règle, environ
 * 13 % des dispositions montreraient une scène amputée d'un objet — le candidat
 * lirait alors un ordre incomplet et la réponse deviendrait indécidable.
 */
export function occlusionOk(objects: readonly SceneObject[]): boolean {
  const radius = objects.map((o) => OBJECT_RADIUS[o.kind]);
  const height = objects.map((o) => OBJECT_HEIGHT[o.kind]);
  for (let k = 0; k < VIEWPOINT_COUNT; k++) {
    const { screenX, depth } = project(objects, viewpointAngle(k));
    for (let p = 0; p < objects.length; p++) {
      for (let q = p + 1; q < objects.length; q++) {
        // f = devant, b = derrière
        const [f, b] = depth[p] < depth[q] ? [p, q] : [q, p];
        const af = radius[f] / depth[f];
        const ab = radius[b] / depth[b];
        const covered =
          screenX[b] - ab >= screenX[f] - af - OCCLUSION_MARGIN &&
          screenX[b] + ab <= screenX[f] + af + OCCLUSION_MARGIN;
        // Coordonnée verticale du sommet à l'écran (vers le haut = plus grand).
        const topF = (height[f] - CAMERA_HEIGHT) / depth[f];
        const topB = (height[b] - CAMERA_HEIGHT) / depth[b];
        if (covered && topB <= topF + OCCLUSION_MARGIN) return false;
      }
    }
  }
  return true;
}

/** LA condition d'existence de l'item : les 8 vues sont deux à deux discernables. */
export function layoutIsUnique(objects: readonly SceneObject[]): boolean {
  if (!spacingOk(objects)) return false;
  if (!separationOk(objects)) return false;
  if (!occlusionOk(objects)) return false;
  for (let k1 = 0; k1 < VIEWPOINT_COUNT; k1++) {
    for (let k2 = k1 + 1; k2 < VIEWPOINT_COUNT; k2++) {
      if (!discernable(objects, k1, k2)) return false;
    }
  }
  return true;
}
