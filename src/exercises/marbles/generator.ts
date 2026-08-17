import { mulberry32, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { LEVELS } from './config';
import { CAPACITIES, statesByDistance } from './model';
import type { State } from './model';

export interface MarblesQuestion {
  start: State;
  goal: State;
  /** Réponse : nombre minimum de déplacements. */
  answer: number;
}

/** Répartit `count` billes colorées dans les 3 tubes, en respectant les capacités. */
function randomState(rng: Rng, marbles: number[]): State {
  const state: State = [[], [], []];
  for (const color of marbles) {
    const open = [0, 1, 2].filter((t) => state[t].length < CAPACITIES[t]);
    state[open[randInt(rng, 0, open.length - 1)]].push(color);
  }
  return state;
}

export function generate(seed: number, level: number, forceTag?: string): Item<MarblesQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(level, LEVELS.length) - 1];

  let wantMin = cfg.minMoves;
  let wantMax = cfg.maxMoves;
  if (forceTag === 'long-solution') wantMin = Math.max(cfg.minMoves, cfg.maxMoves - 1);
  if (forceTag === 'short-solution') wantMax = Math.min(cfg.maxMoves, cfg.minMoves + 1);

  // Billes : `colors` couleurs distinctes, complétées par des doublons si besoin.
  const palette: number[] = [];
  for (let i = 0; i < cfg.marbles; i++) palette.push(i % cfg.colors);

  // On tire un départ, puis on explore par BFS : choisir l'arrivée à une distance
  // DONNÉE garantit que la réponse est bien le minimum, sans rejet ni approximation.
  let start: State = [[], [], []];
  let goal: State = [[], [], []];
  let answer = 0;
  for (let attempt = 0; attempt < 60; attempt++) {
    start = randomState(rng, shuffle(rng, palette));
    const levels = statesByDistance(start, wantMax);
    const reachable: number[] = [];
    for (let d = wantMin; d < levels.length; d++) if (levels[d].length > 0) reachable.push(d);
    if (reachable.length === 0) continue;
    const depth = reachable[randInt(rng, 0, reachable.length - 1)];
    goal = levels[depth][randInt(rng, 0, levels[depth].length - 1)];
    answer = depth;
    break;
  }

  const tags = [`moves-${answer}`, answer >= 5 ? 'long-solution' : 'short-solution'];
  const duplicates = cfg.marbles > cfg.colors;
  if (duplicates) tags.push('duplicate-colors');

  return { question: { start, goal, answer }, seed, level, tags };
}

export function validate(item: Item<MarblesQuestion>, answer: string): boolean {
  return /^\d+$/.test(answer) && Number(answer) === item.question.answer;
}
