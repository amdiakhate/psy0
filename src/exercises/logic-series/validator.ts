import type { Item } from '../../core/types';
import type { LogicAnswer, LogicQuestion } from './generator';

/** Réponse « Je ne sais pas… » : ni juste, ni fausse — 0 point au barème. */
export const ABSTENTION = 'abstention';

export function isAbstention(answer: LogicAnswer): boolean {
  return String(answer) === ABSTENTION;
}

/**
 * QCM à 4 choix dans les trois formats : la réponse est l'index de l'option.
 *
 * Le moteur de session est binaire (juste / faux) et une abstention y compte
 * donc comme une non-réussite — ce qui est correct au barème, où elle ne
 * rapporte aucun point. La différence avec une mauvaise réponse (−1/3) se lit
 * dans le journal d'events, via le tag `abstention`.
 */
export function validate(item: Item<LogicQuestion>, answer: LogicAnswer): boolean {
  if (isAbstention(answer)) return false;
  return Number(answer) === item.question.correctIndex;
}

/** Le libellé de la bonne réponse, pour la correction. */
export function expectedLabel(question: LogicQuestion): string {
  if (question.format === 'numeric') return String(question.options[question.correctIndex]);
  if (question.format === 'letters') return question.options[question.correctIndex];
  return `option ${question.correctIndex + 1}`;
}
