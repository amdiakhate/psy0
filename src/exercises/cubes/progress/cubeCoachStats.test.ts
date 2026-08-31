import { describe, expect, it } from 'vitest';
import { computeCubeCoachStats, dominantCubeWeakness } from './cubeCoachStats';
import type { CubeAttemptRecord, CubeSkill } from './cubeCoachStorage';

function attempt(index: number, skill: CubeSkill, correct: boolean): CubeAttemptRecord {
  return {
    id: `a-${index}`,
    answeredAt: new Date(2026, 7, 31, 10, index).toISOString(),
    mode: 'drill',
    seed: index,
    level: 1,
    durationMs: 1000,
    correct,
    question: null,
    answer: null,
    solution: null,
    errorCauses: [],
    skills: [{ skill, correct }],
  };
}

describe('statistiques par sous-compétence Cubes', () => {
  it('utilise les 30 observations les plus récentes', () => {
    const attempts = Array.from({ length: 35 }, (_, index) => attempt(index, 'opposites', index >= 5));
    const stat = computeCubeCoachStats(attempts).find((entry) => entry.skill === 'opposites')!;
    expect(stat.attempts).toBe(30);
    expect(stat.accuracy).toBe(1);
  });

  it('ne déclare pas de faiblesse sous cinq observations', () => {
    const attempts = Array.from({ length: 4 }, (_, index) => attempt(index, 'mirror', false));
    expect(dominantCubeWeakness(attempts, new Date(2026, 7, 31, 12))).toBeNull();
  });

  it('choisit la compétence mesurée la plus faible', () => {
    const attempts = [
      ...Array.from({ length: 5 }, (_, index) => attempt(index, 'opposites', true)),
      ...Array.from({ length: 5 }, (_, index) => attempt(10 + index, 'two-candidates-ring', index < 2)),
    ];
    expect(dominantCubeWeakness(attempts, new Date(2026, 7, 31, 12))?.skill).toBe('two-candidates-ring');
  });

  it('ignore les observations des jours précédents pour le problème du jour', () => {
    const attempts = Array.from({ length: 5 }, (_, index) => attempt(index, 'mirror', false));
    expect(dominantCubeWeakness(attempts, new Date(2026, 8, 1, 12))).toBeNull();
  });
});
