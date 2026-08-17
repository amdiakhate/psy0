import { mulberry32, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import {
  CLOSE_GAP,
  GRID_COLS,
  GRID_ROWS,
  JITTER_X,
  JITTER_Y,
  LABELS,
  LEVELS,
  MAX_NUMBERS,
  MIN_NUMBERS,
  MIXED_HI,
  MIXED_LO,
} from './config';

/** 0 = pair, 1 = impair. */
export type Parity = 0 | 1;

export interface NumberCell {
  /** Index dans `cells` (ordre de lecture de la grille). */
  id: number;
  value: number;
  parity: Parity;
  /** Position du centre, en % de la zone de jeu. */
  x: number;
  y: number;
  isStart: boolean;
  /** Étiquette clavier affichée sur le nombre ('1'…'9', 'A'…'E'). */
  label: string;
}

export interface OddEvenQuestion {
  cells: NumberCell[];
  /** Ids des cellules dans l'ordre de la chaîne, START inclus en position 0. */
  chain: number[];
  /** Parité du START (donc du premier maillon). */
  startParity: Parity;
}

/** La séquence réellement cliquée (nombres séparés par un espace), START exclu. */
export type OddEvenAnswer = string;

export function parityLabel(p: Parity): string {
  return p === 0 ? 'pair' : 'impair';
}

/**
 * Un nombre est jouable à l'étape `step` (= nombre de nombres déjà validés
 * après le START) s'il n'a pas déjà été joué, s'il est de la parité OPPOSÉE au
 * dernier validé, et s'il est le suivant dans l'ordre croissant de sa parité.
 */
export function isPlayable(q: OddEvenQuestion, step: number, cellId: number): boolean {
  const played = new Set(q.chain.slice(0, step + 1));
  if (played.has(cellId)) return false;
  const c = q.cells[cellId];
  const lastParity = q.cells[q.chain[step]].parity;
  if (c.parity === lastParity) return false;
  return !q.cells.some((d) => d.parity === c.parity && !played.has(d.id) && d.value < c.value);
}

/** Tous les nombres jouables à l'étape `step` — doit toujours contenir 0 ou 1 élément. */
export function playableIds(q: OddEvenQuestion, step: number): number[] {
  return q.cells.filter((c) => isPlayable(q, step, c.id)).map((c) => c.id);
}

/**
 * Suite strictement croissante de `k` nombres d'une parité donnée dans
 * [lo, hi], avec un écart d'au moins `minGap` entre deux termes consécutifs.
 */
function ascending(rng: Rng, k: number, parity: Parity, lo: number, hi: number, minGap: number): number[] {
  const uLo = Math.ceil((lo - parity) / 2);
  const uHi = Math.floor((hi - parity) / 2);
  const span = uHi - uLo;
  const maxStep = Math.max(1, Math.floor(span / k));
  const minStep = Math.max(1, Math.min(Math.ceil(minGap / 2), maxStep));

  const gaps: number[] = [];
  let total = 0;
  for (let i = 1; i < k; i++) {
    const g = randInt(rng, minStep, Math.max(minStep, maxStep));
    gaps.push(g);
    total += g;
  }
  let u = randInt(rng, uLo, Math.max(uLo, uHi - total));
  const out = [u * 2 + parity];
  for (const g of gaps) {
    u += g;
    out.push(u * 2 + parity);
  }
  return out;
}

export function generate(seed: number, level: number, forceTag?: string): Item<OddEvenQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  // Les tirages sont TOUJOURS consommés dans le même ordre : forceTag écrase
  // le résultat, jamais la séquence du PRNG.
  let nNumbers = randInt(rng, cfg.minNumbers, cfg.maxNumbers);
  let closeTrap = rng() < cfg.closeChance;
  let mixed = rng() < cfg.mixedChance;

  const nTag = forceTag?.match(/^n-numbers-(\d+)$/);
  if (nTag) nNumbers = Math.min(Math.max(Number(nTag[1]), MIN_NUMBERS), MAX_NUMBERS);
  if (forceTag === 'close-values') closeTrap = true;
  if (forceTag === 'mixed-digits') mixed = true;

  const startParity: Parity = rng() < 0.5 ? 0 : 1;
  const otherParity: Parity = startParity === 0 ? 1 : 0;
  const trapOnStart = rng() < 0.5;

  // La chaîne alterne en partant du START : sa parité porte un nombre de plus
  // quand le total est impair.
  const kStart = Math.ceil(nNumbers / 2);
  const kOther = nNumbers - kStart;

  // Le mélange 2/4 chiffres se fabrique en partant d'une bande à 3 chiffres,
  // puis en abaissant le plus petit terme et en relevant le plus grand.
  const lo = mixed ? MIXED_LO : cfg.lo;
  const hi = mixed ? MIXED_HI : cfg.hi;

  const startValues = ascending(rng, kStart, startParity, lo, hi, cfg.minGap);
  const otherValues = ascending(rng, kOther, otherParity, lo, hi, cfg.minGap);

  if (mixed) {
    for (const [values, parity] of [
      [startValues, startParity],
      [otherValues, otherParity],
    ] as Array<[number[], Parity]>) {
      values[0] = randInt(rng, 5, 49) * 2 + parity;
      values[values.length - 1] = randInt(rng, 500, 4999) * 2 + parity;
    }
  }

  if (closeTrap) {
    const values = trapOnStart ? startValues : otherValues;
    const i = randInt(rng, 1, values.length - 2);
    values[i] = values[i - 1] + 2;
  }

  const chainValues: Array<{ value: number; parity: Parity }> = [];
  for (let i = 0; i < kStart; i++) {
    chainValues.push({ value: startValues[i], parity: startParity });
    if (i < kOther) chainValues.push({ value: otherValues[i], parity: otherParity });
  }

  const slots = shuffle(rng, [...Array(GRID_COLS * GRID_ROWS).keys()]).slice(0, nNumbers);
  const placed = chainValues.map((v, i) => {
    const slot = slots[i];
    const col = slot % GRID_COLS;
    const row = Math.floor(slot / GRID_COLS);
    return {
      ...v,
      row,
      col,
      x: ((col + 0.5) / GRID_COLS) * 100 + randInt(rng, -JITTER_X, JITTER_X),
      y: ((row + 0.5) / GRID_ROWS) * 100 + randInt(rng, -JITTER_Y, JITTER_Y),
    };
  });

  // Ordre de lecture (haut→bas, gauche→droite) : il fixe les ids et les
  // étiquettes clavier, indépendamment de l'ordre de la solution.
  const reading = [...placed.keys()].sort(
    (a, b) => placed[a].row - placed[b].row || placed[a].col - placed[b].col,
  );
  const cells: NumberCell[] = reading.map((chainIdx, i) => ({
    id: i,
    value: placed[chainIdx].value,
    parity: placed[chainIdx].parity,
    x: placed[chainIdx].x,
    y: placed[chainIdx].y,
    isStart: chainIdx === 0,
    label: LABELS[i],
  }));
  const cellIdOf = new Map<number, number>();
  reading.forEach((chainIdx, i) => cellIdOf.set(chainIdx, i));
  const chain = chainValues.map((_, chainIdx) => cellIdOf.get(chainIdx)!);

  const question: OddEvenQuestion = { cells, chain, startParity };
  const tags = [`n-numbers-${nNumbers}`];
  if (hasCloseValues(question)) tags.push('close-values');
  if (hasMixedDigits(question)) tags.push('mixed-digits');

  return { question, seed, level, tags };
}

/** Deux nombres de même parité séparés par moins de CLOSE_GAP. */
export function hasCloseValues(q: OddEvenQuestion): boolean {
  for (const parity of [0, 1] as Parity[]) {
    const values = q.cells
      .filter((c) => c.parity === parity)
      .map((c) => c.value)
      .sort((a, b) => a - b);
    for (let i = 1; i < values.length; i++) {
      if (values[i] - values[i - 1] <= CLOSE_GAP) return true;
    }
  }
  return false;
}

/** La grille mélange des nombres à 2 chiffres et des nombres à 4 chiffres. */
export function hasMixedDigits(q: OddEvenQuestion): boolean {
  const lengths = new Set(q.cells.map((c) => String(c.value).length));
  return lengths.has(2) && lengths.has(4);
}

/** La séquence attendue : les nombres à cliquer, START exclu. */
export function expectedSequence(q: OddEvenQuestion): string {
  return q.chain
    .slice(1)
    .map((id) => q.cells[id].value)
    .join(' ');
}
