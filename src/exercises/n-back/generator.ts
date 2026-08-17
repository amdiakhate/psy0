import { mulberry32, randInt } from '../../core/rng';
import type { Item } from '../../core/types';
import { DIGIT_MS, LEVELS, N, SEQ_LENGTH } from './config';

export interface NBackPos {
  digit: number;
  /** true = identique au chiffre d'il y a 2 positions → bouton « Oui ». */
  expected: boolean;
  /** 'match' | 'lure' | 'plain' — 'warmup' pour les 2 premières positions (non évaluées). */
  kind: 'match' | 'lure' | 'plain' | 'warmup';
}

export interface NBackQuestion {
  /** Toujours 2 — conservé dans la question pour l'affichage et les tags. */
  n: number;
  /** Durée d'affichage du chiffre (ms). */
  digitMs: number;
  /** Durée de la fenêtre « Oui / Non » (ms). */
  responseMs: number;
  positions: NBackPos[];
}

/** Réponse par position, gérée par le composant (continuous) : true = « Oui ». */
export type NBackAnswer = boolean;

export function generate(seed: number, level: number, forceTag?: string): Item<NBackQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  const matchRate = forceTag === 'match' ? 0.5 : cfg.matchRate;
  const lureRate = forceTag === 'lure' ? 0.6 : cfg.lureRate;

  const digits: number[] = [];
  for (let i = 0; i < N; i++) digits.push(randInt(rng, 0, 9));

  for (let i = N; i < SEQ_LENGTH; i++) {
    const ref = digits[i - N];
    if (rng() < matchRate) {
      digits.push(ref);
      continue;
    }
    // Lure : répète le chiffre à N-1 ou N+1 positions — le piège classique.
    const lureCandidates: number[] = [];
    if (digits[i - (N - 1)] !== ref) lureCandidates.push(digits[i - (N - 1)]);
    if (i - (N + 1) >= 0 && digits[i - (N + 1)] !== ref) lureCandidates.push(digits[i - (N + 1)]);
    const wantLure = rng() < lureRate / (1 - matchRate) && lureCandidates.length > 0;
    if (wantLure) {
      digits.push(lureCandidates[randInt(rng, 0, lureCandidates.length - 1)]);
    } else {
      let d = randInt(rng, 0, 9);
      while (d === ref) d = randInt(rng, 0, 9);
      digits.push(d);
    }
  }

  // Les kinds sont recalculés depuis les valeurs réelles : un 'plain' tombé par
  // hasard sur un lure est retagué — les tags reflètent toujours la réalité.
  const positions: NBackPos[] = digits.map((digit, i) => {
    if (i < N) return { digit, expected: false, kind: 'warmup' };
    const isMatch = digit === digits[i - N];
    if (isMatch) return { digit, expected: true, kind: 'match' };
    const isLure =
      digit === digits[i - (N - 1)] || (i - (N + 1) >= 0 && digit === digits[i - (N + 1)]);
    return { digit, expected: false, kind: isLure ? 'lure' : 'plain' };
  });

  return {
    question: { n: N, digitMs: DIGIT_MS, responseMs: cfg.responseMs, positions },
    seed,
    level,
    tags: [`n=${N}`],
  };
}
