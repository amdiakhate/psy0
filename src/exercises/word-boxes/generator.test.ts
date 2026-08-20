import { describe, expect, it } from 'vitest';
import { generate } from './generator';
import { BANK, INCOMPATIBLE_PAIRS, THEMES, areIncompatible, themesOf } from './data';
import type { Theme } from './data';
import { DISTANT_GAP, LEVELS } from './config';
import { applyChoice, freeBoxes, initialState } from './model';
import type { BoxesState } from './model';

const SEEDS = 150;

describe('word-boxes data', () => {
  it('au moins 14 champs lexicaux de 8 mots ou plus', () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(14);
    for (const t of THEMES) {
      expect(BANK[t].length, t).toBeGreaterThanOrEqual(8);
      expect(new Set(BANK[t]).size, t).toBe(BANK[t].length);
    }
  });

  it('les banques sont globalement disjointes : aucun mot dans deux champs lexicaux', () => {
    const seen = new Map<string, Theme>();
    for (const t of THEMES) {
      for (const w of BANK[t]) {
        expect(seen.has(w), `« ${w} » présent dans ${seen.get(w)} ET ${t}`).toBe(false);
        seen.set(w, t);
      }
      for (const w of BANK[t]) expect(themesOf(w)).toEqual([t]);
    }
  });

  it('les paires incompatibles sont bien formées et symétriques', () => {
    for (const [a, b] of INCOMPATIBLE_PAIRS) {
      expect(THEMES).toContain(a);
      expect(THEMES).toContain(b);
      expect(a).not.toBe(b);
      expect(areIncompatible(a, b)).toBe(true);
      expect(areIncompatible(b, a)).toBe(true);
    }
  });
});

describe('word-boxes generator', () => {
  it('est déterministe : même (seed, level) → même item', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('la série a le bon nombre de boîtes, de thèmes et de mots', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        expect(q.boxCount).toBe(cfg.boxes);
        expect(q.themes).toHaveLength(cfg.boxes);
        expect(new Set(q.themes).size).toBe(cfg.boxes);
        expect(q.steps).toHaveLength(cfg.boxes * cfg.wordsPerTheme);
        for (const t of q.themes) {
          expect(q.steps.filter((s) => s.theme === t)).toHaveLength(cfg.wordsPerTheme);
        }
        expect(item.tags).toContain(`boxes-${cfg.boxes}`);
      }
    }
  });

  it('aucun mot n’appartient à deux thèmes de la même série, aucun mot répété', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        const words = q.steps.map((s) => s.word);
        expect(new Set(words).size, `seed ${seed} niveau ${level}`).toBe(words.length);
        for (const step of q.steps) {
          // Le mot appartient à son thème…
          expect(BANK[step.theme as Theme]).toContain(step.word);
          // …et à AUCUN autre thème de la série.
          const others = q.themes.filter((t) => t !== step.theme && BANK[t].includes(step.word));
          expect(others, `« ${step.word} » ambigu`).toHaveLength(0);
        }
      }
    }
  });

  it('aucune paire de thèmes incompatibles dans une même série', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        for (let i = 0; i < q.themes.length; i++) {
          for (let j = i + 1; j < q.themes.length; j++) {
            expect(
              areIncompatible(q.themes[i], q.themes[j]),
              `${q.themes[i]} + ${q.themes[j]} (seed ${seed}, niveau ${level})`,
            ).toBe(false);
          }
        }
      }
    }
  });

  it('les tags first-of-theme / recall / distant-recall collent à l’ordre réel d’apparition', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        const lastPos = new Map<string, number>();
        q.steps.forEach((step, pos) => {
          const last = lastPos.get(step.theme);
          const isFirst = last === undefined;
          expect(step.firstOfTheme, `pos ${pos}`).toBe(isFirst);
          expect(step.tags).toContain(isFirst ? 'first-of-theme' : 'recall');
          expect(step.tags).not.toContain(isFirst ? 'recall' : 'first-of-theme');
          expect(step.tags).toContain(`boxes-${cfg.boxes}`);
          expect(step.gap).toBe(isFirst ? -1 : pos - last!);
          expect(step.tags.includes('distant-recall')).toBe(!isFirst && pos - last! >= DISTANT_GAP);
          lastPos.set(step.theme, pos);
        });
        // Chaque thème est introduit exactement une fois.
        expect(q.steps.filter((s) => s.firstOfTheme)).toHaveLength(q.themes.length);
      }
    }
  });

  it('forceTag distant-recall allonge les rappels ; boxes-N impose le nombre de boîtes', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 60; seed++) {
        const forced = generate(seed, level, 'distant-recall');
        expect(forced.tags).toContain(`min-gap-${Math.max(LEVELS[level - 1].minGap, DISTANT_GAP)}`);
        for (const n of [4, 5, 6]) {
          const item = generate(seed, level, `boxes-${n}`);
          expect(item.question.boxCount).toBe(n);
          expect(item.question.themes).toHaveLength(n);
        }
      }
    }
  });
});

describe('word-boxes model (attribution libre puis rappel)', () => {
  it('le premier mot d’un thème est correct dans TOUTE boîte libre, faux dans une boîte occupée', () => {
    const q = generate(3, 3).question;
    const first = q.steps[0];
    for (let box = 0; box < q.boxCount; box++) {
      const res = applyChoice(initialState(q.boxCount), first, box, q.boxCount);
      expect(res.correct).toBe(true);
      expect(res.state.assignment[first.theme]).toBe(box);
      expect(res.state.contents[box]).toEqual([first.word]);
    }
    // Deuxième thème : la boîte du premier est désormais occupée → erreur.
    const afterFirst = applyChoice(initialState(q.boxCount), first, 0, q.boxCount).state;
    const second = q.steps.find((s) => s.firstOfTheme && s.theme !== first.theme)!;
    expect(applyChoice(afterFirst, second, 0, q.boxCount).correct).toBe(false);
    expect(applyChoice(afterFirst, second, 1, q.boxCount).correct).toBe(true);
  });

  it('un rappel n’est correct que dans la boîte attribuée ; l’absence de réponse est fausse', () => {
    const q = generate(11, 4).question;
    let state: BoxesState = initialState(q.boxCount);
    for (const step of q.steps) {
      const assigned = state.assignment[step.theme];
      if (assigned === undefined) {
        state = applyChoice(state, step, freeBoxes(state, q.boxCount)[0], q.boxCount).state;
        continue;
      }
      for (let box = 0; box < q.boxCount; box++) {
        expect(applyChoice(state, step, box, q.boxCount).correct).toBe(box === assigned);
      }
      expect(applyChoice(state, step, null, q.boxCount).correct).toBe(false);
      state = applyChoice(state, step, assigned, q.boxCount).state;
    }
  });

  it('une série jouée avec la stratégie « ordre d’apparition » est 100 % correcte', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        let state: BoxesState = initialState(q.boxCount);
        let correct = 0;
        for (const step of q.steps) {
          const assigned = state.assignment[step.theme];
          const chosen = assigned === undefined ? freeBoxes(state, q.boxCount)[0] : assigned;
          const res = applyChoice(state, step, chosen, q.boxCount);
          if (res.correct) correct += 1;
          state = res.state;
        }
        expect(correct, `seed ${seed} niveau ${level}`).toBe(q.steps.length);
        // Toutes les boîtes finissent dédiées, et contiennent les mots de leur thème.
        expect(Object.keys(state.assignment)).toHaveLength(q.boxCount);
        expect(state.contents.flat()).toHaveLength(q.steps.length);
        for (const theme of q.themes) {
          const box = state.assignment[theme];
          for (const w of state.contents[box]) expect(BANK[theme]).toContain(w);
        }
      }
    }
  });

  it('une erreur sur le premier mot d’un thème attribue quand même le thème (série cohérente)', () => {
    const q = generate(5, 2).question;
    const first = q.steps[0];
    const state = applyChoice(initialState(q.boxCount), first, 0, q.boxCount).state;
    const second = q.steps.find((s) => s.firstOfTheme && s.theme !== first.theme)!;
    const res = applyChoice(state, second, 0, q.boxCount); // boîte occupée → erreur
    expect(res.correct).toBe(false);
    expect(res.state.assignment[second.theme]).toBe(1); // première boîte libre
    expect(res.state.contents[1]).toEqual([second.word]);
  });
});

describe('régression : le nombre de boîtes change avec le niveau', () => {
  /**
   * C'est ce changement qui faisait planter la séance en plein jeu. L'état des
   * boîtes était figé sur la PREMIÈRE série ; quand le niveau montait, la série
   * suivante en demandait cinq ou six alors que l'état n'en contenait que
   * quatre, et le rendu lisait une case inexistante.
   *
   * Le composant remet donc son état à zéro PENDANT le rendu, et non dans un
   * effet qui s'exécute après. Ce test garde la raison d'être de ce choix : si
   * tous les niveaux avaient le même nombre de boîtes, on ne comprendrait plus
   * pourquoi le code est écrit ainsi.
   */
  it('un passage de niveau modifie réellement le nombre de boîtes', () => {
    const counts = LEVELS.map((l) => l.boxes);
    expect(new Set(counts).size).toBeGreaterThan(1);
    // Et le générateur le répercute bien sur la question.
    for (let level = 1; level <= LEVELS.length; level++) {
      const q = generate(1234, level).question;
      expect(q.boxCount, `niveau ${level}`).toBe(LEVELS[level - 1].boxes);
    }
  });

  it('l’état initial a toujours autant de boîtes que la question', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const q = generate(99, level).question;
      expect(initialState(q.boxCount).contents).toHaveLength(q.boxCount);
    }
  });
});
