import { loadJson, saveJson } from '../../../core/storage';
import { COURSE_CHAPTERS } from './courseModel';
import type { CubeCourseSkill } from './courseModel';

const STORAGE_KEY = 'cubes-course-v1';
const MAX_ATTEMPTS = 800;

export interface CubeCourseAttempt {
  exerciseId: string;
  chapterId: string;
  skill: CubeCourseSkill;
  correct: boolean;
  answeredAt: string;
}

export interface CubeCourseProgress {
  schemaVersion: 1;
  currentChapterId: string;
  completedScreens: string[];
  attempts: CubeCourseAttempt[];
}

export interface CourseSkillEvaluation {
  skill: CubeCourseSkill;
  attempts: number;
  accuracy: number | null;
  required: number;
  ready: boolean;
}

export interface CourseEvaluation {
  completedChapters: number;
  totalChapters: number;
  skills: CourseSkillEvaluation[];
  courseComplete: boolean;
}

const EMPTY: CubeCourseProgress = {
  schemaVersion: 1,
  currentChapterId: COURSE_CHAPTERS[0].id,
  completedScreens: [],
  attempts: [],
};

const SKILLS: ReadonlyArray<{ skill: CubeCourseSkill; required: number }> = [
  { skill: 'opposites', required: 0.9 },
  { skill: 'adjacency', required: 0.9 },
  { skill: 'belt', required: 0.9 },
  { skill: 'ring', required: 0.8 },
  { skill: 'mirror', required: 0.8 },
  { skill: 'orientation', required: 0.8 },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAttempt(value: unknown): value is CubeCourseAttempt {
  if (!isRecord(value)) return false;
  return typeof value.exerciseId === 'string'
    && typeof value.chapterId === 'string'
    && typeof value.skill === 'string'
    && typeof value.correct === 'boolean'
    && typeof value.answeredAt === 'string'
    && Number.isFinite(Date.parse(value.answeredAt));
}

function normalize(value: unknown): CubeCourseProgress {
  if (!isRecord(value) || value.schemaVersion !== 1) return { ...EMPTY };
  const knownChapter = COURSE_CHAPTERS.some((chapter) => chapter.id === value.currentChapterId);
  return {
    schemaVersion: 1,
    currentChapterId: knownChapter ? value.currentChapterId as string : COURSE_CHAPTERS[0].id,
    completedScreens: Array.isArray(value.completedScreens)
      ? [...new Set(value.completedScreens.filter((entry): entry is string => typeof entry === 'string'))]
      : [],
    attempts: Array.isArray(value.attempts) ? value.attempts.filter(isAttempt).slice(-MAX_ATTEMPTS) : [],
  };
}

export function loadCubeCourseProgress(): CubeCourseProgress {
  return normalize(loadJson<unknown>(STORAGE_KEY, EMPTY));
}

export function saveCubeCourseProgress(progress: CubeCourseProgress): void {
  saveJson(STORAGE_KEY, normalize(progress));
}

export function resetCubeCourseProgress(): void {
  saveCubeCourseProgress({ ...EMPTY });
}

export function recordCubeCourseAttempt(attempt: CubeCourseAttempt): CubeCourseProgress {
  const state = loadCubeCourseProgress();
  const next = { ...state, attempts: [...state.attempts, attempt].slice(-MAX_ATTEMPTS) };
  saveCubeCourseProgress(next);
  return next;
}

export function markCubeCourseScreenComplete(chapterId: string, screenId: string): CubeCourseProgress {
  const state = loadCubeCourseProgress();
  const key = `${chapterId}:${screenId}`;
  const next = {
    ...state,
    currentChapterId: chapterId,
    completedScreens: state.completedScreens.includes(key) ? state.completedScreens : [...state.completedScreens, key],
  };
  saveCubeCourseProgress(next);
  return next;
}

export function chapterAccuracy(progress: CubeCourseProgress, chapterId: string): number | null {
  const chapter = COURSE_CHAPTERS.find((candidate) => candidate.id === chapterId);
  if (!chapter) return null;
  const latestByExercise = new Map<string, CubeCourseAttempt>();
  for (const attempt of progress.attempts.filter((candidate) => candidate.chapterId === chapterId)) {
    latestByExercise.set(attempt.exerciseId, attempt);
  }
  const latest = [...latestByExercise.values()];
  return latest.length === 0 ? null : latest.filter((attempt) => attempt.correct).length / latest.length;
}

export function isChapterComplete(progress: CubeCourseProgress, chapterId: string): boolean {
  const chapter = COURSE_CHAPTERS.find((candidate) => candidate.id === chapterId);
  if (!chapter) return false;
  const attempts = progress.attempts.filter((candidate) => candidate.chapterId === chapterId);
  const latestByExercise = new Map(attempts.map((attempt) => [attempt.exerciseId, attempt]));
  if (latestByExercise.size < chapter.exerciseCount) return false;
  const accuracy = [...latestByExercise.values()].filter((attempt) => attempt.correct).length / latestByExercise.size;
  return accuracy >= chapter.threshold;
}

export function getChapterStatus(progress: CubeCourseProgress, chapterId: string): 'locked' | 'available' | 'complete' {
  const index = COURSE_CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
  if (index < 0) return 'locked';
  if (isChapterComplete(progress, chapterId)) return 'complete';
  if (index === 0 || isChapterComplete(progress, COURSE_CHAPTERS[index - 1].id)) return 'available';
  return 'locked';
}

export function getCourseEvaluation(progress: CubeCourseProgress): CourseEvaluation {
  const skills = SKILLS.map(({ skill, required }) => {
    const observations = progress.attempts.filter((attempt) => attempt.skill === skill).slice(-30);
    const accuracy = observations.length === 0 ? null : observations.filter((attempt) => attempt.correct).length / observations.length;
    return { skill, attempts: observations.length, accuracy, required, ready: accuracy !== null && accuracy >= required };
  });
  const completedChapters = COURSE_CHAPTERS.filter((chapter) => isChapterComplete(progress, chapter.id)).length;
  return {
    completedChapters,
    totalChapters: COURSE_CHAPTERS.length,
    skills,
    courseComplete: completedChapters === COURSE_CHAPTERS.length && skills.every((skill) => skill.ready),
  };
}

