import { describe, expect, it } from 'vitest';
import { generate } from '../generator';
import { isCubesQuestionSnapshot } from '../progress/cubeHistoryGuard';

describe('replay de l’historique Cubes', () => {
  it('refuse un instantané structurellement incomplet avant de lancer l’analyse', () => {
    expect(isCubesQuestionSnapshot({ reference: [], target: [], holes: [], pieces: [] })).toBe(false);
  });

  it('accepte une vraie question générée', () => {
    expect(isCubesQuestionSnapshot(generate(42, 4, 'letters').question)).toBe(true);
  });
});
