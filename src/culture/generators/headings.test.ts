import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { generateHeadingQuestion } from './headings';

describe('générateur de caps', () => {
  it('normalise toutes les réponses numériques entre 000 et 359', () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const question = generateHeadingQuestion(mulberry32(seed));
      if (question.type !== 'numeric') continue;
      expect(Number(question.answer), String(seed)).toBeGreaterThanOrEqual(0);
      expect(Number(question.answer), String(seed)).toBeLessThan(360);
    }
  });

  it('couvre virage, différence, opposé, cardinal et QFU', () => {
    const ids = Array.from({ length: 100 }, (_, index) => generateHeadingQuestion(mulberry32(index + 10)).id);
    for (const kind of ['turn', 'angle', 'opposite', 'cardinal', 'qfu']) {
      expect(ids.some((id) => id.includes(kind)), kind).toBe(true);
    }
  });

  it('peut générer chacun des sous-types de caps à la demande', () => {
    for (const type of ['heading-turn', 'angular-difference', 'opposite-heading', 'cardinal-heading', 'qfu'] as const) {
      expect(generateHeadingQuestion(mulberry32(42), type).drillType).toBe(type);
    }
  });
});
