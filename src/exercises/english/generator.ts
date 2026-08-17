import { mulberry32, pick, shuffle } from '../../core/rng';
import type { Item } from '../../core/types';
import { BANKS, ENGLISH_BANKS } from './data';
import type { EnglishBank } from './data';
import { LEVELS } from './config';

export interface EnglishQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  bank: EnglishBank;
}

/** Index de l'option choisie (0-based). */
export type EnglishAnswer = number;

export function generate(seed: number, level: number, forceTag?: string): Item<EnglishQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(level, LEVELS.length) - 1];

  const bank: EnglishBank = (ENGLISH_BANKS as string[]).includes(forceTag ?? '')
    ? (forceTag as EnglishBank)
    : pick(rng, cfg.banks);

  let pool = BANKS[bank].filter(
    (e) => e.difficulty >= cfg.minDifficulty && e.difficulty <= cfg.maxDifficulty,
  );
  if (pool.length === 0) pool = BANKS[bank];

  const entry = pick(rng, pool);
  const order = shuffle(rng, [0, 1, 2, 3]);
  const options = order.map((i) => entry.options[i]);
  const correctIndex = order.indexOf(entry.correct);

  return {
    question: { prompt: entry.prompt, options, correctIndex, bank },
    seed,
    level,
    tags: [bank, `d${entry.difficulty}`],
  };
}
