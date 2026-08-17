import { describe, expect, it } from 'vitest';
import { generate, validate } from './generator';
import { ANSWER_CHOICES, LEVELS } from './config';
import { CAPACITIES, countMarbles, minMoves, optimalPath, serialize, successors } from './model';
import type { State } from './model';

describe('modèle des tubes (règle officielle)', () => {
  it('respecte les capacités 3 / 2 / 3', () => {
    expect([...CAPACITIES]).toEqual([3, 2, 3]);
  });

  it('un déplacement prend la bille du DESSUS et la pose sur le DESSUS d’un autre tube', () => {
    const state: State = [[0, 1], [2], []];
    const succ = successors(state);
    // Depuis le tube 0, seule la bille du dessus (1) peut partir.
    const toTube2 = succ.find((s) => s[2].length === 1 && s[0].length === 1);
    expect(toTube2![2]).toEqual([1]);
    expect(toTube2![0]).toEqual([0]);
  });

  it('n’autorise jamais de dépasser la capacité d’un tube', () => {
    const full: State = [[0, 1, 2], [3, 4], [5, 6, 7]];
    expect(successors(full)).toHaveLength(0); // tous les tubes sont pleins
    const state: State = [[0], [1, 2], []];
    for (const s of successors(state)) {
      s.forEach((tube, i) => expect(tube.length).toBeLessThanOrEqual(CAPACITIES[i]));
    }
  });

  it('minMoves est cohérent avec un chemin optimal réel', () => {
    const start: State = [[0, 1, 2], [], []];
    const goal: State = [[0], [1], [2]];
    expect(minMoves(start, goal)).toBe(2);
    const path = optimalPath(start, goal)!;
    expect(path).toHaveLength(3); // état initial + 2 déplacements
    expect(serialize(path[0])).toBe(serialize(start));
    expect(serialize(path[path.length - 1])).toBe(serialize(goal));
    // Chaque étape du chemin est un successeur légal de la précédente.
    for (let i = 1; i < path.length; i++) {
      expect(successors(path[i - 1]).map(serialize)).toContain(serialize(path[i]));
    }
  });

  it('minMoves vaut 0 si départ = arrivée, et null si les billes diffèrent', () => {
    const s: State = [[0], [1], []];
    expect(minMoves(s, s)).toBe(0);
    expect(minMoves(s, [[0], [2], []])).toBeNull();
  });
});

describe('marbles generator', () => {
  it('est déterministe', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 40; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('départ et arrivée sont légaux, distincts, et contiennent les mêmes billes', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 120; seed++) {
        const { start, goal } = generate(seed, level).question;
        expect(serialize(start)).not.toBe(serialize(goal));
        expect(countMarbles(start)).toBe(LEVELS[level - 1].marbles);
        expect(countMarbles(goal)).toBe(countMarbles(start));
        start.forEach((t, i) => expect(t.length).toBeLessThanOrEqual(CAPACITIES[i]));
        goal.forEach((t, i) => expect(t.length).toBeLessThanOrEqual(CAPACITIES[i]));
        expect([...start.flat()].sort()).toEqual([...goal.flat()].sort());
      }
    }
  });

  it("L'INVARIANT : la réponse est bien le nombre MINIMUM de déplacements (recalculé par BFS)", () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 120; seed++) {
        const item = generate(seed, level);
        const { start, goal, answer } = item.question;
        expect(minMoves(start, goal)).toBe(answer);
        expect(answer).toBeGreaterThan(0);
        // Aucun chemin plus court n'existe : le chemin optimal a exactement `answer` déplacements.
        expect(optimalPath(start, goal)!).toHaveLength(answer + 1);
      }
    }
  });

  it('la difficulté suit le niveau (fourchette de déplacements respectée)', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < 80; seed++) {
        const { answer } = generate(seed, level).question;
        expect(answer).toBeGreaterThanOrEqual(cfg.minMoves);
        expect(answer).toBeLessThanOrEqual(cfg.maxMoves);
      }
    }
  });

  it('validate n’accepte que la valeur exacte', () => {
    for (let seed = 0; seed < 60; seed++) {
      const item = generate(seed, 3);
      const n = item.question.answer;
      expect(validate(item, String(n))).toBe(true);
      expect(validate(item, String(n + 1))).toBe(false);
      expect(validate(item, String(Math.max(0, n - 1)))).toBe(false);
      expect(validate(item, '')).toBe(false);
    }
  });

  it('tagge le nombre de déplacements', () => {
    for (let seed = 0; seed < 60; seed++) {
      const item = generate(seed, 5);
      expect(item.tags).toContain(`moves-${item.question.answer}`);
    }
  });

  it('numérote les billes de façon UNIQUE : aucune n’est interchangeable', () => {
    // Sur Pilotest chaque bille porte un numéro. Réutiliser un numéro rendrait
    // deux billes permutables et ferait baisser le minimum de déplacements :
    // l'exercice deviendrait plus facile que l'original.
    for (let level = 1; level <= 5; level++) {
      for (let seed = 0; seed < 40; seed++) {
        const { question } = generate(seed, level);
        for (const state of [question.start, question.goal]) {
          const all = state.flat();
          expect(new Set(all).size).toBe(all.length);
          // Numérotation contiguë depuis 0, comme l'affichage le suppose.
          expect([...all].sort((a, b) => a - b)).toEqual(all.map((_, i) => i));
        }
      }
    }
  });

  it('garde toujours la réponse dans les choix du QCM (2 à 9)', () => {
    // Le QCM ne propose que 2..9 : une réponse hors de cette plage serait
    // impossible à donner, quel que soit le raisonnement du candidat.
    for (let level = 1; level <= 5; level++) {
      for (let seed = 0; seed < 60; seed++) {
        const { question } = generate(seed, level);
        expect(ANSWER_CHOICES).toContain(question.answer);
      }
    }
  });
});
