import { CULTURE_CATEGORY_IDS } from './data/categories';
import {
  CULTURE_BANK_TARGETS,
  CULTURE_BANK_TOTAL,
  CULTURE_CORE_TOTAL,
  CULTURE_EXTENDED_TOTAL,
  CULTURE_LESSON_TOTAL,
} from './data/questions/manifest';
import type { CultureLesson, CultureQuestion } from './types';

const NUMERIC_CALCULATION_TAGS = new Set([
  'vitesse-distance-temps',
  'caps',
  'différence angulaire',
  'cap opposé',
  'QFU',
  'conversion',
]);

export function validateCultureBank(
  questions: CultureQuestion[],
  lessons: CultureLesson[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const questionIds = new Set(questions.map((question) => question.id));
  const categoryIds = new Set(CULTURE_CATEGORY_IDS);

  if (questions.length !== CULTURE_BANK_TOTAL) errors.push(`banque: ${CULTURE_BANK_TOTAL} questions requises`);
  if (questions.filter((question) => question.tier === 'core').length !== CULTURE_CORE_TOTAL) errors.push(`banque: ${CULTURE_CORE_TOTAL} questions CORE requises`);
  if (questions.filter((question) => question.tier === 'extended').length !== CULTURE_EXTENDED_TOTAL) errors.push(`banque: ${CULTURE_EXTENDED_TOTAL} questions EXTENDED requises`);
  if (lessons.length !== CULTURE_LESSON_TOTAL) errors.push(`banque: ${CULTURE_LESSON_TOTAL} fiches requises`);

  for (const [domain, target] of Object.entries(CULTURE_BANK_TARGETS)) {
    const domainQuestions = questions.filter((question) => question.domain === domain);
    if (domainQuestions.length !== target.total) errors.push(`${domain}: ${target.total} questions requises`);
    if (domainQuestions.filter((question) => question.tier === 'core').length !== target.core) errors.push(`${domain}: ${target.core} questions CORE requises`);
  }

  for (const question of questions) {
    if (ids.has(question.id)) errors.push(`${question.id}: identifiant dupliqué`);
    ids.add(question.id);
    if (!categoryIds.has(question.category)) errors.push(`${question.id}: catégorie inconnue`);
    if (!question.domain) errors.push(`${question.id}: domaine éditorial absent`);
    if (!['core', 'extended'].includes(question.tier)) errors.push(`${question.id}: tier explicite absent ou invalide`);
    if (question.highYield !== (question.tier === 'core')) errors.push(`${question.id}: highYield incohérent avec tier`);
    if (!question.categories.includes(question.category)) errors.push(`${question.id}: catégorie principale absente de categories`);
    if (question.explanation.trim().length < 20) errors.push(`${question.id}: explication insuffisante`);
    if (!question.source) errors.push(`${question.id}: source absente`);
    if (question.type === 'single-choice') {
      if (question.choices?.length !== 4) errors.push(`${question.id}: quatre choix requis`);
      if (question.choices && new Set(question.choices).size !== question.choices.length) errors.push(`${question.id}: choix dupliqués`);
      if (typeof question.answer !== 'string' || !question.choices?.includes(question.answer)) errors.push(`${question.id}: réponse absente des choix`);
    }
    if (question.type === 'numeric') {
      if (typeof question.answer !== 'number') errors.push(`${question.id}: réponse numérique requise`);
      if (!question.tags.some((tag) => NUMERIC_CALCULATION_TAGS.has(tag))) {
        errors.push(`${question.id}: numeric réservé aux calculs et drills`);
      }
    }
    if (question.type === 'short-answer' && !question.tags.includes('rappel libre')) {
      errors.push(`${question.id}: short-answer réservé au rappel libre explicite`);
    }
    if (question.isTimeSensitive && (!question.verifiedAt || !question.source)) errors.push(`${question.id}: donnée temporelle sans date ou source`);
  }

  const lessonIds = new Set<string>();
  for (const item of lessons) {
    if (lessonIds.has(item.id)) errors.push(`${item.id}: identifiant de fiche dupliqué`);
    lessonIds.add(item.id);
    if (item.takeaways.length < 3 || item.takeaways.length > 8) errors.push(`${item.id}: trois à huit points requis`);
    if (item.questionIds.length < 5 || item.questionIds.length > 10) errors.push(`${item.id}: cinq à dix questions liées requises`);
    if (new Set(item.questionIds).size !== item.questionIds.length) errors.push(`${item.id}: question liée dupliquée`);
    for (const id of item.questionIds) if (!questionIds.has(id)) errors.push(`${item.id}: question liée inconnue ${id}`);
    if (item.isTimeSensitive && (!item.verifiedAt || !item.source)) errors.push(`${item.id}: fiche temporelle sans date ou source`);
  }
  return errors;
}
