import type { Hint, Item } from '../../core/types';
import type { SlidingQuestion } from './generator';
import { greyCount } from './model';

/**
 * Astuce des Formes glissées.
 *
 * Le contrôle de parité dit COMBIEN de cases seront doublement couvertes. C'est
 * l'information qui manque le plus au début — elle transforme le tâtonnement en
 * recherche dirigée — et elle ne dit rien de l'endroit où poser quoi.
 */
export function hint(item: Item<SlidingQuestion>): Hint | null {
  const q = item.question;
  const posees = q.shapes.reduce(
    (n, s) => n + s.cells.reduce((m, row) => m + row.reduce<number>((k, v) => k + v, 0), 0),
    0,
  );
  const cible = greyCount(q.target);
  const recouvrements = (posees - cible) / 2;

  return {
    where:
      'La règle est un OU EXCLUSIF : gris sur gris redonne du marine. Avant de poser quoi que ce soit, compte.',
    step:
      recouvrements === 0
        ? 'Cases grises des formes et de la cible : même total. Aucune forme n’en recouvre une autre — la grille se résout bloc par bloc, sans piège.'
        : `Les formes portent ${posees} cases grises, la cible ${cible} : l’écart vaut ${posees - cible}, donc ${recouvrements} case${recouvrements > 1 ? 's' : ''} sera doublement couverte. Cherche-la${recouvrements > 1 ? 's' : ''} : une case marine cernée de gris.`,
  };
}
