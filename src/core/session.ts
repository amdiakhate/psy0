import type { ExerciseId, SessionRecord } from './types';
import { loadJson, saveJson } from './storage';

/** Niveaux adaptatifs persistés par exercice (1-indexés). */
export function getSavedLevel(exercise: ExerciseId): number {
  return loadJson<Record<string, number>>('levels', {})[exercise] ?? 1;
}

export function saveLevel(exercise: ExerciseId, level: number): void {
  const levels = loadJson<Record<string, number>>('levels', {});
  levels[exercise] = level;
  saveJson('levels', levels);
}

/**
 * Difficulté adaptative : +1 après 3 réussites consécutives rapides
 * (rt < médiane du bloc), -1 après 2 échecs consécutifs.
 */
export interface AdaptiveState {
  level: number;
  maxLevel: number;
  streak: number; // réussites rapides consécutives
  fails: number; // échecs consécutifs
  rts: number[];
}

export function initAdaptive(level: number, maxLevel: number): AdaptiveState {
  return { level, maxLevel, streak: 0, fails: 0, rts: [] };
}

export function adaptiveStep(s: AdaptiveState, correct: boolean, rtMs: number): AdaptiveState {
  const rts = [...s.rts, rtMs];
  const sorted = [...rts].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const fast = rts.length < 4 ? correct : rtMs <= median;

  let { level, streak, fails } = s;
  if (correct) {
    fails = 0;
    streak = fast ? streak + 1 : 0;
    if (streak >= 3 && level < s.maxLevel) {
      level += 1;
      streak = 0;
    }
  } else {
    streak = 0;
    fails += 1;
    if (fails >= 2 && level > 1) {
      level -= 1;
      fails = 0;
    }
  }
  return { ...s, level, streak, fails, rts };
}

export function getSessions(): SessionRecord[] {
  return loadJson<SessionRecord[]>('sessions', []);
}

export function saveSession(record: SessionRecord): void {
  const sessions = getSessions();
  sessions.push(record);
  saveJson('sessions', sessions);
}

export function newSessionId(): string {
  return `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
