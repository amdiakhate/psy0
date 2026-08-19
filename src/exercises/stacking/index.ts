import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { StackingAnswer, StackingQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { hint } from './hint';
import { lesson } from './lesson';
import { StackingExplain } from './Explain';
import { StackingExercise } from './StackingExercise';
import { Stacking3DTip } from './Stacking3DTip';
import { LEVELS } from './config';

export const stacking: ExerciseModule<StackingQuestion, StackingAnswer> = {
  id: 'stacking',
  name: 'Empilements',
  description:
    'Trois empilements de cubes : deux sont identiques à une rotation près, le troisième a subi une symétrie. Trouve le symétrique.',
  families: ['Spatiale'],
  levels: LEVELS.length,
  defaultItemSeconds: 10,
  /** Pilotest : 20 questions, 10 s chacune. */
  itemLimitSec: 10,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => `empilement ${a + 1}`,
  expectedToString: (item) => `empilement ${item.question.answerIndex + 1}`,
  tips: {
    ...tips,
    examples: [
      {
        title: 'Vues proches : apparier avant de désigner',
        seed: 7,
        level: 2,
        forceTag: 'easy-orientation',
        walkthrough: [
          'Deux des trois vues ne sont séparées que d’un quart de tour : commence par les repérer, ce sont les candidates naturelles à la paire — mais ce n’est pas une preuve, deux vues proches peuvent être un original et son miroir.',
          'Applique la signature : bras le plus long orienté vers toi, décrochage à DROITE ou à GAUCHE. Note la main des trois empilements — deux partagent la même.',
          'Le troisième, celui de main opposée, est le symétrique. Contre-épreuve express : superpose mentalement les deux bras de même main, leurs décrochages doivent tomber du même côté.',
        ],
      },
      {
        title: 'Vues très éloignées : passer par la formule verbale',
        seed: 21,
        level: 5,
        forceTag: 'hard-orientation',
        walkthrough: [
          'Ici aucune vue n’est proche d’une autre (au moins 120° d’écart deux à deux) : la comparaison image contre image est perdue d’avance, la rotation mentale coûterait 20 s.',
          'Convertis chaque empilement en une phrase : longueur du bras principal, position du décrochage, sens du dernier cube. Trois phrases, deux identiques.',
          'Réponds sur la phrase minoritaire. Ne relis pas la figure : à cette difficulté, la relecture d’image fait perdre la formule déjà construite.',
        ],
      },
    ],
  },
  lesson,
  hint,
  Explain: StackingExplain,
  Component: StackingExercise,
  TipsIllustration: Stacking3DTip,
};
