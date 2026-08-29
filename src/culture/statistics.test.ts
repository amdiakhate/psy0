import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './bank';
import { categoryCoreCoverageLabel } from './dashboardMetrics';
import { getCultureDashboardStats } from './statistics';
import { emptyCultureStore, recordCultureAnswer } from './storage';
import type { CultureQuestion } from './types';

describe('statistiques Culture', () => {
  it('calcule le taux, les erreurs, les échéances et les faiblesses', () => {
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    store = recordCultureAnswer({ store, questionId: 'doc26-03', category: 'navigation', verdict: 'wrong', sessionId: 's', mode: 'review', now });
    store = recordCultureAnswer({ store, questionId: 'doc26-33', category: 'weather', verdict: 'known', sessionId: 's', mode: 'review', now });
    const stats = getCultureDashboardStats(QUESTIONS, store, new Date('2026-08-30T13:00:00Z'));
    expect(stats).toMatchObject({ seen: 2, mastered: 0, errors: 1, due: 1, toReview: 2, accuracy: 0.5, streak: 1 });
    expect(stats.weakest).toEqual([]);
  });

  it('produit sept jours même sans activité', () => {
    const stats = getCultureDashboardStats(QUESTIONS, emptyCultureStore(), new Date('2026-08-29T12:00:00Z'));
    expect(stats.lastSevenDays).toHaveLength(7);
    expect(stats.categories).toHaveLength(12);
    expect(stats.accuracy).toBe(0);
    expect(stats.core).toMatchObject({ total: 180, seen: 0, mastered: 0, coverage: 0, attemptAccuracy: 0, currentAccuracy: 0, examReady: 0 });
    expect(stats.extended).toMatchObject({ total: 200, seen: 0, mastered: 0, coverage: 0, attemptAccuracy: 0, currentAccuracy: 0, examReady: 0 });
  });

  it('sépare couverture et réussite CORE et EXTENDED', () => {
    const core = QUESTIONS.find((question) => question.highYield)!;
    const extended = QUESTIONS.find((question) => !question.highYield)!;
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    store = recordCultureAnswer({ store, questionId: core.id, category: core.category, verdict: 'known', sessionId: 's', mode: 'review', now });
    store = recordCultureAnswer({ store, questionId: extended.id, category: extended.category, verdict: 'wrong', sessionId: 's', mode: 'review', now });
    const stats = getCultureDashboardStats(QUESTIONS, store, now);
    expect(stats.core).toMatchObject({ total: 180, seen: 1, coverage: 1 / 180, attemptAccuracy: 1, currentAccuracy: 1 });
    expect(stats.extended).toMatchObject({ total: 200, seen: 1, coverage: 1 / 200, attemptAccuracy: 0, currentAccuracy: 0 });
  });

  it('calcule la réussite actuelle avec le dernier verdict de chaque question distincte', () => {
    const [first, second] = QUESTIONS.filter((question) => question.tier === 'core').slice(0, 2);
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    store = recordCultureAnswer({ store, questionId: first.id, category: first.category, verdict: 'wrong', sessionId: 's1', mode: 'review', now });
    store = recordCultureAnswer({ store, questionId: first.id, category: first.category, verdict: 'known', sessionId: 's2', mode: 'review', now: new Date(now.getTime() + 1_000) });
    store = recordCultureAnswer({ store, questionId: second.id, category: second.category, verdict: 'wrong', sessionId: 's1', mode: 'review', now });
    const stats = getCultureDashboardStats(QUESTIONS, store, now);
    expect(stats.core.attemptAccuracy).toBeCloseTo(1 / 3);
    expect(stats.core.currentAccuracy).toBe(0.5);
  });

  it('ne compte comme solide qu’une CORE correcte sans erreur active', () => {
    const [solid, unresolved] = QUESTIONS.filter((question) => question.tier === 'core').slice(0, 2);
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    store = recordCultureAnswer({ store, questionId: solid.id, category: solid.category, verdict: 'known', sessionId: 's1', mode: 'review', now });
    store = recordCultureAnswer({ store, questionId: unresolved.id, category: unresolved.category, verdict: 'wrong', sessionId: 's2', mode: 'review', now });
    store = recordCultureAnswer({ store, questionId: unresolved.id, category: unresolved.category, verdict: 'known', sessionId: 's2', mode: 'review', now: new Date(now.getTime() + 1_000) });
    const stats = getCultureDashboardStats(QUESTIONS, store, now);
    expect(stats.core.currentAccuracy).toBe(1);
    expect(stats.core).toMatchObject({ seen: 2, solid: 1, solidRate: 0.5 });
  });

  it('sépare les vrais points faibles des catégories à explorer', () => {
    const navigation = QUESTIONS.filter((question) => question.category === 'navigation').slice(0, 5);
    const weather = QUESTIONS.filter((question) => question.category === 'weather').slice(0, 5);
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    for (const question of navigation) {
      store = recordCultureAnswer({ store, questionId: question.id, category: question.category, verdict: 'known', sessionId: 'navigation', mode: 'review', now });
    }
    for (const [index, question] of weather.entries()) {
      store = recordCultureAnswer({ store, questionId: question.id, category: question.category, verdict: index === 0 ? 'wrong' : 'known', sessionId: 'weather', mode: 'review', now });
    }
    const stats = getCultureDashboardStats(QUESTIONS, store, now);
    expect(stats.weakest.map((item) => item.category)).toContain('weather');
    expect(stats.weakest.map((item) => item.category)).not.toContain('navigation');
    expect(stats.weakest.every((item) => item.sampleSize >= 5 && (item.accuracy ?? 1) < 0.85)).toBe(true);
    expect(stats.toExplore.every((item) => item.sampleSize < 5)).toBe(true);
    expect(stats.toExplore.map((item) => item.coreUnseen)).toEqual(
      stats.toExplore.map((item) => item.coreUnseen).sort((a, b) => b - a),
    );
  });

  it('compte les mêmes CORE mental-math avec une catégorie principale ou secondaire', () => {
    const secondaryMentalMath: CultureQuestion = {
      ...QUESTIONS[0],
      id: 'test-secondary-mental-math',
      tier: 'core',
      highYield: true,
      category: 'navigation',
      categories: ['navigation', 'mental-math'],
    };
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    store = recordCultureAnswer({
      store,
      questionId: secondaryMentalMath.id,
      category: secondaryMentalMath.category,
      verdict: 'known',
      sessionId: 'secondary-category',
      mode: 'review',
      now,
    });
    const stats = getCultureDashboardStats([secondaryMentalMath], store, now);
    const mentalMath = stats.categories.find((item) => item.category === 'mental-math')!;
    expect(mentalMath).toMatchObject({
      coreTotal: 1,
      coreSeen: 1,
      coreUnseen: 0,
    });
    expect(categoryCoreCoverageLabel(mentalMath)).toBe('1/1 CORE vues');
  });
});
