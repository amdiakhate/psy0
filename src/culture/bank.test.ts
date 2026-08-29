import { describe, expect, it } from 'vitest';
import { LESSONS, QUESTIONS, questionById, questionsByCategory } from './bank';
import { CULTURE_CATEGORY_IDS } from './data/categories';
import { validateCultureBank } from './validation';
import type { CultureQuestion } from './types';

describe('banque Culture Aéro V2', () => {
  it('importe les 80 questions du document 2026 sans trou', () => {
    expect(QUESTIONS).toHaveLength(80);
    expect(QUESTIONS.map((question) => question.sourceQuestionNumber).sort((a, b) => Number(a) - Number(b))).toEqual(
      Array.from({ length: 80 }, (_, index) => index + 1),
    );
  });

  it('contient des mini-fiches liées à des questions réelles', () => {
    expect(LESSONS).toHaveLength(22);
    expect(validateCultureBank(QUESTIONS, LESSONS)).toEqual([]);
  });

  it('couvre les douze catégories', () => {
    for (const category of CULTURE_CATEGORY_IDS) {
      expect(questionsByCategory(category).length, category).toBeGreaterThan(0);
    }
  });

  it('retrouve une question par identifiant', () => {
    expect(questionById('doc26-01')?.sourceQuestionNumber).toBe(1);
    expect(questionById('missing')).toBeUndefined();
  });

  it('marque chaque donnée temporelle avec date et source', () => {
    for (const question of QUESTIONS.filter((item) => item.isTimeSensitive)) {
      expect(question.verifiedAt, question.id).toBe('2026-08-29');
      expect(question.source, question.id).toContain('Culture_Aero');
    }
  });

  it('refuse une réponse absente des choix', () => {
    const invalid: CultureQuestion = {
      ...QUESTIONS[3],
      id: 'invalid-answer',
      answer: 'absente',
    };
    expect(validateCultureBank([invalid], [])).toContain('invalid-answer: réponse absente des choix');
  });

  it('refuse les identifiants dupliqués et les données temporelles incomplètes', () => {
    const invalid: CultureQuestion = {
      ...QUESTIONS[0],
      isTimeSensitive: true,
      verifiedAt: undefined,
      source: undefined,
    };
    const errors = validateCultureBank([invalid, invalid], []);
    expect(errors).toContain(`${invalid.id}: identifiant dupliqué`);
    expect(errors).toContain(`${invalid.id}: donnée temporelle sans date ou source`);
  });
});
