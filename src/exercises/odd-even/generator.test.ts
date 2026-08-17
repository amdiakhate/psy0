import { describe, expect, it } from 'vitest';
import {
  expectedSequence,
  generate,
  hasCloseValues,
  hasMixedDigits,
  isPlayable,
  playableIds,
} from './generator';
import type { OddEvenQuestion, Parity } from './generator';
import { validate } from './validator';
import { CLOSE_GAP, GRID_COLS, GRID_ROWS, LABELS, LEVELS, MAX_NUMBERS, MIN_NUMBERS } from './config';

const SEEDS = 150;

/** Rejoue la chaîne en ne s'autorisant que des coups valides. */
function walk(q: OddEvenQuestion): void {
  for (let step = 0; step < q.chain.length - 1; step++) {
    expect(playableIds(q, step)).toEqual([q.chain[step + 1]]);
  }
  expect(playableIds(q, q.chain.length - 1)).toEqual([]);
}

describe('odd-even generator', () => {
  it('est déterministe : même seed → même item', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
        expect(generate(seed, level, 'close-values')).toEqual(generate(seed, level, 'close-values'));
      }
    }
  });

  it('la grille est cohérente : nombres distincts, un seul START, étiquettes uniques', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        expect(q.cells.length).toBeGreaterThanOrEqual(cfg.minNumbers);
        expect(q.cells.length).toBeLessThanOrEqual(cfg.maxNumbers);
        expect(q.chain).toHaveLength(q.cells.length);
        expect(new Set(q.chain).size).toBe(q.cells.length);
        expect(new Set(q.cells.map((c) => c.value)).size).toBe(q.cells.length);
        expect(new Set(q.cells.map((c) => c.label)).size).toBe(q.cells.length);
        q.cells.forEach((c, i) => {
          expect(c.id).toBe(i);
          expect(c.label).toBe(LABELS[i]);
          expect(c.value % 2).toBe(c.parity);
          expect(c.value).toBeGreaterThan(0);
        });
        expect(q.cells.filter((c) => c.isStart)).toHaveLength(1);
        expect(q.cells[q.chain[0]].isStart).toBe(true);
        expect(q.cells[q.chain[0]].parity).toBe(q.startParity);
      }
    }
  });

  it('la solution alterne les parités et respecte l’ordre croissant dans chacune', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        const cells = q.chain.map((id) => q.cells[id]);
        for (let i = 1; i < cells.length; i++) {
          expect(cells[i].parity).not.toBe(cells[i - 1].parity);
        }
        for (const parity of [0, 1] as Parity[]) {
          const seq = cells.filter((c) => c.parity === parity).map((c) => c.value);
          expect(seq).toEqual([...seq].sort((a, b) => a - b));
          // Tous les nombres de la grille sont utilisés par la chaîne.
          expect(seq).toHaveLength(q.cells.filter((c) => c.parity === parity).length);
        }
        // La parité du START porte un nombre de plus quand le total est impair.
        const nStart = q.cells.filter((c) => c.parity === q.startParity).length;
        expect(nStart).toBe(Math.ceil(q.cells.length / 2));
      }
    }
  });

  it('à chaque étape un seul nombre est jouable, et c’est celui de la solution', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        walk(generate(seed, level).question);
      }
    }
  });

  it('tout autre clic que le nombre attendu est refusé', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const q = generate(seed, 5).question;
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

  it('tagge le nombre de cases, les valeurs proches et le mélange de longueurs', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        expect(item.tags).toContain(`n-numbers-${item.question.cells.length}`);
        expect(item.tags.includes('close-values')).toBe(hasCloseValues(item.question));
        expect(item.tags.includes('mixed-digits')).toBe(hasMixedDigits(item.question));
      }
    }
  });

  it('sans piège close-values, les nombres de même parité restent bien séparés', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        if (item.tags.includes('close-values')) continue;
        for (const parity of [0, 1] as Parity[]) {
          const values = item.question.cells
            .filter((c) => c.parity === parity)
            .map((c) => c.value)
            .sort((a, b) => a - b);
          for (let i = 1; i < values.length; i++) {
            expect(values[i] - values[i - 1]).toBeGreaterThan(CLOSE_GAP);
          }
        }
      }
    }
  });

  it('respecte forceTag', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      expect(generate(seed, 1, 'close-values').tags).toContain('close-values');
      expect(generate(seed, 1, 'mixed-digits').tags).toContain('mixed-digits');
      expect(generate(seed, 5, 'mixed-digits').tags).toContain('mixed-digits');
      for (let n = MIN_NUMBERS; n <= MAX_NUMBERS; n++) {
        const item = generate(seed, 3, `n-numbers-${n}`);
        expect(item.question.cells).toHaveLength(n);
        expect(item.tags).toContain(`n-numbers-${n}`);
      }
    }
  });

  it('validate n’accepte que la séquence exacte, sans reprise', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const item = generate(seed, 4);
      const exp = expectedSequence(item.question);
      expect(validate(item, exp)).toBe(true);
      const wrong = item.question.cells.find((c) => !c.isStart)!.value;
      expect(validate(item, `${wrong} ${exp}`)).toBe(false);
      expect(validate(item, exp.split(' ').reverse().join(' '))).toBe(false);
    }
  });
});
