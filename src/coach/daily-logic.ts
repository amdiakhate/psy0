import type { ExerciseId, SessionBlock } from '../core/types';

/**
 * Logique PURE de la « Session du jour » : aucune lecture de storage, aucune
 * dépendance au registre d'exercices — tout est injecté, tout est testable.
 * Toutes les dates s'entendent en Europe/Paris.
 */

export interface ParisMoment {
  y: number;
  m: number; // 1-12
  d: number;
  hour: number;
  minute: number;
  /** AAAA-MM-JJ en heure de Paris. */
  dayKey: string;
}

export function parisMoment(date: Date): ParisMoment {
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = Number(parts.day);
  return {
    y,
    m,
    d,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    dayKey: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  };
}

/** Jalons du protocole (heure de Paris). */
export const DISCOVERY_END = '2026-08-17'; // dernier jour de la phase découverte
export const MINI_SIM_DAYS = new Set(['2026-08-22', '2026-08-29']);
export const REST_DAYS = new Set(['2026-08-23']);
export const SIM_WEEK_START = '2026-08-30';
export const LOCK_DAY = '2026-09-02'; // veille du test : repos total

/** Cap dur quotidien du Psychomoteur : apprentissage moteur = doses courtes. */
export const PSYCHO_DAILY_CAP_SEC = 720; // 12 min

export function isAfterBedtime(moment: ParisMoment): boolean {
  return moment.hour > 22 || (moment.hour === 22 && moment.minute >= 30);
}

/** Groupes de rotation. Le cycle G1→G5 saute le groupe couvert par la priorité du jour. */
export const GROUPS: Array<{ name: string; members: ExerciseId[] }> = [
  { name: 'G1 Tri', members: ['word-skip', 'odd-even'] },
  { name: 'G2 Spatial', members: ['cubes', 'stacking', 'objects-3d', 'sliding-shapes'] },
  { name: 'G3 Logique', members: ['logic-series', 'marbles', 'calc-grid'] },
  { name: 'G4 Attention/Mémoire', members: ['n-back', 'shapes-colors', 'airways', 'psychomotor'] },
  { name: 'G5 Verbal/Anglais', members: ['word-boxes', 'star-words', 'english'] },
];

export interface DailyState {
  /** Rotation P1/P2/P3 : reprend où on en était, jamais de reset. */
  priorityCursor: number;
  /** Curseur du cycle G1→G5. */
  groupCursor: number;
  /** Dernier exercice du sprint du soir (jamais deux soirs de suite le même). */
  lastEveningExercise: ExerciseId | null;
  /** Jour (dayKey Paris) où la session du matin a été complétée — anti double-avance. */
  lastMorningDoneDay: string | null;
}

export const INITIAL_DAILY_STATE: DailyState = {
  priorityCursor: 0,
  groupCursor: 0,
  lastEveningExercise: null,
  lastMorningDoneDay: null,
};

export type DailyDecision =
  | { kind: 'discovery-morning'; toDiscover: ExerciseId[] }
  | { kind: 'discovery-evening'; exercise: ExerciseId | null }
  | { kind: 'buildup-morning'; priority: ExerciseId; groupIndex: number }
  | { kind: 'buildup-evening'; exercise: ExerciseId | null }
  | { kind: 'mini-sim' }
  | { kind: 'rest' }
  | { kind: 'locked' }
  | { kind: 'simulation-first' }
  /**
   * Le devoir du jour est fait. `replay` porte la décision qui AURAIT été
   * offerte : elle permet de reproposer exactement le même programme en
   * entraînement libre, sans avoir à deviner ce qu'il contenait.
   */
  | { kind: 'done-today'; replay: DailyDecision };

export interface DecideArgs {
  moment: ParisMoment;
  state: DailyState;
  /** Exercices « découverts » = au moins un item joué. */
  discovered: Set<ExerciseId>;
  /** Les 16 exercices, dans l'ordre canonique. */
  allExercises: ExerciseId[];
  /** P1/P2/P3 configurées, ou null si pas encore saisies. */
  priorities: ExerciseId[] | null;
  /** Exercices du plus faible au plus fort (fallback priorité + suggestions du soir). */
  weakestOrder: ExerciseId[];
}

export function decideDaily(args: DecideArgs): DailyDecision {
  const { moment, state, discovered, allExercises, priorities, weakestOrder } = args;
  const day = moment.dayKey;

  if (day === LOCK_DAY) return { kind: 'locked' };
  if (MINI_SIM_DAYS.has(day)) return { kind: 'mini-sim' };
  if (REST_DAYS.has(day)) return { kind: 'rest' };
  if (day >= SIM_WEEK_START) return { kind: 'simulation-first' };

  const isMorning = moment.hour < 12;
  const morningDone = state.lastMorningDoneDay === day;

  if (day <= DISCOVERY_END) {
    if (isMorning) {
      const morning: DailyDecision = {
        kind: 'discovery-morning',
        toDiscover: allExercises.filter((e) => !discovered.has(e)),
      };
      return morningDone ? { kind: 'done-today', replay: morning } : morning;
    }
    // Sprint léger du soir : un exercice déjà vu, jamais celui de la veille, jamais le Psychomoteur (cap).
    const candidates = weakestOrder.filter(
      (e) => discovered.has(e) && e !== state.lastEveningExercise && e !== 'psychomotor',
    );
    return { kind: 'discovery-evening', exercise: candidates[0] ?? null };
  }

  // Phase montée en charge (18/08 → 29/08 hors samedis/dimanche spéciaux).
  if (isMorning) {
    // La priorité et le groupe se calculent AVANT de savoir si la séance est
    // faite : c'est ce qui permet de reproposer le même programme à l'identique.
    // Le curseur n'a pas bougé — `advanceAfterMorning` est idempotent par jour.
    const priority = priorities?.[state.priorityCursor % 3] ?? weakestOrder[0] ?? allExercises[0];
    let g = state.groupCursor % GROUPS.length;
    if (GROUPS[g].members.includes(priority)) g = (g + 1) % GROUPS.length;
    const morning: DailyDecision = { kind: 'buildup-morning', priority, groupIndex: g };
    return morningDone ? { kind: 'done-today', replay: morning } : morning;
  }
  const suggestion = weakestOrder.filter((e) => e !== 'psychomotor' && e !== state.lastEveningExercise)[0] ?? null;
  return { kind: 'buildup-evening', exercise: suggestion };
}

/** Avance les rotations après complétion d'une session du matin. Idempotent par jour. */
export function advanceAfterMorning(state: DailyState, usedGroup: number | undefined, dayKey: string): DailyState {
  if (state.lastMorningDoneDay === dayKey) return state;
  return {
    ...state,
    priorityCursor: (state.priorityCursor + 1) % 3,
    groupCursor: usedGroup !== undefined ? (usedGroup + 1) % GROUPS.length : state.groupCursor,
    lastMorningDoneDay: dayKey,
  };
}

export function recordEvening(state: DailyState, exercise: ExerciseId): DailyState {
  return { ...state, lastEveningExercise: exercise };
}

/**
 * Secondes de Psychomoteur consommées un jour donné : chaque fenêtre de
 * poursuite (tag 'tracking') dure exactement 1 s.
 */
export function psychoUsedSec(
  events: Array<{ ts: number; exercise: string; tags: string[] }>,
  dayKey: string,
): number {
  let sec = 0;
  for (const e of events) {
    if (e.exercise !== 'psychomotor' || !e.tags.includes('tracking')) continue;
    if (parisMoment(new Date(e.ts)).dayKey !== dayKey) continue;
    sec += 1;
  }
  return sec;
}

/**
 * Applique le cap quotidien du Psychomoteur à un plan : tronque les blocs
 * psychomoteur au budget restant, supprime ceux qui tomberaient sous 60 s.
 */
export function clampPsychomotor(
  blocks: SessionBlock[],
  remainingSec: number,
): { blocks: SessionBlock[]; trimmed: boolean } {
  let budget = Math.max(0, remainingSec);
  let trimmed = false;
  const out: SessionBlock[] = [];
  for (const b of blocks) {
    if (b.exercise !== 'psychomotor') {
      out.push(b);
      continue;
    }
    const wanted = b.durationSec ?? (b.itemCount ?? 1) * 60;
    const granted = Math.min(wanted, budget);
    if (granted < 60) {
      trimmed = true;
      continue;
    }
    if (granted < wanted) trimmed = true;
    budget -= granted;
    out.push({ ...b, durationSec: granted, itemCount: undefined });
  }
  return { blocks: out, trimmed };
}
