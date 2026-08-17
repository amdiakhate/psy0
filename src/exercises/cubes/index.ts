import type { ExerciseModule } from '../../core/types';
import { generate, validate } from './generator';
import type { CubesAnswer, CubesQuestion } from './generator';
import { tips } from './tips';
import { lesson } from './lesson';
import { CubesExercise } from './CubesExercise';
import { Cube3DTip } from './Cube3DTip';
import { LEVELS } from './config';

export const cubes: ExerciseModule<CubesQuestion, CubesAnswer> = {
  id: 'cubes',
  name: 'Cubes 2D/3D',
  description:
    'Un patron de cube complet à gauche, un patron à faces manquantes à droite : replace les bonnes faces (parfois à retourner) pour reconstituer le même cube.',
  families: ['Spatiale'],
  levels: LEVELS.length,
  defaultItemSeconds: 60,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) =>
    Object.entries(a)
      .map(([hole, p]) => `${hole}:${p.pieceId}${p.flipped ? '⇄' : ''}`)
      .join(' '),
  expectedToString: (item) =>
    item.question.holes.map((h) => `${h}:${item.question.solution[h]}`).join(' '),
  tips,
  lesson,
  Component: CubesExercise,
  TipsIllustration: Cube3DTip,
};
