import { mulberry32, pick, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { GRID_COLS, GRID_ROWS, JITTER_X, JITTER_Y, LABELS, LEVELS, MAX_WORDS, MIN_WORDS } from './config';
import { CLOSE_PAIRS, FAR_PAIRS, THEMES } from './data';
import type { ThemeId } from './data';

/** 0 = thématique du mot START, 1 = l'autre. */
export type ThemeSlot = 0 | 1;

export interface WordCell {
  /** Index dans `cells` (ordre de lecture de la grille). */
  id: number;
  word: string;
  theme: ThemeSlot;
  /** Position du centre, en % de la zone de jeu. */
  x: number;
  y: number;
  isStart: boolean;
  /** Étiquette clavier affichée sur le mot ('1'…'9', 'A'…'E'). */
  label: string;
}

export interface WordSkipQuestion {
  /** Libellés [thématique du START, autre thématique]. */
  themeLabels: [string, string];
  /** Identifiants des thématiques, même ordre. */
  themeIds: [ThemeId, ThemeId];
  cells: WordCell[];
  /** Ids des cellules dans l'ordre de la chaîne, START inclus en position 0. */
  chain: number[];
}

/** La séquence réellement cliquée (mots séparés par un espace), START exclu. */
export type WordSkipAnswer = string;

/**
 * Un mot est jouable à l'étape `step` (= nombre de mots déjà validés après le
 * START) s'il n'a pas déjà été joué, s'il appartient à l'AUTRE thématique que
 * le dernier mot validé, et s'il est le suivant dans l'ordre alphabétique de sa
 * thématique (aucun mot non joué de la même thématique ne le précède).
 */
export function isPlayable(q: WordSkipQuestion, step: number, cellId: number): boolean {
  const played = new Set(q.chain.slice(0, step + 1));
  if (played.has(cellId)) return false;
  const c = q.cells[cellId];
  const lastTheme = q.cells[q.chain[step]].theme;
  if (c.theme === lastTheme) return false;
  return !q.cells.some((d) => d.theme === c.theme && !played.has(d.id) && d.word < c.word);
}

/** Tous les mots jouables à l'étape `step` — doit toujours contenir 0 ou 1 élément. */
export function playableIds(q: WordSkipQuestion, step: number): number[] {
  return q.cells.filter((c) => isPlayable(q, step, c.id)).map((c) => c.id);
}

/** Groupe les mots d'une thématique par initiale, dans un ordre déterministe. */
function groupByInitial(words: string[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const w of [...words].sort()) {
    const key = w[0];
    const bucket = out.get(key);
    if (bucket) bucket.push(w);
    else out.set(key, [w]);
  }
  return out;
}

/**
 * Choisit `k` mots d'une thématique, triés alphabétiquement.
 * `wantTrap` : garantit deux mots de même initiale ; sinon toutes les initiales
 * sont distinctes (donc aucun piège de tri accidentel).
 */
function selectWords(rng: Rng, themeId: ThemeId, k: number, wantTrap: boolean): string[] {
  const byInitial = groupByInitial(THEMES[themeId].words);
  const letters = [...byInitial.keys()];

  if (!wantTrap) {
    const chosenLetters = shuffle(rng, letters).slice(0, k);
    return chosenLetters.map((l) => pick(rng, byInitial.get(l)!)).sort();
  }

  const multi = letters.filter((l) => byInitial.get(l)!.length >= 2);
  const trapLetter = pick(rng, multi);
  const trapPair = shuffle(rng, byInitial.get(trapLetter)!).slice(0, 2);
  const rest = shuffle(rng, letters.filter((l) => l !== trapLetter))
    .slice(0, k - 2)
    .map((l) => pick(rng, byInitial.get(l)!));
  return [...trapPair, ...rest].sort();
}

export function generate(seed: number, level: number, forceTag?: string): Item<WordSkipQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  // Les tirages sont TOUJOURS consommés dans le même ordre : forceTag écrase
  // le résultat, jamais la séquence du PRNG.
  let nWords = randInt(rng, cfg.minWords, cfg.maxWords);
  let close = rng() < cfg.closeChance;
  let trap = rng() < cfg.trapChance;

  const nTag = forceTag?.match(/^n-words-(\d+)$/);
  if (nTag) nWords = Math.min(Math.max(Number(nTag[1]), MIN_WORDS), MAX_WORDS);
  if (forceTag === 'theme-close') close = true;
  if (forceTag === 'theme-far') close = false;
  if (forceTag === 'alpha-trap') trap = true;

  const [pairA, pairB] = pick(rng, close ? CLOSE_PAIRS : FAR_PAIRS);
  const startFirst = rng() < 0.5;
  const startTheme = startFirst ? pairA : pairB;
  const otherTheme = startFirst ? pairB : pairA;
  const trapOnStart = rng() < 0.5;

  // La chaîne alterne en partant du START : sa thématique porte un mot de plus
  // quand le total est impair.
  const kStart = Math.ceil(nWords / 2);
  const kOther = nWords - kStart;

  const startWords = selectWords(rng, startTheme, kStart, trap && trapOnStart);
  const otherWords = selectWords(rng, otherTheme, kOther, trap && !trapOnStart);

  const chainWords: Array<{ word: string; theme: ThemeSlot }> = [];
  for (let i = 0; i < kStart; i++) {
    chainWords.push({ word: startWords[i], theme: 0 });
    if (i < kOther) chainWords.push({ word: otherWords[i], theme: 1 });
  }

  const slots = shuffle(rng, [...Array(GRID_COLS * GRID_ROWS).keys()]).slice(0, nWords);
  const placed = chainWords.map((w, i) => {
    const slot = slots[i];
    const col = slot % GRID_COLS;
    const row = Math.floor(slot / GRID_COLS);
    return {
      ...w,
      row,
      col,
      x: ((col + 0.5) / GRID_COLS) * 100 + randInt(rng, -JITTER_X, JITTER_X),
      y: ((row + 0.5) / GRID_ROWS) * 100 + randInt(rng, -JITTER_Y, JITTER_Y),
    };
  });

  // Ordre de lecture (haut→bas, gauche→droite) : c'est lui qui fixe les ids et
  // les étiquettes clavier, indépendamment de l'ordre de la solution.
  const reading = [...placed.keys()].sort(
    (a, b) => placed[a].row - placed[b].row || placed[a].col - placed[b].col,
  );
  const cells: WordCell[] = reading.map((chainIdx, i) => ({
    id: i,
    word: placed[chainIdx].word,
    theme: placed[chainIdx].theme,
    x: placed[chainIdx].x,
    y: placed[chainIdx].y,
    isStart: chainIdx === 0,
    label: LABELS[i],
  }));
  const cellIdOf = new Map<number, number>();
  reading.forEach((chainIdx, i) => cellIdOf.set(chainIdx, i));
  const chain = chainWords.map((_, chainIdx) => cellIdOf.get(chainIdx)!);

  const tags = [`n-words-${nWords}`, close ? 'theme-close' : 'theme-far'];
  if (trap) tags.push('alpha-trap');

  return {
    question: {
      themeLabels: [THEMES[startTheme].label, THEMES[otherTheme].label],
      themeIds: [startTheme, otherTheme],
      cells,
      chain,
    },
    seed,
    level,
    tags,
  };
}

/** La séquence attendue : les mots à cliquer, START exclu. */
export function expectedSequence(q: WordSkipQuestion): string {
  return q.chain
    .slice(1)
    .map((id) => q.cells[id].word)
    .join(' ');
}
