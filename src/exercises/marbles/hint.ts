import type { Hint, Item } from '../../core/types';
import type { MarblesQuestion } from './generator';

/**
 * Astuce des Billes.
 *
 * Elle donne la MÉTHODE de comptage, jamais un compte. Une version antérieure
 * annonçait le plancher — le nombre de billes hors de leur tube d'arrivée — ce
 * qui paraissait anodin : mais quand aucune bille n'en coiffe une autre, ce
 * plancher EST la réponse. L'astuce répondait donc à la place du candidat sur
 * tous les items faciles, et lui apprenait à attendre le chiffre au lieu de le
 * chercher.
 */
export function hint(item: Item<MarblesQuestion>): Hint | null {
  void item;
  return {
    where:
      'Ne simule pas les déplacements : compte. Chaque bille qui n’est pas dans son tube d’arrivée coûte au minimum un coup.',
    step:
      'Deux comptes, dans cet ordre. Un : les billes qui changent de tube — c’est ton plancher. Deux : les billes BIEN placées posées sur une mal placée — chacune coûte deux coups de plus, parce qu’il faut la sortir puis la remettre. C’est ce second compte que tout le monde oublie.',
  };
}
