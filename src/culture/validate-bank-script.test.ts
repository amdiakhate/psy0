import { describe, expect, it } from 'vitest';
import { LESSONS, QUESTIONS } from './bank';
import { CULTURE_BANK_TARGETS } from './data/questions/manifest';
import { validateCultureBank } from './validation';

describe('validation éditoriale Culture Aéro V3', () => {
  it('respecte tous les invariants et affiche le manifeste', () => {
    const errors = validateCultureBank(QUESTIONS, LESSONS);
    const core = QUESTIONS.filter((question) => question.highYield).length;
    const extended = QUESTIONS.length - core;
    const domains = Object.fromEntries(Object.keys(CULTURE_BANK_TARGETS).map((domain) => [
      domain,
      QUESTIONS.filter((question) => question.domain === domain).length,
    ]));
    console.info(JSON.stringify({ questions: QUESTIONS.length, core, extended, lessons: LESSONS.length, domains }, null, 2));
    expect(errors).toEqual([]);
  });
});
