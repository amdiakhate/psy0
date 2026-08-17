import type { ItemEvent } from '../core/types';
import { recentEvents } from './scores';

export interface FatigueSlice {
  /** Tranche de 5 minutes (0 = minutes 0-4, 1 = 5-9, …). */
  slice: number;
  n: number;
  accuracy: number;
}

export interface FatigueReport {
  slices: FatigueSlice[];
  /** Minute (multiple de 5) où la précision décroche de > 15 pts vs la 1re tranche, sinon null. */
  dropAtMinute: number | null;
}

/**
 * Courbe de fatigue intra-session : précision par tranche de 5 minutes,
 * agrégée sur les sessions récentes (les tranches tardives n'existent que
 * pour les sessions assez longues — n minimal de 15 items par tranche).
 */
export function fatigueReport(events: ItemEvent[] = recentEvents()): FatigueReport {
  const bySlice = new Map<number, { n: number; ok: number }>();
  for (const e of events) {
    const slice = Math.floor(e.minuteInSession / 5);
    const s = bySlice.get(slice) ?? { n: 0, ok: 0 };
    s.n += 1;
    if (e.correct) s.ok += 1;
    bySlice.set(slice, s);
  }
  const slices: FatigueSlice[] = [...bySlice.entries()]
    .filter(([, s]) => s.n >= 15)
    .map(([slice, s]) => ({ slice, n: s.n, accuracy: s.ok / s.n }))
    .sort((a, b) => a.slice - b.slice);

  let dropAtMinute: number | null = null;
  if (slices.length >= 2) {
    const base = slices[0].accuracy;
    for (const s of slices.slice(1)) {
      if (base - s.accuracy > 0.15) {
        dropAtMinute = s.slice * 5;
        break;
      }
    }
  }
  return { slices, dropAtMinute };
}
