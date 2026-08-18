import { describe, expect, it } from 'vitest';
import { PRIORITIES_LOCKED_UNTIL, arePrioritiesLocked, missingPilotestClasses } from './prefs';
import type { Prefs } from './prefs';
import type { ExerciseId } from './types';

/**
 * Les fonctions testées reçoivent les préférences en argument : le câblage
 * localStorage n'a pas de logique et n'est pas testable en Node.
 */

const prefs = (over: Partial<Prefs> = {}): Prefs => ({
  priorities: ['cubes', 'marbles', 'english'],
  pilotestClass: {},
  phase1ReviewAt: null,
  explainOnError: true,
  dev: { fastHalfway: false },
  ...over,
});

describe('arePrioritiesLocked', () => {
  it('ne verrouille rien tant que le bilan n’a pas été validé', () => {
    // Sans bilan, les priorités doivent rester librement modifiables.
    expect(arePrioritiesLocked('2026-08-18', prefs())).toBe(false);
    expect(arePrioritiesLocked('2026-08-24', prefs())).toBe(false);
  });

  it('verrouille du bilan jusqu’à la veille du 25/08', () => {
    const done = prefs({ phase1ReviewAt: 1_755_400_000_000 });
    expect(arePrioritiesLocked('2026-08-18', done)).toBe(true);
    expect(arePrioritiesLocked('2026-08-24', done)).toBe(true);
  });

  it('déverrouille le jour de l’échéance, pas après', () => {
    const done = prefs({ phase1ReviewAt: 1_755_400_000_000 });
    expect(arePrioritiesLocked(PRIORITIES_LOCKED_UNTIL, done)).toBe(false);
    expect(arePrioritiesLocked('2026-08-26', done)).toBe(false);
    expect(arePrioritiesLocked('2026-09-03', done)).toBe(false);
  });

  it('compare les dates lexicalement sans se tromper de mois', () => {
    // Les dayKey sont en AAAA-MM-JJ : la comparaison de chaînes suffit,
    // encore faut-il que le passage de mois soit correct.
    const done = prefs({ phase1ReviewAt: 1 });
    expect(arePrioritiesLocked('2026-07-31', done)).toBe(true);
    expect(arePrioritiesLocked('2026-09-01', done)).toBe(false);
  });
});

describe('missingPilotestClasses', () => {
  const all: ExerciseId[] = ['cubes', 'marbles', 'english'];

  it('liste tout quand rien n’est saisi', () => {
    expect(missingPilotestClasses(all, prefs())).toEqual(all);
  });

  it('ignore les exercices renseignés', () => {
    const p = prefs({ pilotestClass: { cubes: 6, marbles: 4, english: 7 } });
    expect(missingPilotestClasses(all, p)).toEqual([]);
  });

  it('traite null comme non saisi, mais garde la classe 1', () => {
    // La classe 1 est une vraie valeur : elle ne doit pas être confondue
    // avec une absence de saisie par une comparaison laxiste.
    const p = prefs({ pilotestClass: { cubes: null, marbles: 1 } });
    expect(missingPilotestClasses(all, p)).toEqual(['cubes', 'english']);
  });
});
