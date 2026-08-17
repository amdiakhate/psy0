import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { NBackQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { NBackExercise } from './NBackExercise';
import { NBackTip } from './NBackTip';
import { lesson } from './lesson';
import { LEVELS } from './config';

export const nBack: ExerciseModule<NBackQuestion, boolean> = {
  id: 'n-back',
  name: 'M2 Back numérique',
  description:
    'Un chiffre s’affiche 1 s, puis « Oui » ou « Non » pendant 3 s : le chiffre est-il identique à celui de 2 coups avant ? 42 chiffres par série, truffés de répétitions à 1 et 3 coups. Mémoire de travail pure.',
  families: ['Attention', 'Mémorisation'],
  levels: LEVELS.length,
  defaultItemSeconds: 150,
  timed: 'continuous',
  generate,
  validate,
  answerToString: (a) => (a ? 'oui' : 'non'),
  expectedToString: () => '—',
  tips,
  lesson,
  Component: NBackExercise,
  TipsIllustration: NBackTip,
};
