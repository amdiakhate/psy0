export interface WordBoxesLevel {
  /** Nombre de boîtes affichées — et donc de champs lexicaux dans la série (4 à 6). */
  boxes: number;
  /** Mots par champ lexical dans la série. */
  wordsPerTheme: number;
  /** Écart minimal visé (en mots) entre deux mots d'un même thème : plus il est grand, plus le rappel est lointain. */
  minGap: number;
  /** Durée d'affichage du mot au centre (« un mot apparaît quelques instants »). */
  wordMs: number;
  /** Délai de réponse après la disparition du mot. */
  answerMs: number;
}

export const LEVELS: WordBoxesLevel[] = [
  { boxes: 4, wordsPerTheme: 4, minGap: 2, wordMs: 1400, answerMs: 3200 },
  { boxes: 4, wordsPerTheme: 5, minGap: 3, wordMs: 1200, answerMs: 3000 },
  { boxes: 5, wordsPerTheme: 5, minGap: 4, wordMs: 1100, answerMs: 2800 },
  { boxes: 5, wordsPerTheme: 6, minGap: 5, wordMs: 1000, answerMs: 2600 },
  { boxes: 6, wordsPerTheme: 5, minGap: 6, wordMs: 900, answerMs: 2400 },
];

/** Un rappel est « lointain » quand le thème n'est pas apparu depuis au moins 5 mots. */
export const DISTANT_GAP = 5;
