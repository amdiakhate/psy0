import { shuffle } from '../core/rng';
import type { Rng } from '../core/rng';
import type { CultureEntry } from './types';

/**
 * Le format officiel, relevé sur les annales Pilotest 2018 et 2019 :
 * 20 questions, 4 propositions, ~15 s chacune, et un barème à points négatifs
 * où « je ne sais pas » est une réponse recevable.
 */
export const QUIZ_SIZE = 20;
export const ITEM_LIMIT_SEC = 15;
export const POINTS = { correct: 3, wrong: -1, skip: 0 } as const;

export interface QuizQuestion {
  entry: CultureEntry;
  /** Les quatre propositions dans l'ordre AFFICHÉ. */
  options: string[];
  /** L'index de la bonne réponse dans cet ordre-là. */
  correctIndex: number;
}

/** L'index choisi, ou `null` pour « je ne sais pas » — non répondu compris. */
export type Given = number | null;

export function presentEntry(entry: CultureEntry, rng: Rng): QuizQuestion {
  const order = shuffle(rng, [0, 1, 2, 3]);
  return {
    entry,
    options: order.map((i) => entry.options[i]),
    correctIndex: order.indexOf(entry.correct),
  };
}

export function composeQuiz(pool: CultureEntry[], size: number, rng: Rng): QuizQuestion[] {
  return shuffle(rng, pool)
    .slice(0, size)
    .map((e) => presentEntry(e, rng));
}

export interface Score {
  correct: number;
  wrong: number;
  skipped: number;
  /** Points obtenus, négatifs possibles. */
  raw: number;
  /** Le maximum atteignable sur ce nombre de questions. */
  max: number;
}

export function scoreOf(questions: QuizQuestion[], answers: Given[]): Score {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  for (const [i, q] of questions.entries()) {
    const given = answers[i] ?? null;
    if (given === null) skipped += 1;
    else if (given === q.correctIndex) correct += 1;
    else wrong += 1;
  }
  return {
    correct,
    wrong,
    skipped,
    raw: correct * POINTS.correct + wrong * POINTS.wrong,
    max: questions.length * POINTS.correct,
  };
}

/**
 * L'espérance de gain d'une réponse au hasard, quand il reste `optionsLeft`
 * propositions plausibles.
 *
 * C'est LE calcul qui décide de la stratégie, et il ne coûte rien à retenir :
 *
 *   E(n) = (1/n) × 3 + ((n−1)/n) × (−1) = (4 − n) / n
 *
 *   4 propositions → 0     répondre au hasard ne rapporte ni ne coûte rien
 *   3 propositions → +0,33 une seule élimination rend la réponse rentable
 *   2 propositions → +1
 *   1 proposition  → +3
 *
 * Conséquence pratique : « je ne sais pas » n'est JAMAIS meilleur que de
 * répondre. Au pire il fait jeu égal, dès qu'on élimine une proposition il
 * devient perdant. Sur 20 questions, cocher au hasard les cinq dernières plutôt
 * que les laisser vides ne coûte rien en espérance et peut rapporter gros.
 */
export function expectedValue(optionsLeft: number): number {
  if (optionsLeft < 1) return 0;
  return (POINTS.correct + (optionsLeft - 1) * POINTS.wrong) / optionsLeft;
}
