import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './bank';
import { checkAnswer } from './answers';

describe('réponses Culture', () => {
  it('gère les accents et la casse', () => {
    const hanoi = QUESTIONS.find((question) => question.id === 'doc26-73')!;
    expect(checkAnswer(hanoi, 'HANOI')).toBe(true);
    expect(checkAnswer(hanoi, 'Hô Chi Minh-Ville')).toBe(false);
  });

  it('gère les nombres et la virgule décimale', () => {
    const distance = QUESTIONS.find((question) => question.id === 'doc26-01')!;
    expect(checkAnswer(distance, '60')).toBe(true);
    expect(checkAnswer(distance, 60)).toBe(true);
    expect(checkAnswer({ ...distance, answer: 64.75, acceptedAnswers: [] }, '64,75')).toBe(true);
  });

  it('refuse une réponse vide', () => {
    expect(checkAnswer(QUESTIONS[0], null)).toBe(false);
    expect(checkAnswer(QUESTIONS[0], '')).toBe(false);
  });
});
