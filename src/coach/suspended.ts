import type { SessionPlan } from '../core/types';
import { loadJson, saveJson } from '../core/storage';

/**
 * Séance coupée en deux : les blocs restants sont mis de côté et reproposés
 * depuis l'accueil. Une seule séance suspendue à la fois — deux moitiés en
 * attente signifieraient qu'aucune n'est finie, ce qui n'est pas un usage à encourager.
 */
export interface SuspendedSession {
  savedAt: number;
  /** Jour (dayKey Paris) de la coupure : au-delà, la reprise n'a plus de sens. */
  dayKey: string;
  title: string;
  /** Minutes déjà effectuées avant la coupure. */
  doneMin: number;
  plan: SessionPlan;
}

export function getSuspended(): SuspendedSession | null {
  return loadJson<SuspendedSession | null>('suspended', null);
}

export function saveSuspended(session: SuspendedSession): void {
  saveJson('suspended', session);
}

export function clearSuspended(): void {
  saveJson('suspended', null);
}

/**
 * Séance suspendue encore reprenable : le même jour uniquement. Une seconde
 * moitié faite le lendemain fausserait la rotation et le log du jour.
 */
export function resumableToday(dayKey: string, session = getSuspended()): SuspendedSession | null {
  if (!session || session.dayKey !== dayKey || session.plan.blocks.length === 0) return null;
  return session;
}

export function remainingMinutes(session: SuspendedSession): number {
  return Math.round(session.plan.blocks.reduce((s, b) => s + (b.durationSec ?? 0), 0) / 60);
}
