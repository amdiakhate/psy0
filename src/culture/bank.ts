import { coreLessons } from './data/lessons/core';
import { document2026Questions } from './data/questions/document2026';
import type { CultureCategory, CultureLesson, CultureQuestion } from './types';
import { validateCultureBank } from './validation';

export const QUESTIONS: CultureQuestion[] = document2026Questions;
export const LESSONS: CultureLesson[] = coreLessons;

const validationErrors = validateCultureBank(QUESTIONS, LESSONS);
if (validationErrors.length > 0) {
  throw new Error(`Banque Culture Aéro invalide:\n${validationErrors.join('\n')}`);
}

const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));
const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));

export function questionById(id: string): CultureQuestion | undefined {
  return QUESTION_BY_ID.get(id);
}

export function lessonById(id: string): CultureLesson | undefined {
  return LESSON_BY_ID.get(id);
}

export function questionsByCategory(category: CultureCategory): CultureQuestion[] {
  return QUESTIONS.filter((question) => question.categories.includes(category));
}

export function questionsByTag(tag: string): CultureQuestion[] {
  return QUESTIONS.filter((question) => question.tags.includes(tag));
}

export function lessonsByCategory(category: CultureCategory): CultureLesson[] {
  return LESSONS.filter((lesson) => lesson.category === category);
}
