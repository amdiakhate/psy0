import { describe, expect, it } from 'vitest';
import { COURSE_CHAPTERS } from './courseModel';

describe('cube course model', () => {
  it('defines ten ordered chapters and exactly 39 validations', () => {
    expect(COURSE_CHAPTERS.map((chapter) => chapter.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(COURSE_CHAPTERS.map((chapter) => chapter.exerciseCount)).toEqual([3, 5, 4, 3, 3, 4, 4, 5, 5, 3]);
    expect(COURSE_CHAPTERS.reduce((sum, chapter) => sum + chapter.exerciseCount, 0)).toBe(39);
  });
});

