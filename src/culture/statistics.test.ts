import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './bank';
import { getCultureDashboardStats } from './statistics';
import { emptyCultureStore, recordCultureAnswer } from './storage';

describe('statistiques Culture', () => {
  it('calcule le taux, les erreurs, les échéances et les faiblesses', () => {
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    store = recordCultureAnswer({ store, questionId: 'doc26-03', category: 'navigation', verdict: 'wrong', sessionId: 's', mode: 'review', now });
    store = recordCultureAnswer({ store, questionId: 'doc26-33', category: 'weather', verdict: 'known', sessionId: 's', mode: 'review', now });
    const stats = getCultureDashboardStats(QUESTIONS, store, new Date('2026-08-30T13:00:00Z'));
    expect(stats).toMatchObject({ seen: 2, mastered: 0, errors: 1, due: 1, toReview: 2, accuracy: 0.5, streak: 1 });
    expect(stats.weakest[0].category).toBe('navigation');
  });

  it('produit sept jours même sans activité', () => {
    const stats = getCultureDashboardStats(QUESTIONS, emptyCultureStore(), new Date('2026-08-29T12:00:00Z'));
    expect(stats.lastSevenDays).toHaveLength(7);
    expect(stats.categories).toHaveLength(12);
    expect(stats.accuracy).toBe(0);
    expect(stats.core).toMatchObject({ total: 180, seen: 0, mastered: 0, coverage: 0, accuracy: 0 });
    expect(stats.extended).toMatchObject({ total: 200, seen: 0, mastered: 0, coverage: 0, accuracy: 0 });
  });

  it('sépare couverture et réussite CORE et EXTENDED', () => {
    const core = QUESTIONS.find((question) => question.highYield)!;
    const extended = QUESTIONS.find((question) => !question.highYield)!;
    let store = emptyCultureStore();
    const now = new Date('2026-08-29T12:00:00Z');
    store = recordCultureAnswer({ store, questionId: core.id, category: core.category, verdict: 'known', sessionId: 's', mode: 'review', now });
    store = recordCultureAnswer({ store, questionId: extended.id, category: extended.category, verdict: 'wrong', sessionId: 's', mode: 'review', now });
    const stats = getCultureDashboardStats(QUESTIONS, store, now);
    expect(stats.core).toMatchObject({ total: 180, seen: 1, coverage: 1 / 180, accuracy: 1 });
    expect(stats.extended).toMatchObject({ total: 200, seen: 1, coverage: 1 / 200, accuracy: 0 });
  });
});
