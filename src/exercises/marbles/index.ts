import type { ExerciseModule } from '../../core/types';
import { generate, validate } from './generator';
import type { MarblesQuestion } from './generator';
import { tips } from './tips';
import { hint } from './hint';
import { MarblesExplain } from './Explain';
import { lesson } from './lesson';
import { MarblesExercise } from './MarblesExercise';
import { LEVELS } from './config';

export const marbles: ExerciseModule<MarblesQuestion, string> = {
  id: 'marbles',
  name: 'Billes',
  description:
    'Trois tubes en U (capacités 3, 2, 3). Compte le nombre MINIMUM de déplacements pour passer de la disposition de départ à celle d’arrivée — une bille se prend et se pose toujours sur le dessus.',
  families: ['Spatiale', 'Intellectuelle'],
  levels: LEVELS.length,
  defaultItemSeconds: 40,
  /** Pilotest : 20 questions, 40 s chacune. */
  itemLimitSec: 40,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => a,
  expectedToString: (item) => String(item.question.answer),
  tips: {
    ...tips,
    examples: [
      {
        title: 'Compter le plancher, puis chercher les bloquantes',
        seed: 4,
        level: 2,
        walkthrough: [
          'Compare les tubes de bas en haut : identifie les billes déjà à leur place finale (elles ne bougeront jamais) et celles qui sont mal placées.',
          'Le nombre de billes mal placées est ton PLANCHER : la réponse ne peut pas être inférieure.',
          'Ajoute 2 déplacements pour chaque bille bien placée posée SUR une bille à extraire (elle doit sortir puis revenir), puis confirme d’une simulation rapide en respectant les capacités 3 / 2 / 3.',
        ],
      },
    ],
  },
  lesson,
  hint,
  Explain: MarblesExplain,
  Component: MarblesExercise,
};
