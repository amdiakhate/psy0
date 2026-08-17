export type CalcKind = 'add' | 'sub' | 'sub-carry' | 'mul' | 'div' | 'percent' | 'fraction' | 'chain';

/** Pool d'opérations par niveau (tirage uniforme). */
export const LEVELS: CalcKind[][] = [
  ['add', 'add', 'sub'],
  ['add', 'sub-carry', 'mul'],
  ['mul', 'div', 'sub-carry', 'chain'],
  ['percent', 'fraction', 'chain', 'div', 'mul'],
  ['percent', 'fraction', 'chain', 'mul', 'sub-carry', 'div'],
];

/** Une grille contient 9 calculs, dont 0 à 4 faux (règle officielle). */
export const GRID_SIZE = 9;
export const MAX_WRONG = 4;
