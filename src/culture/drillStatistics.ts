import type { CultureDrillAttempt, CultureDrillType } from './types';

export const CULTURE_DRILL_TYPES: CultureDrillType[] = [
  'distance',
  'time',
  'speed',
  'heading-turn',
  'opposite-heading',
  'angular-difference',
  'qfu',
  'cardinal-heading',
  'time-conversion',
];

export const CULTURE_DRILL_LABELS: Record<CultureDrillType, string> = {
  distance: 'Distance',
  time: 'Temps de vol',
  speed: 'Vitesse',
  'heading-turn': 'Caps après virage',
  'opposite-heading': 'Caps opposés',
  'angular-difference': 'Différence angulaire',
  qfu: 'QFU / orientation de piste',
  'cardinal-heading': 'Orientation cardinale',
  'time-conversion': 'Conversions de temps',
};

export interface CultureDrillTypeStats {
  type: CultureDrillType;
  attempts: number;
  correct: number;
  rate: number | null;
  sampleSufficient: boolean;
}

export interface CultureDrillDashboardStats {
  total: number;
  successRate: number | null;
  today: number;
  lastAttemptAt?: string;
  byType: CultureDrillTypeStats[];
  weakest?: CultureDrillTypeStats;
}

export function getDrillSuccessRate(attempts: CultureDrillAttempt[]): number | null {
  return attempts.length === 0 ? null : attempts.filter((attempt) => attempt.correct).length / attempts.length;
}

export function getRecentDrillAttempts(attempts: CultureDrillAttempt[], limit = 30): CultureDrillAttempt[] {
  return [...attempts]
    .sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime())
    .slice(0, Math.max(0, limit));
}

export function getDrillSuccessRateByType(
  attempts: CultureDrillAttempt[],
  type: CultureDrillType,
  windowSize = 30,
): CultureDrillTypeStats {
  const recent = getRecentDrillAttempts(attempts.filter((attempt) => attempt.drillType === type), windowSize);
  const correct = recent.filter((attempt) => attempt.correct).length;
  return {
    type,
    attempts: recent.length,
    correct,
    rate: recent.length === 0 ? null : correct / recent.length,
    sampleSufficient: recent.length >= 5,
  };
}

function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getDrillAttemptsToday(attempts: CultureDrillAttempt[], now: Date): number {
  const today = localDay(now);
  return attempts.filter((attempt) => localDay(new Date(attempt.answeredAt)) === today).length;
}

export function getDrillDashboardStats(attempts: CultureDrillAttempt[], now: Date): CultureDrillDashboardStats {
  const byType = CULTURE_DRILL_TYPES.map((type) => getDrillSuccessRateByType(attempts, type));
  const weakest = byType
    .filter((item) => item.sampleSufficient && item.rate !== null && item.rate < 0.85)
    .sort((a, b) => (a.rate ?? 1) - (b.rate ?? 1))[0];
  return {
    total: attempts.length,
    successRate: getDrillSuccessRate(attempts),
    today: getDrillAttemptsToday(attempts, now),
    lastAttemptAt: getRecentDrillAttempts(attempts, 1)[0]?.answeredAt,
    byType,
    weakest,
  };
}
