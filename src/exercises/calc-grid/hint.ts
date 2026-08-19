import type { Hint, Item } from '../../core/types';
import type { CalcQuestion } from './generator';

/**
 * Astuce des Grilles de calculs.
 *
 * Elle annonce combien d'erreurs la PASSE DES UNITÉS démasque — jamais le total
 * de la grille. La nuance décide de tout : une version antérieure traitait à
 * part le cas « aucune erreur » et l'annonçait, alors que la grille propre est
 * justement le piège de conception de l'épreuve, celui qui pousse à cocher au
 * hasard pour se rassurer. L'astuce y répondait à la place du candidat.
 *
 * Dire « aucune ne se voit aux unités » reste vrai aussi bien sur une grille
 * propre que sur une grille dont les fautes sont toutes des retenues : le
 * candidat garde son travail entier.
 */
export function hint(item: Item<CalcQuestion>): Hint | null {
  const parUnites = item.question.cells.filter(
    (c) => c.wrong && c.shown % 10 !== c.truth % 10,
  ).length;

  return {
    where:
      'Ne recalcule rien : compare d’abord le seul CHIFFRE DES UNITÉS. Celui d’une somme ne dépend que des unités des deux opérandes — aucune retenue ne remonte jusqu’à lui.',
    step:
      parUnites === 0
        ? 'Cette passe ne démasquera rien ici. Enchaîne sur les soustractions à retenue et l’ordre de grandeur — et souviens-toi qu’une grille sans faute est une réponse légitime.'
        : `Cette passe démasque ${parUnites === 1 ? 'une erreur' : `${parUnites} erreurs`} à elle seule. Il peut en rester d’autres : les retenues et les inversions de chiffres passent à travers.`,
  };
}
