import type { ExerciseModule } from '../../core/types';
import { generate, expectedSequence } from './generator';
import type { WordSkipAnswer, WordSkipQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { WordSkipExercise } from './WordSkipExercise';
import { lesson } from './lesson';
import { LEVELS } from './config';

export const wordSkip: ExerciseModule<WordSkipQuestion, WordSkipAnswer> = {
  id: 'word-skip',
  name: 'Un mot sur deux',
  description:
    'Des mots de deux thématiques sont donnés en désordre. En partant du mot marqué START, clique alternativement un mot de chaque thématique, en respectant l’ordre alphabétique à l’intérieur de chaque thématique. Toute erreur renvoie au début de la série.',
  families: ['Attention', 'Spatiale', 'Verbale'],
  levels: LEVELS.length,
  defaultItemSeconds: 25,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => a,
  expectedToString: (item) => expectedSequence(item.question),
  tips,
  lesson,
  Component: WordSkipExercise,
};
