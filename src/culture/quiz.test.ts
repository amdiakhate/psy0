import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { BANK } from './bank';
import { POINTS, QUIZ_SIZE, composeQuiz, expectedValue, presentEntry, scoreOf } from './quiz';
import type { Given } from './quiz';

describe('composition d’un test de culture', () => {
  /**
   * Le seul invariant qui compte au mélange : la bonne réponse doit rester la
   * même CHAÎNE. On la retrouve indépendamment, sans réutiliser l'index calculé
   * par la fonction testée.
   */
  it('conserve la bonne réponse à travers le mélange', () => {
    for (const [i, entry] of BANK.entries()) {
      const q = presentEntry(entry, mulberry32(i + 1));
      expect(q.options.slice().sort(), entry.id).toEqual(entry.options.slice().sort());
      expect(q.options[q.correctIndex], entry.id).toBe(entry.options[entry.correct]);
    }
  });

  it('tire le bon nombre de questions, sans doublon', () => {
    const quiz = composeQuiz(BANK, QUIZ_SIZE, mulberry32(42));
    expect(quiz).toHaveLength(QUIZ_SIZE);
    expect(new Set(quiz.map((q) => q.entry.id)).size).toBe(QUIZ_SIZE);
  });

  it('est déterministe à graine égale', () => {
    const a = composeQuiz(BANK, QUIZ_SIZE, mulberry32(7)).map((q) => q.entry.id + q.options.join('|'));
    const b = composeQuiz(BANK, QUIZ_SIZE, mulberry32(7)).map((q) => q.entry.id + q.options.join('|'));
    expect(a).toEqual(b);
  });

  it('ne rend jamais plus que le vivier disponible', () => {
    const petit = BANK.slice(0, 5);
    expect(composeQuiz(petit, QUIZ_SIZE, mulberry32(3))).toHaveLength(5);
  });
});

describe('barème', () => {
  it('compte +3, −1 et 0', () => {
    const quiz = composeQuiz(BANK, 5, mulberry32(11));
    const answers: Given[] = [
      quiz[0].correctIndex,
      quiz[1].correctIndex,
      (quiz[2].correctIndex + 1) % 4,
      (quiz[3].correctIndex + 2) % 4,
      null,
    ];
    const s = scoreOf(quiz, answers);
    expect(s).toMatchObject({ correct: 2, wrong: 2, skipped: 1 });
    // Recalcul indépendant : 2×3 − 2×1 = 4.
    expect(s.raw).toBe(4);
    expect(s.max).toBe(5 * POINTS.correct);
  });

  it('traite une réponse manquante comme une abstention', () => {
    const quiz = composeQuiz(BANK, 3, mulberry32(12));
    const s = scoreOf(quiz, []);
    expect(s).toMatchObject({ correct: 0, wrong: 0, skipped: 3, raw: 0 });
  });

  it('accepte un score négatif', () => {
    const quiz = composeQuiz(BANK, 3, mulberry32(13));
    const faux = quiz.map((q) => (q.correctIndex + 1) % 4);
    expect(scoreOf(quiz, faux).raw).toBe(-3);
  });
});

describe('stratégie de réponse', () => {
  /**
   * Ce calcul est la raison d'être du conseil donné dans la leçon. S'il changeait
   * — par exemple si le barème passait à −1,5 — le conseil deviendrait faux, et
   * ce test le signalerait.
   */
  it('rend une réponse au hasard neutre sur quatre propositions', () => {
    expect(expectedValue(4)).toBe(0);
  });

  it('rend la réponse rentable dès qu’une proposition est éliminée', () => {
    expect(expectedValue(3)).toBeCloseTo(1 / 3, 10);
    expect(expectedValue(2)).toBe(1);
    expect(expectedValue(1)).toBe(POINTS.correct);
  });

  it('croît strictement à mesure qu’on élimine', () => {
    const values = [4, 3, 2, 1].map(expectedValue);
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1]);
  });
});
