export type NumericRuleType =
  | 'arith'
  | 'arith-neg'
  | 'geo'
  | 'second-order'
  | 'alternate'
  | 'two-rules'
  | 'squares'
  | 'cubes'
  | 'fibo'
  | 'mul-add'
  /** Chaque terme est un PALINDROME. Aucune loi entre les termes — elle est dans le terme. */
  | 'palindrome';

export const ALL_NUMERIC_RULES: NumericRuleType[] = [
  'arith',
  'arith-neg',
  'geo',
  'second-order',
  'alternate',
  'two-rules',
  'squares',
  'cubes',
  'fibo',
  'mul-add',
  'palindrome',
];

/** Pool de règles numériques par niveau. */
export const NUMERIC_RULES: NumericRuleType[][] = [
  ['arith'],
  ['geo', 'arith-neg'],
  ['second-order', 'alternate'],
  ['two-rules', 'second-order', 'alternate', 'palindrome'],
  ['squares', 'cubes', 'fibo', 'mul-add', 'two-rules', 'palindrome'],
];

export type LetterRuleType =
  | 'letter-step'
  | 'letter-alternate'
  | 'letter-interleaved'
  /** Groupes de 2 lettres, une loi PAR COLONNE : « ZT - GK - NB - US ». */
  | 'pair-columns'
  /**
   * Groupes de 2 lettres où la loi est INTERNE au groupe : la seconde se déduit
   * de la première, et les premières ne suivent aucune progression.
   * « RK - BU - OH - ZS - FY » — chercher un pas entre les termes n'y mène nulle part.
   */
  | 'pair-internal';

export const ALL_LETTER_RULES: LetterRuleType[] = [
  'letter-step',
  'letter-alternate',
  'letter-interleaved',
  'pair-columns',
  'pair-internal',
];

/**
 * Pool de règles alphabétiques par niveau. L'exemple officiel Pilotest est un
 * 'letter-step' de +7 crans (« … N … U »).
 */
export const LETTER_RULES: LetterRuleType[][] = [
  ['letter-step'],
  ['letter-step', 'pair-columns'],
  ['letter-step', 'letter-alternate', 'pair-columns'],
  ['letter-alternate', 'letter-interleaved', 'pair-columns', 'pair-internal'],
  ['letter-alternate', 'letter-interleaved', 'pair-columns', 'pair-internal'],
];

/** Nombre d'attributs qui varient dans la série figurale, par niveau. */
export const FIGURAL_ATTR_COUNT: number[] = [1, 1, 2, 2, 3];

/** Les trois formats de série, tels qu'ils apparaissent au test. */
export const FORMATS = ['numeric', 'letters', 'figural'] as const;
export type SeriesFormat = (typeof FORMATS)[number];

/** Le test présente des séries de 4 OU 5 items — jamais un nombre fixe. */
export const SERIES_LENGTHS = [4, 5] as const;

/** Barème officiel : bonne réponse +1, mauvaise −1/3, abstention 0. */
export const PENALTY = 1 / 3;
