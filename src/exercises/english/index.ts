import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { EnglishAnswer, EnglishQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { lesson } from './lesson';
import { EnglishExercise } from './EnglishExercise';
import { LEVELS } from './config';

export const english: ExerciseModule<EnglishQuestion, EnglishAnswer> = {
  id: 'english',
  name: 'Anglais présélection cadets',
  description:
    'QCM d\'anglais type présélection : grammaire, vocabulaire courant, vocabulaire aviation et compréhension de phrases.',
  families: ['Anglais'],
  levels: LEVELS.length,
  defaultItemSeconds: 15, // Pilotest : 30 QCM en 7 min 30 = 15 s par question
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => String(a + 1),
  expectedToString: (item) => item.question.options[item.question.correctIndex],
  tips: {
    ...tips,
    examples: [
      {
        title: 'Grammaire : le marqueur de temps décide, pas l’oreille',
        seed: 3,
        level: 2,
        walkthrough: [
          'Cherche d’abord le marqueur temporel ou structurel dans la phrase (last week, since, every day, yet…) : c’est lui qui impose la forme, pas ce qui « sonne bien ».',
          'Élimine les options grammaticalement impossibles avec ce marqueur — il en tombe généralement deux d’un coup.',
          'Entre les deux restantes, choisis la plus simple qui satisfait le marqueur : les distracteurs du test sont des formes plausibles mais incompatibles avec le contexte.',
        ],
      },
    ],
  },
  lesson,
  Component: EnglishExercise,
};
