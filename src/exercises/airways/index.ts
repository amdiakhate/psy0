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
  pilotestUrl: 'https://www.pilotest.com/fr/tests/airways',
  name: 'Airways',
  description:
    'Optimisation de flux, 10 séries. Les bleus vont à gauche, les violets à droite. Ferme le moins de voies possible sans jamais dépasser 4 avions (dont 2 bleus) dans la bande grise d’un groupe — sinon accident. Chaque fermeture coûte des points.',
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
