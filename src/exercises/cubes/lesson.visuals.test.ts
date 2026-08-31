import { describe, expect, it } from 'vitest';
import { lesson } from './lesson';
import { CUBE_LESSON_HOLES } from './CubeLessonVisuals';
import { getOppositePosition } from './domain/cubeGeometry';

describe('leçon visuelle Cubes', () => {
  it('donne une scène pédagogique distincte à chaque étape', () => {
    const scenes = lesson.steps.map((step) => step.scene);
    expect(new Set(scenes).size).toBe(scenes.length);
  });

  it('couvre les neuf gestes de la méthode dans l’ordre', () => {
    expect(lesson.steps.map((step) => step.scene)).toEqual([
      'fold',
      'fold-pairs',
      'compare-nets',
      'map-opposites',
      'solve-opposite',
      'orient-edge',
      'rotate-piece',
      'symmetric-symbols',
      'verify-pairs',
    ]);
  });

  it('garde visible la face opposée de chaque trou dans la démonstration', () => {
    for (const hole of CUBE_LESSON_HOLES) {
      expect(CUBE_LESSON_HOLES).not.toContain(getOppositePosition(hole));
    }
  });
});
