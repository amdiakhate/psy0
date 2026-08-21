import { describe, expect, it } from 'vitest';
import { generate, decoyScore } from './generator';
import type { StarAnswer } from './generator';
import { validate } from './validator';
import { INTERSECTIONS, SLOT_COUNT, WORD_LENGTH, isPlacementCorrect } from './geometry';
import { WORDS7 } from './data';
import { diagnoseStarAnswer } from './explanation';

const SEEDS = 150;
const LEVELS = [1, 2, 3, 4, 5];

/** Réimplémentation indépendante du critère : toutes les cases communes cohérentes. */
function everyIntersectionAgrees(words: string[]): boolean {
  return INTERSECTIONS.every((x) => words[x.wordA][x.indexA] === words[x.wordB][x.indexB]);
}

/** Réponse « solution de référence ». */
function referenceAnswer(solution: number[]): StarAnswer {
  return [...solution];
}

describe('star-words — dictionnaire', () => {
  it('ne contient que des mots de 7 lettres ASCII majuscules, sans doublon', () => {
    expect(WORDS7.length).toBeGreaterThanOrEqual(250);
    for (const w of WORDS7) expect(w).toMatch(/^[A-Z]{7}$/);
    expect(new Set(WORDS7).size).toBe(WORDS7.length);
  });
});

describe('star-words — géométrie', () => {
  it('6 intersections, chaque emplacement en partage exactement 2, cycle fermé', () => {
    expect(INTERSECTIONS.length).toBe(6);
    const perSlot = new Array(SLOT_COUNT).fill(0);
    for (const x of INTERSECTIONS) {
      perSlot[x.wordA]++;
      perSlot[x.wordB]++;
      // Les cases communes tombent toujours sur les indices 2 et 4.
      expect([2, 4]).toContain(x.indexA);
      expect([2, 4]).toContain(x.indexB);
      expect(x.wordA).not.toBe(x.wordB);
    }
    expect(perSlot).toEqual([2, 2, 2, 2, 2, 2]);
    // Chaque paire d'emplacements partage au plus une case.
    const pairs = INTERSECTIONS.map((x) => `${Math.min(x.wordA, x.wordB)}-${Math.max(x.wordA, x.wordB)}`);
    expect(new Set(pairs).size).toBe(6);
  });
});

describe('star-words — correction expliquée', () => {
  const question = {
    words: ['AAAAAAA', 'BBBBBBB', 'CCCCCCC', 'DDDDDDD', 'EEEEEEE', 'FFFFFFF', 'GGGGGGG', 'HHHHHHH', 'IIIIIII'],
    solution: [0, 0, 0, 0, 0, 0],
  };

  it('distingue une grille incomplète d’un conflit et nomme les lettres incompatibles', () => {
    expect(diagnoseStarAnswer(question, [0, null, null, null, null, null])).toMatchObject({
      kind: 'incomplete',
      placedCount: 1,
    });

    expect(diagnoseStarAnswer(question, [0, 1, 2, 3, 4, 5])).toMatchObject({
      kind: 'conflict',
      conflict: {
        wordA: 'AAAAAAA',
        wordB: 'DDDDDDD',
        letterA: 'A',
        letterB: 'D',
      },
    });
  });
});

describe('star-words — générateur', () => {
  it('est déterministe : même (seed, niveau) → même item', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('propose 9 mots distincts de 7 lettres ASCII, tous issus du dictionnaire', () => {
    const dict = new Set(WORDS7);
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        expect(q.words.length).toBe(9);
        expect(new Set(q.words).size).toBe(9);
        for (const w of q.words) {
          expect(w).toMatch(/^[A-Z]{7}$/);
          expect(w.length).toBe(WORD_LENGTH);
          expect(dict.has(w)).toBe(true);
        }
      }
    }
  });

  it('la solution de référence satisfait TOUTES les intersections', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        expect(q.solution.length).toBe(SLOT_COUNT);
        expect(new Set(q.solution).size).toBe(SLOT_COUNT);
        for (const idx of q.solution) expect(idx).toBeGreaterThanOrEqual(0);

        const placed = q.solution.map((i) => q.words[i]);
        expect(everyIntersectionAgrees(placed)).toBe(true);
        expect(isPlacementCorrect(placed)).toBe(true);
        expect(validate(item, referenceAnswer(q.solution))).toBe(true);
      }
    }
  });

  it('le validateur accepte TOUTE configuration correcte, pas seulement la référence', () => {
    let alternativesTested = 0;
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        // Un distracteur qui reproduit les deux lettres contraintes d'un mot de
        // la solution peut le remplacer : le validateur doit dire OUI.
        const solutionSet = new Set(q.solution);
        for (let slot = 0; slot < SLOT_COUNT; slot++) {
          const target = q.words[q.solution[slot]];
          for (let w = 0; w < q.words.length; w++) {
            if (solutionSet.has(w)) continue;
            const cand = q.words[w];
            if (cand[2] !== target[2] || cand[4] !== target[4]) continue;
            const answer = referenceAnswer(q.solution);
            answer[slot] = w;
            expect(validate(item, answer)).toBe(true);
            alternativesTested++;
          }
        }
      }
    }
    expect(alternativesTested).toBeGreaterThan(0);
  });

  it('le validateur rejette toute configuration avec au moins un conflit', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        const solutionSet = new Set(q.solution);

        // Incomplet → faux.
        const partial = referenceAnswer(q.solution);
        partial[3] = null;
        expect(validate(item, partial)).toBe(false);

        // Doublon → faux.
        const dup = referenceAnswer(q.solution);
        dup[1] = dup[0];
        expect(validate(item, dup)).toBe(false);

        // Permutation de deux emplacements : fausse dès qu'elle casse une case commune.
        const swapped = referenceAnswer(q.solution);
        [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
        const swappedWords = swapped.map((i) => q.words[i as number]);
        if (!everyIntersectionAgrees(swappedWords)) {
          expect(validate(item, swapped)).toBe(false);
        }

        // Substitution par un distracteur incompatible → faux.
        for (let slot = 0; slot < SLOT_COUNT; slot++) {
          const target = q.words[q.solution[slot]];
          const bad = q.words.findIndex(
            (w, i) => !solutionSet.has(i) && (w[2] !== target[2] || w[4] !== target[4]),
          );
          if (bad < 0) continue;
          const answer = referenceAnswer(q.solution);
          answer[slot] = bad;
          expect(validate(item, answer)).toBe(false);
        }
      }
    }
  });

  it('les tags décrivent la longueur et la difficulté des distracteurs', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate(seed, level);
        expect(item.tags).toContain('len-7');
        expect(item.tags).toContain(level <= 2 ? 'easy-decoys' : 'hard-decoys');
      }
    }
  });

  it('respecte forceTag et calibre la difficulté des distracteurs', () => {
    let easyTotal = 0;
    let hardTotal = 0;
    for (let seed = 0; seed < 60; seed++) {
      const easy = generate(seed, 5, 'easy-decoys');
      const hard = generate(seed, 5, 'hard-decoys');
      expect(easy.tags).toContain('easy-decoys');
      expect(hard.tags).toContain('hard-decoys');

      for (const item of [easy, hard]) {
        const q = item.question;
        const solution = q.solution.map((i) => q.words[i]);
        const decoys = q.words.filter((_, i) => !q.solution.includes(i));
        expect(decoys.length).toBe(3);
        const score = decoys.reduce((s, w) => s + decoyScore(w, solution), 0);
        if (item === easy) easyTotal += score;
        else hardTotal += score;
      }
      // Distracteurs faciles : aucune lettre contrainte reproduite.
      const easySolution = easy.question.solution.map((i) => easy.question.words[i]);
      for (const w of easy.question.words.filter((_, i) => !easy.question.solution.includes(i))) {
        expect(decoyScore(w, easySolution)).toBe(0);
      }
    }
    expect(easyTotal).toBe(0);
    expect(hardTotal).toBeGreaterThan(easyTotal);
  });
});
