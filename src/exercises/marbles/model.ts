/**
 * Billes (PSY0 cadets) — règle officielle :
 * « Des billes sont empilées dans des tubes en forme de U. Les tubes représentent
 *   en haut une disposition de départ, en bas une disposition d'arrivée. Vous devez
 *   compter le nombre minimum de déplacements de billes à effectuer d'un tube à
 *   l'autre pour passer de la disposition de départ à la disposition d'arrivée.
 *   Une bille est toujours prise sur le DESSUS d'un tube et reposée sur le DESSUS
 *   d'un autre. Ne jamais dépasser la taille d'un tube : de gauche à droite 3, 2 et 3. »
 *
 * Un état = 3 piles de couleurs, index 0 = fond du tube, dernier = dessus.
 */

export const CAPACITIES = [3, 2, 3] as const;
export type State = number[][];

export function serialize(state: State): string {
  return state.map((t) => t.join(',')).join('|');
}

export function deserialize(key: string): State {
  return key.split('|').map((t) => (t === '' ? [] : t.split(',').map(Number)));
}

/** Tous les états atteignables en un déplacement légal (dessus → dessus, capacités respectées). */
export function successors(state: State): State[] {
  const out: State[] = [];
  for (let from = 0; from < 3; from++) {
    if (state[from].length === 0) continue;
    for (let to = 0; to < 3; to++) {
      if (to === from || state[to].length >= CAPACITIES[to]) continue;
      const next = state.map((t) => [...t]);
      next[to].push(next[from].pop()!);
      out.push(next);
    }
  }
  return out;
}

/**
 * Nombre MINIMUM de déplacements entre deux dispositions (BFS bidirectionnel simple).
 * Retourne null si l'arrivée est inatteignable (multiensembles de billes différents).
 */
export function minMoves(start: State, goal: State): number | null {
  const goalKey = serialize(goal);
  if (serialize(start) === goalKey) return 0;
  if (multisetKey(start) !== multisetKey(goal)) return null;

  const seen = new Set<string>([serialize(start)]);
  let frontier: State[] = [start];
  let depth = 0;
  while (frontier.length > 0 && depth < 20) {
    depth += 1;
    const next: State[] = [];
    for (const state of frontier) {
      for (const succ of successors(state)) {
        const key = serialize(succ);
        if (seen.has(key)) continue;
        if (key === goalKey) return depth;
        seen.add(key);
        next.push(succ);
      }
    }
    frontier = next;
  }
  return null;
}

/** Le chemin optimal (suite d'états), pour l'animation de correction. */
export function optimalPath(start: State, goal: State): State[] | null {
  const goalKey = serialize(goal);
  if (serialize(start) === goalKey) return [start];
  const parents = new Map<string, string>();
  const seen = new Set<string>([serialize(start)]);
  let frontier: State[] = [start];
  while (frontier.length > 0) {
    const next: State[] = [];
    for (const state of frontier) {
      for (const succ of successors(state)) {
        const key = serialize(succ);
        if (seen.has(key)) continue;
        seen.add(key);
        parents.set(key, serialize(state));
        if (key === goalKey) {
          const path: State[] = [succ];
          let cur = key;
          while (parents.has(cur)) {
            cur = parents.get(cur)!;
            path.unshift(deserialize(cur));
          }
          return path;
        }
        next.push(succ);
      }
    }
    frontier = next;
  }
  return null;
}

function multisetKey(state: State): string {
  return [...state.flat()].sort((a, b) => a - b).join(',');
}

/** Nombre total de billes d'un état. */
export function countMarbles(state: State): number {
  return state.reduce((n, t) => n + t.length, 0);
}

/**
 * Tous les états atteignables depuis `start`, groupés par distance exacte
 * (index 0 = start). Permet de choisir une arrivée dont on CONNAÎT le minimum
 * de déplacements par construction.
 */
export function statesByDistance(start: State, maxDepth: number): State[][] {
  const levels: State[][] = [[start]];
  const seen = new Set<string>([serialize(start)]);
  for (let d = 1; d <= maxDepth; d++) {
    const next: State[] = [];
    for (const state of levels[d - 1]) {
      for (const succ of successors(state)) {
        const key = serialize(succ);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(succ);
      }
    }
    if (next.length === 0) break;
    levels.push(next);
  }
  return levels;
}
