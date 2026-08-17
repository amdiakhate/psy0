import { describe, expect, it } from 'vitest';
import type { SessionPlan } from '../core/types';
import { remainingMinutes, resumableToday } from './suspended';
import type { SuspendedSession } from './suspended';

/**
 * Les fonctions testées ici reçoivent la session en argument : le câblage
 * localStorage (getSuspended / saveSuspended) n'est pas testable en Node et
 * n'a de toute façon aucune logique.
 */

const plan = (blockCount: number, durationSec = 300): SessionPlan => ({
  mode: 'guided120',
  blocks: Array.from({ length: blockCount }, () => ({
    exercise: 'cubes' as const,
    level: 'adaptive' as const,
    durationSec,
  })),
  meta: { daily: 'morning', requiresLog: true, resumed: true },
});

const session = (overrides: Partial<SuspendedSession> = {}): SuspendedSession => ({
  savedAt: 1_755_000_000_000,
  dayKey: '2026-08-20',
  title: 'Session du matin',
  doneMin: 55,
  plan: plan(6),
  ...overrides,
});

describe('resumableToday', () => {
  it('reprend une séance coupée le jour même', () => {
    expect(resumableToday('2026-08-20', session())).not.toBeNull();
  });

  it('refuse une séance coupée un autre jour', () => {
    // Finir la seconde moitié le lendemain fausserait la rotation et le log du jour.
    expect(resumableToday('2026-08-21', session())).toBeNull();
    expect(resumableToday('2026-08-19', session())).toBeNull();
  });

  it('refuse une séance sans bloc restant', () => {
    expect(resumableToday('2026-08-20', session({ plan: plan(0) }))).toBeNull();
  });

  it('accepte l’absence de séance suspendue', () => {
    expect(resumableToday('2026-08-20', null)).toBeNull();
  });

  it('conserve le log obligatoire et le marquage « matin » sur la reprise', () => {
    // Sans cela, une séance coupée n'avancerait jamais la rotation quotidienne.
    const resumed = resumableToday('2026-08-20', session())!;
    expect(resumed.plan.meta?.daily).toBe('morning');
    expect(resumed.plan.meta?.requiresLog).toBe(true);
    expect(resumed.plan.meta?.halfwayIndex).toBeUndefined();
  });
});

describe('remainingMinutes', () => {
  it('somme les durées des blocs restants', () => {
    expect(remainingMinutes(session({ plan: plan(6, 300) }))).toBe(30);
    expect(remainingMinutes(session({ plan: plan(4, 450) }))).toBe(30);
    expect(remainingMinutes(session({ plan: plan(0) }))).toBe(0);
  });
});
