import { describe, expect, it } from 'vitest';
import type { BlockResult, SessionBlock } from './types';
import { buildLogRows, externalExercisesOf } from './log-rows';
import { formatDayLog } from './logs';
import type { DayLogEntry } from './logs';

const planBlocks: SessionBlock[] = [
  { exercise: 'calc-grid', level: 'adaptive', durationSec: 300, role: 'warmup' },
  { exercise: 'airways', level: 'adaptive', durationSec: 480, role: 'priority', external: true },
  { exercise: 'cubes', level: 'adaptive', durationSec: 480, role: 'rotation' },
  { exercise: 'airways', level: 'adaptive', durationSec: 480, role: 'priority', external: true },
];

const played: BlockResult[] = [
  { exercise: 'calc-grid', items: 20, correct: 16, avgRtMs: 3000, endLevel: 3 },
  { exercise: 'cubes', items: 10, correct: 5, avgRtMs: 9000, endLevel: 2 },
];

describe('lignes du log de séance', () => {
  it('agrège les blocs joués par exercice', () => {
    const rows = buildLogRows({ played, planBlocks, externals: [] });
    const calc = rows.find((r) => r.exercise === 'calc-grid')!;
    // Recalcul indépendant : 16/20 justes → 20 % d'erreurs.
    expect(calc.errPct).toBe(20);
    expect(calc.role).toBe('warmup');
    expect(calc.external).toBeUndefined();
  });

  /**
   * Le bug qu'on verrouille : la règle « un bloc sans item ne compte pas »
   * effaçait les créneaux externes, qui n'ont par construction aucun item joué
   * ici — et qui sont pourtant la seule mesure fiable de la séance.
   */
  it('remonte un créneau externe alors qu’aucun item n’a été joué ici', () => {
    const rows = buildLogRows({
      played,
      planBlocks,
      externals: [{ exercise: 'airways', pilotestClass: 2, errPct: 45, note: 'vague 3 ratée' }],
    });
    const airways = rows.find((r) => r.exercise === 'airways');
    expect(airways).toBeDefined();
    expect(airways).toMatchObject({
      external: true,
      pilotestClass: 2,
      errPct: 45,
      role: 'priority',
      note: 'vague 3 ratée',
    });
  });

  it('compte autant de passes que le plan réservait de créneaux', () => {
    const rows = buildLogRows({
      played,
      planBlocks,
      externals: [{ exercise: 'airways', pilotestClass: 2, errPct: 45 }],
    });
    // Deux blocs `external` dans le plan → deux passes.
    expect(rows.find((r) => r.exercise === 'airways')!.passes).toBe(2);
  });

  it('range la classe Pilotest dans `level` pour rester exportable', () => {
    const rows = buildLogRows({
      played: [],
      planBlocks,
      externals: [{ exercise: 'airways', pilotestClass: 7, errPct: 10 }],
    });
    expect(rows[0].level).toBe(7);
  });

  it('ne rend rien pour un créneau externe passé sans mesure', () => {
    const rows = buildLogRows({ played, planBlocks, externals: [] });
    expect(rows.some((r) => r.exercise === 'airways')).toBe(false);
  });

  it('liste les exercices à faire ailleurs, dédoublonnés et dans l’ordre', () => {
    expect(externalExercisesOf(planBlocks)).toEqual(['airways']);
    expect(externalExercisesOf(planBlocks.filter((b) => !b.external))).toEqual([]);
  });
});

describe('export du log — créneau externe', () => {
  const base = {
    day: '2026-08-21',
    ts: 1,
    feeling: 'laborieux' as const,
    passes: 2,
  };

  const ctx = (entries: DayLogEntry[]) => ({
    day: '2026-08-21',
    entries,
    names: { airways: 'Airways', cubes: 'Cubes 2D/3D' },
    subtypes: {},
    psychoUsedSec: 300,
    psychoCapSec: 720,
    tomorrow: { priority: null, group: 'G2 Spatial' },
  });

  /**
   * Une classe Pilotest et un niveau local peuvent valoir le même chiffre sans
   * vouloir dire la même chose. L'export doit les distinguer, sinon on compare
   * un chiffre déclaré à un chiffre mesuré sans le savoir.
   */
  it('écrit « PILOTEST classe » et non « niveau »', () => {
    const text = formatDayLog(
      ctx([
        {
          ...base,
          exercise: 'airways',
          level: 2,
          errPct: 45,
          role: 'priority',
          external: true,
          pilotestClass: 2,
        },
      ]),
    );
    expect(text).toContain('PILOTEST classe 2');
    expect(text).not.toContain('niveau 2');
    expect(text).toContain('45% err');
    expect(text).toContain('2 passes');
  });

  it('laisse les mesures locales inchangées', () => {
    const text = formatDayLog(
      ctx([{ ...base, exercise: 'cubes', level: 3, errPct: 50, role: 'rotation', passes: 1 }]),
    );
    expect(text).toContain('niveau 3');
    expect(text).not.toContain('PILOTEST');
  });
});
