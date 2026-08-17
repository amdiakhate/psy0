import type { BlockRole, ExerciseId } from './types';
import { loadJson, saveJson } from './storage';
import { getExercise, EXERCISES } from '../exercises';
import { getEvents } from './eventlog';
import { getPrefs } from './prefs';
import { tagStats } from '../analysis/errorTaxonomy';
import { GROUPS, PSYCHO_DAILY_CAP_SEC, parisMoment, psychoUsedSec } from '../coach/daily-logic';
import { getDailyState } from '../coach/daily';

export type Feeling = 'fluide' | 'correct' | 'laborieux' | 'à revoir';
export const FEELINGS: Feeling[] = ['fluide', 'correct', 'laborieux', 'à revoir'];

export interface DayLogEntry {
  /** dayKey Paris AAAA-MM-JJ. */
  day: string;
  ts: number;
  exercise: ExerciseId;
  level: number;
  /** % d'erreurs, auto-rempli depuis les données de la session. */
  errPct: number;
  feeling: Feeling;
  /** Note libre, 140 caractères max. */
  note?: string;
  /** Rôle tenu dans la séance — permet de grouper l'export par fonction. */
  role?: BlockRole;
  /** Nombre de blocs joués sur cet exercice (les priorités en ont plusieurs). */
  passes?: number;
}

export function getLogs(): DayLogEntry[] {
  return loadJson<DayLogEntry[]>('logs', []);
}

export function saveLogEntries(entries: DayLogEntry[]): void {
  saveJson('logs', [...getLogs(), ...entries]);
}

export interface SubtypeStat {
  tag: string;
  errorRate: number;
  n: number;
}

/** Tout ce dont le formatage a besoin — injecté, donc testable sans storage. */
export interface DayLogContext {
  day: string;
  entries: DayLogEntry[];
  /** Nom lisible par exercice. */
  names: Partial<Record<ExerciseId, string>>;
  /** Sous-types d'erreurs dominants du jour, par exercice. */
  subtypes: Partial<Record<ExerciseId, SubtypeStat[]>>;
  psychoUsedSec: number;
  psychoCapSec: number;
  /** Ce que le coach proposera demain matin. */
  tomorrow: { priority: string | null; group: string | null };
}

const ROLE_LABEL: Record<BlockRole, string> = {
  warmup: 'ÉCHAUFFEMENT',
  priority: 'PRIORITÉ',
  rotation: 'ROTATION',
  psychomotor: 'PSYCHOMOTEUR',
};

/** Ordre de lecture : ce qui pilote la suite d'abord. */
const ROLE_ORDER: BlockRole[] = ['priority', 'rotation', 'warmup', 'psychomotor'];

function roleRank(role: BlockRole | undefined): number {
  const index = role ? ROLE_ORDER.indexOf(role) : -1;
  return index === -1 ? ROLE_ORDER.length : index;
}

/**
 * Export texte brut du jour : une ligne par exercice joué, préfixée de son rôle,
 * plus le compteur Psychomoteur et l'état de la rotation pour demain. Destiné à
 * être collé tel quel dans une conversation de suivi.
 */
export function formatDayLog(ctx: DayLogContext): string {
  if (ctx.entries.length === 0) return '';
  const [y, m, d] = ctx.day.split('-');
  const lines: string[] = [`=== ${d}/${m}/${y} · PSY0 Trainer ===`];

  const sorted = [...ctx.entries].sort((a, b) => roleRank(a.role) - roleRank(b.role) || a.ts - b.ts);
  for (const e of sorted) {
    const name = ctx.names[e.exercise] ?? e.exercise;
    const parts = [
      e.role ? ROLE_LABEL[e.role] : 'SÉANCE',
      name,
      `niveau ${e.level}`,
      `${e.errPct}% err`,
    ];
    if (e.passes !== undefined && e.passes > 1) parts.push(`${e.passes} passes`);
    const subs = ctx.subtypes[e.exercise];
    if (subs && subs.length > 0) {
      parts.push(`sous-types : ${subs.map((s) => `${s.tag} ${Math.round(s.errorRate * 100)}%`).join(', ')}`);
    }
    parts.push(e.feeling);
    if (e.note?.trim()) parts.push(e.note.trim());
    lines.push(parts.join(' · '));
  }

  lines.push(
    `PSYCHOMOTEUR · ${Math.round(ctx.psychoUsedSec / 60)} min consommées / ${Math.round(
      ctx.psychoCapSec / 60,
    )} min de cap quotidien`,
  );
  lines.push(
    `DEMAIN · priorité : ${ctx.tomorrow.priority ?? 'non définie (P1/P2/P3 à saisir)'} · rotation : ${
      ctx.tomorrow.group ?? '—'
    }`,
  );
  return lines.join('\n');
}

/** Sous-types d'erreurs dominants d'un exercice sur les events d'un jour. */
export function dominantSubtypes(
  exercise: ExerciseId,
  dayEvents: Parameters<typeof tagStats>[0],
  limit = 2,
): SubtypeStat[] {
  return tagStats(dayEvents)
    .filter((t) => t.exercise === exercise && t.n >= 5 && t.errorRate > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, limit)
    .map((t) => ({ tag: t.tag, errorRate: t.errorRate, n: t.n }));
}

/** Assemble le contexte depuis le storage, puis délègue le rendu à `formatDayLog`. */
export function exportDayLog(day: string): string {
  const entries = getLogs().filter((e) => e.day === day);
  if (entries.length === 0) return '';

  const events = getEvents().filter((e) => parisMoment(new Date(e.ts)).dayKey === day);
  const subtypes: Partial<Record<ExerciseId, SubtypeStat[]>> = {};
  for (const e of entries) {
    const found = dominantSubtypes(e.exercise, events);
    if (found.length > 0) subtypes[e.exercise] = found;
  }

  const state = getDailyState();
  const prefs = getPrefs();
  // Le curseur a déjà été avancé à la complétion de la séance du matin :
  // il désigne donc la priorité de DEMAIN, pas celle qu'on vient de faire.
  const tomorrowPriority = prefs.priorities?.[state.priorityCursor % 3] ?? null;

  return formatDayLog({
    day,
    entries,
    names: Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex.name])),
    subtypes,
    psychoUsedSec: psychoUsedSec(events, day),
    psychoCapSec: PSYCHO_DAILY_CAP_SEC,
    tomorrow: {
      priority: tomorrowPriority ? getExercise(tomorrowPriority).name : null,
      group: GROUPS[state.groupCursor % GROUPS.length]?.name ?? null,
    },
  });
}
