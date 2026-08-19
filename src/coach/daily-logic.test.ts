import { describe, expect, it } from 'vitest';
import {
  GROUPS,
  INITIAL_DAILY_STATE,
  PSYCHO_DAILY_CAP_SEC,
  advanceAfterMorning,
  clampPsychomotor,
  decideDaily,
  isAfterBedtime,
  parisMoment,
  psychoUsedSec,
  recordEvening,
} from './daily-logic';
import type { DailyState } from './daily-logic';
import type { ExerciseId, SessionBlock } from '../core/types';

const ALL: ExerciseId[] = [
  'word-skip', 'odd-even', 'n-back', 'shapes-colors', 'airways', 'psychomotor',
  'stacking', 'objects-3d', 'marbles', 'sliding-shapes', 'cubes', 'calc-grid',
  'logic-series', 'word-boxes', 'star-words', 'english',
];

/** En août/septembre, Paris est en heure d'été : UTC+2. */
const at = (iso: string) => parisMoment(new Date(`${iso}+02:00`));

function decide(iso: string, overrides: Partial<Parameters<typeof decideDaily>[0]> = {}) {
  return decideDaily({
    moment: at(iso),
    state: INITIAL_DAILY_STATE,
    discovered: new Set<ExerciseId>(),
    allExercises: ALL,
    priorities: null,
    weakestOrder: [...ALL],
    ...overrides,
  });
}

describe('parisMoment', () => {
  it('convertit correctement en heure de Paris (été = UTC+2)', () => {
    const m = parisMoment(new Date('2026-08-18T07:30:00Z')); // 09:30 à Paris
    expect(m.dayKey).toBe('2026-08-18');
    expect(m.hour).toBe(9);
    expect(m.minute).toBe(30);
  });

  it('bascule de jour à minuit Paris, pas UTC', () => {
    const m = parisMoment(new Date('2026-08-18T22:30:00Z')); // 00:30 le 19 à Paris
    expect(m.dayKey).toBe('2026-08-19');
  });
});

describe('decideDaily — bornes de dates', () => {
  it('17/08 = dernier jour découverte, 18/08 = montée en charge', () => {
    expect(decide('2026-08-17T09:00:00').kind).toBe('discovery-morning');
    expect(decide('2026-08-17T14:00:00').kind).toBe('discovery-evening');
    expect(decide('2026-08-18T09:00:00').kind).toBe('buildup-morning');
    expect(decide('2026-08-18T14:00:00').kind).toBe('buildup-evening');
  });

  it('bascule matin/soir à 12h00 exactement', () => {
    expect(decide('2026-08-19T11:59:00').kind).toBe('buildup-morning');
    expect(decide('2026-08-19T12:00:00').kind).toBe('buildup-evening');
  });

  it('samedis 22 et 29/08 = mini-simulation, quel que soit le moment', () => {
    expect(decide('2026-08-22T09:00:00').kind).toBe('mini-sim');
    expect(decide('2026-08-22T20:00:00').kind).toBe('mini-sim');
    expect(decide('2026-08-29T10:00:00').kind).toBe('mini-sim');
  });

  it('dimanche 23/08 = repos', () => {
    expect(decide('2026-08-23T10:00:00').kind).toBe('rest');
  });

  it('30/08 → 01/09 = simulation d’abord ; 02/09 = verrouillé', () => {
    expect(decide('2026-08-30T09:00:00').kind).toBe('simulation-first');
    expect(decide('2026-08-31T18:00:00').kind).toBe('simulation-first');
    expect(decide('2026-09-01T09:00:00').kind).toBe('simulation-first');
    expect(decide('2026-09-02T09:00:00').kind).toBe('locked');
    expect(decide('2026-09-02T23:00:00').kind).toBe('locked');
  });
});

describe('decideDaily — découverte', () => {
  it('le matin propose uniquement les exercices non découverts', () => {
    const discovered = new Set<ExerciseId>(['odd-even', 'n-back', 'calc-grid']);
    const d = decide('2026-08-15T09:00:00', { discovered });
    expect(d.kind).toBe('discovery-morning');
    if (d.kind === 'discovery-morning') {
      expect(d.toDiscover).not.toContain('odd-even');
      expect(d.toDiscover).toContain('cubes');
      expect(d.toDiscover.length).toBe(ALL.length - 3);
    }
  });

  it('le soir : un exercice déjà vu, jamais celui de la veille, jamais le psychomoteur', () => {
    const discovered = new Set<ExerciseId>(['psychomotor', 'odd-even', 'cubes']);
    const state: DailyState = { ...INITIAL_DAILY_STATE, lastEveningExercise: 'odd-even' };
    const d = decide('2026-08-15T20:00:00', { discovered, state, weakestOrder: ['psychomotor', 'odd-even', 'cubes'] });
    expect(d.kind).toBe('discovery-evening');
    if (d.kind === 'discovery-evening') expect(d.exercise).toBe('cubes');
  });

  it('le soir sans exercice découvert : pas de sprint proposé', () => {
    const d = decide('2026-08-15T20:00:00', { discovered: new Set() });
    if (d.kind === 'discovery-evening') expect(d.exercise).toBeNull();
  });
});

describe('decideDaily — montée en charge et rotation', () => {
  const priorities: ExerciseId[] = ['cubes', 'n-back', 'calc-grid'];

  it('utilise P1/P2/P3 selon le curseur persisté', () => {
    for (const [cursor, expected] of [[0, 'cubes'], [1, 'n-back'], [2, 'calc-grid'], [3, 'cubes']] as const) {
      const d = decide('2026-08-19T09:00:00', {
        priorities,
        state: { ...INITIAL_DAILY_STATE, priorityCursor: cursor },
      });
      if (d.kind === 'buildup-morning') expect(d.priority).toBe(expected);
      else expect.unreachable();
    }
  });

  it('la rotation saute le groupe couvert par la priorité du jour', () => {
    // cubes ∈ G2 (index 1) : si le curseur de groupe pointe G2, on passe à G3.
    const d = decide('2026-08-19T09:00:00', {
      priorities,
      state: { ...INITIAL_DAILY_STATE, priorityCursor: 0, groupCursor: 1 },
    });
    if (d.kind === 'buildup-morning') {
      expect(d.priority).toBe('cubes');
      expect(d.groupIndex).toBe(2);
      expect(GROUPS[d.groupIndex].members).not.toContain('cubes');
    } else expect.unreachable();
  });

  it('sans priorités configurées, retombe sur le plus faible', () => {
    const d = decide('2026-08-19T09:00:00', { weakestOrder: ['star-words', ...ALL] });
    if (d.kind === 'buildup-morning') expect(d.priority).toBe('star-words');
    else expect.unreachable();
  });

  it('matin déjà complété → done-today (pas de double session)', () => {
    const d = decide('2026-08-19T09:00:00', {
      state: { ...INITIAL_DAILY_STATE, lastMorningDoneDay: '2026-08-19' },
    });
    expect(d.kind).toBe('done-today');
  });
});

describe('advanceAfterMorning — persistance sans reset', () => {
  it('avance P et G, et est idempotent le même jour', () => {
    const s1 = advanceAfterMorning(INITIAL_DAILY_STATE, 1, '2026-08-19');
    expect(s1.priorityCursor).toBe(1);
    expect(s1.groupCursor).toBe(2);
    expect(s1.lastMorningDoneDay).toBe('2026-08-19');
    // Rejouer une session matin le même jour n'avance pas une 2e fois.
    const s2 = advanceAfterMorning(s1, 2, '2026-08-19');
    expect(s2).toEqual(s1);
    // Un jour raté ne reset rien : le lendemain reprend au curseur suivant.
    const s3 = advanceAfterMorning(s1, 4, '2026-08-21');
    expect(s3.priorityCursor).toBe(2);
    expect(s3.groupCursor).toBe(0);
  });

  it('recordEvening mémorise le sprint du soir', () => {
    expect(recordEvening(INITIAL_DAILY_STATE, 'cubes').lastEveningExercise).toBe('cubes');
  });
});

describe('cap psychomoteur', () => {
  const psycho = (sec: number): SessionBlock => ({ exercise: 'psychomotor', level: 'adaptive', durationSec: sec });
  const other = (sec: number): SessionBlock => ({ exercise: 'cubes', level: 'adaptive', durationSec: sec });

  it('tronque au budget restant et ne touche pas aux autres blocs', () => {
    const { blocks, trimmed } = clampPsychomotor([other(300), psycho(600)], 300);
    expect(trimmed).toBe(true);
    expect(blocks).toHaveLength(2);
    expect(blocks[1].durationSec).toBe(300);
    expect(blocks[0].durationSec).toBe(300);
  });

  it('supprime un bloc qui tomberait sous 60 s', () => {
    const { blocks, trimmed } = clampPsychomotor([psycho(600), other(300)], 30);
    expect(trimmed).toBe(true);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].exercise).toBe('cubes');
  });

  it('deux blocs psychomoteur partagent le même budget', () => {
    const { blocks } = clampPsychomotor([psycho(600), psycho(600)], PSYCHO_DAILY_CAP_SEC);
    const total = blocks.filter((b) => b.exercise === 'psychomotor').reduce((s, b) => s + (b.durationSec ?? 0), 0);
    expect(total).toBeLessThanOrEqual(PSYCHO_DAILY_CAP_SEC);
  });

  it('psychoUsedSec compte 1 s par fenêtre de poursuite du jour Paris', () => {
    const ts = new Date('2026-08-19T08:00:00+02:00').getTime();
    const yesterday = new Date('2026-08-18T08:00:00+02:00').getTime();
    const events = [
      { ts, exercise: 'psychomotor', tags: ['tracking'] },
      { ts, exercise: 'psychomotor', tags: ['tracking', 'dual-load'] },
      { ts, exercise: 'psychomotor', tags: ['secondary-calc', 'dual-load'] }, // pas une fenêtre
      { ts: yesterday, exercise: 'psychomotor', tags: ['tracking'] }, // pas aujourd'hui
      { ts, exercise: 'cubes', tags: ['tracking'] }, // pas psychomoteur
    ];
    expect(psychoUsedSec(events, '2026-08-19')).toBe(2);
  });
});

describe('bandeau sommeil', () => {
  it('à partir de 22h30 Paris', () => {
    expect(isAfterBedtime(at('2026-08-19T22:29:00'))).toBe(false);
    expect(isAfterBedtime(at('2026-08-19T22:30:00'))).toBe(true);
    expect(isAfterBedtime(at('2026-08-19T23:15:00'))).toBe(true);
  });
});

describe('refaire la séance du jour', () => {
  const base = {
    moment: parisMoment(new Date('2026-08-19T09:00:00+02:00')),
    discovered: new Set<ExerciseId>(ALL),
    allExercises: ALL,
    priorities: ['cubes', 'marbles', 'english'] as [ExerciseId, ExerciseId, ExerciseId],
    weakestOrder: ALL,
  };

  it('porte le programme qui AURAIT été offert, pour pouvoir le rejouer', () => {
    const state = { ...INITIAL_DAILY_STATE, priorityCursor: 1, groupCursor: 2 };
    const avant = decideDaily({ ...base, state });
    const apres = decideDaily({ ...base, state: { ...state, lastMorningDoneDay: base.moment.dayKey } });

    expect(avant.kind).toBe('buildup-morning');
    expect(apres.kind).toBe('done-today');
    if (apres.kind !== 'done-today') return;
    // Le programme rejoué est EXACTEMENT celui du matin : même priorité, même
    // groupe. Un curseur qui aurait bougé donnerait un autre programme.
    expect(apres.replay).toEqual(avant);
  });

  it('ne fait pas réavancer les rotations : l’avancement est idempotent par jour', () => {
    const day = '2026-08-19';
    const state = { ...INITIAL_DAILY_STATE, priorityCursor: 1, groupCursor: 2 };
    const apresPremier = advanceAfterMorning(state, 2, day);
    expect(apresPremier.priorityCursor).toBe(2);
    // Rejouer la séance le même jour ne doit rien décaler.
    expect(advanceAfterMorning(apresPremier, 2, day)).toEqual(apresPremier);
  });
});
