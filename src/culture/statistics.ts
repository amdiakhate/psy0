import { CULTURE_CATEGORY_IDS } from './data/categories';
import { hasActiveError, isQuestionDue } from './progress';
import { categoryAccuracy } from './selection';
import type { CultureCategory, CultureQuestion, CultureStore } from './types';

export interface CultureCategoryStats {
  category: CultureCategory;
  total: number;
  seen: number;
  mastered: number;
  errors: number;
  due: number;
  accuracy: number | null;
  sampleSize: number;
  coreTotal: number;
  coreSeen: number;
  coreUnseen: number;
}

export interface CultureDayStats {
  day: string;
  attempts: number;
  accuracy: number;
}

export interface CultureDashboardStats {
  total: number;
  seen: number;
  mastered: number;
  errors: number;
  due: number;
  toReview: number;
  accuracy: number;
  masteryPercent: number;
  streak: number;
  lastTrainingAt?: string;
  weakest: CultureCategoryStats[];
  toExplore: CultureCategoryStats[];
  categories: CultureCategoryStats[];
  lastSevenDays: CultureDayStats[];
  core: CultureTierStats;
  extended: CultureTierStats;
}

export interface CultureTierStats {
  total: number;
  seen: number;
  mastered: number;
  coverage: number;
  attemptAccuracy: number;
  currentAccuracy: number;
  examReady: number;
  solid: number;
  solidRate: number;
}

function tierStats(questions: CultureQuestion[], store: CultureStore, tier: CultureQuestion['tier']): CultureTierStats {
  const pool = questions.filter((question) => question.tier === tier);
  const ids = new Set(pool.map((question) => question.id));
  const attempts = store.attempts.filter((attempt) => ids.has(attempt.questionId));
  const viewedProgress = pool.map((question) => store.progress[question.id]).filter((progress) => progress?.seenCount && progress.lastVerdict);
  const seen = pool.filter((question) => (store.progress[question.id]?.seenCount ?? 0) > 0).length;
  const solid = pool.filter((question) => {
    const progress = store.progress[question.id];
    const lastVerdictCorrect = progress?.lastVerdict === 'known' || progress?.lastVerdict === 'guessed' || progress?.lastVerdict === 'review';
    return Boolean(progress?.seenCount && lastVerdictCorrect && !hasActiveError(progress));
  }).length;
  return {
    total: pool.length,
    seen,
    mastered: pool.filter((question) => store.progress[question.id]?.mastery === 'mastered').length,
    coverage: pool.length === 0 ? 0 : seen / pool.length,
    attemptAccuracy: attempts.length === 0 ? 0 : attempts.filter((attempt) => attempt.correct).length / attempts.length,
    currentAccuracy: viewedProgress.length === 0 ? 0 : viewedProgress.filter((progress) => progress.lastVerdict !== 'wrong').length / viewedProgress.length,
    examReady: pool.filter((question) => store.progress[question.id]?.examReady).length,
    solid,
    solidRate: seen === 0 ? 0 : solid / seen,
  };
}

function localDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function cultureStreak(activeDays: string[], now: Date): number {
  const days = new Set(activeDays);
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(localDay(cursor))) cursor = new Date(cursor.getTime() - 86_400_000);
  let streak = 0;
  while (days.has(localDay(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

export function getCategoryStats(
  questions: CultureQuestion[],
  store: CultureStore,
  now: Date,
): CultureCategoryStats[] {
  return CULTURE_CATEGORY_IDS.map((category) => {
    const pool = questions.filter((question) => question.categories.includes(category));
    const corePool = pool.filter((question) => question.tier === 'core');
    const coreSeen = corePool.filter((question) => (store.progress[question.id]?.seenCount ?? 0) > 0).length;
    return {
      category,
      total: pool.length,
      seen: pool.filter((question) => (store.progress[question.id]?.seenCount ?? 0) > 0).length,
      mastered: pool.filter((question) => store.progress[question.id]?.mastery === 'mastered').length,
      errors: pool.filter((question) => hasActiveError(store.progress[question.id])).length,
      due: pool.filter((question) => isQuestionDue(store.progress[question.id], now)).length,
      accuracy: categoryAccuracy(store, category),
      sampleSize: new Set(store.attempts.filter((attempt) => attempt.category === category).map((attempt) => attempt.questionId)).size,
      coreTotal: corePool.length,
      coreSeen,
      coreUnseen: corePool.length - coreSeen,
    };
  });
}

export function sevenDayHistory(store: CultureStore, now: Date): CultureDayStats[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    const day = localDay(date);
    const attempts = store.attempts.filter((attempt) => localDay(new Date(attempt.answeredAt)) === day);
    const correct = attempts.filter((attempt) => attempt.correct).length;
    return { day, attempts: attempts.length, accuracy: attempts.length === 0 ? 0 : correct / attempts.length };
  });
}

export function getCultureDashboardStats(
  questions: CultureQuestion[],
  store: CultureStore,
  now: Date,
): CultureDashboardStats {
  const categories = getCategoryStats(questions, store, now);
  const seen = questions.filter((question) => (store.progress[question.id]?.seenCount ?? 0) > 0).length;
  const mastered = questions.filter((question) => store.progress[question.id]?.mastery === 'mastered').length;
  const errors = questions.filter((question) => hasActiveError(store.progress[question.id])).length;
  const due = questions.filter((question) => isQuestionDue(store.progress[question.id], now)).length;
  const toReview = questions.filter((question) => {
    const progress = store.progress[question.id];
    return progress?.mastery === 'learning' || progress?.mastery === 'review';
  }).length;
  const correct = store.attempts.filter((attempt) => attempt.correct).length;
  const weakest = categories
    .filter((item) => item.sampleSize >= 5 && item.accuracy !== null && item.accuracy < 0.85)
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
    .slice(0, 3);
  const toExplore = categories
    .filter((item) => item.sampleSize < 5)
    .sort((a, b) => b.coreUnseen - a.coreUnseen || a.sampleSize - b.sampleSize)
    .slice(0, 3);
  return {
    total: questions.length,
    seen,
    mastered,
    errors,
    due,
    toReview,
    accuracy: store.attempts.length === 0 ? 0 : correct / store.attempts.length,
    masteryPercent: questions.length === 0 ? 0 : mastered / questions.length,
    streak: cultureStreak(store.activeDays, now),
    lastTrainingAt: store.lastTrainingAt,
    weakest,
    toExplore,
    categories,
    lastSevenDays: sevenDayHistory(store, now),
    core: tierStats(questions, store, 'core'),
    extended: tierStats(questions, store, 'extended'),
  };
}
