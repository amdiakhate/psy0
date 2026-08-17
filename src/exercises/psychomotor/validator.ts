import type { Item } from '../../core/types';
import type { PsyQuestion } from './generator';

/**
 * Exercice continu : le scoring (fenêtres de poursuite + tâches secondaires)
 * est fait par le composant. Ce validateur ne sert qu'à l'interface commune.
 */
export function validate(_item: Item<PsyQuestion>, _answer: string): boolean {
  return true;
}
