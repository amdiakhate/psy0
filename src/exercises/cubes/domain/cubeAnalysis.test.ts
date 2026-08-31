import { describe, expect, it } from 'vitest';
import { generate, solutionAnswer } from '../generator';
import { SYMBOL_QUARTER_SYMMETRY } from '../cube-model';
import { analyzeCubeAttempt } from './cubeAnalysis';

describe('analyse d’une tentative Cubes', () => {
  it('reconnaît une solution complète sans diagnostic parasite', () => {
    const item = generate(42, 4, 'letters');
    const analysis = analyzeCubeAttempt(item.question, solutionAnswer(item.question));
    expect(analysis.isCorrect).toBe(true);
    expect(analysis.incorrectFaces).toEqual([]);
    expect(analysis.orientationErrors).toEqual([]);
    expect(analysis.mirrorDetected).toBe(false);
  });

  it('distingue une bonne face tournée dans le mauvais sens', () => {
    const item = generate(7, 4, 'letters');
    const answer = solutionAnswer(item.question);
    const hole = item.question.holes[0];
    answer[hole] = { ...answer[hole], rot: (answer[hole].rot + 1) % 4 };
    const analysis = analyzeCubeAttempt(item.question, answer);
    expect(analysis.isCorrect).toBe(false);
    expect(analysis.orientationErrors).toHaveLength(1);
    expect(analysis.orientationErrors[0].position).toBe(hole);
    expect(analysis.incorrectFaces[0].primaryCause).toBe('CORRECT_FACE_WRONG_ORIENTATION');
  });

  it('ne signale jamais l’orientation d’un symbole invariant', () => {
    const item = Array.from({ length: 200 }, (_, seed) => generate(seed, 1, 'shapes')).find(({ question }) => {
      const hole = question.holes[0];
      const piece = question.pieces.find((candidate) => candidate.id === question.solution[hole])!;
      return SYMBOL_QUARTER_SYMMETRY[piece.sym] === 4;
    })!;
    const answer = solutionAnswer(item.question);
    const hole = item.question.holes[0];
    answer[hole] = { ...answer[hole], rot: (answer[hole].rot + 1) % 4 };
    expect(analyzeCubeAttempt(item.question, answer).orientationErrors).toEqual([]);
  });
});
