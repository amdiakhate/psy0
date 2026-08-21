import type { ExerciseId, SessionBlock, SessionPlan } from '../core/types';

/**
 * Créneaux « à faire sur Pilotest ».
 *
 * Un générateur local peut être fidèle à la MÉCANIQUE d'un test sans l'être à
 * son ÉTALONNAGE. Airways en est l'exemple : la densité d'avions et le barème
 * de déroutement ont été recalés à l'estime, jamais confrontés à l'original.
 * S'y entraîner reste utile — le geste est le bon. En tirer une classe ne l'est
 * pas, et c'est pourtant ce que fait le classement des faiblesses, qui décide
 * ensuite des priorités du matin. Une mesure fausse ne se contente pas d'être
 * inutile : elle contamine tout ce qui s'appuie dessus.
 *
 * D'où ce mécanisme. Le coach garde le créneau — le temps est réservé, la
 * structure de la séance tient, l'entrelacement ne bouge pas — mais il renvoie
 * le candidat à la source et récupère le résultat à la main. Le bloc reste dans
 * le plan ; seule sa façon de se jouer change.
 *
 * Logique PURE : le drapeau par exercice est injecté, jamais lu du storage.
 */

/**
 * Page de préparation des présélections cadets. Sert de repli quand l'exercice
 * n'a pas d'URL vérifiée : mieux vaut une page juste et générale qu'un lien
 * profond deviné, qui tomberait en 404 au moment précis où le candidat en a
 * besoin.
 */
export const PILOTEST_FALLBACK_URL =
  'https://www.pilotest.com/fr/selections/preparez-la-preselection-pilotes-cadets-air-france';

export function pilotestUrlFor(moduleUrl: string | undefined): string {
  return moduleUrl ?? PILOTEST_FALLBACK_URL;
}

/**
 * Marque les blocs dont l'exercice est déclaré non calibré.
 *
 * Ne touche NI aux durées, NI à l'ordre, NI au nombre de blocs : un créneau
 * externe occupe exactement la place qu'il occupait. C'est ce qui permet de
 * basculer le drapeau sans recomposer la séance — et ce que le test vérifie.
 */
export function markExternal(
  blocks: SessionBlock[],
  isExternal: (id: ExerciseId) => boolean,
): SessionBlock[] {
  return blocks.map((b) => (isExternal(b.exercise) ? { ...b, external: true } : b));
}

export function markExternalPlan(
  plan: SessionPlan,
  isExternal: (id: ExerciseId) => boolean,
): SessionPlan {
  return { ...plan, blocks: markExternal(plan.blocks, isExternal) };
}

/**
 * Une saisie manuelle relevée sur Pilotest à la place d'un bloc joué ici.
 *
 * `pilotestClass` est la classe stanine 1-9 lue sur le site ; `errPct` le taux
 * d'erreurs. Les deux sont déclaratifs — c'est assumé : une mesure déclarée
 * faite dans les bonnes conditions vaut mieux qu'une mesure automatique faite
 * dans les mauvaises.
 */
export interface ExternalEntry {
  exercise: ExerciseId;
  pilotestClass: number;
  errPct: number;
  note?: string;
}

export const MIN_CLASS = 1;
export const MAX_CLASS = 9;

export function isValidEntry(entry: Partial<ExternalEntry>): boolean {
  const c = entry.pilotestClass;
  const e = entry.errPct;
  return (
    typeof c === 'number' &&
    Number.isInteger(c) &&
    c >= MIN_CLASS &&
    c <= MAX_CLASS &&
    typeof e === 'number' &&
    Number.isFinite(e) &&
    e >= 0 &&
    e <= 100
  );
}
