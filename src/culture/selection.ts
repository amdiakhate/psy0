import { shuffle } from '../core/rng';
import type { Rng } from '../core/rng';
import { hasActiveError, isQuestionDue } from './progress';
import type { CultureCategory, CultureQuestion, CultureStore } from './types';

export type CulturePoolFilter = 'all' | 'weak' | 'errors' | 'new' | 'traps';

export interface SelectionOptions {
  category?: CultureCategory;
  filter?: CulturePoolFilter;
  onlyHighYield?: boolean;
  finalStretch?: boolean;
}

export function categoryAccuracy(store: CultureStore, category: CultureCategory): number | null {
  const attempts = store.attempts.filter((attempt) => attempt.category === category).slice(-30);
  if (attempts.length === 0) return null;
  return attempts.filter((attempt) => attempt.correct).length / attempts.length;
}

export function weakestCategories(store: CultureStore, count = 3): CultureCategory[] {
  const categories = [...new Set(store.attempts.map((attempt) => attempt.category))];
  return categories
    .map((category) => ({ category, accuracy: categoryAccuracy(store, category) ?? 1 }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, count)
    .map((item) => item.category);
}

function eligible(question: CultureQuestion, store: CultureStore, options: SelectionOptions): boolean {
  const progress = store.progress[question.id];
  if (options.category && !question.categories.includes(options.category)) return false;
  if (options.onlyHighYield && !question.highYield && !hasActiveError(progress)) return false;
  if (options.filter === 'errors' && !hasActiveError(progress)) return false;
  if (options.filter === 'new' && progress?.seenCount) return false;
  if (options.filter === 'traps' && !question.trap) return false;
  if (options.filter === 'weak' && !weakestCategories(store).some((category) => question.categories.includes(category))) return false;
  return true;
}

function priority(question: CultureQuestion, store: CultureStore, now: Date, finalStretch: boolean): number {
  const progress = store.progress[question.id];
  let score = 0;
  if (hasActiveError(progress)) score += 1_000;
  if (isQuestionDue(progress, now)) score += 800;
  const accuracy = categoryAccuracy(store, question.category);
  if (accuracy !== null) score += Math.round((1 - accuracy) * 400);
  if (!progress?.seenCount) score += 300;
  if (question.highYield) score += finalStretch ? 350 : 100;
  if (question.isTimeSensitive) score += 30;
  if (progress?.mastery === 'mastered') score -= finalStretch ? 500 : 100;
  if (progress?.lastIncorrectAt) score += Math.max(0, 100 - Math.floor((now.getTime() - new Date(progress.lastIncorrectAt).getTime()) / 86_400_000));
  return score;
}

export function selectReviewQuestions(
  questions: CultureQuestion[],
  store: CultureStore,
  count: number,
  now: Date,
  rng: Rng,
  options: SelectionOptions = {},
): CultureQuestion[] {
  const pool = shuffle(rng, questions.filter((question) => eligible(question, store, options)));
  return pool
    .map((question, index) => ({ question, index, score: priority(question, store, now, options.finalStretch ?? store.finalStretch) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map((item) => item.question);
}

export function selectBalancedSimulation(
  questions: CultureQuestion[],
  count: number,
  rng: Rng,
): CultureQuestion[] {
  const groups = new Map<CultureCategory, CultureQuestion[]>();
  for (const question of shuffle(rng, questions)) {
    const group = groups.get(question.category) ?? [];
    group.push(question);
    groups.set(question.category, group);
  }
  const orderedGroups = shuffle(rng, [...groups.values()]);
  const result: CultureQuestion[] = [];
  let level = 0;
  while (result.length < count && orderedGroups.some((group) => level < group.length)) {
    for (const group of orderedGroups) {
      const question = group[level];
      if (question && result.length < count) result.push(question);
    }
    level += 1;
  }
  return shuffle(rng, result);
}
