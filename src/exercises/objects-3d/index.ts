import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { Objects3dAnswer, Objects3dQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { Objects3dExercise } from './Objects3dExercise';
import { DesertTip } from './DesertTip';
import { lesson } from './lesson';
import { LEVELS } from './config';

export const objects3d: ExerciseModule<Objects3dQuestion, Objects3dAnswer> = {
  id: 'objects-3d',
  name: 'Objets 3D',
  description:
    'Une scène d’objets posés dans le désert : retrouve lequel des 8 points de vue disposés en cercle l’a produite.',
  families: ['Spatiale'],
  levels: LEVELS.length,
  defaultItemSeconds: 10,
  /** Pilotest : 20 questions, 10 s chacune. */
  itemLimitSec: 10,
  timed: 'per-item',
  generate,
  validate,
  answerToString: (a) => `point de vue ${a + 1}`,
  expectedToString: (item) => `point de vue ${item.question.viewpoint + 1}`,
  tips: {
    ...tips,
    examples: [
      {
        title: 'Disposition étalée : deux découpes suffisent',
        seed: 11,
        level: 2,
        forceTag: 'spread-layout',
        walkthrough: [
          'Sur le plan, repère les deux objets les plus éloignés l’un de l’autre : ils forment un axe qui coupe les 8 ronds en deux moitiés, celle qui voit le premier à gauche et celle qui voit l’inverse.',
          'Lis la vue : note lequel de ces deux objets est à gauche de l’autre. Quatre ronds tombent d’un coup. Recommence avec un troisième objet — il reste un, parfois deux ronds.',
          'Si deux ronds survivent, ils sont opposés : départage-les par la profondeur (l’objet dont le PIED est le plus bas dans l’image est le plus proche du rond cherché).',
        ],
      },
      {
        title: 'Disposition symétrique, 3 objets : le piège du rond opposé',
        seed: 4,
        level: 5,
        forceTag: 'symmetric-layout',
        walkthrough: [
          'Trois objets quasi en triangle régulier : aucune forme ne « saute aux yeux », seule la relation entre objets porte l’information. Ne cherche pas de détail dans l’image.',
          'Applique quand même l’axe : les deux objets les plus écartés donnent un ordre gauche→droite. Attention, ici l’erreur classique est de retenir le rond opposé, qui voit exactement l’ordre inverse.',
          'Contrôle final obligatoire par la profondeur : l’objet le plus bas dans l’image doit être, sur le plan, celui du même côté que le rond que tu as choisi. Si ce n’est pas le cas, prends son opposé (rond n+4).',
        ],
      },
    ],
  },
  lesson,
  Component: Objects3dExercise,
  TipsIllustration: DesertTip,
};
