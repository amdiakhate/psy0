import { describe, expect, it } from 'vitest';
import { generate, expectedSequence, isPlayable, playableIds } from './generator';
import type { WordSkipQuestion } from './generator';
import { validate } from './validator';
import { GRID_COLS, GRID_ROWS, LABELS, LEVELS, MAX_WORDS, MIN_WORDS } from './config';
import { FAR_PAIRS, isClosePair, THEMES, THEME_IDS } from './data';

const SEEDS = 150;

describe('word-skip data', () => {
  it('12 thématiques, ≥ 10 mots chacune, sans doublon global', () => {
    expect(THEME_IDS.length).toBeGreaterThanOrEqual(12);
    const all: string[] = [];
    for (const id of THEME_IDS) {
      expect(THEMES[id].words.length).toBeGreaterThanOrEqual(10);
      all.push(...THEMES[id].words);
    }
    expect(new Set(all).size).toBe(all.length);
  });

  it('les mots sont en majuscules ASCII (tri alphabétique non ambigu)', () => {
    for (const id of THEME_IDS) {
      for (const w of THEMES[id].words) {
        expect(w).toMatch(/^[A-Z]+$/);
      }
    }
  });

  it('chaque thématique offre assez d’initiales distinctes pour une grille pleine', () => {
    const maxPerTheme = Math.ceil(MAX_WORDS / 2);
    for (const id of THEME_IDS) {
      const initials = new Set(THEMES[id].words.map((w) => w[0]));
      expect(initials.size).toBeGreaterThanOrEqual(maxPerTheme);
      // Au moins une initiale doublée : le piège alpha-trap est toujours réalisable.
      expect(initials.size).toBeLessThan(THEMES[id].words.length);
    }
  });

  it('aucune paire « éloignée » n’est aussi déclarée proche', () => {
    expect(FAR_PAIRS.length).toBeGreaterThan(0);
    for (const [a, b] of FAR_PAIRS) expect(isClosePair(a, b)).toBe(false);
  });
});

/** Rejoue la chaîne en ne s'autorisant que des coups valides. */
function walk(q: WordSkipQuestion): void {
  for (let step = 0; step < q.chain.length - 1; step++) {
    const playable = playableIds(q, step);
    expect(playable).toEqual([q.chain[step + 1]]);
  }
  // Chaîne complète : plus rien n'est jouable.
  expect(playableIds(q, q.chain.length - 1)).toEqual([]);
}

describe('word-skip generator', () => {
  it('est déterministe : même seed → même item', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
        expect(generate(seed, level, 'alpha-trap')).toEqual(generate(seed, level, 'alpha-trap'));
      }
    }
  });

  it('la grille est cohérente : mots distincts, un seul START, étiquettes uniques', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        expect(q.cells.length).toBeGreaterThanOrEqual(cfg.minWords);
        expect(q.cells.length).toBeLessThanOrEqual(cfg.maxWords);
        expect(q.chain).toHaveLength(q.cells.length);
        expect(new Set(q.chain).size).toBe(q.cells.length);
        expect(new Set(q.cells.map((c) => c.word)).size).toBe(q.cells.length);
        expect(new Set(q.cells.map((c) => c.label)).size).toBe(q.cells.length);
        q.cells.forEach((c, i) => {
          expect(c.id).toBe(i);
          expect(c.label).toBe(LABELS[i]);
          expect(THEMES[q.themeIds[c.theme]].words).toContain(c.word);
        });
        expect(q.cells.filter((c) => c.isStart)).toHaveLength(1);
        // Le START est le premier maillon de la chaîne.
        expect(q.cells[q.chain[0]].isStart).toBe(true);
        expect(q.cells[q.chain[0]].theme).toBe(0);
      }
    }
  });

  it('la solution alterne les thématiques et respecte l’ordre alphabétique interne', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        const words = q.chain.map((id) => q.cells[id]);
        for (let i = 1; i < words.length; i++) {
          expect(words[i].theme).not.toBe(words[i - 1].theme);
        }
        for (const theme of [0, 1] as const) {
          const seq = words.filter((c) => c.theme === theme).map((c) => c.word);
          expect(seq).toEqual([...seq].sort());
          // Tous les mots de la grille sont utilisés par la chaîne.
          expect(seq).toHaveLength(q.cells.filter((c) => c.theme === theme).length);
        }
        // Les deux thématiques sont bien distinctes.
        expect(q.themeIds[0]).not.toBe(q.themeIds[1]);
      }
    }
  });

  it('à chaque étape un seul mot est jouable, et c’est celui de la solution', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        walk(generate(seed, level).question);
      }
    }
  });

  it('tout autre clic que le mot attendu est refusé', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const q = generate(seed, 4).question;
      for (let step = 0; step < q.chain.length - 1; step++) {
        for (const c of q.cells) {
          expect(isPlayable(q, step, c.id)).toBe(c.id === q.chain[step + 1]);
        }
      }
    }
  });

  it('les positions occupent des emplacements distincts de la grille', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        const slots = new Set<string>();
        for (const c of q.cells) {
          expect(c.x).toBeGreaterThan(0);
          expect(c.x).toBeLessThan(100);
          expect(c.y).toBeGreaterThan(0);
          expect(c.y).toBeLessThan(100);
          slots.add(`${Math.round((c.x / 100) * GRID_COLS - 0.5)}:${Math.round((c.y / 100) * GRID_ROWS - 0.5)}`);
        }
        expect(slots.size).toBe(q.cells.length);
      }
    }
  });

  it('tagge le nombre de mots, la proximité des thématiques et le piège de tri', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        expect(item.tags).toContain(`n-words-${q.cells.length}`);
        const close = isClosePair(q.themeIds[0], q.themeIds[1]);
        expect(item.tags).toContain(close ? 'theme-close' : 'theme-far');
        // alpha-trap ⟺ deux mots d'une même thématique partagent leur initiale.
        const hasTrap = [0, 1].some((t) => {
          const initials = q.cells.filter((c) => c.theme === t).map((c) => c.word[0]);
          return new Set(initials).size < initials.length;
        });
        expect(item.tags.includes('alpha-trap')).toBe(hasTrap);
      }
    }
  });

  it('respecte forceTag', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      expect(generate(seed, 1, 'theme-close').tags).toContain('theme-close');
      expect(generate(seed, 5, 'theme-far').tags).toContain('theme-far');
      expect(generate(seed, 1, 'alpha-trap').tags).toContain('alpha-trap');
      for (let n = MIN_WORDS; n <= MAX_WORDS; n++) {
        const item = generate(seed, 3, `n-words-${n}`);
        expect(item.question.cells).toHaveLength(n);
        expect(item.tags).toContain(`n-words-${n}`);
      }
    }
  });

  it('validate n’accepte que la séquence exacte, sans reprise', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const item = generate(seed, 3);
      const exp = expectedSequence(item.question);
      expect(validate(item, exp)).toBe(true);
      const wrong = item.question.cells.find((c) => !c.isStart)!.word;
      expect(validate(item, `${wrong} ${exp}`)).toBe(false);
      expect(validate(item, exp.split(' ').reverse().join(' '))).toBe(false);
    }
  });
});
