import { describe, expect, it } from 'vitest';
import { emptyProgress, hasActiveError, isQuestionDue, markProgressUnderstood, reviewQuestion } from './progress';

const T0 = new Date('2026-08-29T08:00:00.000Z');

describe('répétition espacée Culture V2', () => {
  it('programme rapidement une erreur et la conserve active', () => {
    const next = reviewQuestion(undefined, 'q1', 'wrong', T0);
    expect(next).toMatchObject({ seenCount: 1, incorrectCount: 1, currentStreak: 0, mastery: 'learning', confidence: 0 });
    expect(next.nextReviewAt).toBe('2026-08-29T12:00:00.000Z');
    expect(hasActiveError(next)).toBe(true);
  });

  it('place une réponse devinée en review à un jour', () => {
    const next = reviewQuestion(undefined, 'q1', 'guessed', T0);
    expect(next).toMatchObject({ correctCount: 1, currentStreak: 0, mastery: 'review', confidence: 1 });
    expect(next.nextReviewAt).toBe('2026-08-30T08:00:00.000Z');
  });

  it('fait progresser une réponse sue vers mastered', () => {
    const first = reviewQuestion(undefined, 'q1', 'known', T0);
    const second = reviewQuestion(first, 'q1', 'known', T0);
    const third = reviewQuestion(second, 'q1', 'known', T0);
    expect(first.mastery).toBe('learning');
    expect(second.mastery).toBe('review');
    expect(third).toMatchObject({ mastery: 'mastered', currentStreak: 3, correctCount: 3 });
  });

  it('ne retire une erreur qu’après deux réponses sues', () => {
    const wrong = reviewQuestion(undefined, 'q1', 'wrong', T0);
    const once = reviewQuestion(wrong, 'q1', 'known', T0);
    const twice = reviewQuestion(once, 'q1', 'known', T0);
    expect(hasActiveError(once)).toBe(true);
    expect(hasActiveError(twice)).toBe(false);
  });

  it('permet de marquer explicitement une erreur comprise', () => {
    const wrong = reviewQuestion(undefined, 'q1', 'wrong', T0);
    const understood = markProgressUnderstood(wrong, T0);
    expect(hasActiveError(understood)).toBe(false);
    expect(understood.understoodAt).toBe(T0.toISOString());
  });

  it('détecte les échéances sans considérer toutes les nouvelles comme dues', () => {
    expect(isQuestionDue(undefined, T0)).toBe(false);
    const known = reviewQuestion(emptyProgress('q1'), 'q1', 'known', T0);
    expect(isQuestionDue(known, new Date('2026-08-31T07:59:59.999Z'))).toBe(false);
    expect(isQuestionDue(known, new Date('2026-08-31T08:00:00.000Z'))).toBe(true);
  });
});
