import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { QUESTIONS } from './bank';
import { reviewQuestion } from './progress';
import { selectBalancedSimulation, selectReviewQuestions } from './selection';
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
    expect(selectReviewQuestions(QUESTIONS, store, 80, NOW, mulberry32(2), { filter: 'new' })).toHaveLength(79);
    expect(selectReviewQuestions(QUESTIONS, store, 80, NOW, mulberry32(2), { filter: 'traps' }).every((q) => q.trap)).toBe(true);
  });

  it('identifie une catégorie faible à partir des essais', () => {
    let store = emptyCultureStore();
    store = recordCultureAnswer({ store, questionId: 'doc26-03', category: 'navigation', verdict: 'wrong', sessionId: 's', mode: 'quick-quiz', now: NOW });
    store = recordCultureAnswer({ store, questionId: 'doc26-33', category: 'weather', verdict: 'known', sessionId: 's', mode: 'quick-quiz', now: NOW });
    const selected = selectReviewQuestions(QUESTIONS, store, 20, NOW, mulberry32(4), { filter: 'weak' });
    expect(selected[0].categories).toContain('navigation');
    expect(selected.every((question) => question.categories.includes('navigation') || question.categories.includes('weather'))).toBe(true);
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
