import type { ExerciseId } from './types';
import { loadJson, saveJson } from './storage';

/** Date (dayKey Paris) jusqu'à laquelle les priorités restent verrouillées. */
export const PRIORITIES_LOCKED_UNTIL = '2026-08-25';

export interface Prefs {
  /** P1/P2/P3 (rotation stricte de la session du matin). */
  priorities: [ExerciseId, ExerciseId, ExerciseId] | null;
  /** Classe Pilotest actuelle par exercice (1-9), null = pas encore mesurée. */
  pilotestClass: Partial<Record<ExerciseId, number | null>>;
  /**
   * Horodatage de validation du Bilan Phase 1. Non nul = le bilan est fait,
   * l'écran disparaît de l'accueil et les priorités sont verrouillées.
   */
  phase1ReviewAt: number | null;
  /** Bascules de mise au point, à retirer avant le test. */
  dev: { fastHalfway: boolean };
}

const DEFAULT_PREFS: Prefs = {
  priorities: null,
  pilotestClass: {},
  phase1ReviewAt: null,
  dev: { fastHalfway: false },
};

export function getPrefs(): Prefs {
  const stored = loadJson<Partial<Prefs>>('prefs', {});
  // `dev` est fusionné à part : un objet partiel venant d'un ancien export
  // écraserait sinon les bascules absentes par `undefined`.
  return { ...DEFAULT_PREFS, ...stored, dev: { ...DEFAULT_PREFS.dev, ...stored.dev } };
}

export function savePrefs(prefs: Prefs): void {
  saveJson('prefs', prefs);
}

/** Exercices dont la classe Pilotest n'a pas été saisie. */
export function missingPilotestClasses(all: ExerciseId[], prefs = getPrefs()): ExerciseId[] {
  return all.filter((id) => {
    const value = prefs.pilotestClass[id];
    return value === null || value === undefined;
  });
}

/**
 * Les priorités sont figées du bilan jusqu'au 25/08 : changer de cible tous les
 * deux jours, c'est n'en travailler aucune. Passé cette date, elles restent
 * modifiables — avec confirmation.
 */
export function arePrioritiesLocked(dayKey: string, prefs = getPrefs()): boolean {
  return prefs.phase1ReviewAt !== null && dayKey < PRIORITIES_LOCKED_UNTIL;
}
