import type { ItemEvent } from '../core/types';
import { getEvents } from '../core/eventlog';

export type DaySlot = 'matin' | 'après-midi' | 'soir';

export interface SlotStat {
  slot: DaySlot;
  n: number;
  accuracy: number;
  medianRtMs: number;
}

function slotOf(ts: number): DaySlot {
  const h = new Date(ts).getHours();
  if (h >= 5 && h < 12) return 'matin';
  if (h >= 12 && h < 18) return 'après-midi';
  return 'soir';
}

/** Performance par créneau horaire (l'entraînement se fait à des heures variables). */
export function timeOfDayStats(events: ItemEvent[] = getEvents()): SlotStat[] {
  const bySlot = new Map<DaySlot, ItemEvent[]>();
  for (const e of events) {
    const slot = slotOf(e.ts);
    const list = bySlot.get(slot) ?? [];
    list.push(e);
    bySlot.set(slot, list);
  }
  const out: SlotStat[] = [];
  for (const slot of ['matin', 'après-midi', 'soir'] as DaySlot[]) {
    const evts = bySlot.get(slot) ?? [];
    if (evts.length < 20) continue;
    const rts = evts.map((e) => e.rtMs).sort((a, b) => a - b);
    out.push({
      slot,
      n: evts.length,
      accuracy: evts.filter((e) => e.correct).length / evts.length,
      medianRtMs: rts[Math.floor(rts.length / 2)],
    });
  }
  return out;
}

/** Le meilleur et le pire créneau, si l'écart est significatif (> 5 pts, ≥ 2 créneaux mesurés). */
export function bestWorstSlot(events: ItemEvent[] = getEvents()): { best: SlotStat; worst: SlotStat } | null {
  const stats = timeOfDayStats(events);
  if (stats.length < 2) return null;
  const sorted = [...stats].sort((a, b) => b.accuracy - a.accuracy);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  return best.accuracy - worst.accuracy > 0.05 ? { best, worst } : null;
}
