import { mulberry32, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { WORDS7, wordsWithLetterAt } from './data';
import { INTERSECTIONS, SLOT_COUNT, WORD_LENGTH, sharedIndexesOf } from './geometry';
import { LEVELS } from './config';
import type { DecoyMode } from './config';

export interface StarQuestion {
  /** Les 9 mots proposés : les 6 d'une solution + 3 distracteurs, ordre mélangé. */
  words: string[];
  /**
   * Solution de RÉFÉRENCE : pour chaque emplacement 0-5, l'index du mot dans
   * `words`. Sert d'affichage de correction ; la validation, elle, accepte
   * toute configuration cohérente (règle officielle).
   */
  solution: number[];
}

/** Pour chaque emplacement 0-5, l'index du mot posé dans `words` (null = vide). */
export type StarAnswer = (number | null)[];

/* ------------------------------------------------------------------ */
/* Recherche d'une solution (backtracking indexé)                      */
/* ------------------------------------------------------------------ */

/**
 * Ordre de remplissage choisi pour que chaque emplacement soit contraint par
 * ceux déjà posés : 0 libre, puis 3, 2, 5, 1 (une contrainte chacun), puis 4
 * (deux contraintes — il ferme le cycle). Un ordre naïf 0,1,2,… laisserait des
 * emplacements sans aucune contrainte et ferait exploser la recherche.
 */
const SEARCH_ORDER = [0, 3, 2, 5, 1, 4] as const;

interface Constraint {
  /** Indice de la lettre dans le mot candidat. */
  selfIndex: number;
  /** Emplacement déjà rempli qui impose la lettre. */
  otherSlot: number;
  /** Indice de la lettre dans le mot déjà posé. */
  otherIndex: number;
}

/** Contraintes de chaque étape de SEARCH_ORDER vis-à-vis des étapes précédentes. */
const CONSTRAINTS: Constraint[][] = (() => {
  // Clés en `number` : les emplacements d'INTERSECTIONS ne sont pas typés
  // comme littéraux, contrairement à ceux de SEARCH_ORDER (`as const`).
  const rank = new Map<number, number>(SEARCH_ORDER.map((slot, i) => [slot, i]));
  const out: Constraint[][] = SEARCH_ORDER.map(() => []);
  for (const x of INTERSECTIONS) {
    const ra = rank.get(x.wordA)!;
    const rb = rank.get(x.wordB)!;
    if (ra < rb) out[rb].push({ selfIndex: x.indexB, otherSlot: x.wordA, otherIndex: x.indexA });
    else out[ra].push({ selfIndex: x.indexA, otherSlot: x.wordB, otherIndex: x.indexB });
  }
  return out;
})();

/** Budget de nœuds par tentative : au-delà, on repart d'un autre premier mot. */
const NODE_BUDGET = 4000;
const MAX_ATTEMPTS = 80;

function searchFrom(rng: Rng, firstWord: string): string[] | null {
  const assigned: (string | null)[] = new Array(SLOT_COUNT).fill(null);
  let nodes = 0;

  const recurse = (step: number): boolean => {
    if (step === SLOT_COUNT) return true;
    const slot = SEARCH_ORDER[step];

    let candidates: readonly string[];
    if (step === 0) {
      candidates = [firstWord];
    } else {
      // Intersection des listes indexées (position, lettre) — la plus courte d'abord.
      const lists = CONSTRAINTS[step]
        .map((c) => wordsWithLetterAt(c.selfIndex, assigned[c.otherSlot]![c.otherIndex]))
        .sort((a, b) => a.length - b.length);
      let pool: readonly string[] = lists[0];
      for (let i = 1; i < lists.length; i++) {
        const other = new Set(lists[i]);
        pool = pool.filter((w) => other.has(w));
      }
      candidates = shuffle(rng, pool);
    }

    for (const word of candidates) {
      if (++nodes > NODE_BUDGET) return false;
      if (assigned.includes(word)) continue;
      assigned[slot] = word;
      if (recurse(step + 1)) return true;
      assigned[slot] = null;
    }
    return false;
  };

  return recurse(0) ? (assigned as string[]) : null;
}

/**
 * Une solution complète : 6 mots distincts satisfaisant TOUTES les intersections.
 * On essaie des premiers mots successifs (ordre mélangé déterministe) jusqu'à
 * ce que l'un d'eux mène à une solution — mesuré : 1 à 2 tentatives suffisent.
 */
export function findSolution(rng: Rng): string[] {
  const starts = shuffle(rng, WORDS7);
  for (let i = 0; i < Math.min(MAX_ATTEMPTS, starts.length); i++) {
    const found = searchFrom(rng, starts[i]);
    if (found) return found;
  }
  throw new Error('star-words : aucune configuration trouvée (dictionnaire trop pauvre)');
}

/* ------------------------------------------------------------------ */
/* Distracteurs                                                        */
/* ------------------------------------------------------------------ */

/** Les positions réellement contraintes d'un emplacement (2 et 4). */
const SHARED_INDEXES = sharedIndexesOf(0);

/**
 * Combien de lettres contraintes un mot reproduit-il, tous emplacements
 * confondus ? 0 = distracteur éliminable à vue ; élevé = distracteur tentant,
 * qui semble s'emboîter avant de se révéler faux.
 */
export function decoyScore(word: string, solution: readonly string[]): number {
  let score = 0;
  for (const target of solution) {
    for (const idx of SHARED_INDEXES) {
      if (word[idx] === target[idx]) score++;
    }
  }
  return score;
}

function pickDecoys(rng: Rng, solution: string[], mode: DecoyMode, targetScore: number): string[] {
  const used = new Set(solution);
  const scored = WORDS7.filter((w) => !used.has(w)).map((w) => ({
    word: w,
    score: decoyScore(w, solution),
  }));

  if (mode === 'easy-decoys') {
    const pool = scored.filter((s) => s.score <= targetScore);
    return shuffle(rng, pool.length >= 3 ? pool : scored).slice(0, 3).map((s) => s.word);
  }

  // Difficile : on garde les mots les plus « accrocheurs », puis on en tire 3.
  const sorted = [...scored].sort((a, b) => b.score - a.score || (a.word < b.word ? -1 : 1));
  const qualified = sorted.filter((s) => s.score >= targetScore);
  const pool = qualified.length >= 3 ? qualified.slice(0, Math.max(12, 3)) : sorted.slice(0, 12);
  return shuffle(rng, pool).slice(0, 3).map((s) => s.word);
}

/* ------------------------------------------------------------------ */
/* Item                                                                */
/* ------------------------------------------------------------------ */

function levelConfig(level: number, forceTag?: string) {
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];
  if (forceTag === 'easy-decoys') return { mode: 'easy-decoys' as DecoyMode, targetScore: 0 };
  if (forceTag === 'hard-decoys') return { mode: 'hard-decoys' as DecoyMode, targetScore: 3 };
  return cfg;
}

export function generate(seed: number, level: number, forceTag?: string): Item<StarQuestion> {
  const rng = mulberry32(seed);
  const { mode, targetScore } = levelConfig(level, forceTag);

  const solution = findSolution(rng);
  const decoys = pickDecoys(rng, solution, mode, targetScore);
  const words = shuffle(rng, [...solution, ...decoys]);

  return {
    question: {
      words,
      solution: solution.map((w) => words.indexOf(w)),
    },
    seed,
    level,
    tags: [`len-${WORD_LENGTH}`, mode],
  };
}
