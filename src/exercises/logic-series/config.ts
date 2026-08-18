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
  | 'palindrome'
  /** « 67212 = 6/72/12 car 6×12 = 72 » : le terme est a, a×b et b collés. Loi interne. */
  | 'concat-product';

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
  'concat-product',
];

/** Pool de règles numériques par niveau. */
export const NUMERIC_RULES: NumericRuleType[][] = [
  ['arith'],
  ['geo', 'arith-neg'],
  ['second-order', 'alternate'],
  ['two-rules', 'second-order', 'alternate', 'palindrome'],
  ['squares', 'cubes', 'fibo', 'mul-add', 'palindrome', 'concat-product'],
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
  | 'pair-internal'
  /** « U21 - C3 - S19 - A1 » : une lettre suivie de SON rang. Loi interne, lettres arbitraires. */
  | 'letter-rank'
  /** « F2 - M3 - A4 - M5 » : initiale du mois et son numéro. La loi est une connaissance, pas un calcul. */
  | 'calendar';

export const ALL_LETTER_RULES: LetterRuleType[] = [
  'letter-step',
  'letter-alternate',
  'letter-interleaved',
  'pair-columns',
  'pair-internal',
  'letter-rank',
  'calendar',
];

/**
 * Pool de règles alphabétiques par niveau. L'exemple officiel Pilotest est un
 * 'letter-step' de +7 crans (« … N … U »).
 */
export const LETTER_RULES: LetterRuleType[][] = [
  ['letter-step'],
  ['letter-step', 'pair-columns'],
  ['letter-step', 'letter-alternate', 'pair-columns', 'calendar'],
  ['letter-alternate', 'letter-interleaved', 'pair-columns', 'pair-internal', 'calendar'],
  ['letter-alternate', 'letter-interleaved', 'pair-columns', 'pair-internal', 'letter-rank', 'calendar'],
];

/** Nombre d'attributs qui varient dans la série figurale, par niveau. */
export const FIGURAL_ATTR_COUNT: number[] = [1, 1, 2, 2, 3];

/** Les trois formats de série, tels qu'ils apparaissent au test. */
export const FORMATS = ['numeric', 'letters', 'figural', 'words', 'riddle'] as const;

/**
 * Règles des séries de MOTS. La propriété est commune à tous les termes et ne
 * relie pas les termes entre eux — c'est encore une loi « dans le terme ».
 */
export const WORD_RULES = ['same-length', 'same-initial', 'same-final'] as const;
export type WordRuleType = (typeof WORD_RULES)[number];

/**
 * Règles des énigmes sur les prénoms. Seule `first-last-concat` a été relevée
 * chez Pilotest (« Emma a 51 ans » : E=5, A=1). Les deux autres sont du même
 * genre — un nombre déduit des lettres — et évitent qu'une seule relation,
 * apprise en trois questions, rende l'exercice sans objet.
 */
export const RIDDLE_RULES = ['first-last-concat', 'first-last-sum', 'length-first'] as const;
export type RiddleRuleType = (typeof RIDDLE_RULES)[number];
export type SeriesFormat = (typeof FORMATS)[number];

/** Le test présente des séries de 4 OU 5 items — jamais un nombre fixe. */
export const SERIES_LENGTHS = [4, 5] as const;

/** Barème officiel : bonne réponse +1, mauvaise −1/3, abstention 0. */
export const PENALTY = 1 / 3;
