import type { ExerciseId, ExerciseModule } from '../core/types';
import { oddEven } from './odd-even';
import { nBack } from './n-back';
import { calcGrid } from './calc-grid';
import { psychomotor } from './psychomotor';
import { wordSkip } from './word-skip';
import { shapesColors } from './shapes-colors';
import { cubes } from './cubes';
import { objects3d } from './objects-3d';
import { airways } from './airways';
import { logicSeries } from './logic-series';
import { wordBoxes } from './word-boxes';
import { starWords } from './star-words';
import { english } from './english';
import { stacking } from './stacking';
import { marbles } from './marbles';
import { slidingShapes } from './sliding-shapes';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyExerciseModule = ExerciseModule<any, any>;

/** Registre central — le moteur de session est agnostique, il ne connaît que cette liste. */
/** Les 16 exercices, dans l'ordre de la spec PSY0. */
export const EXERCISES: AnyExerciseModule[] = [
  wordSkip,
  oddEven,
  nBack,
  shapesColors,
  airways,
  psychomotor,
  stacking,
  objects3d,
  marbles,
  slidingShapes,
  cubes,
  calcGrid,
  logicSeries,
  wordBoxes,
  starWords,
  english,
];

export function getExercise(id: ExerciseId): AnyExerciseModule {
  const module_ = EXERCISES.find((e) => e.id === id);
  if (!module_) throw new Error(`Exercice inconnu ou non encore implémenté : ${id}`);
  return module_;
}

export function hasExercise(id: ExerciseId): boolean {
  return EXERCISES.some((e) => e.id === id);
}
