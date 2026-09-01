import { describe, expect, it } from 'vitest';
import { ALL_ROTATIONS, POS, applyRotation } from '../cube-model';
import { FACE_FRAMES, getClockwiseNeighbors } from '../domain/cubeGeometry';
import type { Vec3 } from '../domain/types';
import {
  buildDirectionalRingQuestion,
  buildMentalRingQuestion,
  buildRingScene,
  isMirrorOrder,
  isRingRotation,
  multiplyRingMatrix,
  reachableFrontRings,
} from './ringSceneModel';
import {
  COURSE_CUBE,
  COURSE_FACE_IDS,
  COURSE_FACE_TO_POSITION,
  COURSE_POSITION_TO_FACE,
} from './courseFixtures';

const closeVector = (actual: Vec3, expected: Vec3) => {
  expect(actual[0]).toBeCloseTo(expected[0], 8);
  expect(actual[1]).toBeCloseTo(expected[1], 8);
  expect(actual[2]).toBeCloseTo(expected[2], 8);
};

describe('modèle de scène anneau', () => {
  it.each(COURSE_FACE_IDS)('place réellement la normale de %s face caméra', (faceId) => {
    const scene = buildRingScene(faceId, 0);
    const frame = FACE_FRAMES[COURSE_FACE_TO_POSITION[faceId]];
    closeVector(multiplyRingMatrix(scene.cubeTransform, frame.normal), [0, 0, 1]);
    closeVector(multiplyRingMatrix(scene.cubeTransform, frame.up), [0, 1, 0]);
    closeVector(multiplyRingMatrix(scene.cubeTransform, frame.right), [1, 0, 0]);
  });

  it.each(COURSE_FACE_IDS)('dérive les positions 1–4 de getClockwiseNeighbors pour %s', (faceId) => {
    const position = COURSE_FACE_TO_POSITION[faceId];
    expect(buildRingScene(faceId, 0).clockwiseNeighbors).toEqual(
      getClockwiseNeighbors(position).map((neighbor) => COURSE_POSITION_TO_FACE[neighbor]),
    );
  });

  it('synchronise le quart de tour : haut devient droite', () => {
    const before = buildRingScene('A', 0);
    const after = buildRingScene('A', 1);
    expect(after.displayedNeighbors).toEqual([
      before.clockwiseNeighbors[3],
      before.clockwiseNeighbors[0],
      before.clockwiseNeighbors[1],
      before.clockwiseNeighbors[2],
    ]);
    const up = FACE_FRAMES[COURSE_FACE_TO_POSITION.A].up;
    closeVector(multiplyRingMatrix(after.cubeTransform, up), [1, 0, 0]);
  });

  it.each(COURSE_FACE_IDS)('le miroir de %s est absent des rotations propres', (faceId) => {
    const ring = buildRingScene(faceId, 0).clockwiseNeighbors;
    const mirror = [ring[0], ring[3], ring[2], ring[1]] as const;
    expect(isMirrorOrder(mirror, ring)).toBe(true);
    expect(reachableFrontRings(faceId).some((candidate) => candidate.join() === mirror.join())).toBe(false);

    const reachedFromCube = ALL_ROTATIONS
      .map((rotation) => applyRotation(COURSE_CUBE, rotation))
      .filter((cube) => cube[POS.F].id === faceId)
      .map((cube) => [cube[POS.U].id, cube[POS.R].id, cube[POS.D].id, cube[POS.L].id]);
    expect(reachedFromCube).toEqual(reachableFrontRings(faceId));
  });

  it('génère quatre choix avec une seule classe de rotation correcte', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const question = buildMentalRingQuestion(seed);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.order.join('|'))).size).toBe(4);
      expect(question.options.filter((option) => isRingRotation(option.order, question.referenceOrder))).toHaveLength(1);
      expect(question.options.find((option) => option.id === question.answerId)?.order).toEqual(question.correctOrder);
    }
  });

  it('génère les voisins directionnels depuis la scène', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const question = buildDirectionalRingQuestion(seed);
      const scene = buildRingScene(question.centerFaceId, 0);
      expect(question.answerFaceId).toBe(scene.clockwiseNeighbors[question.directionIndex]);
    }
  });
});
