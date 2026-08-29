import { CULTURE_CATEGORY_IDS } from './data/categories';
import type { CultureLesson, CultureQuestion } from './types';

export function validateCultureBank(
  questions: CultureQuestion[],
  lessons: CultureLesson[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const questionIds = new Set(questions.map((question) => question.id));
  const categoryIds = new Set(CULTURE_CATEGORY_IDS);

  for (const question of questions) {
    if (ids.has(question.id)) errors.push(`${question.id}: identifiant dupliqué`);
    ids.add(question.id);
    if (!categoryIds.has(question.category)) errors.push(`${question.id}: catégorie inconnue`);
    if (!question.categories.includes(question.category)) errors.push(`${question.id}: catégorie principale absente de categories`);
    if (question.explanation.trim().length < 20) errors.push(`${question.id}: explication insuffisante`);
    if (question.type === 'single-choice') {
      if (question.choices?.length !== 4) errors.push(`${question.id}: quatre choix requis`);
      if (question.choices && new Set(question.choices).size !== question.choices.length) errors.push(`${question.id}: choix dupliqués`);
      if (typeof question.answer !== 'string' || !question.choices?.includes(question.answer)) errors.push(`${question.id}: réponse absente des choix`);
    }
    if (question.type === 'numeric' && typeof question.answer !== 'number') errors.push(`${question.id}: réponse numérique requise`);
    if (question.isTimeSensitive && (!question.verifiedAt || !question.source)) errors.push(`${question.id}: donnée temporelle sans date ou source`);
  }

  const lessonIds = new Set<string>();
  for (const item of lessons) {
    if (lessonIds.has(item.id)) errors.push(`${item.id}: identifiant de fiche dupliqué`);
    lessonIds.add(item.id);
    if (item.takeaways.length < 3 || item.takeaways.length > 6) errors.push(`${item.id}: trois à six points requis`);
    for (const id of item.questionIds) if (!questionIds.has(id)) errors.push(`${item.id}: question liée inconnue ${id}`);
    if (item.isTimeSensitive && (!item.verifiedAt || !item.source)) errors.push(`${item.id}: fiche temporelle sans date ou source`);
  }
  return errors;
}
