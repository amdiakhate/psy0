import { describe, expect, it } from 'vitest';
import { ALL_COURSE_EXERCISES, buildCourseExercises } from './courseDrills';
import { COURSE_CHAPTERS } from './courseModel';
import { rotateEdge } from '../domain/cubeGeometry';

describe('cube course validations', () => {
  it('builds the declared amount with valid answers and explanations', () => {
    expect(ALL_COURSE_EXERCISES).toHaveLength(39);
    expect(new Set(ALL_COURSE_EXERCISES.map((exercise) => exercise.id)).size).toBe(39);
    for (const chapter of COURSE_CHAPTERS) {
      const exercises = buildCourseExercises(chapter.id);
      expect(exercises).toHaveLength(chapter.exerciseCount);
      for (const exercise of exercises) {
        expect(exercise.choices.some((candidate) => candidate.id === exercise.answerId)).toBe(true);
        expect(exercise.explanation.length).toBeGreaterThan(20);
      }
    }
  });

  it('donne à chaque validation d’orientation un cas géométrique visible et cohérent', () => {
    const exercises = buildCourseExercises('orientation-symboles');
    for (const exercise of exercises) {
      expect(exercise.orientationContext).toBeDefined();
      const context = exercise.orientationContext!;
      expect(rotateEdge(context.sourceEdge, Number(exercise.answerId) as 0 | 1 | 2 | 3)).toBe(context.targetEdge);
      expect(exercise.prompt).toContain(context.faceId);
      expect(exercise.prompt).toContain(context.anchorFaceId);
    }
  });
});
