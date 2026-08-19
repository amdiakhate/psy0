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
  /**
   * Arrêt sur image après une réponse : la question reste à l'écran avec sa
   * correction jusqu'à ce qu'on enchaîne.
   *
   * Sans lui, l'item suivant est généré aussitôt et le verdict ne fait que
   * survoler la NOUVELLE question — on n'a jamais le temps de voir la solution
   * de celle qu'on vient de rater. C'est ce que fait Pilotest avec sa case
   * « Afficher les corrections ».
   *
   * Par défaut sur les seules erreurs : sur une bonne réponse on connaît déjà
   * la solution, et s'arrêter à chaque item ajoute un geste pour rien.
   * Jamais en simulation, quel que soit ce réglage.
   */
  pauseAfterAnswer: 'toujours' | 'erreurs' | 'jamais';
  /**
   * Astuces à la volée pendant l'entraînement (touche H). Désactivées en
   * simulation : au test personne ne t'en donne, et s'y habituer fausserait la
   * répétition — comme pour la correction visuelle.
   */
  hintsEnabled: boolean;
  /**
   * Imposer la limite officielle par question. Actif par défaut : c'est la
   * contrainte du test, et s'entraîner sans elle donne un niveau qu'on ne
   * retrouvera pas le jour J. Désactivable pour travailler une méthode au
   * calme — un dépassement de chrono en phase d'apprentissage n'apprend rien.
   */
  itemTimeLimit: boolean;
  /** Bascules de mise au point, à retirer avant le test. */
  dev: { fastHalfway: boolean };
}

const DEFAULT_PREFS: Prefs = {
  priorities: null,
  pilotestClass: {},
  phase1ReviewAt: null,
  pauseAfterAnswer: 'erreurs',
  hintsEnabled: true,
  itemTimeLimit: true,
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
