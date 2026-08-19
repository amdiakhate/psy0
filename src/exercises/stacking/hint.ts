import type { Hint, Item } from '../../core/types';
import type { StackingQuestion } from './generator';
import { findTrihedron } from './signature';

/**
 * Astuce des Empilements.
 *
 * Elle rappelle qu'on cherche la PAIRE et non le symétrique, puis indique la
 * longueur du plus long bras — le repère par lequel commencer sur chaque
 * figure. Elle ne dit jamais quelle figure est laquelle : le geste des trois
 * doigts reste entièrement à faire.
 */
export function hint(item: Item<StackingQuestion>): Hint | null {
  const q = item.question;
  const t = findTrihedron(q.stacks[0]);
  const base = {
    where:
      'Tu ne cherches pas le symétrique : tu cherches la PAIRE. Dès que deux figures partagent la même main, la troisième est la réponse.',
  };
  if (t === null) {
    return {
      ...base,
      step: `${q.size} cubes par figure. Repère le plus long alignement, ce qui sort de son milieu et ce qui est posé à son bout — dans cet ordre, sur les trois.`,
    };
  }
  return {
    ...base,
    step: `Le plus long alignement fait ${t.armIndices.length} cubes. Retrouve-le sur chaque figure, puis les deux décrochages, toujours dans le même ordre.`,
  };
}
