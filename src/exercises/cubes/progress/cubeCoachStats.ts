import type { CubeAttemptRecord, CubeSkill } from './cubeCoachStorage';

export interface CubeSkillStat {
  skill: CubeSkill;
  attempts: number;
  correct: number;
  accuracy: number | null;
  sampleSufficient: boolean;
}

export const CUBE_SKILLS: readonly CubeSkill[] = [
  'opposites',
  'adjacency',
  'deductive-placement',
  'two-candidates-ring',
  'mirror',
  'rotation-90',
  'rotation-180',
  'full-puzzle',
];

export function computeCubeCoachStats(attempts: readonly CubeAttemptRecord[]): CubeSkillStat[] {
  return CUBE_SKILLS.map((skill) => {
    const observations = attempts
      .flatMap((attempt) =>
        attempt.skills
          .filter((result) => result.skill === skill)
          .map((result) => ({ answeredAt: attempt.answeredAt, correct: result.correct })),
      )
      .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt))
      .slice(-30);
    const correct = observations.filter((observation) => observation.correct).length;
    return {
      skill,
      attempts: observations.length,
      correct,
      accuracy: observations.length > 0 ? correct / observations.length : null,
      sampleSufficient: observations.length >= 5,
    };
  });
}

export function dominantCubeWeakness(
  attempts: readonly CubeAttemptRecord[],
  now = new Date(),
): CubeSkillStat | null {
  const localDay = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const today = localDay(now);
  return (
    computeCubeCoachStats(attempts.filter((attempt) => localDay(new Date(attempt.answeredAt)) === today))
      .filter((stat) => stat.sampleSufficient && stat.accuracy !== null)
      .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))[0] ?? null
  );
}
