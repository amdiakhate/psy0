/**
 * Le barème d'Airways.
 *
 * Trois faits à ne pas mélanger. Un accident coûte très cher — c'est l'échec de
 * la série. Une voie fermée coûte peu, mais coûte : l'objectif est zéro
 * accident AVEC le minimum de déroutements, pas zéro accident à tout prix.
 * Et le bouton global coûte cinq points, soit moins que six fermetures et plus
 * que quatre : il n'est rentable que quand la situation est déjà perdue de
 * partout. C'est tout le dilemme du test.
 */

/** Une ligne fermée à la main. */
export const CLOSE_COST = 1;
/** Le bouton global d'un groupe — référence candidats : ~5 points par usage. */
export const GLOBAL_COST = 5;
/** L'accident. Il ne se rattrape pas dans la série. */
export const ACCIDENT_COST = 50;

export interface SeriesOutcome {
  /** Voies fermées une par une (le global n'est pas compté ici). */
  closures: number;
  /** Nombre d'appuis sur un bouton global. */
  globals: number;
  accident: boolean;
}

/** Score d'une série, sur 100. Un accident plus quelques fermetures peut tomber à zéro. */
export function seriesScore({ closures, globals, accident }: SeriesOutcome): number {
  const raw =
    100 - closures * CLOSE_COST - globals * GLOBAL_COST - (accident ? ACCIDENT_COST : 0);
  return Math.max(0, Math.min(100, raw));
}

/** Pourcentage de réussite d'une passation : la moyenne de ses séries. */
export function passationPercent(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

/**
 * Table stanine officielle. Lue comme un seuil ATTEINT : 90 % donne la classe 7,
 * 89 % la classe 6.
 *
 * Conséquence assumée, et voulue : la classe 9 exige 100 %, donc une passation
 * sans le moindre déroutement. Le générateur produit des séries où l'inaction
 * mène à un dépassement certain — il y a donc toujours quelque chose à fermer,
 * et le 9 reste hors d'atteinte. C'est le comportement du test, où la note
 * parfaite n'est pas un objectif réaliste.
 */
export const STANINE_THRESHOLDS: Array<{ percent: number; stanine: number }> = [
  { percent: 100, stanine: 9 },
  { percent: 95, stanine: 8 },
  { percent: 90, stanine: 7 },
  { percent: 80, stanine: 6 },
  { percent: 65, stanine: 5 },
  { percent: 50, stanine: 4 },
  { percent: 35, stanine: 3 },
  { percent: 25, stanine: 2 },
];

export function stanineFor(percent: number): number {
  for (const { percent: threshold, stanine } of STANINE_THRESHOLDS) {
    if (percent >= threshold) return stanine;
  }
  return 1;
}

/**
 * Le meilleur score atteignable sur une passation : chaque série jouée
 * parfaitement, c'est-à-dire en ne fermant que les voies réellement forcées.
 * Sert à vérifier — par un test — que le 100 % reste hors de portée.
 */
export function bestPossiblePercent(pars: number[]): number {
  return passationPercent(pars.map((par) => seriesScore({ closures: par, globals: 0, accident: false })));
}
