import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { AirwaysQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { AirwaysExercise } from './AirwaysExercise';
import { AirwaysTip } from './AirwaysTip';
import { lesson } from './lesson';
import { LEVELS } from './config';

export const airways: ExerciseModule<AirwaysQuestion, string> = {
  id: 'airways',
  name: 'Airways',
  description:
    'Gestion de flux : les bleus vont à gauche, les violets à droite. Déroute le moins d’avions possible sans jamais dépasser 4 avions (dont 2 bleus max) dans la zone grise de chaque groupe — sinon accident.',
  families: ['Attention', 'Intellectuelle'],
  levels: LEVELS.length,
  defaultItemSeconds: 45,
  timed: 'continuous',
  generate,
  validate,
  answerToString: (a) => a,
  expectedToString: () => '—',
  tips,
  Component: AirwaysExercise,
  TipsIllustration: AirwaysTip,
  lesson,
};
