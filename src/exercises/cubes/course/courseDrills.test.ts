import { describe, expect, it } from 'vitest';
import { ALL_COURSE_EXERCISES, buildCourseExercises } from './courseDrills';
import { COURSE_CHAPTERS } from './courseModel';

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
});

