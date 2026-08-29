import type { CultureProgress, CultureReviewVerdict } from './types';

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export function emptyProgress(questionId: string): CultureProgress {
  return {
    questionId,
    seenCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    currentStreak: 0,
    mastery: 'new',
  };
}

function nextKnownState(streak: number): Pick<CultureProgress, 'mastery' | 'confidence'> & { delay: number } {
  if (streak <= 1) return { mastery: 'learning', confidence: 2, delay: 2 * DAY_MS };
  if (streak === 2) return { mastery: 'review', confidence: 3, delay: 7 * DAY_MS };
  return { mastery: 'mastered', confidence: 3, delay: streak >= 5 ? 45 * DAY_MS : 21 * DAY_MS };
}

export function reviewQuestion(
  current: CultureProgress | undefined,
  questionId: string,
  verdict: CultureReviewVerdict,
  now: Date,
): CultureProgress {
  const previous = current ?? emptyProgress(questionId);
  const timestamp = now.toISOString();
  const base = {
    ...previous,
    questionId,
    seenCount: previous.seenCount + 1,
    lastSeenAt: timestamp,
    understoodAt: undefined,
  };

  if (verdict === 'wrong') {
    return {
      ...base,
      incorrectCount: previous.incorrectCount + 1,
      currentStreak: 0,
      mastery: 'learning',
      confidence: 0,
      lastIncorrectAt: timestamp,
      nextReviewAt: new Date(now.getTime() + 4 * HOUR_MS).toISOString(),
    };
  }

  if (verdict === 'review') {
    return {
      ...base,
      correctCount: previous.correctCount + 1,
      currentStreak: 0,
      mastery: 'learning',
      confidence: 0,
      nextReviewAt: new Date(now.getTime() + 12 * HOUR_MS).toISOString(),
    };
  }

  if (verdict === 'guessed') {
    return {
      ...base,
      correctCount: previous.correctCount + 1,
      currentStreak: 0,
      mastery: 'review',
      confidence: 1,
      nextReviewAt: new Date(now.getTime() + DAY_MS).toISOString(),
    };
  }

  const currentStreak = previous.currentStreak + 1;
  const state = nextKnownState(currentStreak);
  return {
    ...base,
    correctCount: previous.correctCount + 1,
    currentStreak,
    mastery: state.mastery,
    confidence: state.confidence,
    nextReviewAt: new Date(now.getTime() + state.delay).toISOString(),
  };
}

export function isQuestionDue(progress: CultureProgress | undefined, now: Date): boolean {
  if (!progress?.nextReviewAt) return false;
  return new Date(progress.nextReviewAt).getTime() <= now.getTime();
}

export function hasActiveError(progress: CultureProgress | undefined): boolean {
  if (!progress || progress.incorrectCount === 0 || progress.understoodAt) return false;
  return progress.currentStreak < 2;
}

export function markProgressUnderstood(progress: CultureProgress, now: Date): CultureProgress {
  return {
    ...progress,
    understoodAt: now.toISOString(),
    currentStreak: Math.max(progress.currentStreak, 2),
    mastery: progress.mastery === 'mastered' ? 'mastered' : 'review',
    nextReviewAt: new Date(now.getTime() + 7 * DAY_MS).toISOString(),
  };
}
