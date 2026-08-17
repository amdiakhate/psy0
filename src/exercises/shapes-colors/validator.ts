import type { Item } from '../../core/types';
import type { ShapesColorsAnswer, ShapesColorsQuestion } from './generator';

/**
 * Exercice continu : la validation se fait par stimulus dans le composant
 * (touche donnée vs `stimulus.key`, tous deux issus de `expectedKey`).
 * Ce validateur n'existe que pour l'interface commune.
 */
export function validate(_item: Item<ShapesColorsQuestion>, _answer: ShapesColorsAnswer): boolean {
  return true;
}
