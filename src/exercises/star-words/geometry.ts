/**
 * Géométrie de l'étoile — le modèle pur, testable sans React.
 *
 * L'étoile de David = deux triangles superposés, donc SIX segments (les 6 côtés
 * des deux triangles). Chaque segment porte 7 cases : un mot de 7 lettres.
 *
 * Triangle « pointe en haut »  : sommets T (haut), BL (bas-gauche), BR (bas-droite)
 *   - emplacement 0 : T  → BR
 *   - emplacement 1 : BR → BL
 *   - emplacement 2 : BL → T
 * Triangle « pointe en bas »   : sommets B (bas), TL (haut-gauche), TR (haut-droite)
 *   - emplacement 3 : TL → TR
 *   - emplacement 4 : TR → B
 *   - emplacement 5 : B  → TL
 *
 * Les deux triangles se croisent en 6 points : les sommets de l'hexagone
 * intérieur. Sur un segment, ces croisements tombent au tiers et aux deux tiers,
 * c'est-à-dire exactement sur les cases d'indice 2 et 4 (7 cases régulièrement
 * espacées, indices 0..6). Chaque segment croise donc DEUX segments de l'autre
 * triangle, et chaque paire de segments adjacents partage exactement UNE case :
 * 6 cases communes au total, formant le cycle 0-3-2-5-1-4-0.
 *
 * Les 6 pointes extérieures (T, BR, BL, TL, TR, B) ne sont PAS des cases
 * communes : les deux mots qui s'y rejoignent y ont chacun leur propre case
 * (dessinées côte à côte dans le rendu). C'est ce qui rend le problème soluble :
 * partager aussi les pointes imposerait 12 contraintes, et aucune configuration
 * de 6 mots français de 7 lettres ne les satisfait (vérifié empiriquement).
 */

/** Nombre d'emplacements de mots dans l'étoile. */
export const SLOT_COUNT = 6;

/** Longueur imposée des mots (7 cases par segment). */
export const WORD_LENGTH = 7;

/** Étiquettes clavier des emplacements (touches A-F). */
export const SLOT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

/** Une case commune à deux mots : elle ne doit porter QU'UNE seule lettre. */
export interface Intersection {
  wordA: number;
  indexA: number;
  wordB: number;
  indexB: number;
}

/**
 * Les 6 cases communes, dans l'ordre du cycle des segments.
 * Lecture : « la case n°2 du mot placé en 0 est la même que la case n°4 du mot placé en 3 ».
 */
export const INTERSECTIONS: readonly Intersection[] = [
  { wordA: 0, indexA: 2, wordB: 3, indexB: 4 },
  { wordA: 0, indexA: 4, wordB: 4, indexB: 2 },
  { wordA: 1, indexA: 2, wordB: 4, indexB: 4 },
  { wordA: 1, indexA: 4, wordB: 5, indexB: 2 },
  { wordA: 2, indexA: 2, wordB: 5, indexB: 4 },
  { wordA: 2, indexA: 4, wordB: 3, indexB: 2 },
];

/** Placement : pour chaque emplacement 0-5, le mot posé (ou null si vide). */
export type Placement = readonly (string | null)[];

/**
 * Les intersections en conflit : les deux mots sont posés et imposent à la même
 * case deux lettres différentes. Une intersection dont un côté est vide n'est
 * pas (encore) un conflit.
 */
export function conflictingIntersections(placement: Placement): number[] {
  const out: number[] = [];
  INTERSECTIONS.forEach((x, i) => {
    const a = placement[x.wordA];
    const b = placement[x.wordB];
    if (a && b && a[x.indexA] !== b[x.indexB]) out.push(i);
  });
  return out;
}

/**
 * Une configuration est correcte si les 6 emplacements portent 6 mots DISTINCTS
 * et que CHAQUE intersection est cohérente. On ne compare jamais à une solution
 * mémorisée : la règle officielle accepte explicitement toute autre solution.
 */
export function isPlacementCorrect(placement: Placement): boolean {
  const words = placement.filter((w): w is string => w !== null);
  if (words.length !== SLOT_COUNT) return false;
  if (new Set(words).size !== SLOT_COUNT) return false;
  if (words.some((w) => w.length !== WORD_LENGTH)) return false;
  return conflictingIntersections(placement).length === 0;
}

/** Les indices de cases partagées d'un emplacement (toujours 2 et 4). */
export function sharedIndexesOf(slot: number): number[] {
  const out: number[] = [];
  for (const x of INTERSECTIONS) {
    if (x.wordA === slot) out.push(x.indexA);
    if (x.wordB === slot) out.push(x.indexB);
  }
  return out.sort((a, b) => a - b);
}

/** L'emplacement voisin qui partage une case, et les indices concernés. */
export interface Neighbour {
  slot: number;
  /** Indice de la case dans le mot de l'emplacement interrogé. */
  selfIndex: number;
  /** Indice de la même case dans le mot du voisin. */
  otherIndex: number;
}

export function neighboursOf(slot: number): Neighbour[] {
  const out: Neighbour[] = [];
  for (const x of INTERSECTIONS) {
    if (x.wordA === slot) out.push({ slot: x.wordB, selfIndex: x.indexA, otherIndex: x.indexB });
    if (x.wordB === slot) out.push({ slot: x.wordA, selfIndex: x.indexB, otherIndex: x.indexA });
  }
  return out;
}
