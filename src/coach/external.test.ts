import { describe, expect, it } from 'vitest';
import type { ExerciseId, SessionBlock } from '../core/types';
import {
  PILOTEST_FALLBACK_URL,
  isValidEntry,
  markExternal,
  markExternalPlan,
  pilotestUrlFor,
} from './external';
import { composeMorningBlocks } from './morning-logic';
import { externalExercisesOf } from '../core/log-rows';

const plan: SessionBlock[] = [
  { exercise: 'calc-grid', level: 'adaptive', durationSec: 300, role: 'warmup' },
  { exercise: 'airways', level: 'adaptive', durationSec: 480, role: 'priority' },
  { exercise: 'cubes', level: 'adaptive', durationSec: 480, role: 'rotation' },
  { exercise: 'airways', level: 'adaptive', durationSec: 480, role: 'priority' },
];

const isAirways = (id: ExerciseId) => id === 'airways';

describe('créneaux externes', () => {
  it('marque uniquement les exercices déclarés non calibrés', () => {
    const out = markExternal(plan, isAirways);
    expect(out.map((b) => b.external === true)).toEqual([false, true, false, true]);
  });

  /**
   * Le point entier du mécanisme : basculer le drapeau ne doit RIEN changer à
   * la séance sinon la façon de jouer le créneau. Si la durée ou l'ordre
   * bougeaient, activer le drapeau recomposerait la matinée en douce.
   */
  it('ne touche ni aux durées, ni à l’ordre, ni au nombre de blocs', () => {
    const out = markExternal(plan, isAirways);
    expect(out).toHaveLength(plan.length);
    expect(out.map((b) => b.exercise)).toEqual(plan.map((b) => b.exercise));
    expect(out.map((b) => b.durationSec)).toEqual(plan.map((b) => b.durationSec));
    expect(out.map((b) => b.role)).toEqual(plan.map((b) => b.role));
    // Somme conservée : la séance dure toujours ce qu'elle annonce.
    const total = (bs: SessionBlock[]) => bs.reduce((s, b) => s + (b.durationSec ?? 0), 0);
    expect(total(out)).toBe(total(plan));
  });

  it('laisse le plan intact quand aucun exercice n’est marqué', () => {
    const out = markExternal(plan, () => false);
    expect(out.some((b) => b.external)).toBe(false);
  });

  it('marque un plan complet sans perdre son briefing ni son meta', () => {
    const out = markExternalPlan(
      { mode: 'guided60', blocks: plan, briefing: ['a'], meta: { daily: 'morning' } },
      isAirways,
    );
    expect(out.briefing).toEqual(['a']);
    expect(out.meta).toEqual({ daily: 'morning' });
    expect(out.blocks.filter((b) => b.external)).toHaveLength(2);
  });

  /** Une vraie séance du matin, pour vérifier sur autre chose qu'un plan à la main. */
  it('survit à une séance du matin réelle', () => {
    const blocks = composeMorningBlocks({
      durationMin: 60,
      warmup: 'calc-grid',
      priorities: [{ exercise: 'airways', weakTag: null }],
      rotationMembers: ['cubes', 'stacking'],
      hasPsycho: true,
    });
    const out = markExternal(blocks, isAirways);
    const externalSec = out
      .filter((b) => b.external)
      .reduce((s, b) => s + (b.durationSec ?? 0), 0);
    const airwaysSec = blocks
      .filter((b) => b.exercise === 'airways')
      .reduce((s, b) => s + (b.durationSec ?? 0), 0);
    expect(externalSec).toBe(airwaysSec);
    expect(externalSec).toBeGreaterThan(0);
    expect(externalExercisesOf(out)).toEqual(['airways']);
  });
});

describe('lien Pilotest', () => {
  it('utilise l’URL vérifiée du test quand elle existe', () => {
    expect(pilotestUrlFor('https://www.pilotest.com/fr/tests/airways')).toBe(
      'https://www.pilotest.com/fr/tests/airways',
    );
  });

  /** Un lien profond deviné tomberait en 404 juste au moment où on en a besoin. */
  it('retombe sur la page cadets quand aucune URL n’est vérifiée', () => {
    expect(pilotestUrlFor(undefined)).toBe(PILOTEST_FALLBACK_URL);
  });
});

describe('validation de la saisie manuelle', () => {
  it('accepte une classe 1-9 et un taux d’erreurs 0-100', () => {
    expect(isValidEntry({ pilotestClass: 1, errPct: 0 })).toBe(true);
    expect(isValidEntry({ pilotestClass: 9, errPct: 100 })).toBe(true);
    expect(isValidEntry({ pilotestClass: 4, errPct: 37 })).toBe(true);
  });

  it('refuse une saisie incomplète ou hors bornes', () => {
    expect(isValidEntry({})).toBe(false);
    expect(isValidEntry({ pilotestClass: 4 })).toBe(false);
    expect(isValidEntry({ errPct: 20 })).toBe(false);
    expect(isValidEntry({ pilotestClass: 0, errPct: 20 })).toBe(false);
    expect(isValidEntry({ pilotestClass: 10, errPct: 20 })).toBe(false);
    expect(isValidEntry({ pilotestClass: 4.5, errPct: 20 })).toBe(false);
    expect(isValidEntry({ pilotestClass: 4, errPct: -1 })).toBe(false);
    expect(isValidEntry({ pilotestClass: 4, errPct: 101 })).toBe(false);
    expect(isValidEntry({ pilotestClass: 4, errPct: Number.NaN })).toBe(false);
  });
});
