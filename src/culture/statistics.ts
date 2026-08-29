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
  categories: CultureCategoryStats[];
  lastSevenDays: CultureDayStats[];
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
    return {
      category,
      total: pool.length,
      seen: pool.filter((question) => (store.progress[question.id]?.seenCount ?? 0) > 0).length,
      mastered: pool.filter((question) => store.progress[question.id]?.mastery === 'mastered').length,
      errors: pool.filter((question) => hasActiveError(store.progress[question.id])).length,
      due: pool.filter((question) => isQuestionDue(store.progress[question.id], now)).length,
      accuracy: categoryAccuracy(store, category),
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
    .filter((item) => item.accuracy !== null)
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
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
    categories,
    lastSevenDays: sevenDayHistory(store, now),
  };
}
