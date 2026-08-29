import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { QUESTIONS } from './bank';
import { composeQuiz, presentQuestion, scoreByCategory, scoreOf } from './quiz';

describe('quiz Culture V2', () => {
  it('mélange les choix sans perdre la bonne réponse', () => {
    const source = QUESTIONS.find((question) => question.type === 'single-choice')!;
    const presented = presentQuestion(source, mulberry32(42));
    expect(presented.choices?.slice().sort()).toEqual(source.choices?.slice().sort());
    expect(presented.choices).toContain(String(source.answer));
  });

  it('compose un lot sans doublon', () => {
    const quiz = composeQuiz(QUESTIONS, 20, mulberry32(12));
    expect(quiz).toHaveLength(20);
    expect(new Set(quiz.map((item) => item.question.id)).size).toBe(20);
  });

  it('calcule score global et score par catégorie', () => {
    const quiz = composeQuiz(QUESTIONS, 10, mulberry32(7));
    const answers = quiz.map((item, index) => index < 6 ? item.question.answer : 'faux');
    expect(scoreOf(quiz, answers)).toMatchObject({ correct: 6, wrong: 4, total: 10, percent: 60 });
    const categories = scoreByCategory(quiz, answers);
    expect(categories.reduce((sum, category) => sum + category.total, 0)).toBe(10);
    expect(categories.reduce((sum, category) => sum + category.correct, 0)).toBe(6);
  });
});
