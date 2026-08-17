import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { ShapesColorsAnswer, ShapesColorsQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { ShapesColorsExercise } from './ShapesColorsExercise';
import { ShapesColorsTip } from './ShapesColorsTip';
import { lesson } from './lesson';
import { LEVELS } from './config';

export const shapesColors: ExerciseModule<ShapesColorsQuestion, ShapesColorsAnswer> = {
  id: 'shapes-colors',
  name: 'Formes et couleurs',
  description:
    'Deux règles en cascade annoncées avant la série : le remplissage (vide/rempli) décide quel critère — couleur ou forme — commande la touche N ou X. 30 formes défilent, chacune visible 0,5 s seulement : tu réponds sur l’écran vide.',
  families: ['Attention'],
  levels: LEVELS.length,
  defaultItemSeconds: 90,
  timed: 'continuous',
  generate,
  validate,
  answerToString: (a) => a,
  expectedToString: () => '—',
  tips,
  lesson,
  Component: ShapesColorsExercise,
  TipsIllustration: ShapesColorsTip,
};
