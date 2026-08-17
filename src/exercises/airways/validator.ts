import type { Item } from '../../core/types';
import type { AirwaysQuestion } from './generator';

/**
 * Exercice continu : le scoring (flux écoulé, accidents, efficacité des
 * déroutages) est fait par le composant. Stub pour l'interface commune.
 */
export function validate(_item: Item<AirwaysQuestion>, _answer: string): boolean {
  return true;
}
