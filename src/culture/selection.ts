import { shuffle } from '../core/rng';
import type { Rng } from '../core/rng';
import { hasActiveError, isQuestionDue } from './progress';
import type { CultureCategory, CultureQuestion, CultureStore } from './types';

export type CulturePoolFilter = 'all' | 'weak' | 'errors' | 'new' | 'traps' | 'extended';

export interface SelectionOptions {
  category?: CultureCategory;
  filter?: CulturePoolFilter;
  onlyHighYield?: boolean;
  finalStretch?: boolean;
}

export function categoryAccuracy(store: CultureStore, category: CultureCategory): number | null {
  const latest = new Map<string, CultureStore['attempts'][number]>();
  for (const attempt of store.attempts) if (attempt.category === category) latest.set(attempt.questionId, attempt);
  const attempts = [...latest.values()];
  if (attempts.length < 5) return null;
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
  if (options.filter === 'extended' && question.tier !== 'extended') return false;
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
  const explicitExtendedPool = options.filter === 'extended' || Boolean(options.category);
  if ((options.finalStretch ?? store.finalStretch) && !explicitExtendedPool) {
    return selectFinalStretchQuestions(pool, store, count, now, rng);
  }
  return pool
    .map((question, index) => ({ question, index, score: priority(question, store, now, options.finalStretch ?? store.finalStretch) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map((item) => item.question);
}

export function selectFinalStretchQuestions(
  questions: CultureQuestion[],
  store: CultureStore,
  count: number,
  now: Date,
  rng: Rng,
): CultureQuestion[] {
  const core = questions.filter((question) => question.tier === 'core');
  const coverage = core.length === 0 ? 0 : core.filter((question) => (store.progress[question.id]?.seenCount ?? 0) > 0).length / core.length;
  const allowExtended = coverage >= 0.9;
  const newCore = core.filter((question) => !(store.progress[question.id]?.seenCount));
  const errors = questions.filter((question) => hasActiveError(store.progress[question.id]) && (allowExtended || question.tier === 'core'));
  const weakCore = core.filter((question) => {
    const progress = store.progress[question.id];
    if (!progress?.seenCount || progress.examReady || hasActiveError(progress)) return false;
    const uncertain = progress.lastVerdict;
    const weakEvidence = progress.incorrectCount > 0 || uncertain === 'guessed' || uncertain === 'review';
    return weakEvidence && (isQuestionDue(progress, now) || newCore.length === 0);
  });
  const consolidationCore = core.filter((question) => {
    const progress = store.progress[question.id];
    return Boolean(progress?.seenCount && !hasActiveError(progress) && !weakCore.includes(question) && isQuestionDue(progress, now));
  });
  const extended = allowExtended
    ? questions.filter((question) => question.tier === 'extended' && !hasActiveError(store.progress[question.id]) && (!(store.progress[question.id]?.seenCount) || isQuestionDue(store.progress[question.id], now)))
    : [];

  const ratios = [0.4, 8 / 30, 0.2, 4 / 30];
  const quotas = ratios.map((ratio) => Math.floor(count * ratio));
  while (quotas.reduce((sum, value) => sum + value, 0) < count) quotas[0] += 1;
  const selected: CultureQuestion[] = [];
  const categoryCounts = new Map<CultureCategory, number>();
  const categoryCap = Math.max(1, Math.ceil(count * 0.4));
  const extendedCap = Math.floor(count * 0.2);

  function take(pool: CultureQuestion[], wanted: number): void {
    const candidates = shuffle(rng, pool.filter((question) => !selected.some((item) => item.id === question.id)));
    let added = 0;
    for (const question of candidates) {
      if (added >= wanted || selected.length >= count) break;
      if ((categoryCounts.get(question.category) ?? 0) >= categoryCap) continue;
      if (question.tier === 'extended' && selected.filter((item) => item.tier === 'extended').length >= extendedCap) continue;
      selected.push(question);
      categoryCounts.set(question.category, (categoryCounts.get(question.category) ?? 0) + 1);
      added += 1;
    }
  }

  const pools = [newCore, errors, weakCore, [...consolidationCore, ...extended]];
  pools.forEach((pool, index) => take(pool, quotas[index]));
  let cursor = 0;
  while (selected.length < count && cursor < pools.length) {
    const before = selected.length;
    take(pools[cursor], count - selected.length);
    if (selected.length === before) cursor += 1;
  }
  return shuffle(rng, selected).slice(0, count);
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
