import { describe, expect, it } from 'vitest';
import { generate, solutionAnswer, validate } from './generator';
import { LEVELS } from './config';
import { LETTER_SYMS, SHAPE_SYMS, SYMBOLS } from './CubeSvg';
import {
  ALL_ROTATIONS,
  SYMBOL_QUARTER_SYMMETRY,
  applyRotation,
  orbitOf,
  sameCube,
  serializeCube,
} from './cube-model';
import type { Cube } from './cube-model';

const TEST_CUBE: Cube = [0, 1, 2, 3, 4, 5].map((sym) => ({ sym, rot: sym % 4 }));

describe('cube-model : le groupe des rotations', () => {
  it('contient exactement 24 rotations distinctes', () => {
    expect(ALL_ROTATIONS.length).toBe(24);
    const keys = new Set(ALL_ROTATIONS.map((r) => r.dest.join('') + '|' + r.twist.join('')));
    expect(keys.size).toBe(24);
  });

  it("l'orbite d'un cube à faces distinctes contient exactement 24 états", () => {
    expect(orbitOf(TEST_CUBE).size).toBe(24);
  });

  it('chaque rotation préserve les symboles (permutation pure)', () => {
    for (const r of ALL_ROTATIONS) {
      expect([...applyRotation(TEST_CUBE, r).map((f) => f.sym)].sort()).toEqual([0, 1, 2, 3, 4, 5]);
    }
  });
});

describe('cubes : patron à compléter (règle officielle)', () => {
  it('est déterministe', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 40; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('le patron à compléter est le MÊME cube que la référence, dans une autre orientation', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 150; seed++) {
        const q = generate(seed, level).question;
        const filled = q.target.map((f) => (f ? { ...f } : null));
        for (const hole of q.holes) {
          const piece = q.pieces.find((p) => p.id === q.solution[hole])!;
          filled[hole] = { sym: piece.sym, rot: q.expectedRot[hole] };
        }
        const complete = filled as Cube;
        expect(sameCube(complete, q.reference)).toBe(true);
        // …mais PAS dans la même orientation, sinon la question est triviale.
        expect(serializeCube(complete)).not.toBe(serializeCube(q.reference));
      }
    }
  });

  it('propose EXACTEMENT une pièce par trou : Pilotest ne met aucun leurre', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < 100; seed++) {
        const q = generate(seed, level).question;
        expect(q.holes).toHaveLength(cfg.holes);
        // Sans leurre, le raisonnement par élimination est légitime : toutes
        // les pièces doivent servir. Un leurre l'interdirait.
        expect(q.pieces).toHaveLength(cfg.holes);
        expect(q.target.filter((f) => f === null)).toHaveLength(cfg.holes);
        expect(Object.keys(q.solution)).toHaveLength(cfg.holes);
      }
    }
  });

  it('ne mélange jamais lettres et formes dans une même question', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 80; seed++) {
        const q = generate(seed, level).question;
        const pool = q.family === 'letters' ? LETTER_SYMS : SHAPE_SYMS;
        for (const face of q.reference) expect(pool).toContain(face.sym);
        for (const piece of q.pieces) expect(pool).toContain(piece.sym);
      }
    }
  });

  it("L'INVARIANT : la solution de référence est acceptée, et elle seule", () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 150; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        expect(validate(item, solutionAnswer(q))).toBe(true);

        // Mauvaise pièce dans un trou → refusé. Deux pièces peuvent porter le
        // même symbole seulement si le tirage l'a permis ; on écarte ce cas,
        // qui est légitimement interchangeable.
        const hole = q.holes[0];
        const goodId = q.solution[hole];
        const goodSym = q.pieces.find((p) => p.id === goodId)!.sym;
        for (const piece of q.pieces) {
          if (piece.id === goodId || piece.sym === goodSym) continue;
          const answer = solutionAnswer(q);
          answer[hole] = { pieceId: piece.id, rot: q.expectedRot[hole] };
          expect(validate(item, answer)).toBe(false);
        }
      }
    }
  });

  it('sur les LETTRES, une orientation fausse est refusée — les quatre se distinguent', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = generate(seed, 4, 'letters');
      const q = item.question;
      for (const hole of q.holes) {
        for (let turns = 1; turns <= 3; turns++) {
          const answer = solutionAnswer(q);
          answer[hole] = { pieceId: q.solution[hole], rot: (q.expectedRot[hole] + turns) % 4 };
          expect(validate(item, answer), `graine ${seed}, trou ${hole}, +${turns}`).toBe(false);
        }
      }
    }
  });

  it('sur les FORMES, l’orientation ne compte pas — un carré tourné reste le même carré', () => {
    // Le pendant du test précédent : ces symboles sont invariants par quart de
    // tour, exiger une orientation précise serait exiger l'impossible à l'œil.
    let invariants = 0;
    for (let seed = 0; seed < 200; seed++) {
      const item = generate(seed, 2, 'shapes');
      const q = item.question;
      for (const hole of q.holes) {
        const sym = q.pieces.find((p) => p.id === q.solution[hole])!.sym;
        if (SYMBOL_QUARTER_SYMMETRY[sym] !== 4) continue;
        invariants++;
        for (let turns = 1; turns <= 3; turns++) {
          const answer = solutionAnswer(q);
          answer[hole] = { pieceId: q.solution[hole], rot: (q.expectedRot[hole] + turns) % 4 };
          expect(validate(item, answer), `graine ${seed}, trou ${hole}, +${turns}`).toBe(true);
        }
      }
    }
    expect(invariants).toBeGreaterThan(50);
  });

  it('un trou laissé vide invalide la réponse', () => {
    for (let seed = 0; seed < 60; seed++) {
      const item = generate(seed, 3);
      const partial = solutionAnswer(item.question);
      delete partial[item.question.holes[0]];
      expect(validate(item, partial)).toBe(false);
    }
  });

  it('une même pièce ne peut pas servir deux fois', () => {
    for (let seed = 0; seed < 100; seed++) {
      const item = generate(seed, 4);
      const q = item.question;
      if (q.holes.length < 2) continue;
      const answer = solutionAnswer(q);
      answer[q.holes[1]] = { pieceId: q.solution[q.holes[0]], rot: q.expectedRot[q.holes[1]] };
      expect(validate(item, answer)).toBe(false);
    }
  });

  it('les deux familles restent alignées entre le rendu et la table de symétrie', () => {
    // Un décalage d'un cran entre SYMBOLS et SYMBOL_QUARTER_SYMMETRY rendrait
    // une lettre « invariante » : l'exercice accepterait n'importe quelle
    // orientation sans que rien ne le signale à l'écran.
    expect(SYMBOL_QUARTER_SYMMETRY).toHaveLength(SYMBOLS.length);
    for (const i of LETTER_SYMS) {
      expect(SYMBOLS[i].kind, `symbole ${i}`).toBe('letter');
      expect(SYMBOL_QUARTER_SYMMETRY[i], `symbole ${i}`).toBe(1);
    }
    for (const i of SHAPE_SYMS) expect(SYMBOLS[i].kind, `symbole ${i}`).toBe('shape');
  });
});
