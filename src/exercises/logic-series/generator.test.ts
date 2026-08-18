import { describe, expect, it } from 'vitest';
import { generate, figKey } from './generator';
import type { FigDesc, FigRule, LetterRule, RuleDesc } from './generator';
import { ABSTENTION, isAbstention, validate } from './validator';
import {
  ALL_LETTER_RULES,
  ALL_NUMERIC_RULES,
  FIGURAL_ATTR_COUNT,
  LETTER_RULES,
  NUMERIC_RULES,
} from './config';

const SEEDS = 150;
const LEVELS = [1, 2, 3, 4, 5];

/** Réimplémentation indépendante : les 6 termes attendus pour chaque règle numérique. */
function expectedSeries(rule: RuleDesc): number[] {
  const out: number[] = [];
  switch (rule.type) {
    case 'arith':
      for (let i = 0; i < 6; i++) out.push(rule.start + i * rule.k);
      break;
    case 'arith-neg':
      for (let i = 0; i < 6; i++) out.push(rule.start - i * rule.k);
      break;
    case 'geo':
      for (let i = 0; i < 6; i++) out.push(rule.start * Math.pow(rule.k, i));
      break;
    case 'second-order': {
      let t = rule.start;
      let d = rule.d0;
      out.push(t);
      for (let i = 0; i < 5; i++) {
        t += d;
        d += rule.c;
        out.push(t);
      }
      break;
    }
    case 'alternate': {
      let t = rule.start;
      out.push(t);
      for (let i = 0; i < 5; i++) {
        t += i % 2 === 0 ? rule.a : -rule.b;
        out.push(t);
      }
      break;
    }
    case 'two-rules':
      for (let i = 0; i < 6; i++) {
        out.push(i % 2 === 0 ? rule.startA + (i / 2) * rule.dA : rule.startB + ((i - 1) / 2) * rule.dB);
      }
      break;
    case 'squares':
      for (let i = 0; i < 6; i++) out.push((rule.n0 + i) * (rule.n0 + i) + rule.c);
      break;
    case 'cubes':
      for (let i = 0; i < 6; i++) out.push((rule.n0 + i) * (rule.n0 + i) * (rule.n0 + i) + rule.c);
      break;
    case 'fibo': {
      out.push(rule.t1, rule.t2);
      for (let i = 2; i < 6; i++) out.push(out[i - 1] + out[i - 2]);
      break;
    }
    case 'palindrome':
      // Recalcul indépendant : on ne rejoue pas la génération, on VÉRIFIE que
      // chaque terme se lit pareil dans les deux sens.
      for (const t of rule.terms) {
        const digits = String(t);
        expect(digits).toBe([...digits].reverse().join(''));
      }
      return rule.terms;
    case 'mul-add': {
      let t = rule.start;
      out.push(t);
      for (let i = 0; i < 5; i++) {
        t = i % 2 === 0 ? t * rule.k : t + rule.m;
        out.push(t);
      }
      break;
    }
  }
  return out;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function letterAt(rank: number): string {
  return ALPHABET[((rank % 26) + 26) % 26];
}

/** Réimplémentation indépendante : les 6 lettres attendues pour chaque règle alphabétique. */
/** Recalcul INDÉPENDANT du générateur : un terme est un ou deux rangs. */
function expectedLetters(rule: LetterRule): string[] {
  const out: number[][] = [];
  switch (rule.type) {
    case 'letter-step':
      for (let i = 0; i < 6; i++) out.push([rule.start + i * rule.step]);
      break;
    case 'letter-alternate': {
      let t = rule.start;
      out.push([t]);
      for (let i = 0; i < 5; i++) {
        t += i % 2 === 0 ? rule.a : rule.b;
        out.push([t]);
      }
      break;
    }
    case 'letter-interleaved':
      for (let i = 0; i < 6; i++) {
        out.push([i % 2 === 0 ? rule.startA + (i / 2) * rule.dA : rule.startB + ((i - 1) / 2) * rule.dB]);
      }
      break;
    case 'pair-columns':
      for (let i = 0; i < 6; i++) out.push([rule.startA + i * rule.dA, rule.startB + i * rule.dB]);
      break;
    case 'pair-internal':
      for (const f of rule.firsts) out.push([f, f + rule.delta]);
      break;
  }
  return out.map((ranks) => ranks.map(letterAt).join(''));
}

/** Réimplémentation indépendante de la figure de rang `index`. */
function expectedFig(rule: FigRule, index: number): FigDesc {
  const d: FigDesc = { ...rule.base };
  for (const attr of rule.attrs) {
    if (attr === 'count') d.count = 1 + (index % 3);
    else if (attr === 'rotation') d.rotation = [0, 45, 90][index % 3];
    else if (attr === 'size') d.size = (['s', 'm', 'l'] as const)[index % 3];
    else d.filled = index % 2 === 0;
  }
  return d;
}

/** Contrat commun aux trois formats : QCM à 4 options, une seule correcte. */
function checkMcq(item: ReturnType<typeof generate>): void {
  const q = item.question;
  const labels = (q.format === 'figural' ? q.options.map(figKey) : q.options.map(String)) as string[];
  expect(labels.length).toBe(4);
  expect(new Set(labels).size).toBe(4);
  expect(q.correctIndex).toBeGreaterThanOrEqual(0);
  expect(q.correctIndex).toBeLessThan(4);
  for (let i = 0; i < 4; i++) {
    expect(validate(item, String(i))).toBe(i === q.correctIndex);
  }
}

describe('logic-series — contrat commun', () => {
  it('est déterministe : même (seed, niveau) → même item', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('affiche toujours 4 ou 5 items et propose 4 options distinctes dont une seule correcte', () => {
    const lengths = new Set<number>();
    const formats = new Set<string>();
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        const q = item.question;
        const shown = q.format === 'figural' ? q.cells.length : q.terms.length;
        expect([4, 5]).toContain(shown);
        lengths.add(shown);
        formats.add(q.format);
        checkMcq(item);
      }
    }
    // Les deux longueurs et les trois formats sortent réellement.
    expect([...lengths].sort()).toEqual([4, 5]);
    expect([...formats].sort()).toEqual(['figural', 'letters', 'numeric']);
  });
});

describe('logic-series — numérique', () => {
  it('la bonne réponse se recalcule indépendamment depuis la règle', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'numeric');
        const q = item.question;
        expect(q.format).toBe('numeric');
        if (q.format !== 'numeric') continue;

        const series = expectedSeries(q.rule);
        expect(q.terms).toEqual(series.slice(0, q.terms.length));
        if (q.rule.type === 'palindrome') {
          // La bonne réponse est le SEUL palindrome des quatre options : c'est
          // ce qui rend la question décidable sans progression.
          const pal = q.options.filter((o) => String(o) === [...String(o)].reverse().join(''));
          expect(pal).toEqual([q.options[q.correctIndex]]);
        }
        expect(q.options[q.correctIndex]).toBe(series[q.terms.length]);
        for (const t of [...q.terms, ...q.options]) {
          expect(Number.isInteger(t)).toBe(true);
          // La borne protège les suites À PROGRESSION : un terme qui explose y
          // signale un générateur qui s'emballe. Les palindromes n'ont aucune
          // progression, et Pilotest en pose jusqu'à huit chiffres.
          expect(Math.abs(t)).toBeLessThan(q.rule.type === 'palindrome' ? 1e10 : 100000);
        }
        checkMcq(item);
      }
    }
  });

  it('les règles tirées respectent le pool du niveau et sont taguées', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'numeric');
        if (item.question.format !== 'numeric') continue;
        expect(NUMERIC_RULES[level - 1]).toContain(item.question.rule.type);
        expect(item.tags).toEqual(['numeric', item.question.rule.type]);
      }
    }
  });
});

describe('logic-series — lettres', () => {
  it('la bonne réponse se recalcule indépendamment depuis la règle', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'letters');
        const q = item.question;
        expect(q.format).toBe('letters');
        if (q.format !== 'letters') continue;

        const series = expectedLetters(q.rule);
        expect(q.terms).toEqual(series.slice(0, q.terms.length));
        expect(q.options[q.correctIndex]).toBe(series[q.terms.length]);
        for (const l of [...q.terms, ...q.options]) expect(l).toMatch(/^[A-Z]{1,2}$/);
        // Tous les termes d'une série ont la même forme : jamais une lettre isolée
        // au milieu de groupes de deux.
        const width = new Set([...q.terms, ...q.options].map((t) => t.length));
        expect(width.size).toBe(1);
        checkMcq(item);
      }
    }
  });

  it('les règles tirées respectent le pool du niveau et sont taguées', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'letters');
        if (item.question.format !== 'letters') continue;
        expect(LETTER_RULES[level - 1]).toContain(item.question.rule.type);
        expect(item.tags).toEqual(['letters', item.question.rule.type]);
      }
    }
  });
});

describe('logic-series — figural', () => {
  it('la bonne option complète la série, chaque distracteur en diffère vraiment', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'figural');
        const q = item.question;
        expect(q.format).toBe('figural');
        if (q.format !== 'figural') continue;

        // Les items affichés suivent la règle, rang par rang.
        q.cells.forEach((cell, i) => {
          expect(figKey(cell)).toBe(figKey(expectedFig(q.rule, i)));
        });
        const answer = expectedFig(q.rule, q.cells.length);
        expect(figKey(q.options[q.correctIndex])).toBe(figKey(answer));

        const keys = q.options.map(figKey);
        for (let i = 0; i < 4; i++) {
          if (i !== q.correctIndex) expect(keys[i]).not.toBe(figKey(answer));
        }
        checkMcq(item);

        // Rotation jamais porteuse d'info hors triangle.
        for (const d of [...q.cells, ...q.options]) {
          if (d.shape !== 'triangle') expect(d.rotation).toBe(0);
        }
      }
    }
  });

  it("le nombre d'attributs variables suit le niveau", () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 50; seed++) {
        const item = generate(seed, level, 'figural');
        if (item.question.format !== 'figural') continue;
        const n = FIGURAL_ATTR_COUNT[level - 1];
        expect(item.question.rule.attrs.length).toBe(n);
        expect(item.tags).toEqual(['figural', `attrs-${n}`]);
      }
    }
  });
});

describe('logic-series — forceTag', () => {
  it('force le format', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      expect(generate(seed, 5, 'numeric').question.format).toBe('numeric');
      expect(generate(seed, 5, 'letters').question.format).toBe('letters');
      expect(generate(seed, 5, 'figural').question.format).toBe('figural');
    }
  });

  it('force une règle précise, numérique ou alphabétique', () => {
    for (const rule of ALL_NUMERIC_RULES) {
      for (let seed = 0; seed < 30; seed++) {
        const item = generate(seed, 5, rule);
        expect(item.question.format).toBe('numeric');
        expect(item.tags).toContain(rule);
      }
    }
    for (const rule of ALL_LETTER_RULES) {
      for (let seed = 0; seed < 30; seed++) {
        const item = generate(seed, 5, rule);
        expect(item.question.format).toBe('letters');
        expect(item.tags).toContain(rule);
      }
    }
  });
});

describe('abstention « Je ne sais pas… »', () => {
  it('n’est jamais comptée comme une bonne réponse', () => {
    // Pilotest propose un bouton d'abstention : elle vaut 0, pas +1.
    for (let seed = 0; seed < 40; seed++) {
      const item = generate(seed, 3);
      expect(validate(item, ABSTENTION as never)).toBe(false);
    }
  });

  it('se distingue d’un index de réponse valide', () => {
    // Sans cette distinction, l'abstention serait traitée comme un clic sur
    // l'option 0 — et vaudrait le point une fois sur quatre.
    expect(isAbstention(ABSTENTION as never)).toBe(true);
    for (let i = 0; i < 4; i++) expect(isAbstention(String(i) as never)).toBe(false);
  });
});
