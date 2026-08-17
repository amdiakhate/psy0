import { mulberry32, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { BANK, THEMES, areIncompatible } from './data';
import type { Theme } from './data';
import { DISTANT_GAP, LEVELS } from './config';
import type { WordStep } from './model';

export interface WordBoxesQuestion {
  /** Nombre de boîtes (= nombre de champs lexicaux de la série). */
  boxCount: number;
  /** Les champs lexicaux de la série, deux à deux compatibles. */
  themes: Theme[];
  /** La série : les mots dans leur ordre d'apparition. */
  steps: WordStep[];
  /** Durée d'affichage du mot, puis délai de réponse. */
  wordMs: number;
  answerMs: number;
}

/** Index de la boîte choisie (l'évaluation réelle passe par `applyChoice`). */
export type WordBoxesAnswer = number;

/**
 * Choisit `count` thèmes deux à deux compatibles.
 * Passage glouton sur la liste mélangée : le résultat est un ensemble INDÉPENDANT
 * MAXIMAL du graphe d'incompatibilité. Ce graphe a 17 sommets, dont 3 isolés, et un
 * degré maximal de 3 → tout ensemble maximal contient au moins 3 + ⌈14/4⌉ = 7 thèmes.
 * Six boîtes sont donc toujours atteignables (vérifié par les tests sur tous les seeds).
 */
function pickThemes(rng: Rng, count: number): Theme[] {
  const chosen: Theme[] = [];
  for (const theme of shuffle(rng, THEMES)) {
    if (chosen.every((c) => !areIncompatible(c, theme))) chosen.push(theme);
  }
  return chosen.slice(0, count);
}

/**
 * Construit la série : à chaque position, on tire un thème parmi ceux qui ont encore
 * des mots ET qui ne sont pas apparus depuis `minGap` mots (contrainte relâchée si
 * elle ne laisse aucun candidat). Le tirage est pondéré par le nombre de mots restants,
 * ce qui évite qu'un thème soit relégué en bloc à la fin de la série.
 */
function buildSteps(
  rng: Rng,
  themes: Theme[],
  wordsPerTheme: number,
  minGap: number,
  boxCount: number,
): WordStep[] {
  const pool = new Map<Theme, string[]>(
    themes.map((t) => [t, shuffle(rng, BANK[t]).slice(0, wordsPerTheme)]),
  );
  const lastPos = new Map<Theme, number>(themes.map((t) => [t, -1]));
  const total = themes.length * wordsPerTheme;
  const steps: WordStep[] = [];

  for (let pos = 0; pos < total; pos++) {
    const available = themes.filter((t) => pool.get(t)!.length > 0);
    const spaced = available.filter((t) => {
      const last = lastPos.get(t)!;
      return last === -1 || pos - last >= minGap;
    });
    const candidates = spaced.length > 0 ? spaced : available;

    const weights = candidates.map((t) => pool.get(t)!.length);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let ticket = rng() * totalWeight;
    let theme = candidates[candidates.length - 1];
    for (let i = 0; i < candidates.length; i++) {
      ticket -= weights[i];
      if (ticket < 0) {
        theme = candidates[i];
        break;
      }
    }

    const word = pool.get(theme)!.shift()!;
    const last = lastPos.get(theme)!;
    const firstOfTheme = last === -1;
    const gap = firstOfTheme ? -1 : pos - last;
    const tags = [firstOfTheme ? 'first-of-theme' : 'recall', `boxes-${boxCount}`];
    if (!firstOfTheme && gap >= DISTANT_GAP) tags.push('distant-recall');

    steps.push({ word, theme, firstOfTheme, gap, tags });
    lastPos.set(theme, pos);
  }

  return steps;
}

export function generate(seed: number, level: number, forceTag?: string): Item<WordBoxesQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];

  const forcedBoxes = /^boxes-([456])$/.exec(forceTag ?? '');
  const boxCount = forcedBoxes ? Number(forcedBoxes[1]) : cfg.boxes;
  const minGap = forceTag === 'distant-recall' ? Math.max(cfg.minGap, DISTANT_GAP) : cfg.minGap;

  const themes = pickThemes(rng, boxCount);
  const steps = buildSteps(rng, themes, cfg.wordsPerTheme, minGap, boxCount);

  return {
    question: {
      boxCount,
      themes,
      steps,
      wordMs: cfg.wordMs,
      answerMs: cfg.answerMs,
    },
    seed,
    level,
    tags: [`boxes-${boxCount}`, `words-${steps.length}`, `min-gap-${minGap}`],
  };
}

/**
 * Exercice continu : la correction se fait mot par mot dans le composant, via
 * `applyChoice` (le thème n'a de « bonne boîte » qu'une fois attribué par le joueur).
 * Ce validateur n'existe que pour l'interface commune des modules.
 */
export function validate(_item: Item<WordBoxesQuestion>, _answer: WordBoxesAnswer): boolean {
  return false;
}
