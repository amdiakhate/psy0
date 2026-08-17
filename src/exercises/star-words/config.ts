/**
 * Difficulté : elle ne tient qu'aux 3 distracteurs ajoutés aux 6 mots de la
 * solution. Plus un distracteur partage de lettres AUX POSITIONS CONTRAINTES
 * (indices 2 et 4, les seules cases communes), plus il est tentant.
 */
export type DecoyMode = 'easy-decoys' | 'hard-decoys';

export interface StarLevel {
  mode: DecoyMode;
  /**
   * Score maximal toléré pour un distracteur en mode facile, score minimal visé
   * en mode difficile. Le score compte, sur les 6 emplacements, le nombre de
   * lettres contraintes que le distracteur reproduit.
   */
  targetScore: number;
}

export const LEVELS: StarLevel[] = [
  // 1-2 : distracteurs qui ne reproduisent AUCUNE lettre contrainte — éliminables à vue.
  { mode: 'easy-decoys', targetScore: 0 },
  { mode: 'easy-decoys', targetScore: 0 },
  // 3 : distracteurs qui accrochent une lettre contrainte — il faut vérifier.
  { mode: 'hard-decoys', targetScore: 1 },
  // 4-5 : distracteurs qui partagent le plus possible de lettres contraintes.
  { mode: 'hard-decoys', targetScore: 3 },
  { mode: 'hard-decoys', targetScore: 4 },
];
