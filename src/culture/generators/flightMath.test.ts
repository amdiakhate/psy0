import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { generateFlightMathQuestion } from './flightMath';

describe('générateur vitesse distance temps', () => {
  it('produit des résultats entiers et positifs sur 500 graines', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const question = generateFlightMathQuestion(mulberry32(seed));
      expect(Number.isInteger(question.answer), String(seed)).toBe(true);
      expect(Number(question.answer), String(seed)).toBeGreaterThan(0);
      expect(question.explanation).toMatch(/D =|T =|V =/);
    }
  });

  it('couvre distance, temps et vitesse', () => {
    const generated = Array.from({ length: 500 }, (_, index) => generateFlightMathQuestion(mulberry32(index + 1)));
    const ids = generated.map((question) => question.id);
    expect(ids.some((id) => id.includes('distance'))).toBe(true);
    expect(ids.some((id) => id.includes('time'))).toBe(true);
    expect(ids.some((id) => id.includes('speed'))).toBe(true);
    for (const minutes of [5, 10, 15, 20, 30, 45]) {
      expect(generated.some((question) => question.question.includes(`${minutes} min`) || question.explanation.includes(`${minutes} min`)), String(minutes)).toBe(true);
    }
  });
});
