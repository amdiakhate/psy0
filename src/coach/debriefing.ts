import type { ItemEvent, SessionRecord } from '../core/types';
import { getEvents } from '../core/eventlog';
import { getSessions } from '../core/session';
import { getExercise } from '../exercises';

export interface Debrief {
  accuracy: number;
  items: number;
  prevAccuracy: number | null;
  /** UN insight actionnable, pas une liste. */
  insight: string;
}

function accuracyOf(events: ItemEvent[]): number {
  return events.length === 0 ? 0 : events.filter((e) => e.correct).length / events.length;
}

/**
 * Débriefing : comparaison vs session précédente de même type + un seul insight.
 * Priorité de l'insight : sous-type d'erreur dominant > trade-off vitesse/précision.
 */
export function buildDebrief(record: SessionRecord): Debrief {
  const all = getEvents();
  const sessionEvents = all.filter((e) => e.sessionId === record.sessionId);
  const accuracy = accuracyOf(sessionEvents);

  const prev = getSessions()
    .filter((s) => s.mode === record.mode && s.sessionId !== record.sessionId)
    .sort((a, b) => b.endedAt - a.endedAt)[0];
  const prevAccuracy = prev ? accuracyOf(all.filter((e) => e.sessionId === prev.sessionId)) : null;

  // Insight 1 : le sous-type d'erreur dominant de CETTE session (n ≥ 5, ≥ 3 erreurs).
  const byTag = new Map<string, { n: number; errors: number; exercise: string }>();
  for (const e of sessionEvents) {
    for (const tag of e.tags) {
      const key = `${e.exercise}|${tag}`;
      const s = byTag.get(key) ?? { n: 0, errors: 0, exercise: e.exercise };
      s.n += 1;
      if (!e.correct) s.errors += 1;
      byTag.set(key, s);
    }
  }
  let worst: { key: string; rate: number; s: { n: number; errors: number; exercise: string } } | null = null;
  for (const [key, s] of byTag) {
    if (s.n < 5 || s.errors < 3) continue;
    const rate = s.errors / s.n;
    if (rate >= 0.35 && (worst === null || rate > worst.rate)) worst = { key, rate, s };
  }
  if (worst) {
    const [exercise, tag] = worst.key.split('|');
    const name = getExercise(exercise as never).name;
    return {
      accuracy,
      items: sessionEvents.length,
      prevAccuracy,
      insight: `Ton point noir aujourd'hui : « ${tag} » en ${name} (${Math.round(worst.rate * 100)} % d'erreurs sur ${worst.s.n} items). Prochaine session : drill ce sous-type en premier, avant tout le reste.`,
    };
  }

  // Insight 2 : trade-off vitesse/précision sur l'exercice le plus joué.
  const byExercise = new Map<string, ItemEvent[]>();
  for (const e of sessionEvents) {
    const list = byExercise.get(e.exercise) ?? [];
    list.push(e);
    byExercise.set(e.exercise, list);
  }
  let insight = 'Session régulière, sans point noir identifiable. Continue comme ça et monte d’un niveau si ça devient confortable.';
  let most: ItemEvent[] = [];
  for (const evts of byExercise.values()) if (evts.length > most.length) most = evts;
  if (most.length >= 10) {
    const acc = accuracyOf(most);
    const module_ = getExercise(most[0].exercise);
    if (module_.timed === 'per-item') {
      const rts = most.map((e) => e.rtMs).sort((a, b) => a - b);
      const medianRt = rts[Math.floor(rts.length / 2)];
      const expected = module_.defaultItemSeconds * 1000;
      if (acc < 0.7 && medianRt < expected * 0.7) {
        insight = `Tu vas trop vite en ${module_.name} : ${Math.round(acc * 100)} % de précision avec un temps médian de ${(medianRt / 1000).toFixed(1)} s. RALENTIS de 20 % : la précision paie plus que la vitesse.`;
      } else if (acc >= 0.9 && medianRt > expected * 1.3) {
        insight = `Tu es très précis en ${module_.name} (${Math.round(acc * 100)} %) mais lent (${(medianRt / 1000).toFixed(1)} s/item). ACCÉLÈRE : vise ${module_.defaultItemSeconds} s par item, quitte à perdre 2-3 points de précision.`;
      }
    }
  }

  return { accuracy, items: sessionEvents.length, prevAccuracy, insight };
}
