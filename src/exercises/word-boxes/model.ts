/**
 * Boîtes à mots (PSY0 cadets) — règle officielle :
 * « Des boîtes vides contenant 4 à 6 cases vous sont données. Puis un mot apparaît
 *   quelques instants au centre de l'écran. Vous devez classer les mots par champs
 *   lexicaux. Chaque boîte est dédiée aux mots d'un champ lexical. Vous êtes néanmoins
 *   libre lorsque le PREMIER mot d'un champ lexical apparaît de lui attribuer la boîte
 *   de votre choix. Cliquez sur la boîte pour la sélectionner. »
 *
 * Mécanique : les boîtes démarrent VIDES et SANS ÉTIQUETTE. Le premier mot d'un thème
 * attribue librement ce thème à une boîte — ce choix est correct par définition. Tous
 * les mots suivants du même thème doivent aller dans la MÊME boîte. L'exercice teste
 * donc la mémoire associative (quelle boîte pour quel thème), pas la connaissance
 * lexicale : les mots eux-mêmes sont sans ambiguïté.
 */

export interface WordStep {
  word: string;
  theme: string;
  /** Premier mot de son thème : le joueur choisit librement une boîte encore libre. */
  firstOfTheme: boolean;
  /** Nombre de mots écoulés depuis le mot précédent du même thème (−1 si premier). */
  gap: number;
  tags: string[];
}

/** État d'une série en cours : quel thème occupe quelle boîte, et le contenu affiché. */
export interface BoxesState {
  /** thème → index de boîte. Une boîte non listée ici est encore libre. */
  assignment: Record<string, number>;
  /** Mots déjà rangés, par boîte (l'aide-mémoire visible à l'écran). */
  contents: string[][];
}

export function initialState(boxCount: number): BoxesState {
  return { assignment: {}, contents: Array.from({ length: boxCount }, () => []) };
}

export function freeBoxes(state: BoxesState, boxCount: number): number[] {
  const taken = new Set(Object.values(state.assignment));
  return Array.from({ length: boxCount }, (_, i) => i).filter((i) => !taken.has(i));
}

export interface ChoiceResult {
  state: BoxesState;
  correct: boolean;
  /** Boîte finalement dédiée au thème du mot (après résolution). */
  boxOfTheme: number;
  given: string;
  expected: string;
}

export const boxLabel = (i: number | null): string => (i === null ? '—' : `boîte ${i + 1}`);

/**
 * Applique le choix du joueur pour un mot.
 *
 * - Premier mot d'un thème : TOUTE boîte encore libre est correcte (règle officielle).
 *   Une boîte déjà dédiée à un autre thème est une erreur ; le thème est alors attribué
 *   d'office à la première boîte libre, pour que la suite de la série reste cohérente.
 * - Mot suivant : seule la boîte déjà dédiée au thème est correcte.
 * - Absence de réponse (`chosen === null`) : erreur, même résolution.
 *
 * Le mot est toujours rangé dans la boîte de son thème : les boîtes affichent le contenu
 * réel, qui sert d'aide-mémoire — comme au test.
 */
export function applyChoice(
  state: BoxesState,
  step: WordStep,
  chosen: number | null,
  boxCount: number,
): ChoiceResult {
  const assigned = state.assignment[step.theme];
  const isFirst = assigned === undefined;
  const free = freeBoxes(state, boxCount);

  let boxOfTheme: number;
  let correct: boolean;
  let expected: string;

  if (isFirst) {
    correct = chosen !== null && free.includes(chosen);
    boxOfTheme = correct ? (chosen as number) : (free[0] ?? 0);
    expected = free.length === 1 ? boxLabel(free[0]) : 'une boîte libre';
  } else {
    boxOfTheme = assigned;
    correct = chosen === assigned;
    expected = boxLabel(assigned);
  }

  const contents = state.contents.map((box, i) => (i === boxOfTheme ? [...box, step.word] : box));
  return {
    state: { assignment: { ...state.assignment, [step.theme]: boxOfTheme }, contents },
    correct,
    boxOfTheme,
    given: boxLabel(chosen),
    expected,
  };
}
