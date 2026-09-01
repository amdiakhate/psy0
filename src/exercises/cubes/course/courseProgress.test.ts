import { beforeEach, describe, expect, it } from 'vitest';
import { COURSE_CHAPTERS } from './courseModel';
import {
  getMentalRingMastery,
  getChapterStatus,
  isChapterComplete,
  loadCubeCourseProgress,
  recordCubeCourseAttempt,
  recordMentalRingAttempt,
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
    expect(loadCubeCourseProgress()).toMatchObject({ schemaVersion: 2, attempts: [], mentalRingAttempts: [] });
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

  it('migre une validation historique du chapitre 6 sans acquérir Anneau de tête', () => {
    const chapter = COURSE_CHAPTERS[5];
    const attempts = Array.from({ length: chapter.exerciseCount }, (_, index) => ({
      exerciseId: `${chapter.id}-${index + 1}`,
      chapterId: chapter.id,
      skill: 'ring',
      correct: true,
      answeredAt: new Date(2026, 7, 30, 10, index).toISOString(),
    }));
    localStorage.setItem('psy0.cubes-course-v1', JSON.stringify({
      schemaVersion: 1,
      currentChapterId: COURSE_CHAPTERS[6].id,
      completedScreens: [],
      attempts,
    }));

    const migrated = loadCubeCourseProgress();
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.historicallyCompletedChapterIds).toContain(chapter.id);
    expect(getMentalRingMastery(migrated).mastered).toBe(false);
    expect(getChapterStatus(migrated, chapter.id)).toBe('complete');
    expect(getChapterStatus(migrated, COURSE_CHAPTERS[6].id)).toBe('available');
    expect(JSON.parse(localStorage.getItem('psy0.cubes-course-v1') ?? '{}').schemaVersion).toBe(2);
  });

  it('exige 12 tentatives récentes, 80 %, quatre faces et cinq réponses sans aide', () => {
    resetCubeCourseProgress();
    const faces = ['A', 'B', 'C', 'D'] as const;
    for (let index = 0; index < 12; index += 1) {
      recordMentalRingAttempt({
        id: `mental-${index}`,
        answeredAt: new Date(2026, 8, 1, 8, index).toISOString(),
        centerFaceId: faces[index % faces.length],
        kind: 'full-ring',
        correct: index !== 0 && index !== 1,
        cubeVisibleBeforeAnswer: index < 7,
        aidLevel: index < 7 ? 1 : 3,
      });
    }
    const mastery = getMentalRingMastery(loadCubeCourseProgress());
    expect(mastery).toMatchObject({ mastered: true, attempts: 12, correct: 10, distinctFaces: 4, lastFiveMental: true });
  });

  it('refuse la maîtrise si la diversité ou les cinq dernières réponses mentales manquent', () => {
    resetCubeCourseProgress();
    for (let index = 0; index < 12; index += 1) {
      recordMentalRingAttempt({
        id: `guided-${index}`,
        answeredAt: new Date(2026, 8, 1, 9, index).toISOString(),
        centerFaceId: index % 2 === 0 ? 'A' : 'B',
        kind: 'full-ring',
        correct: true,
        cubeVisibleBeforeAnswer: index === 11,
        aidLevel: index === 11 ? 1 : 3,
      });
    }
    expect(getMentalRingMastery(loadCubeCourseProgress())).toMatchObject({ mastered: false, distinctFaces: 2, lastFiveMental: false });
  });

  it('demande Anneau de tête aux nouveaux utilisateurs pour compléter le chapitre 6', () => {
    resetCubeCourseProgress();
    const chapter = COURSE_CHAPTERS[5];
    for (let index = 0; index < chapter.exerciseCount; index += 1) {
      recordCubeCourseAttempt({ exerciseId: `${chapter.id}-${index + 1}`, chapterId: chapter.id, skill: 'ring', correct: true, answeredAt: new Date(2026, 8, 1, 10, index).toISOString() });
    }
    expect(isChapterComplete(loadCubeCourseProgress(), chapter.id)).toBe(false);
  });
});
