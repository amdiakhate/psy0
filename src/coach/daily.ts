import type { ExerciseId, SessionBlock, SessionPlan } from '../core/types';
import { loadJson, saveJson } from '../core/storage';
import { getEvents } from '../core/eventlog';
import { getPrefs } from '../core/prefs';
import { EXERCISES, getExercise, hasExercise } from '../exercises';
import { rankWeakest } from '../analysis/scores';
import { weakestTagOf } from '../analysis/errorTaxonomy';
import { composeSimulation } from './simulation';
import { composeGuided } from './composer';
import { markExternalPlan } from './external';
import {
  ROLE_LABEL,
  advancesRotation,
  coverageOf,
  externalOf,
  externalPsychoSec,
  putExternal,
} from './external-session';
import type { ExternalBlockEntry, ExternalSession, ProtocolRole } from './external-session';
import { computeHalfwayIndex } from './composer-logic';
import { saveLogEntries } from '../core/logs';
import { markDirty } from '../sync/sync';
import type { Feeling } from '../core/logs';
import { LOG_RESERVE_SEC, composeMorningBlocks, prioritySecondsOf } from './morning-logic';
import type { MorningDuration, MorningPriority } from './morning-logic';
import { mulberry32, newSeed, shuffle } from '../core/rng';
import {
  GROUPS,
  INITIAL_DAILY_STATE,
  PSYCHO_DAILY_CAP_SEC,
  advanceAfterMorning,
  advancePriorityOnly,
  clampPsychomotor,
  decideDaily,
  morningPriorities,
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

/**
 * Le cap quotidien de psychomoteur, minutes faites AILLEURS comprises.
 *
 * Sans cette addition, une séance externe rechargerait le compteur à neuf :
 * l'app proposerait douze minutes de plus alors que le quota est déjà
 * consommé. Le cap existe parce que l'apprentissage moteur se dégrade au-delà —
 * il ne connaît pas la frontière entre l'app et Pilotest.
 */
export function psychoRemainingTodaySec(now: Date = new Date()): number {
  const day = parisMoment(now).dayKey;
  const used = psychoUsedSec(getEvents(), day) + externalPsychoSec(day);
  return Math.max(0, PSYCHO_DAILY_CAP_SEC - used);
}

export interface DailyOffer {
  decision: DailyDecision;
  /**
   * Le programme du jour REPROPOSÉ alors qu'il est déjà fait. C'est de
   * l'entraînement libre : il ne recompte pas comme la séance du jour, ne fait
   * pas réavancer les rotations et n'impose pas le journal de fin.
   */
  replay?: SessionPlan;
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

  const today = externalOf(moment.dayKey);
  const decision = decideDaily({
    moment,
    state,
    discovered: discoveredSet(),
    allExercises: EXERCISES.map((e) => e.id),
    priorities: prefs.priorities,
    weakestOrder,
    externalToday: today ? coverageOf(today.blocks) : null,
  });

  return buildOffer(decision, moment, morningMin);
}

/** Construit l'offre correspondant à une décision. Extrait pour que « done-today » puisse rejouer la sienne. */
function buildOffer(
  decision: DailyDecision,
  moment: ParisMoment,
  morningMin: MorningDuration,
): DailyOffer {
  const state = getDailyState();
  const prefs = getPrefs();
  const weakestOrder = rankWeakest().map((s) => s.exercise);
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
    case 'done-today': {
      // On reconstruit l'offre qui AURAIT été faite, puis on la dépouille de
      // tout ce qui la rendait « officielle ». Le programme est identique — les
      // questions, elles, seront nouvelles : les items se tirent au hasard.
      const original = buildOffer(decision.replay, moment, morningMin);
      const replay = original.plan
        ? {
            ...original.plan,
            meta: { ...original.plan.meta, daily: undefined, requiresLog: false },
            // Le briefing du matin promet le journal de fin « qui pilote
            // demain ». Un replay ne l'ouvre pas : garder cette phrase
            // annoncerait un écran qui ne viendra jamais.
            briefing: [
              ...(original.plan.briefing ?? []).slice(0, -1),
              'Reprise libre : mêmes exercices, questions nouvelles. Rien n’est recompté, et le journal du jour reste celui de ta vraie séance.',
            ],
          }
        : undefined;
      return {
        decision, moment, plan: null, optional: false, replay,
        title: 'Session du matin déjà faite ✓',
        subtitle: replay
          ? 'Reviens après 12 h pour la session du soir (optionnelle). Tu peux aussi refaire le programme du matin — il ne comptera pas une seconde fois.'
          : 'Reviens après 12 h pour la session du soir (optionnelle).',
      };
    }
    case 'external-done': {
      const original = buildOffer(decision.replay, moment, morningMin);
      return {
        decision, moment, plan: null, optional: false,
        replay: original.plan
          ? { ...original.plan, meta: { ...original.plan.meta, daily: undefined, requiresLog: false } }
          : undefined,
        title: 'Séance du jour : faite (externe) ✓',
        subtitle:
          'Tu l’as consignée comme faite ailleurs, et elle couvre tout le protocole. La rotation a suivi. Tu peux refaire le programme ici — il ne comptera pas une seconde fois.',
      };
    }
    case 'external-partial': {
      // On recompose la séance COMPLÈTE, puis on ne garde que les rôles
      // manquants : durées et enchaînement du protocole sont préservés, on
      // n'invente pas un minutage de rattrapage.
      const original = buildOffer(decision.replay, moment, morningMin);
      const kept = (original.plan?.blocks ?? []).filter(
        (b) => b.role !== undefined && decision.missing.includes(b.role as ProtocolRole),
      );
      const labels = decision.missing.map((r) => ROLE_LABEL[r]).join(', ');
      if (kept.length === 0) {
        return {
          decision, moment, plan: null, optional: false,
          title: 'Séance partielle consignée',
          subtitle: `Il reste : ${labels} — mais rien à lancer ici pour ces blocs. Fais-les où tu voudras, puis complète ta saisie.`,
        };
      }
      const guarded = finalizePlan({
        mode: morningMin === 60 ? 'guided60' : 'guided90',
        blocks: kept,
        briefing: [
          `Complément de séance : ${labels}.`,
          'Le reste a été fait ailleurs et consigné — on ne le rejoue pas.',
          'Minutage normal du protocole : ces blocs durent ce qu’ils auraient duré dans la séance entière.',
        ],
        meta: {
          daily: 'morning',
          requiresLog: true,
          usedGroup: decision.replay.kind === 'buildup-morning' ? decision.replay.groupIndex : undefined,
        },
      });
      return {
        decision, moment, plan: guarded.plan, optional: false, note: guarded.note,
        title: `Séance partielle — il reste : ${labels}`,
        subtitle: guarded.plan
          ? `${guarded.plan.blocks.map(blockLabel).join(' → ')} · ${Math.round(
              guarded.plan.blocks.reduce((t, b) => t + (b.durationSec ?? 0), 0) / 60,
            )} min`
          : '',
      };
    }
    case 'discovery-morning': {
      if (decision.toDiscover.length === 0) {
        // Tout est découvert : session guidée classique de 30 min.
        const plan = finalizePlan({ ...composeGuided(30), meta: { daily: 'morning', requiresLog: true } });
        return {
          decision, moment, plan: plan.plan, optional: false, note: plan.note,
          title: 'Session du matin — 30 min',
          subtitle: 'Tout est découvert : le coach pilote. ' + summarize(plan.plan),
        };
      }
      const list = decision.toDiscover.slice(0, 6);
      const blocks: SessionBlock[] = list.map((e) => ({ exercise: e, level: 'adaptive', durationSec: 300 }));
      const guarded = finalizePlan({
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
      // Une priorité quand P1/P2/P3 sont saisies, trois en mode dégradé.
      const priorities: MorningPriority[] = decision.priorities.map((exercise) => ({
        exercise,
        weakTag: weakestTagOf(exercise),
      }));
      const priorityNames = priorities.map((p) => getExercise(p.exercise).name);
      const head = priorities[0];

      // 1 h 30 : une seconde priorité (la suivante de la rotation) et un second
      // groupe de rotation, pour ne pas empiler 40 min sur un seul exercice.
      // En dégradé il y en a déjà trois : rien à ajouter.
      const groups = [decision.groupIndex];
      if (morningMin >= 90) {
        if (!decision.degraded && head) {
          const second = nextPriorityAfter(head.exercise, prefs.priorities, state.priorityCursor, weakestOrder);
          if (second) {
            priorities.push({ exercise: second, weakTag: weakestTagOf(second) });
            priorityNames.push(getExercise(second).name);
          }
        }
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
      const drills = priorities.filter((p) => p.weakTag);

      const guarded = finalizePlan({
        mode: morningMin === 60 ? 'guided60' : 'guided90',
        blocks,
        briefing: [
          decision.degraded
            ? `Priorités non définies : le coach répartit sur tes ${priorities.length} exercices les plus faibles — ${priorityNames.join(', ')}.`
            : `Priorité du jour : ${priorityNames[0]}${
                head?.weakTag ? ` (drill « ${head.weakTag.tag} »)` : ''
              } · rotation ${groupNames}.`,
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
          degraded: decision.degraded ? DEGRADED_BANNER : undefined,
        },
      });
      return {
        decision, moment, plan: guarded.plan, optional: false, note: guarded.note,
        title: `Session du matin — ${morningMin === 60 ? '60 min' : '1 h 30'} structurée`,
        subtitle:
          `5 min Grilles → ${priorityMin} min ${priorityNames.join(' / ')} ` +
          `(${passes} passes de 8 min${drills.length > 0 ? `, drill ${drills.map((d) => d.weakTag!.tag).join(' / ')}` : ''}) ` +
          `entrelacées avec ${groupNames} → 5 min Psychomoteur → ${Math.round(LOG_RESERVE_SEC / 60)} min de log`,
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
      const guarded = finalizePlan({
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
      const guarded = finalizePlan(composeSimulation());
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

/**
 * Bandeau affiché au lancement d'une séance composée sans P1/P2/P3.
 *
 * Le coach sait faire quelque chose d'utile sans consigne ; il ne doit pas
 * laisser croire qu'il fait la même chose qu'avec. Sans cet aveu, une matinée
 * répartie sur trois exercices devinés se lit comme une matinée ciblée.
 */
export const DEGRADED_BANNER =
  'Priorités non définies — session dégradée. Le coach répartit sur tes trois exercices les plus faibles au lieu d’en travailler un en profondeur. Saisis P1/P2/P3 dans les Réglages pour retrouver une séance ciblée.';

/** Le drapeau « non calibré » vit dans les prefs ; la logique, elle, reste pure. */
export function isExternalExercise(id: ExerciseId): boolean {
  return getPrefs().externalDrill[id] === true;
}

/**
 * Le passage obligé de tout plan avant d'être joué : créneaux externes marqués,
 * puis cap Psychomoteur appliqué. Les deux ensemble, parce que les oublier
 * séparément a le même effet — une séance qui ne fait pas ce qu'elle annonce.
 */
export function finalizePlan(plan: SessionPlan): { plan: SessionPlan | null; note?: string } {
  return guardPsycho(markExternalPlan(plan, isExternalExercise));
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

/**
 * L'exercice que le protocole aurait mis dans chaque rôle aujourd'hui.
 *
 * Sert à pré-remplir la saisie d'une séance externe : dans l'immense majorité
 * des cas le candidat a fait ce que le coach prévoyait, ailleurs. Lui faire
 * ressaisir les mêmes exercices à la main est le meilleur moyen qu'il ne
 * consigne rien.
 */
export function morningRoleDefaults(
  now: Date = new Date(),
  morningMin: MorningDuration = 60,
): Partial<Record<ProtocolRole, ExerciseId>> {
  const offer = getDailyOffer(now, morningMin);
  const source =
    offer.plan ??
    (offer.decision.kind === 'external-done' || offer.decision.kind === 'external-partial'
      ? buildOffer(offer.decision.replay, offer.moment, morningMin).plan
      : null);
  const out: Partial<Record<ProtocolRole, ExerciseId>> = {};
  for (const b of source?.blocks ?? []) {
    const role = b.role as ProtocolRole | undefined;
    if (role && out[role] === undefined) out[role] = b.exercise;
  }
  return out;
}

/**
 * Consigne une séance du matin faite AILLEURS.
 *
 * Trois effets, et ils sont indissociables : la couverture décide de ce que
 * l'app proposera encore, la passe priorité décide de la rotation, et les
 * blocs partent dans le journal du jour marqués « externe ». Oublier le
 * journal reviendrait à effacer la séance de l'historique — c'est-à-dire à
 * refaire exactement le tort qu'on répare.
 */
export function recordExternalSession(args: {
  blocks: ExternalBlockEntry[];
  psychoMin: number;
  feeling?: Feeling;
  now?: Date;
}): { complete: boolean; missing: ProtocolRole[]; rotationAdvanced: boolean } {
  const now = args.now ?? new Date();
  const moment = parisMoment(now);
  const prefs = getPrefs();
  const weakestOrder = rankWeakest().map((s) => s.exercise);
  const state = getDailyState();

  const { list } = morningPriorities({
    priorities: prefs.priorities,
    priorityCursor: state.priorityCursor,
    weakestOrder,
    allExercises: EXERCISES.map((e) => e.id),
  });

  const coverage = coverageOf(args.blocks);
  const advance = advancesRotation(args.blocks, list);

  const session: ExternalSession = {
    dayKey: moment.dayKey,
    savedAt: now.getTime(),
    blocks: args.blocks,
    psychoMin: args.psychoMin,
    feeling: args.feeling,
    advanced: advance,
  };
  putExternal(session);

  if (advance) {
    // Une séance externe COMPLÈTE clôt la journée ; une partielle fait bouger
    // la cible sans prétendre que le travail est fini.
    saveDailyState(
      coverage.complete
        ? advanceAfterMorning(state, undefined, moment.dayKey)
        : advancePriorityOnly(state, moment.dayKey),
    );
  }

  saveLogEntries(
    args.blocks.map((b) => ({
      day: moment.dayKey,
      ts: now.getTime(),
      exercise: b.exercise,
      level: b.pilotestClass ?? 0,
      errPct: b.successPct === undefined ? 0 : Math.round(100 - b.successPct),
      feeling: args.feeling,
      role: b.role,
      passes: 1,
      external: true,
      pilotestClass: b.pilotestClass,
    })),
  );
  markDirty();

  return { complete: coverage.complete, missing: coverage.missing, rotationAdvanced: advance };
}

/**
 * Une séance externe partielle vient d'être complétée ICI : on ajoute les rôles
 * réellement joués à la saisie, pour que la carte cesse d'annoncer un reste qui
 * n'existe plus.
 */
function closeExternalDay(dayKey: string, plan: SessionPlan): void {
  const existing = externalOf(dayKey);
  if (!existing) return;
  const done = new Set(existing.blocks.map((b) => b.role));
  const added: ExternalBlockEntry[] = [];
  for (const b of plan.blocks) {
    const role = b.role as ProtocolRole | undefined;
    if (!role || done.has(role)) continue;
    done.add(role);
    added.push({ role, exercise: b.exercise });
  }
  if (added.length === 0) return;
  putExternal({ ...existing, blocks: [...existing.blocks, ...added] });
}

/** À appeler quand une session « du jour » se termine : avance les rotations. */
export function onDailyCompleted(plan: SessionPlan, now: Date = new Date()): void {
  const moment = parisMoment(now);
  const state = getDailyState();
  if (plan.meta?.daily === 'morning') {
    saveDailyState(advanceAfterMorning(state, plan.meta.usedGroup, moment.dayKey));
    // Complément d'une séance consignée comme faite ailleurs : la saisie doit
    // refléter la journée entière, sinon la carte réclamerait encore les blocs
    // qu'on vient de jouer.
    closeExternalDay(moment.dayKey, plan);
  } else if (plan.meta?.daily === 'evening' && plan.blocks.length > 0) {
    saveDailyState(recordEvening(state, plan.blocks[0].exercise));
  }
}
