import { shuffle } from '../core/rng';
import type { Rng } from '../core/rng';
import { checkAnswer } from './answers';
import type { CultureGivenAnswer } from './answers';
import type { CultureCategory, CultureQuestion } from './types';

export interface PresentedCultureQuestion {
  question: CultureQuestion;
  choices?: string[];
}

export interface CultureScore {
  correct: number;
  wrong: number;
  total: number;
  percent: number;
}

export interface CategoryScore extends CultureScore {
  category: CultureCategory;
}

export function presentQuestion(question: CultureQuestion, rng: Rng): PresentedCultureQuestion {
  const choices = question.type === 'single-choice'
    ? shuffle(rng, question.choices ?? [])
    : question.type === 'true-false'
      ? shuffle(rng, ['Vrai', 'Faux'])
      : undefined;
  return { question, choices };
}

export function composeQuiz(pool: CultureQuestion[], count: number, rng: Rng): PresentedCultureQuestion[] {
  return shuffle(rng, pool).slice(0, Math.max(0, count)).map((question) => presentQuestion(question, rng));
}

export function scoreOf(questions: PresentedCultureQuestion[], answers: CultureGivenAnswer[]): CultureScore {
  const correct = questions.reduce(
    (total, item, index) => total + (checkAnswer(item.question, answers[index] ?? null) ? 1 : 0),
    0,
  );
  const total = questions.length;
  return { correct, wrong: total - correct, total, percent: total === 0 ? 0 : Math.round(correct / total * 100) };
}

export function scoreByCategory(
  questions: PresentedCultureQuestion[],
  answers: CultureGivenAnswer[],
): CategoryScore[] {
  const categories = new Map<CultureCategory, { correct: number; total: number }>();
  questions.forEach((item, index) => {
    const current = categories.get(item.question.category) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (checkAnswer(item.question, answers[index] ?? null)) current.correct += 1;
    categories.set(item.question.category, current);
  });
  return [...categories].map(([category, values]) => ({
    category,
    correct: values.correct,
    wrong: values.total - values.correct,
    total: values.total,
    percent: Math.round(values.correct / values.total * 100),
  }));
}
