export type SymbolFamily = 'letters' | 'shapes';

export interface CubesLevel {
  /** Nombre de faces manquantes à replacer. Il y a EXACTEMENT autant de pièces. */
  holes: number;
  /** Famille de symboles. Les formes sont invariantes par quart de tour : leur orientation ne compte pas. */
  family: SymbolFamily;
}

/**
 * Règle officielle : « Un patron de cube déplié est donné sur la gauche. Un autre
 * patron dont certaines faces manquent est donné à droite. Vous devez glisser-déposer
 * les formes données en dessous de façon à reconstituer le cube de gauche. »
 * 10 questions, 60 s chacune.
 *
 * L'écran de jeu précise l'interaction, et c'est lui qui fait foi : « Cliquez sur
 * une pièce pour la faire TOURNER D'UN QUART DE TOUR ». Les pièces sont donc
 * proposées à l'endroit et c'est au candidat de produire l'orientation — il n'y a
 * pas de retournement en miroir, et il n'y a pas de pièce leurre : le nombre de
 * pièces égale le nombre de trous, ce qui autorise le raisonnement par élimination.
 */
export const LEVELS: CubesLevel[] = [
  { holes: 2, family: 'shapes' },
  { holes: 3, family: 'shapes' },
  { holes: 3, family: 'letters' },
  { holes: 4, family: 'letters' },
  { holes: 4, family: 'letters' },
];
