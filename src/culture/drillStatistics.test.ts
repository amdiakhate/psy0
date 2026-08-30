import { describe, expect, it } from 'vitest';
import {
  getDrillAttemptsToday,
  getDrillDashboardStats,
  getDrillSuccessRate,
  getDrillSuccessRateByType,
  getRecentDrillAttempts,
} from './drillStatistics';
import type { CultureDrillAttempt, CultureDrillType } from './types';

function attempt(index: number, drillType: CultureDrillType, correct: boolean, answeredAt = `2026-08-30T${String(index).padStart(2, '0')}:00:00Z`): CultureDrillAttempt {
  return { id: `a-${index}-${drillType}`, drillType, correct, answeredAt };
}

describe('statistiques Calculs & caps', () => {
  it('calcule la réussite globale, les exercices du jour et les plus récents', () => {
    const attempts = [
      attempt(1, 'distance', true, '2026-08-29T10:00:00Z'),
      attempt(2, 'distance', false, '2026-08-30T07:00:00Z'),
      attempt(3, 'heading-turn', true, '2026-08-30T08:00:00Z'),
      attempt(4, 'qfu', true, '2026-08-30T09:00:00Z'),
    ];
    expect(getDrillSuccessRate(attempts)).toBe(0.75);
    expect(getDrillAttemptsToday(attempts, new Date('2026-08-30T12:00:00Z'))).toBe(3);
    expect(getRecentDrillAttempts(attempts, 2).map((item) => item.id)).toEqual([attempts[3].id, attempts[2].id]);
  });

  it('utilise uniquement les 30 dernières tentatives du sous-type', () => {
    const attempts = Array.from({ length: 35 }, (_, index) => attempt(index, 'heading-turn', index >= 5, new Date(Date.UTC(2026, 7, 1, 0, index)).toISOString()));
    expect(getDrillSuccessRateByType(attempts, 'heading-turn')).toMatchObject({ attempts: 30, correct: 30, rate: 1, sampleSufficient: true });
  });

  it('signale un échantillon faible sous cinq tentatives et recommande le vrai sous-type faible', () => {
    const attempts = [
      ...Array.from({ length: 4 }, (_, index) => attempt(index, 'qfu', false, new Date(Date.UTC(2026, 7, 30, 8, index)).toISOString())),
      ...Array.from({ length: 10 }, (_, index) => attempt(index + 10, 'heading-turn', index >= 4, new Date(Date.UTC(2026, 7, 30, 9, index)).toISOString())),
      ...Array.from({ length: 10 }, (_, index) => attempt(index + 20, 'distance', index < 9, new Date(Date.UTC(2026, 7, 30, 10, index)).toISOString())),
    ];
    expect(getDrillSuccessRateByType(attempts, 'qfu').sampleSufficient).toBe(false);
    const stats = getDrillDashboardStats(attempts, new Date('2026-08-30T23:00:00Z'));
    expect(stats.weakest?.type).toBe('heading-turn');
    expect(stats.weakest?.rate).toBe(0.6);
    expect(stats.lastAttemptAt).toBe(attempts.at(-1)?.answeredAt);
  });
});
