import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { QUESTIONS } from './bank';
import { reviewQuestion } from './progress';
import { categoryAccuracy, selectBalancedSimulation, selectFinalStretchQuestions, selectReviewQuestions } from './selection';
import { emptyCultureStore, recordCultureAnswer } from './storage';

const NOW = new Date('2026-08-29T12:00:00Z');

describe('sélection Culture', () => {
  it('priorise erreur récente, question due puis question nouvelle', () => {
    const [wrong, due, fresh] = QUESTIONS.slice(0, 3);
    const store = emptyCultureStore();
    store.progress[wrong.id] = reviewQuestion(undefined, wrong.id, 'wrong', new Date('2026-08-29T11:00:00Z'));
    store.progress[due.id] = reviewQuestion(undefined, due.id, 'guessed', new Date('2026-08-27T10:00:00Z'));
    const selected = selectReviewQuestions([fresh, due, wrong], store, 3, NOW, mulberry32(1));
    expect(selected.map((question) => question.id)).toEqual([wrong.id, due.id, fresh.id]);
  });

  it('filtre erreurs, nouvelles et questions pièges', () => {
    const store = emptyCultureStore();
    const wrong = QUESTIONS[0];
    store.progress[wrong.id] = reviewQuestion(undefined, wrong.id, 'wrong', NOW);
    expect(selectReviewQuestions(QUESTIONS, store, 20, NOW, mulberry32(2), { filter: 'errors' }).map((q) => q.id)).toEqual([wrong.id]);
    expect(selectReviewQuestions(QUESTIONS, store, 400, NOW, mulberry32(2), { filter: 'new' })).toHaveLength(379);
    expect(selectReviewQuestions(QUESTIONS, store, 80, NOW, mulberry32(2), { filter: 'traps' }).every((q) => q.trap)).toBe(true);
  });

  it('30 erreurs actives ne suppriment pas le quota de CORE nouvelles', () => {
    const store = emptyCultureStore();
    const errorQuestions = QUESTIONS.filter((question) => question.tier === 'core').slice(0, 30);
    for (const question of errorQuestions) store.progress[question.id] = reviewQuestion(undefined, question.id, 'wrong', NOW);
    const selected = selectFinalStretchQuestions(QUESTIONS, store, 30, NOW, mulberry32(9));
    expect(selected).toHaveLength(30);
    expect(selected.filter((question) => store.progress[question.id]?.activeError)).toHaveLength(8);
    expect(selected.filter((question) => !store.progress[question.id]?.seenCount)).toHaveLength(22);
  });

  it('applique exactement les quotas 12/8/6/4 quand les quatre viviers sont disponibles', () => {
    const coreByCategory = new Map<string, typeof QUESTIONS>();
    for (const question of QUESTIONS.filter((item) => item.tier === 'core')) {
      coreByCategory.set(question.category, [...(coreByCategory.get(question.category) ?? []), question]);
    }
    const balancedCore = Array.from({ length: 20 }, (_, round) => [...coreByCategory.values()].map((items) => items[round]).filter(Boolean)).flat();
    const errors = balancedCore.slice(0, 10);
    const weak = balancedCore.slice(10, 16);
    const consolidation = balancedCore.slice(16, 20);
    let store = emptyCultureStore();
    for (const question of errors) {
      store = recordCultureAnswer({ store, questionId: question.id, category: question.category, verdict: 'wrong', sessionId: `error-${question.id}`, mode: 'review', now: new Date('2026-08-28T08:00:00Z') });
    }
    for (const question of weak) {
      store = recordCultureAnswer({ store, questionId: question.id, category: question.category, verdict: 'wrong', sessionId: `weak-a-${question.id}`, mode: 'review', now: new Date('2026-08-20T08:00:00Z') });
      store = recordCultureAnswer({ store, questionId: question.id, category: question.category, verdict: 'known', sessionId: `weak-b-${question.id}`, mode: 'review', now: new Date('2026-08-20T13:00:00Z') });
    }
    for (const question of consolidation) {
      store = recordCultureAnswer({ store, questionId: question.id, category: question.category, verdict: 'known', sessionId: `known-${question.id}`, mode: 'review', now: new Date('2026-08-20T08:00:00Z') });
    }
    const selected = selectFinalStretchQuestions(QUESTIONS, store, 30, NOW, mulberry32(91));
    const ids = new Set(selected.map((question) => question.id));
    expect(selected).toHaveLength(30);
    expect(errors.filter((question) => ids.has(question.id))).toHaveLength(8);
    expect(weak.filter((question) => ids.has(question.id))).toHaveLength(6);
    expect(consolidation.filter((question) => ids.has(question.id))).toHaveLength(4);
    expect(selected.filter((question) => !store.progress[question.id]?.seenCount)).toHaveLength(12);
  });

  it('ne sélectionne aucune Extended automatique sous 90 % de couverture CORE', () => {
    const selected = selectFinalStretchQuestions(QUESTIONS, emptyCultureStore(), 30, NOW, mulberry32(3));
    expect(selected).toHaveLength(30);
    expect(selected.every((question) => question.tier === 'core')).toBe(true);
  });

  it('limite les Extended automatiques à 20 % après 90 % de couverture CORE', () => {
    let store = emptyCultureStore();
    const old = new Date('2026-08-01T12:00:00Z');
    for (const question of QUESTIONS.filter((item) => item.tier === 'core').slice(0, 162)) {
      store = recordCultureAnswer({ store, questionId: question.id, category: question.category, verdict: 'known', sessionId: `s-${question.id}`, mode: 'review', now: old });
    }
    const selected = selectFinalStretchQuestions(QUESTIONS, store, 30, NOW, mulberry32(31));
    expect(selected).toHaveLength(30);
    expect(selected.filter((question) => question.tier === 'extended').length).toBeLessThanOrEqual(6);
  });

  it('empêche une catégorie de monopoliser une session J-5', () => {
    const selected = selectFinalStretchQuestions(QUESTIONS, emptyCultureStore(), 30, NOW, mulberry32(32));
    const counts = new Map<string, number>();
    for (const question of selected) counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(12);
  });

  it('n’établit pas de faiblesse avec seulement deux questions distinctes', () => {
    let store = emptyCultureStore();
    const weather = QUESTIONS.filter((question) => question.category === 'weather').slice(0, 2);
    for (const question of weather) store = recordCultureAnswer({ store, questionId: question.id, category: 'weather', verdict: 'wrong', sessionId: 's', mode: 'review', now: NOW });
    expect(categoryAccuracy(store, 'weather')).toBeNull();
  });

  it('calcule une catégorie sur le dernier verdict de cinq questions distinctes', () => {
    let store = emptyCultureStore();
    const weather = QUESTIONS.filter((question) => question.category === 'weather').slice(0, 5);
    for (const question of weather) store = recordCultureAnswer({ store, questionId: question.id, category: 'weather', verdict: 'wrong', sessionId: 's1', mode: 'review', now: NOW });
    store = recordCultureAnswer({ store, questionId: weather[0].id, category: 'weather', verdict: 'known', sessionId: 's2', mode: 'review', now: new Date(NOW.getTime() + 1_000) });
    expect(categoryAccuracy(store, 'weather')).toBe(0.2);
  });

  it('identifie une catégorie faible à partir des essais', () => {
    let store = emptyCultureStore();
    for (const question of QUESTIONS.filter((item) => item.category === 'navigation').slice(0, 5)) {
      store = recordCultureAnswer({ store, questionId: question.id, category: 'navigation', verdict: 'wrong', sessionId: 's', mode: 'quick-quiz', now: NOW });
    }
    for (const question of QUESTIONS.filter((item) => item.category === 'weather').slice(0, 5)) {
      store = recordCultureAnswer({ store, questionId: question.id, category: 'weather', verdict: 'known', sessionId: 's', mode: 'quick-quiz', now: NOW });
    }
    const selected = selectReviewQuestions(QUESTIONS, store, 20, NOW, mulberry32(4), { filter: 'weak' });
    expect(selected[0].categories).toContain('navigation');
    expect(selected.every((question) => question.categories.includes('navigation'))).toBe(true);
  });

  it('équilibre la simulation entre les catégories disponibles', () => {
    const simulation = selectBalancedSimulation(QUESTIONS, 20, mulberry32(5));
    const counts = new Map<string, number>();
    for (const question of simulation) counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
    expect(simulation).toHaveLength(20);
    expect(new Set(simulation.map((question) => question.id)).size).toBe(20);
    expect(Math.max(...counts.values()) - Math.min(...counts.values())).toBeLessThanOrEqual(1);
  });
});
