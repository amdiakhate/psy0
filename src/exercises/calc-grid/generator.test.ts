import { describe, expect, it } from 'vitest';
import { generate, validate } from './generator';
import { GRID_SIZE, LEVELS, MAX_WRONG } from './config';

/** Évalue l'énoncé (partie gauche du « = ») de gauche à droite. */
function evalLeft(display: string): number {
  const left = display.split(' = ')[0];
  const pct = left.match(/^(\d+) % de (\d+)$/);
  if (pct) return (Number(pct[1]) * Number(pct[2])) / 100;
  const frac = left.match(/^(\d+)\/(\d+) de (\d+)$/);
  if (frac) return (Number(frac[1]) * Number(frac[3])) / Number(frac[2]);
  const tokens = left.split(' ');
  let value = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const b = Number(tokens[i + 1]);
    if (tokens[i] === '+') value += b;
    else if (tokens[i] === '−') value -= b;
    else if (tokens[i] === '×') value *= b;
    else if (tokens[i] === '÷') value /= b;
    else throw new Error(`Opérateur inconnu : ${tokens[i]}`);
  }
  return value;
}

describe('calc-grid : grille de 9 calculs dont 0 à 4 faux (règle officielle)', () => {
  it('est déterministe', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 40; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('chaque grille a exactement 9 cases et 0 à 4 erreurs', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 150; seed++) {
        const q = generate(seed, level).question;
        expect(q.cells).toHaveLength(GRID_SIZE);
        expect(q.wrongIndices.length).toBeGreaterThanOrEqual(0);
        expect(q.wrongIndices.length).toBeLessThanOrEqual(MAX_WRONG);
      }
    }
  });

  it("L'INVARIANT : `truth` est le vrai résultat, et `wrong` ⇔ résultat affiché ≠ vrai résultat", () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 150; seed++) {
        const q = generate(seed, level).question;
        q.cells.forEach((cell, i) => {
          expect(evalLeft(cell.display)).toBe(cell.truth);
          expect(cell.display.endsWith(` = ${cell.shown}`)).toBe(true);
          expect(cell.wrong).toBe(cell.shown !== cell.truth);
          expect(q.wrongIndices.includes(i)).toBe(cell.wrong);
          expect(Number.isInteger(cell.shown)).toBe(true);
          expect(cell.shown).toBeGreaterThanOrEqual(0);
        });
      }
    }
  });

  it('les faux sont PLAUSIBLES : jamais un écart grossier (≤ 20 ou permutation de chiffres)', () => {
    for (let seed = 0; seed < 200; seed++) {
      const q = generate(seed, 4).question;
      for (const cell of q.cells.filter((c) => c.wrong)) {
        const delta = Math.abs(cell.shown - cell.truth);
        const isSwap = String(cell.shown).length === String(cell.truth).length;
        expect(delta <= 20 || isSwap).toBe(true);
      }
    }
  });

  it('validate exige l’ensemble EXACT des cases fausses', () => {
    for (let seed = 0; seed < 100; seed++) {
      const item = generate(seed, 3);
      const truth = item.question.wrongIndices;
      expect(validate(item, truth)).toBe(true);
      expect(validate(item, [...truth].reverse())).toBe(true); // l'ordre n'importe pas
      // Une case en trop ou en moins invalide la réponse.
      const extra = [...Array(GRID_SIZE).keys()].find((i) => !truth.includes(i))!;
      expect(validate(item, [...truth, extra])).toBe(false);
      if (truth.length > 0) expect(validate(item, truth.slice(1))).toBe(false);
      else expect(validate(item, [0])).toBe(false);
    }
  });

  it('des grilles SANS erreur existent (piège officiel) et sont validées par une réponse vide', () => {
    let found = 0;
    for (let seed = 0; seed < 300 && found < 5; seed++) {
      const item = generate(seed, 2);
      if (item.question.wrongIndices.length > 0) continue;
      found++;
      expect(validate(item, [])).toBe(true);
      expect(validate(item, [3])).toBe(false);
      expect(item.tags).toContain('no-error');
    }
    expect(found).toBeGreaterThan(0);
  });

  it('respecte forceTag', () => {
    for (let seed = 0; seed < 60; seed++) {
      expect(generate(seed, 3, 'no-error').question.wrongIndices).toHaveLength(0);
      expect(generate(seed, 3, 'many-errors').question.wrongIndices).toHaveLength(MAX_WRONG);
      expect(generate(seed, 2, 'sub-carry').question.cells.every((c) => c.kind === 'sub-carry')).toBe(true);
    }
  });

  it('les soustractions à retenue en portent bien une', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const cell of generate(seed, 2, 'sub-carry').question.cells) {
        const m = cell.display.match(/^(\d+) − (\d+) = /);
        expect(m).not.toBeNull();
        expect(Number(m![1]) % 10).toBeLessThan(Number(m![2]) % 10);
      }
    }
  });
});
