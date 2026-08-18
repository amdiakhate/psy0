import { loadJson, saveJson } from '../core/storage';
import { TECHNIQUES } from './techniques';
import type { Technique } from './techniques';

/**
 * Suivi de maîtrise, technique par technique.
 *
 * Une technique n'est pas « sue » quand elle est comprise : elle l'est quand
 * elle est RAPIDE. C'est pourquoi la maîtrise croise deux exigences, justesse
 * et temps médian — une technique juste mais lente reste à travailler, puisque
 * au test l'hésitation coûte autant que l'erreur.
 *
 * Volontairement séparé du journal d'events des 16 exercices : le calcul mental
 * n'est pas une épreuve du PSY0, il ne doit ni entrer dans les rotations, ni
 * peser sur les priorités, ni produire de stanine.
 */

export const STORAGE_KEY = 'mental';

/** Fenêtre glissante : ce qui compte, c'est où tu en es, pas où tu en étais. */
export const RECENT_WINDOW = 10;
export const MASTERY_MIN_ATTEMPTS = 8;
export const MASTERY_ACCURACY = 0.9;
export const PROGRESS_ACCURACY = 0.7;

export interface Attempt {
  ok: boolean;
  ms: number;
}

export interface TechniqueStat {
  attempts: number;
  correct: number;
  /** Les derniers essais, du plus ancien au plus récent, plafonnés à RECENT_WINDOW. */
  recent: Attempt[];
}

export type MentalProgress = Record<string, TechniqueStat>;

export const EMPTY_STAT: TechniqueStat = { attempts: 0, correct: 0, recent: [] };

export type Mastery = 'neuf' | 'fragile' | 'en-cours' | 'acquis';

export interface MasteryVerdict {
  level: Mastery;
  /** Justesse sur la fenêtre récente, dans [0, 1]. */
  accuracy: number;
  medianMs: number | null;
  /** Juste mais trop lent : le cas qu'il ne faut surtout pas confondre avec « acquis ». */
  tooSlow: boolean;
}

export function record(stat: TechniqueStat, attempt: Attempt): TechniqueStat {
  return {
    attempts: stat.attempts + 1,
    correct: stat.correct + (attempt.ok ? 1 : 0),
    recent: [...stat.recent, attempt].slice(-RECENT_WINDOW),
  };
}

/** Médiane — pas moyenne : un seul essai où l'on part chercher un stylo la ruinerait. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function assess(stat: TechniqueStat, targetMs: number): MasteryVerdict {
  const recent = stat.recent;
  if (recent.length === 0) return { level: 'neuf', accuracy: 0, medianMs: null, tooSlow: false };

  const accuracy = recent.filter((a) => a.ok).length / recent.length;
  // Le temps ne se mesure que sur les essais JUSTES : chronométrer une erreur
  // n'a pas de sens, et une réponse fausse donnée vite gonflerait le score.
  const medianMs = median(recent.filter((a) => a.ok).map((a) => a.ms));
  const fast = medianMs !== null && medianMs <= targetMs;
  const tooSlow = accuracy >= MASTERY_ACCURACY && !fast;

  if (recent.length < 5) return { level: 'neuf', accuracy, medianMs, tooSlow };
  if (recent.length >= MASTERY_MIN_ATTEMPTS && accuracy >= MASTERY_ACCURACY && fast) {
    return { level: 'acquis', accuracy, medianMs, tooSlow: false };
  }
  if (accuracy >= PROGRESS_ACCURACY) return { level: 'en-cours', accuracy, medianMs, tooSlow };
  return { level: 'fragile', accuracy, medianMs, tooSlow };
}

export const MASTERY_LABEL: Record<Mastery, string> = {
  neuf: 'jamais drillée',
  fragile: 'fragile',
  'en-cours': 'en cours',
  acquis: 'acquise',
};

/* ------------------------------------------------------------- persistance */

export function loadProgress(): MentalProgress {
  return loadJson<MentalProgress>(STORAGE_KEY, {});
}

export function statOf(progress: MentalProgress, id: string): TechniqueStat {
  return progress[id] ?? EMPTY_STAT;
}

export function saveAttempt(id: string, attempt: Attempt): MentalProgress {
  const progress = loadProgress();
  const next = { ...progress, [id]: record(statOf(progress, id), attempt) };
  saveJson(STORAGE_KEY, next);
  return next;
}

/** Vue d'ensemble prête à afficher, dans l'ordre du catalogue. */
export function assessAll(progress: MentalProgress): Array<{ technique: Technique; verdict: MasteryVerdict }> {
  return TECHNIQUES.map((technique) => ({
    technique,
    verdict: assess(statOf(progress, technique.id), technique.targetMs),
  }));
}
