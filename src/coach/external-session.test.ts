import { describe, expect, it } from 'vitest';
import type { ExerciseId } from '../core/types';
import {
  PROTOCOL_ROLES,
  advancesRotation,
  coverageOf,
  isValidExternal,
} from './external-session';
import type { ExternalBlockEntry } from './external-session';
import {
  INITIAL_DAILY_STATE,
  advanceAfterMorning,
  advancePriorityOnly,
  decideDaily,
  parisMoment,
} from './daily-logic';
import type { DailyState } from './daily-logic';

const ALL: ExerciseId[] = [
  'word-skip', 'odd-even', 'n-back', 'shapes-colors', 'airways', 'psychomotor',
  'stacking', 'objects-3d', 'marbles', 'sliding-shapes', 'cubes', 'calc-grid',
  'logic-series', 'word-boxes', 'star-words', 'english',
];

const PRIORITIES: ExerciseId[] = ['word-skip', 'shapes-colors', 'airways'];

const block = (role: ExternalBlockEntry['role'], exercise: ExerciseId): ExternalBlockEntry => ({
  role,
  exercise,
});

/** La séance que le candidat a réellement faite ce matin-là sur Pilotest. */
const PARTIAL: ExternalBlockEntry[] = [
  block('warmup', 'calc-grid'),
  block('rotation', 'marbles'),
];

const FULL: ExternalBlockEntry[] = [
  block('warmup', 'calc-grid'),
  block('priority', 'word-skip'),
  block('rotation', 'marbles'),
  block('psychomotor', 'psychomotor'),
];

describe('couverture d’une séance externe', () => {
  it('repère ce qui manque, dans l’ordre du protocole', () => {
    const c = coverageOf(PARTIAL);
    expect(c.covered).toEqual(['warmup', 'rotation']);
    expect(c.missing).toEqual(['priority', 'psychomotor']);
    expect(c.complete).toBe(false);
  });

  it('déclare complète une séance qui couvre les quatre rôles', () => {
    const c = coverageOf(FULL);
    expect(c.missing).toEqual([]);
    expect(c.complete).toBe(true);
    expect(c.covered).toEqual(PROTOCOL_ROLES);
  });

  it('ne compte pas deux fois un rôle joué en plusieurs passes', () => {
    const c = coverageOf([block('priority', 'word-skip'), block('priority', 'word-skip')]);
    expect(c.covered).toEqual(['priority']);
  });
});

describe('avancement de la rotation', () => {
  /**
   * La rotation n'existe que pour faire tourner P1 → P2 → P3. Elle doit donc
   * suivre la PASSE PRIORITÉ, et rien d'autre : une séance où l'on a fait
   * l'échauffement et la rotation sans toucher la cible n'a rien fait avancer.
   */
  it('n’avance pas si la passe priorité n’a pas été travaillée', () => {
    expect(advancesRotation(PARTIAL, PRIORITIES)).toBe(false);
  });

  it('avance dès que la passe priorité du jour est faite, même partiellement', () => {
    expect(advancesRotation([block('priority', 'word-skip')], PRIORITIES)).toBe(true);
  });

  it('avance sur une séance complète', () => {
    expect(advancesRotation(FULL, PRIORITIES)).toBe(true);
  });

  /** Consigner une priorité qui n'est pas celle du jour ne fait rien avancer. */
  it('exige que l’exercice soit bien une priorité du jour', () => {
    expect(advancesRotation([block('priority', 'marbles')], PRIORITIES)).toBe(false);
  });
});

describe('curseurs', () => {
  const day = '2026-08-21';

  it('advancePriorityOnly fait tourner la priorité sans clore la journée', () => {
    const next = advancePriorityOnly(INITIAL_DAILY_STATE, day);
    expect(next.priorityCursor).toBe(1);
    expect(next.lastPriorityAdvanceDay).toBe(day);
    // La journée n'est PAS finie : la carte doit continuer d'annoncer le reste.
    expect(next.lastMorningDoneDay).toBeNull();
  });

  it('est idempotent dans la journée', () => {
    const once = advancePriorityOnly(INITIAL_DAILY_STATE, day);
    expect(advancePriorityOnly(once, day).priorityCursor).toBe(1);
  });

  /**
   * Le piège du double comptage : la séance externe a déjà fait tourner la
   * priorité, puis le complément est joué ici. Sans le garde-fou, on sauterait
   * une priorité entière — P2 ne serait jamais travaillée.
   */
  it('compléter une séance déjà comptée ne fait pas sauter une priorité', () => {
    const afterExternal = advancePriorityOnly(INITIAL_DAILY_STATE, day);
    const afterLocal = advanceAfterMorning(afterExternal, 2, day);
    expect(afterLocal.priorityCursor).toBe(1);
    expect(afterLocal.lastMorningDoneDay).toBe(day);
    // Le groupe, lui, n'avait pas bougé : il avance normalement.
    expect(afterLocal.groupCursor).toBe(3);
  });

  it('une séance locale seule avance bien la priorité', () => {
    expect(advanceAfterMorning(INITIAL_DAILY_STATE, 0, day).priorityCursor).toBe(1);
  });

  it('boucle sur trois priorités', () => {
    let st: DailyState = INITIAL_DAILY_STATE;
    for (const [i, d] of ['2026-08-21', '2026-08-24', '2026-08-25', '2026-08-26'].entries()) {
      st = advanceAfterMorning(st, undefined, d);
      expect(st.priorityCursor, d).toBe((i + 1) % 3);
    }
  });
});

describe('décision du jour avec séance externe', () => {
  const decide = (external: ReturnType<typeof coverageOf> | null) =>
    decideDaily({
      moment: parisMoment(new Date('2026-08-21T09:00:00+02:00')),
      state: INITIAL_DAILY_STATE,
      discovered: new Set(ALL),
      allExercises: ALL,
      priorities: PRIORITIES as [ExerciseId, ExerciseId, ExerciseId],
      weakestOrder: ALL,
      externalToday: external,
    });

  it('sans séance externe, propose la séance du matin', () => {
    expect(decide(null).kind).toBe('buildup-morning');
  });

  it('séance externe complète → journée close', () => {
    expect(decide(coverageOf(FULL)).kind).toBe('external-done');
  });

  it('séance externe partielle → il reste des blocs, et on sait lesquels', () => {
    const d = decide(coverageOf(PARTIAL));
    if (d.kind === 'external-partial') {
      expect(d.missing).toEqual(['priority', 'psychomotor']);
      // La décision d'origine est conservée : elle sert à recomposer les blocs
      // manquants avec leur minutage normal.
      expect(d.replay.kind).toBe('buildup-morning');
    } else expect.unreachable();
  });
});

describe('validation de la saisie', () => {
  it('accepte une saisie minimale', () => {
    expect(isValidExternal([block('warmup', 'calc-grid')], 0)).toBe(true);
  });

  it('refuse une saisie vide', () => {
    expect(isValidExternal([], 0)).toBe(false);
  });

  it('accepte des mesures absentes', () => {
    expect(isValidExternal(FULL, 5)).toBe(true);
  });

  it('refuse une classe ou un pourcentage hors bornes', () => {
    expect(isValidExternal([{ ...block('warmup', 'calc-grid'), pilotestClass: 0 }], 0)).toBe(false);
    expect(isValidExternal([{ ...block('warmup', 'calc-grid'), pilotestClass: 10 }], 0)).toBe(false);
    expect(isValidExternal([{ ...block('warmup', 'calc-grid'), successPct: 101 }], 0)).toBe(false);
    expect(isValidExternal([{ ...block('warmup', 'calc-grid'), successPct: -1 }], 0)).toBe(false);
  });

  it('refuse un temps de psychomoteur absurde', () => {
    expect(isValidExternal(FULL, -1)).toBe(false);
    expect(isValidExternal(FULL, 121)).toBe(false);
  });
});
