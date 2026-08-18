import type { ExerciseId, SessionBlock, SessionPlan } from '../core/types';
import { loadJson, saveJson } from '../core/storage';
import { getEvents } from '../core/eventlog';
import { getPrefs } from '../core/prefs';
import { EXERCISES, getExercise, hasExercise } from '../exercises';
import { rankWeakest } from '../analysis/scores';
import { weakestTagOf } from '../analysis/errorTaxonomy';
import { composeSimulation } from './simulation';
import { composeGuided } from './composer';
import { computeHalfwayIndex } from './composer-logic';
import { LOG_RESERVE_SEC, composeMorningBlocks, prioritySecondsOf } from './morning-logic';
import type { MorningDuration, MorningPriority } from './morning-logic';
import { mulberry32, newSeed, shuffle } from '../core/rng';
import {
  GROUPS,
  INITIAL_DAILY_STATE,
  PSYCHO_DAILY_CAP_SEC,
  advanceAfterMorning,
  clampPsychomotor,
  decideDaily,
  parisMoment,
  psychoUsedSec,
  recordEvening,
} from './daily-logic';
import type { DailyDecision, DailyState, ParisMoment } from './daily-logic';

/** Câblage storage de la Session du jour — la logique elle-même est dans daily-logic.ts (pure). */

export function getDailyState(): DailyState {
  return { ...INITIAL_DAILY_STATE, ...loadJson<Partial<DailyState>>('daily', {}) };
}

function saveDailyState(state: DailyState): void {
  saveJson('daily', state);
}

export function psychoRemainingTodaySec(now: Date = new Date()): number {
  const used = psychoUsedSec(getEvents(), parisMoment(now).dayKey);
  return Math.max(0, PSYCHO_DAILY_CAP_SEC - used);
}

export interface DailyOffer {
  decision: DailyDecision;
  moment: ParisMoment;
  title: string;
  subtitle: string;
  plan: SessionPlan | null;
  /** Session optionnelle, skippable sans culpabilisation (soirs). */
  optional: boolean;
  /** Note affichée (ex : cap psychomoteur atteint). */
  note?: string;
}

export { MORNING_DURATIONS } from './morning-logic';
export type { MorningDuration } from './morning-logic';

function discoveredSet(): Set<ExerciseId> {
  return new Set(getEvents().map((e) => e.exercise));
}

function blockLabel(b: SessionBlock): string {
  const name = getExercise(b.exercise).name;
  return `${Math.round((b.durationSec ?? 0) / 60)} min ${name}${b.tagFilter ? ` (drill ${b.tagFilter})` : ''}`;
}

export function getDailyOffer(now: Date = new Date(), morningMin: MorningDuration = 60): DailyOffer {
  const moment = parisMoment(now);
  const state = getDailyState();
  const prefs = getPrefs();
  const weakestOrder = rankWeakest().map((s) => s.exercise);

  const decision = decideDaily({
    moment,
    state,
    discovered: discoveredSet(),
    allExercises: EXERCISES.map((e) => e.id),
    priorities: prefs.priorities,
    weakestOrder,
  });

  switch (decision.kind) {
    case 'locked':
      return {
        decision, moment, plan: null, optional: false,
        title: 'Repos total',
        subtitle: 'Le test est demain matin. Aujourd’hui, ton seul travail est de ne rien faire : sommeil, marche, rien d’autre. RDV demain.',
      };
    case 'rest':
      return {
        decision, moment, plan: null, optional: false,
        title: 'Repos',
        subtitle: 'Dimanche off. La consolidation se fait pendant la pause — reviens demain.',
      };
    case 'done-today':
      return {
        decision, moment, plan: null, optional: false,
        title: 'Session du matin déjà faite ✓',
        subtitle: 'Reviens après 12 h pour la session du soir (optionnelle).',
      };
    case 'discovery-morning': {
      if (decision.toDiscover.length === 0) {
        // Tout est découvert : session guidée classique de 30 min.
        const plan = guardPsycho({ ...composeGuided(30), meta: { daily: 'morning', requiresLog: true } });
        return {
          decision, moment, plan: plan.plan, optional: false, note: plan.note,
          title: 'Session du matin — 30 min',
          subtitle: 'Tout est découvert : le coach pilote. ' + summarize(plan.plan),
        };
      }
      const list = decision.toDiscover.slice(0, 6);
      const blocks: SessionBlock[] = list.map((e) => ({ exercise: e, level: 'adaptive', durationSec: 300 }));
      const guarded = guardPsycho({
        mode: 'guided30',
        blocks,
        briefing: [
          `Découverte : ${list.map((e) => getExercise(e).name).join(', ')}.`,
          'Objectif : voir la mécanique de chaque exercice, pas la performance.',
          `Reste à découvrir après cette session : ${Math.max(0, decision.toDiscover.length - list.length)} exercice(s).`,
        ],
        meta: { daily: 'morning', requiresLog: true },
      });
      return {
        decision, moment, plan: guarded.plan, optional: false, note: guarded.note,
        title: 'Session du matin — Découverte (30 min)',
        subtitle: guarded.plan ? guarded.plan.blocks.map(blockLabel).join(' → ') : '',
      };
    }
    case 'discovery-evening': {
      if (!decision.exercise) {
        return {
          decision, moment, plan: null, optional: true,
          title: 'Pas de sprint ce soir',
          subtitle: 'Aucun exercice déjà découvert (hors Psychomoteur). La découverte se fait le matin.',
        };
      }
      const name = getExercise(decision.exercise).name;
      return {
        decision, moment, optional: true,
        title: `Session du soir — Sprint léger (15 min)`,
        subtitle: `${name}, niveau adaptatif. Optionnelle : si la journée a été longue, dors.`,
        plan: {
          mode: 'sprint',
          blocks: [{ exercise: decision.exercise, level: 'adaptive', durationSec: 900 }],
          briefing: [`Sprint léger du soir : ${name}.`, 'Rythme tranquille, précision avant tout.', 'Pas d’enjeu : c’est du volume, pas de la mesure.'],
          meta: { daily: 'evening' },
        },
      };
    }
    case 'buildup-morning': {
      const priorityName = getExercise(decision.priority).name;
      const weakTag = weakestTagOf(decision.priority);

      // 1 h 30 : une seconde priorité (la suivante de la rotation) et un second
      // groupe de rotation, pour ne pas empiler 40 min sur un seul exercice.
      const priorities: MorningPriority[] = [{ exercise: decision.priority, weakTag }];
      const groups = [decision.groupIndex];
      if (morningMin >= 90) {
        const second = nextPriorityAfter(decision.priority, prefs.priorities, state.priorityCursor, weakestOrder);
        if (second) priorities.push({ exercise: second, weakTag: weakestTagOf(second) });
        const secondGroup = nextGroupAfter(decision.groupIndex, groups);
        if (secondGroup !== null) groups.push(secondGroup);
      }

      const used = new Set<ExerciseId>([...priorities.map((p) => p.exercise), 'calc-grid']);
      const rotationMembers = groups.flatMap((gi) =>
        GROUPS[gi].members.filter((m) => hasExercise(m) && m !== 'psychomotor' && !used.has(m)),
      );

      const blocks = composeMorningBlocks({
        durationMin: morningMin,
        warmup: 'calc-grid',
        priorities,
        rotationMembers,
        hasPsycho: hasExercise('psychomotor'),
      });

      const groupNames = groups.map((gi) => GROUPS[gi].name).join(' + ');
      const priorityMin = Math.round(prioritySecondsOf(blocks) / 60);
      const passes = blocks.filter((b) => b.role === 'priority').length;

      const guarded = guardPsycho({
        mode: morningMin === 60 ? 'guided60' : 'guided90',
        blocks,
        briefing: [
          `Priorité du jour : ${priorityName}${weakTag ? ` (drill « ${weakTag.tag} »)` : ''} · rotation ${groupNames}.`,
          `Structure : 5 min d’échauffement, puis ${passes} passes de 8 min de priorité entrelacées avec la rotation, ${Math.round(
            (blocks.find((b) => b.role === 'psychomotor')?.durationSec ?? 0) / 60,
          )} min de Psychomoteur, ${Math.round(LOG_RESERVE_SEC / 60)} min de log.`,
          morningMin > 60
            ? 'Séance longue : tu pourras couper à mi-parcours et reprendre la suite plus tard depuis l’accueil.'
            : 'Objectif : une session complète, log rempli à la fin — c’est lui qui pilote demain.',
        ],
        meta: {
          daily: 'morning',
          requiresLog: true,
          usedGroup: decision.groupIndex,
          halfwayIndex: morningMin > 60 ? computeHalfwayIndex(blocks) : undefined,
        },
      });
      return {
        decision, moment, plan: guarded.plan, optional: false, note: guarded.note,
        title: `Session du matin — ${morningMin === 60 ? '60 min' : '1 h 30'} structurée`,
        subtitle:
          `5 min Grilles → ${priorityMin} min ${priorities.map((p) => getExercise(p.exercise).name).join(' / ')} ` +
          `(${passes} passes de 8 min) entrelacées avec ${groupNames} → 5 min Psychomoteur → ${Math.round(
            LOG_RESERVE_SEC / 60,
          )} min de log`,
      };
    }
    case 'buildup-evening': {
      if (!decision.exercise) {
        return {
          decision, moment, plan: null, optional: true,
          title: 'Rien ce soir',
          subtitle: 'Pas de drill pertinent à suggérer. Repos.',
        };
      }
      const name = getExercise(decision.exercise).name;
      const weakTag = weakestTagOf(decision.exercise);
      return {
        decision, moment, optional: true,
        title: 'Session du soir — Drill libre (15 min, optionnelle)',
        subtitle: `${name}${weakTag ? ` — sous-type « ${weakTag.tag} »` : ''}. Skippable sans culpabilisation : le matin fait le travail.`,
        plan: {
          mode: 'free',
          blocks: [{
            exercise: decision.exercise, level: 'adaptive', durationSec: 900,
            tagFilter: weakTag?.tag, label: weakTag ? `Drill ${weakTag.tag}` : undefined,
          }],
          briefing: [`Drill du soir : ${name}.`, weakTag ? `Cible : « ${weakTag.tag} ».` : 'Conditions normales.', 'Optionnel. Arrête-toi quand tu veux (Échap).'],
          meta: { daily: 'evening' },
        },
      };
    }
    case 'mini-sim': {
      const rng = mulberry32(newSeed());
      // 8 exercices équilibrés : on cycle les groupes pour couvrir large.
      const picks: ExerciseId[] = [];
      const pool = GROUPS.map((g) => shuffle(rng, g.members.filter((m) => hasExercise(m))));
      let gi = 0;
      while (picks.length < 8) {
        const g = pool[gi % pool.length];
        const next = g.find((m) => !picks.includes(m));
        if (next) picks.push(next);
        gi += 1;
        if (gi > 40) break;
      }
      const guarded = guardPsycho({
        mode: 'simulation',
        blocks: shuffle(rng, picks).map((e) => ({ exercise: e, level: 'adaptive' as const, durationSec: 330 })),
        briefing: [
          'Mini-simulation du samedi : 8 exercices enchaînés, ~45 min, sans pause.',
          'Conditions réelles, ordre aléatoire.',
          'Rapport par famille à la fin.',
        ],
      });
      return {
        decision, moment, plan: guarded.plan, optional: false, note: guarded.note,
        title: 'Mini-simulation — 45 min',
        subtitle: guarded.plan ? guarded.plan.blocks.map((b) => getExercise(b.exercise).name).join(' → ') : '',
      };
    }
    case 'simulation-first': {
      const guarded = guardPsycho(composeSimulation());
      return {
        decision, moment, plan: guarded.plan, optional: false, note: guarded.note,
        title: 'Simulation complète du jour',
        subtitle: 'Les 16 exercices en conditions réelles. Ensuite : dashboard → drills courts sur ce que la simulation a révélé.',
      };
    }
  }
}

function summarize(plan: SessionPlan | null): string {
  return plan ? plan.blocks.map(blockLabel).join(' → ') : '';
}

/**
 * Priorité suivante de la rotation P1→P2→P3, ou l'exercice le plus faible
 * encore disponible si les priorités ne sont pas saisies.
 */
function nextPriorityAfter(
  current: ExerciseId,
  priorities: ExerciseId[] | null,
  priorityCursor: number,
  weakestOrder: ExerciseId[],
): ExerciseId | null {
  const fromPrefs = priorities?.[(priorityCursor + 1) % 3];
  if (fromPrefs && hasExercise(fromPrefs) && fromPrefs !== current) return fromPrefs;
  return (
    weakestOrder.find((e) => e !== 'psychomotor' && e !== current && hasExercise(e)) ?? null
  );
}

/** Groupe de rotation suivant non encore couvert par la séance. */
function nextGroupAfter(current: number, used: number[]): number | null {
  for (let k = 1; k <= GROUPS.length; k++) {
    const index = (current + k) % GROUPS.length;
    if (!used.includes(index)) return index;
  }
  return null;
}

/** Applique le cap quotidien du Psychomoteur à n'importe quel plan. */
export function guardPsycho(plan: SessionPlan): { plan: SessionPlan | null; note?: string } {
  // Séance réclamée explicitement : on la laisse passer entière. Le repère
  // quotidien encadre ce que le coach PROGRAMME, il ne verrouille pas l'app.
  if (plan.meta?.ignoreDailyCap) return { plan };
  const remaining = psychoRemainingTodaySec();
  const { blocks, trimmed } = clampPsychomotor(plan.blocks, remaining);
  if (blocks.length === 0) {
    return {
      plan: null,
      note: 'Cap Psychomoteur atteint : 12 min/jour maximum. L’apprentissage moteur se consolide par doses courtes quotidiennes, pas par gavage — reviens demain.',
    };
  }
  // Le clamp peut avoir supprimé un bloc : l'index de coupure, qui désigne une
  // position dans la liste, doit être recalculé sur les blocs réellement gardés.
  const meta =
    plan.meta?.halfwayIndex === undefined
      ? plan.meta
      : { ...plan.meta, halfwayIndex: computeHalfwayIndex(blocks) };

  return {
    plan: { ...plan, blocks, meta },
    note: trimmed
      ? `Psychomoteur réduit : il te reste ${Math.floor(remaining / 60)} min sur le cap de 12 min/jour (apprentissage moteur = doses courtes quotidiennes).`
      : undefined,
  };
}

/** À appeler quand une session « du jour » se termine : avance les rotations. */
export function onDailyCompleted(plan: SessionPlan, now: Date = new Date()): void {
  const moment = parisMoment(now);
  const state = getDailyState();
  if (plan.meta?.daily === 'morning') {
    saveDailyState(advanceAfterMorning(state, plan.meta.usedGroup, moment.dayKey));
  } else if (plan.meta?.daily === 'evening' && plan.blocks.length > 0) {
    saveDailyState(recordEvening(state, plan.blocks[0].exercise));
  }
}
