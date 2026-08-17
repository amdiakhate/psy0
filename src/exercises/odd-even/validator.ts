import type { Item } from '../../core/types';
import { expectedSequence } from './generator';
import type { OddEvenAnswer, OddEvenQuestion } from './generator';

/**
 * L'item n'est réussi que si la chaîne a été reconstituée SANS aucune reprise :
 * la séquence remontée par le composant contient tous les clics, fautes
 * comprises.
 */
export function validate(item: Item<OddEvenQuestion>, answer: OddEvenAnswer): boolean {
  return answer === expectedSequence(item.question);
}
