import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { LogicAnswer, LogicQuestion } from './generator';
import { expectedLabel, validate } from './validator';
import { tips } from './tips';
import { lesson } from './lesson';
import { LogicSeriesExercise } from './LogicSeriesExercise';
import { NUMERIC_RULES } from './config';

export const logicSeries: ExerciseModule<LogicQuestion, LogicAnswer> = {
  id: 'logic-series',
  name: 'Séries logiques',
  description:
    'Séries de 4 ou 5 items — nombres, lettres ou figures — à compléter par un choix parmi 4. Barème officiel : bonne réponse +1, mauvaise −1/3, abstention 0. Ne réponds jamais au hasard.',
  families: ['Intellectuelle'],
  levels: NUMERIC_RULES.length,
  defaultItemSeconds: 30,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => `option ${Number(a) + 1}`,
  expectedToString: (item) => expectedLabel(item.question),
  tips,
  lesson,
  Component: LogicSeriesExercise,
};
