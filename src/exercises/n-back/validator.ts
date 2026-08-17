import type { Item } from '../../core/types';
import type { NBackQuestion } from './generator';

/**
 * Exercice continu : la validation par position est faite par le composant
 * (réponse pressée vs `expected`). Ce validateur ne sert qu'à l'interface commune.
 */
export function validate(_item: Item<NBackQuestion>, answer: boolean): boolean {
  return answer;
}
