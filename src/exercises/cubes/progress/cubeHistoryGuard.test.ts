import { describe, expect, it } from 'vitest';
import { generate } from '../generator';
import { isCubesQuestionSnapshot } from './cubeHistoryGuard';

describe('garde des corrections Cubes historisées', () => {
  it('accepte un instantané réellement généré', () => {
    expect(isCubesQuestionSnapshot(generate(42, 4, 'letters').question)).toBe(true);
  });

  it('refuse un instantané dont la solution ne référence aucune pièce', () => {
    const question = generate(42, 4, 'letters').question;
    expect(isCubesQuestionSnapshot({ ...question, solution: {} })).toBe(false);
  });

  it('refuse un patron troué à un endroit incohérent avec holes', () => {
    const question = generate(42, 4, 'letters').question;
    const target = [...question.target];
    const visible = target.findIndex((face) => face !== null);
    target[visible] = null;
    expect(isCubesQuestionSnapshot({ ...question, target })).toBe(false);
  });

  it('refuse les positions et rotations hors géométrie', () => {
    const question = generate(42, 4, 'letters').question;
    expect(isCubesQuestionSnapshot({ ...question, reference: question.reference.map((face, index) => index === 0 ? { ...face, originalPosition: 99 } : face) })).toBe(false);
    expect(isCubesQuestionSnapshot({ ...question, expectedRot: Object.fromEntries(question.holes.map((hole) => [hole, 7])) })).toBe(false);
  });
});
