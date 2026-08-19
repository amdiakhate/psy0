import type { ExerciseModule } from '../../core/types';
import { generate, validate } from './generator';
import type { CalcQuestion } from './generator';
import { tips } from './tips';
import { hint } from './hint';
import { CalcGridExercise } from './CalcGridExercise';
import { lesson } from './lesson';
import { LEVELS } from './config';

export const calcGrid: ExerciseModule<CalcQuestion, number[]> = {
  id: 'calc-grid',
  name: 'Grilles de calculs',
  description:
    'Une grille de 9 calculs, dont 0 à 4 sont faux : repère les faux et valide. Chrono serré (45 s par grille au test).',
  families: ['Numérique'],
  levels: LEVELS.length,
  defaultItemSeconds: 45,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => (a.length === 0 ? 'aucune erreur' : a.map((i) => i + 1).join(', ')),
  expectedToString: (item) =>
    item.question.wrongIndices.length === 0
      ? 'aucune erreur'
      : item.question.wrongIndices.map((i) => i + 1).join(', '),
  tips: {
    ...tips,
    examples: [
      {
        title: 'Balayer une grille : contrôle par les unités',
        seed: 11,
        level: 3,
        walkthrough: [
          'Ne recalcule pas les 9 opérations : vérifie d’abord le CHIFFRE DES UNITÉS de chaque résultat (7+6 finit forcément par 3). Une unité qui ne colle pas = erreur trouvée en une seconde.',
          'Deuxième passe sur les rescapés : contrôle l’ordre de grandeur (48 × 6 ≈ 300). Les faux plausibles sont souvent à ±10 — d’où la troisième passe.',
          'Troisième passe uniquement sur les calculs suspects restants : recalcule-les vraiment. Puis valide — même si tu n’as trouvé aucune erreur, c’est une réponse possible.',
        ],
      },
    ],
  },
  lesson,
  hint,
  Component: CalcGridExercise,
};
