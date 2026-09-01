import { loadJson, saveJson } from '../../../core/storage';
import { COURSE_CHAPTERS } from './courseModel';
import type { CourseFaceId, CubeCourseSkill } from './courseModel';

const STORAGE_KEY = 'cubes-course-v1';
const MAX_ATTEMPTS = 800;
const MAX_MENTAL_RING_ATTEMPTS = 500;
const RING_CHAPTER_ID = 'anneau-des-voisins';

export interface CubeCourseAttempt {
  exerciseId: string;
  chapterId: string;
  skill: CubeCourseSkill;
  correct: boolean;
  answeredAt: string;
}

export type MentalRingAttemptKind = 'right' | 'left' | 'top' | 'bottom' | 'full-ring' | 'mirror';

export interface MentalRingAttempt {
  id: string;
  answeredAt: string;
  centerFaceId: CourseFaceId;
  kind: MentalRingAttemptKind;
  correct: boolean;
  cubeVisibleBeforeAnswer: boolean;
  aidLevel: 1 | 2 | 3;
}

export interface CubeCourseProgress {
  schemaVersion: 2;
  currentChapterId: string;
  completedScreens: string[];
  attempts: CubeCourseAttempt[];
  historicallyCompletedChapterIds: string[];
  mentalRingAttempts: MentalRingAttempt[];
}

export interface CourseSkillEvaluation {
  skill: CubeCourseSkill;
  attempts: number;
  accuracy: number | null;
  required: number;
  ready: boolean;
}

export interface MentalRingMastery {
  mastered: boolean;
  attempts: number;
  correct: number;
  accuracy: number | null;
  distinctFaces: number;
  lastFiveMental: boolean;
}

export interface MentalRingStat {
  kind: MentalRingAttemptKind;
  attempts: number;
  correct: number;
  accuracy: number | null;
}

export interface CourseEvaluation {
  completedChapters: number;
  totalChapters: number;
  skills: CourseSkillEvaluation[];
  mentalRingMastery: MentalRingMastery;
  courseComplete: boolean;
}

const EMPTY: CubeCourseProgress = {
  schemaVersion: 2,
  currentChapterId: COURSE_CHAPTERS[0].id,
  completedScreens: [],
  attempts: [],
  historicallyCompletedChapterIds: [],
  mentalRingAttempts: [],
};

const SKILLS: ReadonlyArray<{ skill: CubeCourseSkill; required: number }> = [
  { skill: 'opposites', required: 0.9 },
  { skill: 'adjacency', required: 0.9 },
  { skill: 'belt', required: 0.9 },
  { skill: 'ring', required: 0.8 },
  { skill: 'mirror', required: 0.8 },
  { skill: 'orientation', required: 0.8 },
];

const MENTAL_KINDS: readonly MentalRingAttemptKind[] = ['right', 'left', 'top', 'bottom', 'full-ring', 'mirror'];
const FACE_IDS: readonly CourseFaceId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

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

function isMentalRingAttempt(value: unknown): value is MentalRingAttempt {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.answeredAt === 'string'
    && Number.isFinite(Date.parse(value.answeredAt))
    && FACE_IDS.includes(value.centerFaceId as CourseFaceId)
    && MENTAL_KINDS.includes(value.kind as MentalRingAttemptKind)
    && typeof value.correct === 'boolean'
    && typeof value.cubeVisibleBeforeAnswer === 'boolean'
    && (value.aidLevel === 1 || value.aidLevel === 2 || value.aidLevel === 3);
}

function normalizedAttempts(value: unknown): CubeCourseAttempt[] {
  return Array.isArray(value) ? value.filter(isAttempt).slice(-MAX_ATTEMPTS) : [];
}

function basicChapterComplete(attempts: readonly CubeCourseAttempt[], chapterId: string): boolean {
  const chapter = COURSE_CHAPTERS.find((candidate) => candidate.id === chapterId);
  if (!chapter) return false;
  const relevant = attempts.filter((candidate) => candidate.chapterId === chapterId);
  const latestByExercise = new Map(relevant.map((attempt) => [attempt.exerciseId, attempt]));
  if (latestByExercise.size < chapter.exerciseCount) return false;
  const accuracy = [...latestByExercise.values()].filter((attempt) => attempt.correct).length / latestByExercise.size;
  return accuracy >= chapter.threshold;
}

function sharedFields(value: Record<string, unknown>) {
  const knownChapter = COURSE_CHAPTERS.some((chapter) => chapter.id === value.currentChapterId);
  return {
    currentChapterId: knownChapter ? value.currentChapterId as string : COURSE_CHAPTERS[0].id,
    completedScreens: Array.isArray(value.completedScreens)
      ? [...new Set(value.completedScreens.filter((entry): entry is string => typeof entry === 'string'))]
      : [],
    attempts: normalizedAttempts(value.attempts),
  };
}

function normalize(value: unknown): CubeCourseProgress {
  if (!isRecord(value)) return { ...EMPTY };
  const common = sharedFields(value);
  if (value.schemaVersion === 1) {
    return {
      schemaVersion: 2,
      ...common,
      historicallyCompletedChapterIds: COURSE_CHAPTERS
        .filter((chapter) => basicChapterComplete(common.attempts, chapter.id))
        .map((chapter) => chapter.id),
      mentalRingAttempts: [],
    };
  }
  if (value.schemaVersion !== 2) return { ...EMPTY };
  const historical = Array.isArray(value.historicallyCompletedChapterIds)
    ? value.historicallyCompletedChapterIds.filter((id): id is string =>
      typeof id === 'string' && COURSE_CHAPTERS.some((chapter) => chapter.id === id))
    : [];
  return {
    schemaVersion: 2,
    ...common,
    historicallyCompletedChapterIds: [...new Set(historical)],
    mentalRingAttempts: Array.isArray(value.mentalRingAttempts)
      ? value.mentalRingAttempts.filter(isMentalRingAttempt).slice(-MAX_MENTAL_RING_ATTEMPTS)
      : [],
  };
}

export function loadCubeCourseProgress(): CubeCourseProgress {
  const raw = loadJson<unknown>(STORAGE_KEY, null);
  const progress = normalize(raw);
  if (isRecord(raw) && raw.schemaVersion === 1) saveJson(STORAGE_KEY, progress);
  return progress;
}

export function saveCubeCourseProgress(progress: CubeCourseProgress): void {
  saveJson(STORAGE_KEY, normalize(progress));
}

export function resetCubeCourseProgress(): void {
  saveCubeCourseProgress({ ...EMPTY, completedScreens: [], attempts: [], historicallyCompletedChapterIds: [], mentalRingAttempts: [] });
}

export function recordCubeCourseAttempt(attempt: CubeCourseAttempt): CubeCourseProgress {
  const state = loadCubeCourseProgress();
  const next = { ...state, attempts: [...state.attempts, attempt].slice(-MAX_ATTEMPTS) };
  saveCubeCourseProgress(next);
  return next;
}

export function recordMentalRingAttempt(attempt: MentalRingAttempt): CubeCourseProgress {
  if (!isMentalRingAttempt(attempt)) throw new Error('Tentative Anneau de tête invalide');
  const state = loadCubeCourseProgress();
  const next = {
    ...state,
    mentalRingAttempts: [...state.mentalRingAttempts, attempt].slice(-MAX_MENTAL_RING_ATTEMPTS),
  };
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

export function getMentalRingMastery(progress: CubeCourseProgress): MentalRingMastery {
  const window = progress.mentalRingAttempts.slice(-20);
  const correct = window.filter((attempt) => attempt.correct).length;
  const accuracy = window.length === 0 ? null : correct / window.length;
  const distinctFaces = new Set(window.map((attempt) => attempt.centerFaceId)).size;
  const lastFiveMental = window.length >= 5 && window.slice(-5).every((attempt) => !attempt.cubeVisibleBeforeAnswer);
  return {
    mastered: window.length >= 12 && accuracy !== null && accuracy >= 0.8 && distinctFaces >= 4 && lastFiveMental,
    attempts: window.length,
    correct,
    accuracy,
    distinctFaces,
    lastFiveMental,
  };
}

export function getMentalRingStats(progress: CubeCourseProgress): MentalRingStat[] {
  return MENTAL_KINDS.map((kind) => {
    const attempts = progress.mentalRingAttempts.filter((attempt) => attempt.kind === kind).slice(-30);
    const correct = attempts.filter((attempt) => attempt.correct).length;
    return { kind, attempts: attempts.length, correct, accuracy: attempts.length === 0 ? null : correct / attempts.length };
  });
}

export function isChapterComplete(progress: CubeCourseProgress, chapterId: string): boolean {
  if (progress.historicallyCompletedChapterIds.includes(chapterId)) return true;
  if (!basicChapterComplete(progress.attempts, chapterId)) return false;
  return chapterId !== RING_CHAPTER_ID || getMentalRingMastery(progress).mastered;
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
  const mentalRingMastery = getMentalRingMastery(progress);
  return {
    completedChapters,
    totalChapters: COURSE_CHAPTERS.length,
    skills,
    mentalRingMastery,
    courseComplete: completedChapters === COURSE_CHAPTERS.length
      && skills.every((skill) => skill.ready)
      && mentalRingMastery.mastered,
  };
}
