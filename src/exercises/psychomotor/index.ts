import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { PsyQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { lesson } from './lesson';
import { PsychomotorExercise } from './PsychomotorExercise';
import { PsychomotorTip } from './PsychomotorTip';
import { LEVELS } from './config';

export const psychomotor: ExerciseModule<PsyQuestion, string> = {
  id: 'psychomotor',
  name: 'Psychomoteur',
  description:
    'Trois tâches de front pendant 5 minutes : maintenir la flèche du sens de déplacement du cercle, appuyer sur Espace quand les deux formes sont identiques, sur F quand le calcul entouré est faux. L’épreuve reine du PSY0.',
  families: ['Attention', 'Psychomoteur'],
  levels: LEVELS.length,
  defaultItemSeconds: 300,
  timed: 'continuous',
  generate,
  validate,
  answerToString: (a) => a,
  expectedToString: () => '—',
  tips,
  lesson,
  Component: PsychomotorExercise,
  TipsIllustration: PsychomotorTip,
};
