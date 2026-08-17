import { describe, expect, it } from 'vitest';
import { generate, solutionAnswer, validate } from './generator';
import { LEVELS } from './config';
import { ALL_ROTATIONS, applyRotation, orbitOf, sameCube, serializeCube } from './cube-model';
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
        // On reconstitue le patron cible complet à partir de la solution.
        const filled = q.target.map((f) => (f ? { ...f } : null));
        for (const hole of q.holes) {
          const piece = q.pieces.find((p) => p.id === q.solution[hole])!;
          filled[hole] = { sym: piece.sym, rot: piece.rot };
        }
        const complete = filled as Cube;
        expect(sameCube(complete, q.reference)).toBe(true);
        // …mais PAS dans la même orientation, sinon la question est triviale.
        expect(serializeCube(complete)).not.toBe(serializeCube(q.reference));
      }
    }
  });

  it('le nombre de trous et de pièces suit le niveau', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < 100; seed++) {
        const q = generate(seed, level).question;
        expect(q.holes).toHaveLength(cfg.holes);
        expect(q.pieces).toHaveLength(cfg.holes + cfg.decoys);
        expect(q.target.filter((f) => f === null)).toHaveLength(cfg.holes);
        expect(Object.keys(q.solution)).toHaveLength(cfg.holes);
      }
    }
  });

  it("L'INVARIANT : la solution de référence est acceptée, et elle seule", () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 150; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        expect(validate(item, solutionAnswer(q))).toBe(true);

        // Mauvaise pièce dans un trou → refusé.
        const hole = q.holes[0];
        const goodId = q.solution[hole];
        for (const piece of q.pieces) {
          if (piece.id === goodId) continue;
          const answer = solutionAnswer(q);
          answer[hole] = { pieceId: piece.id, flipped: piece.mirrored };
          expect(validate(item, answer)).toBe(false);
        }
      }
    }
  });

  it('une pièce miroir doit être retournée, et une pièce normale ne doit pas l’être', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = generate(seed, 4, 'flip');
      const q = item.question;
      for (const hole of q.holes) {
        const piece = q.pieces.find((p) => p.id === q.solution[hole])!;
        const wrongFlip = solutionAnswer(q);
        wrongFlip[hole] = { pieceId: piece.id, flipped: !piece.mirrored };
        expect(validate(item, wrongFlip)).toBe(false);
      }
    }
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
      const piece = q.pieces.find((p) => p.id === q.solution[q.holes[0]])!;
      const answer = solutionAnswer(q);
      answer[q.holes[1]] = { pieceId: piece.id, flipped: piece.mirrored };
      expect(validate(item, answer)).toBe(false);
    }
  });

  it('respecte forceTag flip / no-flip', () => {
    for (let seed = 0; seed < 80; seed++) {
      expect(generate(seed, 1, 'flip').tags).toContain('flip');
      const noFlip = generate(seed, 5, 'no-flip');
      expect(noFlip.tags).toContain('no-flip');
      expect(noFlip.question.pieces.every((p) => !p.mirrored)).toBe(true);
    }
  });
});
