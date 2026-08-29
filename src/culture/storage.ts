import { loadJson, saveJson } from '../core/storage';
import { emptyProgress, markProgressUnderstood, reviewQuestion } from './progress';
import type {
  CultureAttempt,
  CultureProgress,
  CultureReviewVerdict,
  CultureSessionMode,
  CultureSessionSummary,
  CultureStore,
} from './types';

export const CULTURE_STORAGE_KEY = 'culture-v2';
export const CULTURE_STORAGE_VERSION = 1 as const;
const MAX_ATTEMPTS = 2_000;
const MAX_SESSIONS = 100;

export function emptyCultureStore(): CultureStore {
  return {
    version: CULTURE_STORAGE_VERSION,
    progress: {},
    favoriteQuestionIds: [],
    favoriteLessonIds: [],
    attempts: [],
    sessions: [],
    activeDays: [],
    finalStretch: false,
  };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeProgress(value: unknown): Record<string, CultureProgress> {
  if (!isRecord(value)) return {};
  const result: Record<string, CultureProgress> = {};
  for (const [id, item] of Object.entries(value)) {
    if (!isRecord(item)) continue;
    const mastery = item.mastery;
    if (!['new', 'learning', 'review', 'mastered'].includes(String(mastery))) continue;
    result[id] = {
      questionId: id,
      seenCount: typeof item.seenCount === 'number' ? item.seenCount : 0,
      correctCount: typeof item.correctCount === 'number' ? item.correctCount : 0,
      incorrectCount: typeof item.incorrectCount === 'number' ? item.incorrectCount : 0,
      currentStreak: typeof item.currentStreak === 'number' ? item.currentStreak : 0,
      mastery: mastery as CultureProgress['mastery'],
      lastSeenAt: typeof item.lastSeenAt === 'string' ? item.lastSeenAt : undefined,
      lastIncorrectAt: typeof item.lastIncorrectAt === 'string' ? item.lastIncorrectAt : undefined,
      nextReviewAt: typeof item.nextReviewAt === 'string' ? item.nextReviewAt : undefined,
      confidence: [0, 1, 2, 3].includes(Number(item.confidence)) ? item.confidence as CultureProgress['confidence'] : undefined,
      understoodAt: typeof item.understoodAt === 'string' ? item.understoodAt : undefined,
    };
  }
  return result;
}

export function migrateCultureStore(value: unknown): CultureStore {
  if (!isRecord(value) || value.version !== CULTURE_STORAGE_VERSION) return emptyCultureStore();
  return {
    version: CULTURE_STORAGE_VERSION,
    progress: normalizeProgress(value.progress),
    favoriteQuestionIds: stringArray(value.favoriteQuestionIds),
    favoriteLessonIds: stringArray(value.favoriteLessonIds),
    attempts: Array.isArray(value.attempts) ? value.attempts.filter(isRecord) as unknown as CultureAttempt[] : [],
    sessions: Array.isArray(value.sessions) ? value.sessions.filter(isRecord) as unknown as CultureSessionSummary[] : [],
    activeDays: stringArray(value.activeDays),
    lastTrainingAt: typeof value.lastTrainingAt === 'string' ? value.lastTrainingAt : undefined,
    finalStretch: value.finalStretch === true,
  };
}

export function loadCultureStore(): CultureStore {
  return migrateCultureStore(loadJson<unknown>(CULTURE_STORAGE_KEY, null));
}

export function saveCultureStore(store: CultureStore): void {
  saveJson(CULTURE_STORAGE_KEY, store);
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function recordCultureAnswer(args: {
  store: CultureStore;
  questionId: string;
  category: CultureAttempt['category'];
  verdict: CultureReviewVerdict;
  sessionId: string;
  mode: CultureSessionMode;
  now: Date;
}): CultureStore {
  const { store, questionId, category, verdict, sessionId, mode, now } = args;
  const progress = reviewQuestion(store.progress[questionId], questionId, verdict, now);
  const attempt: CultureAttempt = {
    id: `${sessionId}:${questionId}:${now.getTime()}:${store.attempts.length}`,
    questionId,
    category,
    answeredAt: now.toISOString(),
    correct: verdict === 'known' || verdict === 'guessed' || verdict === 'review',
    verdict,
    sessionId,
    mode,
  };
  return {
    ...store,
    progress: { ...store.progress, [questionId]: progress },
    attempts: [...store.attempts, attempt].slice(-MAX_ATTEMPTS),
    activeDays: [...new Set([...store.activeDays, dayKey(now)])].sort(),
    lastTrainingAt: now.toISOString(),
  };
}

export function recordCultureSession(store: CultureStore, session: CultureSessionSummary): CultureStore {
  return { ...store, sessions: [...store.sessions, session].slice(-MAX_SESSIONS) };
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id];
}

export function toggleFavoriteQuestion(store: CultureStore, id: string): CultureStore {
  return { ...store, favoriteQuestionIds: toggleId(store.favoriteQuestionIds, id) };
}

export function toggleFavoriteLesson(store: CultureStore, id: string): CultureStore {
  return { ...store, favoriteLessonIds: toggleId(store.favoriteLessonIds, id) };
}

export function setFinalStretch(store: CultureStore, enabled: boolean): CultureStore {
  return { ...store, finalStretch: enabled };
}

export function markQuestionUnderstood(store: CultureStore, id: string, now: Date): CultureStore {
  const current = store.progress[id] ?? emptyProgress(id);
  return { ...store, progress: { ...store.progress, [id]: markProgressUnderstood(current, now) } };
}
