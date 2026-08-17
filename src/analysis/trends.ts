import type { ExerciseId, Family, ItemEvent } from '../core/types';
import { getEvents } from '../core/eventlog';
import { FAMILIES } from '../core/types';
import { EXERCISES } from '../exercises';
import { computeStats } from './scores';

export interface DailyPoint {
  /** AAAA-MM-JJ */
  day: string;
  n: number;
  accuracy: number;
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Précision quotidienne globale (courbe de progression). */
export function dailyProgress(events: ItemEvent[] = getEvents()): DailyPoint[] {
  const byDay = new Map<string, { n: number; ok: number }>();
  for (const e of events) {
    const k = dayKey(e.ts);
    const s = byDay.get(k) ?? { n: 0, ok: 0 };
    s.n += 1;
    if (e.correct) s.ok += 1;
    byDay.set(k, s);
  }
  return [...byDay.entries()]
    .map(([day, s]) => ({ day, n: s.n, accuracy: s.ok / s.n }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

/** Sparkline par exercice : précision par jour (14 derniers jours joués). */
export function sparklineOf(exercise: ExerciseId, events: ItemEvent[] = getEvents()): number[] {
  const byDay = new Map<string, { n: number; ok: number }>();
  for (const e of events) {
    if (e.exercise !== exercise) continue;
    const k = dayKey(e.ts);
    const s = byDay.get(k) ?? { n: 0, ok: 0 };
    s.n += 1;
    if (e.correct) s.ok += 1;
    byDay.set(k, s);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([, s]) => s.ok / s.n);
}

/** Tendance : delta de précision entre la fenêtre récente et la fenêtre précédente. */
export function trendOf(exercise: ExerciseId, days: 7 | 14 | 30, events: ItemEvent[] = getEvents()): number | null {
  const now = Date.now();
  const recent = events.filter((e) => e.exercise === exercise && e.ts >= now - days * 86_400_000);
  const before = events.filter(
    (e) => e.exercise === exercise && e.ts >= now - 2 * days * 86_400_000 && e.ts < now - days * 86_400_000,
  );
  if (recent.length < 10 || before.length < 10) return null;
  const acc = (evts: ItemEvent[]) => evts.filter((e) => e.correct).length / evts.length;
  return acc(recent) - acc(before);
}

export interface FamilyScore {
  family: Family;
  score: number;
}

/** Score par famille pour le radar : moyenne des scores des exercices membres (pondérée par les items). */
export function familyScores(): FamilyScore[] {
  const stats = computeStats();
  return FAMILIES.map((family) => {
    const members = EXERCISES.filter((e) => e.families.includes(family));
    let weighted = 0;
    let weight = 0;
    for (const m of members) {
      const s = stats.find((x) => x.exercise === m.id);
      if (s && s.items > 0) {
        const w = Math.min(s.items, 100);
        weighted += s.score * w;
        weight += w;
      }
    }
    return { family, score: weight > 0 ? Math.round(weighted / weight) : 0 };
  });
}

/** Streak : nombre de jours consécutifs (en remontant depuis aujourd'hui) avec au moins un item. */
export function currentStreak(events: ItemEvent[] = getEvents()): number {
  const days = new Set(events.map((e) => dayKey(e.ts)));
  let streak = 0;
  const d = new Date();
  // Le jour courant compte s'il a des items ; sinon on regarde à partir d'hier.
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d.getTime()))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
