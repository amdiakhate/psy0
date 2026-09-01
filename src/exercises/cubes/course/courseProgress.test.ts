import { beforeEach, describe, expect, it } from 'vitest';
import { COURSE_CHAPTERS } from './courseModel';
import {
  getChapterStatus,
  loadCubeCourseProgress,
  recordCubeCourseAttempt,
  resetCubeCourseProgress,
} from './courseProgress';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe('cube course progress', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
  });

  it('starts neutral and recovers from corrupt storage', () => {
    expect(loadCubeCourseProgress().currentChapterId).toBe(COURSE_CHAPTERS[0].id);
    localStorage.setItem('psy0.cubes-course-v1', '{broken');
    expect(loadCubeCourseProgress()).toMatchObject({ schemaVersion: 1, attempts: [] });
  });

  it('unlocks only after every validation and the chapter threshold', () => {
    resetCubeCourseProgress();
    expect(getChapterStatus(loadCubeCourseProgress(), COURSE_CHAPTERS[1].id)).toBe('locked');
    for (let index = 0; index < COURSE_CHAPTERS[0].exerciseCount; index += 1) {
      recordCubeCourseAttempt({
        exerciseId: `${COURSE_CHAPTERS[0].id}-${index + 1}`,
        chapterId: COURSE_CHAPTERS[0].id,
        skill: 'identity',
        correct: true,
        answeredAt: new Date(2026, 8, 1, 10, index).toISOString(),
      });
    }
    expect(getChapterStatus(loadCubeCourseProgress(), COURSE_CHAPTERS[0].id)).toBe('complete');
    expect(getChapterStatus(loadCubeCourseProgress(), COURSE_CHAPTERS[1].id)).toBe('available');
  });

  it('does not read real Coach attempts into the course', () => {
    localStorage.setItem('psy0.cubes-coach', JSON.stringify({ schemaVersion: 1, attempts: [{ correct: true }] }));
    expect(loadCubeCourseProgress().attempts).toEqual([]);
  });
});

