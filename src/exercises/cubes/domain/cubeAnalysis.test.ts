import { describe, expect, it } from 'vitest';
import { generate, solutionAnswer } from '../generator';
import type { CubesAnswer, CubesQuestion } from '../generator';
import { SYMBOL_QUARTER_SYMMETRY } from '../cube-model';
import { analyzeCubeAttempt } from './cubeAnalysis';
import type { FacePosition } from './types';

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

  it('décrit une réponse incomplète sans inventer une permutation de faces', () => {
    const item = generate(8, 4, 'letters');
    const analysis = analyzeCubeAttempt(item.question, {});
    expect(analysis.isCorrect).toBe(false);
    expect(analysis.incorrectFaces.every((face) => face.primaryCause === undefined)).toBe(true);
    expect(analysis.incorrectFaces.every((face) => face.givenFaceId === null)).toBe(true);
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

  it('classe correctement les erreurs de 90° et de 180°', () => {
    const item = generate(31, 4, 'letters');
    const hole = item.question.holes[0];
    for (const delta of [1, 2, 3] as const) {
      const answer = solutionAnswer(item.question);
      answer[hole] = { ...answer[hole], rot: (answer[hole].rot + delta) % 4 };
      const diagnostic = analyzeCubeAttempt(item.question, answer).orientationErrors[0];
      expect(diagnostic.cause).toBe(delta === 2 ? 'WRONG_ROTATION_180' : 'WRONG_ROTATION_90');
      expect(diagnostic.anchorFaceId).toBeTruthy();
    }
  });

  it('détecte une réflexion qui conserve toutes les opposées mais inverse les anneaux', () => {
    const positions = [0, 1, 2, 3, 4, 5] as const;
    const reference = positions.map((position) => ({
      id: `face-${position}`,
      originalPosition: position,
      sym: 6 + position,
      rot: 0 as const,
    }));
    const question: CubesQuestion = {
      family: 'letters',
      reference,
      target: positions.map(() => null),
      holes: [...positions],
      pieces: positions.map((position) => ({ id: position, faceId: `face-${position}`, originalPosition: position, sym: 6 + position })),
      solution: Object.fromEntries(positions.map((position) => [position, position])),
      expectedRot: Object.fromEntries(positions.map((position) => [position, 0])),
    };
    const reflectedPosition: Readonly<Record<FacePosition, FacePosition>> = { 0: 1, 1: 0, 2: 2, 3: 3, 4: 4, 5: 5 };
    const answer: CubesAnswer = Object.fromEntries(
      positions.map((position) => [position, { pieceId: reflectedPosition[position], rot: 0 }]),
    );
    const analysis = analyzeCubeAttempt(question, answer);
    expect(analysis.oppositePairs.every((pair) => pair.valid)).toBe(true);
    expect(analysis.circularOrderErrors.some((error) => error.reversed)).toBe(true);
    expect(analysis.mirrorDetected).toBe(true);
    expect(analysis.isCorrect).toBe(false);
  });
});
