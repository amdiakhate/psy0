/**
 * Score du Psychomoteur et projection sur la stanine officielle.
 *
 * Les trois tâches comptent AUTANT l'une que l'autre — c'est la règle : « trois
 * tâches de même importance ». Le score global est donc la moyenne simple des
 * trois taux de réussite, et non une somme d'événements où la poursuite,
 * mesurée en continu, écraserait les deux autres.
 */

export interface PsyTally {
  /** Millisecondes pendant lesquelles la bonne flèche était maintenue. */
  trackedMs: number;
  /** Millisecondes de poursuite au total. */
  totalMs: number;
  /** Formes identiques signalées / à signaler, et signalements en trop. */
  shapeHits: number;
  shapeTargets: number;
  shapeFalse: number;
  /** Calculs faux signalés / à signaler, et signalements en trop. */
  calcHits: number;
  calcTargets: number;
  calcFalse: number;
}

export interface PsyScore {
  /** Taux par tâche, entre 0 et 1. */
  tracking: number;
  shapes: number;
  calcs: number;
  /** Moyenne des trois, en pourcentage entier. */
  percent: number;
  /** Classe stanine officielle (1-9). */
  stanine: number;
}

/**
 * Une tâche sans aucune cible ne peut pas être ratée : elle vaut 1, sinon une
 * séance sans forme identique pénaliserait à tort.
 * Les faux positifs sont retranchés des réussites : appuyer partout ne doit
 * jamais payer.
 */
function rate(hits: number, targets: number, falsePositives: number): number {
  if (targets === 0) return falsePositives === 0 ? 1 : 0;
  return clamp01((hits - falsePositives) / targets);
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/**
 * Barème officiel, volontairement ÉCRASÉ vers le haut : 57 % vaut déjà 2, et
 * il faut 96 % pour atteindre 9. Quatre points séparent la classe 5 de la
 * classe 9 — d'où l'affichage du pourcentage à côté de la classe, la classe
 * seule masquant des écarts décisifs.
 */
const STANINE_FLOORS: Array<[number, number]> = [
  [96, 9],
  [95, 8],
  [93, 7],
  [90, 6],
  [85, 5],
  [79, 4],
  [69, 3],
  [57, 2],
];

export function stanineOf(percent: number): number {
  for (const [floor, stanine] of STANINE_FLOORS) {
    if (percent >= floor) return stanine;
  }
  return 1;
}

export function scoreOf(t: PsyTally): PsyScore {
  const tracking = t.totalMs > 0 ? clamp01(t.trackedMs / t.totalMs) : 1;
  const shapes = rate(t.shapeHits, t.shapeTargets, t.shapeFalse);
  const calcs = rate(t.calcHits, t.calcTargets, t.calcFalse);
  const percent = Math.round(((tracking + shapes + calcs) / 3) * 100);
  return { tracking, shapes, calcs, percent, stanine: stanineOf(percent) };
}
