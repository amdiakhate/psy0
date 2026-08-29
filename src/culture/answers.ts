import type { CultureQuestion } from './types';

export type CultureGivenAnswer = string | number | boolean | null;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9+.-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseNumeric(value: CultureGivenAnswer): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value.trim().replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function checkAnswer(question: CultureQuestion, given: CultureGivenAnswer): boolean {
  if (given === null) return false;
  if (question.type === 'numeric') {
    const numeric = parseNumeric(given);
    if (numeric === null) return false;
    const accepted = [question.answer, ...(question.acceptedAnswers ?? [])]
      .map(parseNumeric)
      .filter((value): value is number => value !== null);
    return accepted.some((value) => Math.abs(value - numeric) < 0.000_001);
  }
  if (question.type === 'true-false') {
    if (typeof given === 'boolean') return given === question.answer;
    const normalized = normalizeText(String(given));
    const parsed = ['vrai', 'true', '1'].includes(normalized) ? true : ['faux', 'false', '0'].includes(normalized) ? false : null;
    return parsed !== null && parsed === question.answer;
  }
  const accepted = [question.answer, ...(question.acceptedAnswers ?? [])].map((value) => normalizeText(String(value)));
  return accepted.includes(normalizeText(String(given)));
}
