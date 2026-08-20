import { describe, expect, it } from 'vitest';
import { ASKED, BANK, byTheme, counts, entryById } from './bank';
import { THEMES, THEME_LABELS, THEME_SCOPE } from './types';

/**
 * Une banque de plusieurs centaines de questions ne se relit pas à l'œil.
 * Ces tests sont la relecture : ils attrapent la faute de frappe dans un
 * identifiant, l'option dupliquée qui rend une question insoluble, et
 * l'explication oubliée qui la rendrait inutile.
 */
describe('banque de culture aéronautique', () => {
  it('contient une banque conséquente', () => {
    expect(BANK.length).toBeGreaterThanOrEqual(300);
  });

  it('a des identifiants uniques', () => {
    const ids = BANK.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a des énoncés uniques', () => {
    const prompts = BANK.map((e) => e.prompt.trim().toLowerCase());
    const seen = new Map<string, number>();
    for (const p of prompts) seen.set(p, (seen.get(p) ?? 0) + 1);
    expect([...seen].filter(([, n]) => n > 1).map(([p]) => p)).toEqual([]);
  });

  it('propose toujours quatre options distinctes', () => {
    for (const e of BANK) {
      expect(e.options, e.id).toHaveLength(4);
      expect(new Set(e.options).size, e.id).toBe(4);
      for (const o of e.options) expect(o.trim().length, e.id).toBeGreaterThan(0);
    }
  });

  /**
   * La convention n'est pas cosmétique : elle permet de relire la banque en
   * lisant la première option. Sans elle, un réordonnancement qui oublie
   * `correct` transformerait une bonne réponse en piège, silencieusement.
   */
  it('écrit toujours la bonne réponse en premier', () => {
    for (const e of BANK) expect(e.correct, e.id).toBe(0);
  });

  it('porte une difficulté valide', () => {
    for (const e of BANK) {
      expect(e.difficulty, e.id).toBeGreaterThanOrEqual(1);
      expect(e.difficulty, e.id).toBeLessThanOrEqual(5);
    }
  });

  /**
   * Sur une épreuve de connaissances, on n'apprend pas de son score mais de la
   * correction. Une explication d'une ligne creuse ne vaut rien : on exige de
   * la matière.
   */
  it('explique chaque réponse', () => {
    for (const e of BANK) expect(e.explain.length, e.id).toBeGreaterThan(60);
  });

  it('range chaque question dans un thème connu', () => {
    for (const e of BANK) expect(THEMES, e.id).toContain(e.theme);
  });

  it('couvre chaque thème par un lot utilisable', () => {
    const n = counts();
    for (const t of THEMES) {
      expect(n[t], t).toBeGreaterThanOrEqual(20);
      expect(byTheme(t).length, t).toBe(n[t]);
    }
  });

  it('décrit chaque thème', () => {
    for (const t of THEMES) {
      expect(THEME_LABELS[t].length, t).toBeGreaterThan(3);
      expect(THEME_SCOPE[t].length, t).toBeGreaterThan(40);
    }
  });

  it('retrouve une entrée par son identifiant', () => {
    expect(entryById(BANK[0].id)).toBe(BANK[0]);
    expect(entryById('inexistant')).toBeUndefined();
  });

  /**
   * Les questions calquées sur les annales sont la seule partie de la banque
   * dont on sache qu'un examinateur les a posées. Si ce filtre tombe à zéro,
   * le drill « ce qui est déjà tombé » ne sert plus à rien.
   */
  it('identifie les questions issues des annales 2018 et 2019', () => {
    expect(ASKED.length).toBeGreaterThanOrEqual(40);
    for (const e of ASKED) expect(['2018', '2019'], e.id).toContain(e.asked);
    // Les deux sessions sont représentées.
    expect(ASKED.some((e) => e.asked === '2018')).toBe(true);
    expect(ASKED.some((e) => e.asked === '2019')).toBe(true);
  });

  /** Un chiffre daté doit porter son année dans l'énoncé, sinon il vieillit en silence. */
  it('date les énoncés dont la réponse dépend d’une année', () => {
    for (const e of BANK.filter((x) => x.asOf !== undefined)) {
      expect(e.prompt, e.id).toContain(String(e.asOf));
    }
  });
});
