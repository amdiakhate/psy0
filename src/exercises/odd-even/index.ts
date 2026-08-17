import type { ExerciseModule } from '../../core/types';
import { generate, expectedSequence } from './generator';
import type { OddEvenAnswer, OddEvenQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { OddEvenExercise } from './OddEvenExercise';
import { lesson } from './lesson';
import { LEVELS } from './config';

export const oddEven: ExerciseModule<OddEvenQuestion, OddEvenAnswer> = {
  id: 'odd-even',
  name: 'Pair ou impair',
  description:
    'Des nombres sont donnés en désordre. En partant de celui marqué START, clique alternativement un nombre pair puis un nombre impair, en respectant l’ordre croissant dans les deux catégories. Toute erreur renvoie au début de la série.',
  families: ['Attention', 'Spatiale', 'Numérique'],
  levels: LEVELS.length,
  defaultItemSeconds: 25,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => a,
  expectedToString: (item) => expectedSequence(item.question),
  tips,
  lesson,
  Component: OddEvenExercise,
};
