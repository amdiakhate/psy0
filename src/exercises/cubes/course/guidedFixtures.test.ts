import { describe, expect, it } from 'vitest';
import { getGuidedFixture } from './guidedFixtures';

describe('guided real-board fixtures', () => {
  it('finds a deterministic opposite-only board', () => {
    const fixture = getGuidedFixture('opposites');
    const kinds = fixture.path.minimalSteps.map((step) => step.kind);
    expect(kinds.filter((kind) => kind === 'opposite-deduction').length).toBeGreaterThanOrEqual(2);
    expect(kinds).not.toContain('ring-comparison');
    expect(getGuidedFixture('opposites').item.seed).toBe(fixture.item.seed);
  });

  it('finds a board where exactly two candidates require a ring', () => {
    const kinds = getGuidedFixture('two-candidates').path.minimalSteps.map((step) => step.kind);
    expect(kinds.indexOf('two-candidates')).toBeGreaterThanOrEqual(0);
    expect(kinds.indexOf('ring-comparison')).toBeGreaterThan(kinds.indexOf('two-candidates'));
  });

  it('finds a board with multiple physical-edge rotations', () => {
    const steps = getGuidedFixture('orientation').path.minimalSteps;
    expect(steps.filter((step) => step.kind === 'orientation-anchor').length).toBeGreaterThanOrEqual(2);
  });
});

