import { loadJson, saveJson } from '../../../core/storage';
import type { AttemptResultContext } from '../../../core/types';
import type { CubesAnswer, CubesQuestion } from '../generator';
import { solutionAnswer } from '../generator';
import type { CubeErrorCause } from '../domain/cubeAnalysis';
import { analyzeCubeAttempt } from '../domain/cubeAnalysis';
import type { CubeDrillQuestion, CubeDrillType } from '../domain/cubeDrills';
import { quarterTurn } from '../domain/types';

export type CubeSkill =
  | 'opposites'
  | 'adjacency'
  | 'deductive-placement'
  | 'two-candidates-ring'
  | 'mirror'
  | 'rotation-90'
  | 'rotation-180'
  | 'full-puzzle';

export interface CubeSkillResult {
  skill: CubeSkill;
  correct: boolean;
}

export interface CubeAttemptRecord {
  id: string;
  answeredAt: string;
  sessionId?: string;
  mode: 'full' | 'guided' | 'drill';
  drillType?: CubeDrillType;
  seed: number;
  level: number;
  durationMs: number;
  correct: boolean;
  /** Instantané sérialisable. `null` reste accepté pour les anciens tests/imports. */
  question: unknown;
  answer: unknown;
  solution: unknown;
  errorCauses: CubeErrorCause[];
  skills: CubeSkillResult[];
}

export interface CubeCoachStorageV1 {
  schemaVersion: 1;
  attempts: CubeAttemptRecord[];
}

const EMPTY: CubeCoachStorageV1 = { schemaVersion: 1, attempts: [] };
const MAX_ATTEMPTS = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const VALID_SKILLS = new Set<CubeSkill>([
  'opposites',
  'adjacency',
  'deductive-placement',
  'two-candidates-ring',
  'mirror',
  'rotation-90',
  'rotation-180',
  'full-puzzle',
]);

const VALID_CAUSES = new Set<CubeErrorCause>([
  'WRONG_OPPOSITE',
  'WRONG_ADJACENCY',
  'MIRROR_ORDER',
  'WRONG_ROTATION_90',
  'WRONG_ROTATION_180',
  'SWAPPED_OPPOSITE_PAIR',
  'CORRECT_FACE_WRONG_ORIENTATION',
  'FACE_CORRECT_BY_ELIMINATION',
]);

const VALID_DRILL_TYPES = new Set<CubeDrillType>([
  'opposites', 'adjacency', 'rings', 'mirror', 'rotation', 'full-puzzle', 'two-remaining', 'orientation-only',
]);

function isSkillResult(value: unknown): value is CubeSkillResult {
  return isRecord(value) && VALID_SKILLS.has(value.skill as CubeSkill) && typeof value.correct === 'boolean';
}

function isAttempt(value: unknown): value is CubeAttemptRecord {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.answeredAt === 'string' && Number.isFinite(Date.parse(value.answeredAt)) &&
    (value.mode === 'full' || value.mode === 'guided' || value.mode === 'drill') &&
    (value.sessionId === undefined || typeof value.sessionId === 'string') &&
    (value.drillType === undefined || VALID_DRILL_TYPES.has(value.drillType as CubeDrillType)) &&
    typeof value.seed === 'number' && Number.isFinite(value.seed) &&
    typeof value.level === 'number' && Number.isFinite(value.level) &&
    typeof value.durationMs === 'number' && Number.isFinite(value.durationMs) && value.durationMs >= 0 &&
    typeof value.correct === 'boolean' &&
    Array.isArray(value.skills) && value.skills.every(isSkillResult) &&
    Array.isArray(value.errorCauses) && value.errorCauses.every((cause) => VALID_CAUSES.has(cause as CubeErrorCause))
  );
}

export function loadCubeCoachState(): CubeCoachStorageV1 {
  const raw = loadJson<unknown>('cubes-coach', EMPTY);
  if (!isRecord(raw) || raw.schemaVersion !== 1 || !Array.isArray(raw.attempts)) return { ...EMPTY };
  return { schemaVersion: 1, attempts: raw.attempts.filter(isAttempt) };
}

export function appendCubeAttempt(attempt: CubeAttemptRecord): boolean {
  try {
    const state = loadCubeCoachState();
    saveJson('cubes-coach', { schemaVersion: 1, attempts: [...state.attempts, attempt].slice(-MAX_ATTEMPTS) });
    return true;
  } catch {
    return false;
  }
}

export function skillsForCubeDrill(question: CubeDrillQuestion, correct: boolean): CubeSkillResult[] {
  if (question.type === 'opposites') return [{ skill: 'opposites', correct }];
  if (question.type === 'adjacency') return [{ skill: 'adjacency', correct }];
  if (question.type === 'rings' || question.type === 'two-remaining') return [{ skill: 'two-candidates-ring', correct }];
  if (question.type === 'mirror') return [{ skill: 'mirror', correct }];
  if (question.type === 'rotation') {
    if (question.answer.choiceId === '0') return [];
    return [{ skill: question.answer.choiceId === '2' ? 'rotation-180' : 'rotation-90', correct }];
  }
  if (question.type === 'orientation-only') {
    const skills = new Set<'rotation-90' | 'rotation-180'>();
    for (const position of question.orientationTargets) {
      const correction = quarterTurn(question.answer.rotations[position] - question.displayedRotations[position]);
      skills.add(correction === 2 ? 'rotation-180' : 'rotation-90');
    }
    return [...skills].map((skill) => ({ skill, correct }));
  }
  return [{ skill: 'full-puzzle', correct }];
}

function uniqueSkills(results: CubeSkillResult[]): CubeSkillResult[] {
  const latest = new Map<CubeSkill, boolean>();
  for (const result of results) latest.set(result.skill, result.correct);
  return [...latest].map(([skill, correct]) => ({ skill, correct }));
}

function measuredSkills(question: CubesQuestion, answer: CubesAnswer, correct: boolean): CubeSkillResult[] {
  const analysis = analyzeCubeAttempt(question, answer);
  const pathKinds = new Set(analysis.reasoningPath.minimalSteps.map((step) => step.kind));
  const placementsCorrect = analysis.incorrectFaces.every((face) => face.identityCorrect);
  const results: CubeSkillResult[] = [{ skill: 'full-puzzle', correct }];

  if (pathKinds.has('opposite-deduction')) {
    results.push({ skill: 'opposites', correct: analysis.oppositePairs.every((pair) => pair.valid) });
    results.push({ skill: 'deductive-placement', correct: placementsCorrect });
  }
  if (analysis.adjacencyErrors.length > 0) results.push({ skill: 'adjacency', correct: false });
  if (pathKinds.has('two-candidates') || pathKinds.has('ring-comparison')) {
    results.push({
      skill: 'two-candidates-ring',
      correct: placementsCorrect && analysis.circularOrderErrors.length === 0,
    });
    results.push({ skill: 'mirror', correct: !analysis.mirrorDetected && placementsCorrect });
  }

  for (const step of analysis.reasoningPath.minimalSteps) {
    if (step.kind !== 'orientation-anchor') continue;
    const error = analysis.orientationErrors.find((candidate) => candidate.position === step.position);
    results.push({
      skill: step.pieceTurn === 2 ? 'rotation-180' : 'rotation-90',
      correct: error === undefined,
    });
  }
  return uniqueSkills(results);
}

export function recordCubeFullAttempt(
  context: AttemptResultContext<CubesQuestion, CubesAnswer>,
): void {
  const answer = context.answer;
  const analysis = answer ? analyzeCubeAttempt(context.item.question, answer) : null;
  const errorCauses = analysis
    ? [...new Set([
        ...analysis.incorrectFaces.flatMap((face) => (face.primaryCause ? [face.primaryCause] : [])),
        ...analysis.orientationErrors.map((error) => error.cause),
      ])]
    : [];
  const skills = answer
    ? measuredSkills(context.item.question, answer, context.correct)
    : [{ skill: 'full-puzzle' as const, correct: false }];

  appendCubeAttempt({
    id: `cube-${context.sessionId}-${context.item.seed}-${Date.now()}`,
    answeredAt: new Date().toISOString(),
    sessionId: context.sessionId,
    mode: 'full',
    seed: context.item.seed,
    level: context.item.level,
    durationMs: Math.round(context.rtMs),
    correct: context.correct,
    question: context.item.question,
    answer: answer ?? null,
    solution: solutionAnswer(context.item.question),
    errorCauses,
    skills,
  });
}
