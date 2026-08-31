import { describe, expect, it } from 'vitest';
import { generate } from '../generator';
import { getOppositePosition } from './cubeGeometry';
import { buildReasoningPath } from './reasoningPath';

describe('chemin pédagogique minimal', () => {
  it('n’ajoute aucun anneau quand chaque trou se résout par son opposée visible', () => {
    const item = Array.from({ length: 300 }, (_, seed) => generate(seed, 1)).find(({ question }) =>
      question.holes.every((hole) => question.target[getOppositePosition(hole)] !== null),
    );
    expect(item).toBeDefined();
    const path = buildReasoningPath(item!.question);
    expect(path.minimalSteps.some((step) => step.kind === 'opposite-deduction')).toBe(true);
    expect(path.minimalSteps.some((step) => step.kind === 'ring-comparison')).toBe(false);
    expect(path.decisiveStepIndex).toBeGreaterThanOrEqual(0);
  });

  it('nomme le moment où deux faces opposées restent candidates', () => {
    const item = Array.from({ length: 500 }, (_, seed) => generate(seed, 2)).find(({ question }) => {
      const path = buildReasoningPath(question);
      return path.minimalSteps.some((step) => step.kind === 'two-candidates');
    });
    expect(item).toBeDefined();
    const kinds = buildReasoningPath(item!.question).minimalSteps.map((step) => step.kind);
    expect(kinds).toContain('two-candidates');
    expect(kinds).toContain('ring-comparison');
  });
});
