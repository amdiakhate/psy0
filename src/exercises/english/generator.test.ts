import { describe, expect, it } from 'vitest';
import { generate } from './generator';
import { validate } from './validator';
import { BANKS, ENGLISH_BANKS } from './data';
import { LEVELS } from './config';

describe('english data', () => {
  it('tailles minimales des banques', () => {
    expect(BANKS.grammar.length).toBeGreaterThanOrEqual(40);
    expect(BANKS['vocab-general'].length).toBeGreaterThanOrEqual(30);
    expect(BANKS['vocab-aviation'].length).toBeGreaterThanOrEqual(30);
    expect(BANKS.comprehension.length).toBeGreaterThanOrEqual(20);
  });

  it('chaque entrée a 4 options distinctes, un index correct valide et une difficulté 1-5', () => {
    for (const bank of ENGLISH_BANKS) {
      for (const e of BANKS[bank]) {
        expect(e.options.length).toBe(4);
        expect(new Set(e.options).size, `options dupliquées : « ${e.prompt} »`).toBe(4);
        expect(e.correct).toBeGreaterThanOrEqual(0);
        expect(e.correct).toBeLessThan(4);
        expect(e.difficulty).toBeGreaterThanOrEqual(1);
        expect(e.difficulty).toBeLessThanOrEqual(5);
        expect(e.prompt.length).toBeGreaterThan(0);
      }
    }
  });

  it('chaque niveau a un pool non vide pour chacune de ses banques', () => {
    for (const cfg of LEVELS) {
      for (const bank of cfg.banks) {
        const pool = BANKS[bank].filter(
          (e) => e.difficulty >= cfg.minDifficulty && e.difficulty <= cfg.maxDifficulty,
        );
        expect(pool.length, `pool vide : ${bank} (${cfg.minDifficulty}-${cfg.maxDifficulty})`).toBeGreaterThan(0);
      }
    }
  });
});

describe('english generator', () => {
  it('est déterministe : même seed → même item', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 50; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('le mélange préserve la bonne réponse : validate(bonne) = true, distracteurs = false', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 150; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        // Retrouve l'entrée de banque d'origine et compare le texte de la bonne option.
        const entry = BANKS[q.bank].find((e) => e.prompt === q.prompt);
        expect(entry).toBeDefined();
        expect(q.options[q.correctIndex]).toBe(entry!.options[entry!.correct]);
        expect([...q.options].sort()).toEqual([...entry!.options].sort());
        expect(validate(item, q.correctIndex)).toBe(true);
        for (let i = 0; i < 4; i++) {
          if (i !== q.correctIndex) expect(validate(item, i)).toBe(false);
        }
      }
    }
  });

  it('respecte les banques et difficultés du niveau', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < 150; seed++) {
        const item = generate(seed, level);
        expect(cfg.banks).toContain(item.question.bank);
        const entry = BANKS[item.question.bank].find((e) => e.prompt === item.question.prompt)!;
        expect(entry.difficulty).toBeGreaterThanOrEqual(cfg.minDifficulty);
        expect(entry.difficulty).toBeLessThanOrEqual(cfg.maxDifficulty);
        expect(item.tags).toContain(item.question.bank);
        expect(item.tags).toContain(`d${entry.difficulty}`);
      }
    }
  });

  it('respecte forceTag pour chaque banque, même hors pool du niveau', () => {
    for (const bank of ENGLISH_BANKS) {
      for (let seed = 0; seed < 150; seed++) {
        const item = generate(seed, 1, bank);
        expect(item.question.bank).toBe(bank);
        expect(item.tags).toContain(bank);
      }
    }
  });

  it('des seeds différents donnent en général des questions différentes', () => {
    const prompts = new Set<string>();
    for (let seed = 0; seed < 100; seed++) prompts.add(generate(seed, 5).question.prompt);
    expect(prompts.size).toBeGreaterThan(20);
  });
});
