/**
 * Garde-fou anti-clone : compare le niveau atteint DANS CETTE APP à la classe
 * Stanine relevée sur Pilotest. Un écart positif signifie que la salle de drill
 * locale flatte le niveau réel — c'est le signe qu'on s'est optimisé pour son
 * propre clone plutôt que pour le test.
 *
 * Pilotest reste la référence de calibration. Ce badge ne mesure pas un progrès,
 * il mesure un désaccord entre deux mesures.
 */

export type GapVerdict = 'surestime' | 'coherent' | 'sous-estime';

export interface PilotestGap {
  /** Niveau local projeté sur l'échelle 1-9. */
  localClass: number;
  pilotestClass: number;
  gap: number;
  verdict: GapVerdict;
}

/** Écart à partir duquel les deux mesures sont considérées en désaccord. */
export const GAP_THRESHOLD = 2;

/**
 * Projette un niveau local (1..maxLevel) sur l'échelle Stanine 1-9.
 * Niveau 1 → classe 1, niveau max → classe 9, linéairement entre les deux.
 */
export function normalizeLevel(level: number, maxLevel: number): number {
  if (maxLevel <= 1) return 5; // exercice à niveau unique : rien à projeter
  const clamped = Math.min(Math.max(level, 1), maxLevel);
  const projected = 1 + Math.round(((clamped - 1) / (maxLevel - 1)) * 8);
  return Math.min(9, Math.max(1, projected));
}

export function pilotestGap(level: number, maxLevel: number, pilotestClass: number): PilotestGap {
  const localClass = normalizeLevel(level, maxLevel);
  const gap = localClass - pilotestClass;
  return {
    localClass,
    pilotestClass,
    gap,
    verdict: gap >= GAP_THRESHOLD ? 'surestime' : gap <= -GAP_THRESHOLD ? 'sous-estime' : 'coherent',
  };
}

export const VERDICT_LABEL: Record<GapVerdict, string> = {
  surestime: 'local surestime',
  coherent: 'cohérent',
  'sous-estime': 'local sous-estime',
};

export function gapExplanation(gap: PilotestGap): string {
  switch (gap.verdict) {
    case 'surestime':
      return `Ici tu es au niveau ${gap.localClass}/9, sur Pilotest en classe ${gap.pilotestClass}. Cet écart de ${gap.gap} points veut dire que cet exercice est plus facile ici que là-bas : ta référence officielle reste Pilotest.`;
    case 'sous-estime':
      return `Ici tu es au niveau ${gap.localClass}/9, sur Pilotest en classe ${gap.pilotestClass}. La version locale est plus dure que l'originale — pas de panique sur ce chiffre, ta référence officielle reste Pilotest.`;
    case 'coherent':
      return `Niveau local ${gap.localClass}/9, classe Pilotest ${gap.pilotestClass} : les deux mesures concordent. Ta référence officielle reste Pilotest.`;
  }
}

/**
 * Niveau maximal atteint : la difficulté adaptative ne peut plus monter, donc
 * l'app ne mesure plus rien au-dessus. C'est le cas où il faut aller vérifier
 * sur Pilotest avant de sortir l'exercice des priorités.
 */
export function isAtLocalCeiling(level: number, maxLevel: number): boolean {
  return maxLevel > 0 && level >= maxLevel;
}
