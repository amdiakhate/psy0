import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './bank';
import { checkAnswer } from './answers';
import { mulberry32 } from '../core/rng';
import { generateFlightMathQuestion } from './generators/flightMath';

describe('réponses Culture', () => {
  it('gère les accents et la casse', () => {
    const hanoi = QUESTIONS.find((question) => question.id === 'doc26-73')!;
    expect(checkAnswer(hanoi, 'HANOI')).toBe(true);
    expect(checkAnswer(hanoi, 'Hô Chi Minh-Ville')).toBe(false);
  });

  it('gère les nombres et la virgule décimale', () => {
    const distance = generateFlightMathQuestion(mulberry32(12));
    expect(checkAnswer(distance, String(distance.answer))).toBe(true);
    expect(checkAnswer(distance, Number(distance.answer))).toBe(true);
    expect(checkAnswer({ ...distance, answer: 64.75, acceptedAnswers: [] }, '64,75')).toBe(true);
  });

  it('refuse une réponse vide', () => {
    expect(checkAnswer(QUESTIONS[0], null)).toBe(false);
    expect(checkAnswer(QUESTIONS[0], '')).toBe(false);
  });
});
