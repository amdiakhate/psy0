import type { EnglishBank } from './data';

export interface EnglishLevel {
  banks: EnglishBank[];
  minDifficulty: number;
  maxDifficulty: number;
}

export const LEVELS: EnglishLevel[] = [
  { banks: ['grammar', 'vocab-general'], minDifficulty: 1, maxDifficulty: 2 },
  { banks: ['grammar', 'vocab-general'], minDifficulty: 1, maxDifficulty: 3 },
  { banks: ['grammar', 'vocab-general', 'vocab-aviation'], minDifficulty: 1, maxDifficulty: 4 },
  { banks: ['grammar', 'vocab-general', 'vocab-aviation', 'comprehension'], minDifficulty: 2, maxDifficulty: 4 },
  { banks: ['grammar', 'vocab-general', 'vocab-aviation', 'comprehension'], minDifficulty: 3, maxDifficulty: 5 },
];
