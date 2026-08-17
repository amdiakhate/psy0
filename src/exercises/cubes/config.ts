export interface CubesLevel {
  /** Nombre de faces manquantes à replacer (donc de pièces proposées). */
  holes: number;
  /** Des faces peuvent devoir être RETOURNÉES (miroir) avant d'être posées. */
  flippable: boolean;
  /** Pièces leurres en plus des pièces utiles. */
  decoys: number;
}

/**
 * Règle officielle : « Un patron de cube déplié est donné sur la gauche. Un autre
 * patron dont certaines faces manquent est donné à droite. Vous devez glisser-déposer
 * les formes données en dessous de façon à reconstituer le cube de gauche. Notez que
 * pour certaines questions, les faces peuvent être retournées. »
 * 10 questions, 60 s chacune.
 */
export const LEVELS: CubesLevel[] = [
  { holes: 2, flippable: false, decoys: 1 },
  { holes: 3, flippable: false, decoys: 1 },
  { holes: 3, flippable: true, decoys: 2 },
  { holes: 4, flippable: true, decoys: 2 },
  { holes: 4, flippable: true, decoys: 3 },
];
