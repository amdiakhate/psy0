import type { Item } from '../../core/types';
import type { LogicAnswer, LogicQuestion } from './generator';

/**
 * QCM à 4 choix dans les trois formats : la réponse est l'index de l'option.
 * Le module reste binaire (juste / faux) ; la pénalité officielle de −1/3 point
 * pour une mauvaise réponse est une consigne de STRATÉGIE, rappelée à l'écran
 * et dans les astuces — elle ne change pas le journal d'events.
 */
export function validate(item: Item<LogicQuestion>, answer: LogicAnswer): boolean {
  return Number(answer) === item.question.correctIndex;
}

/** Le libellé de la bonne réponse, pour la correction. */
export function expectedLabel(question: LogicQuestion): string {
  if (question.format === 'numeric') return String(question.options[question.correctIndex]);
  if (question.format === 'letters') return question.options[question.correctIndex];
  return `option ${question.correctIndex + 1}`;
}
