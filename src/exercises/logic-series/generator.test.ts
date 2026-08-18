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
    case 'concat-product':
      // Recalcul indépendant : on relit le nombre en trois morceaux et on
      // vérifie que celui du milieu est bien le produit des deux autres.
      return rule.pairs.map(([a, b]) => {
        expect(String(a * b).length).toBeGreaterThan(0);
        return Number(`${a}${a * b}${b}`);
      });
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
    case 'letter-rank':
    case 'calendar':
      // Termes textuels : vérifiés séparément, ils ne passent pas par les rangs.
      return [];
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
        // L'énigme n'est pas une suite : elle n'a pas de termes à compter.
        if (q.format !== 'riddle') {
          const shown = q.format === 'figural' ? q.cells.length : q.terms.length;
          expect([4, 5]).toContain(shown);
          lengths.add(shown);
        }
        formats.add(q.format);
        checkMcq(item);
      }
    }
    // Les deux longueurs et les trois formats sortent réellement.
    expect([...lengths].sort()).toEqual([4, 5]);
    expect([...formats].sort()).toEqual(['figural', 'letters', 'numeric', 'riddle', 'words']);
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
          const sansProgression = q.rule.type === 'palindrome' || q.rule.type === 'concat-product';
          expect(Math.abs(t)).toBeLessThan(sansProgression ? 1e10 : 100000);
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

        if (q.rule.type === 'letter-rank') {
          // Le nombre accolé DOIT être le rang de la lettre — c'est toute la loi.
          for (const t of q.terms) {
            const letter = t[0];
            expect(Number(t.slice(1))).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(letter) + 1);
          }
          checkMcq(item);
          continue;
        }
        if (q.rule.type === 'calendar') {
          const source =
            q.rule.kind === 'months'
              ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
              : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
          q.terms.forEach((t, i) => {
            const idx = (q.rule.type === 'calendar' ? q.rule.start + i : i) % source.length;
            expect(t).toBe(`${source[idx][0].toUpperCase()}${idx + 1}`);
          });
          checkMcq(item);
          continue;
        }

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

describe('logic-series — mots', () => {
  it('tous les termes partagent la propriété, et AUCUN distracteur ne la partage', () => {
    // C'est ce qui rend la question décidable : la bonne réponse est la seule
    // option qui prolonge la propriété. Un distracteur qui la partagerait
    // serait une seconde bonne réponse.
    const key = (type: string, w: string) =>
      type === 'same-length' ? String(w.length) : type === 'same-initial' ? w[0] : w[w.length - 1];
    let seen = 0;
    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level, 'words').question;
        expect(q.format).toBe('words');
        if (q.format !== 'words') continue;
        seen++;
        for (const t of q.terms) expect(key(q.rule.type, t)).toBe(q.rule.value);
        q.options.forEach((o, i) => {
          expect(key(q.rule.type, o) === q.rule.value).toBe(i === q.correctIndex);
        });
        // Aucun mot ne doit apparaître deux fois : il désignerait la réponse.
        expect(new Set([...q.terms, ...q.options]).size).toBe(q.terms.length + q.options.length);
        checkMcq(generate(seed, level, 'words'));
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe('logic-series — énigmes de prénoms', () => {
  it('le nombre de chaque prénom se recalcule depuis la règle annoncée', () => {
    // Recalcul INDÉPENDANT du générateur : on relit l'énoncé et on refait le
    // rang des lettres à la main.
    const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const rankOf = (name: string) => {
      const c = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
      return { first: ALPHA.indexOf(c[0]) + 1, last: ALPHA.indexOf(c[c.length - 1]) + 1, len: c.length };
    };
    const expected = (type: string, name: string) => {
      const { first, last, len } = rankOf(name);
      if (type === 'first-last-concat') return Number(`${first}${last}`);
      if (type === 'first-last-sum') return first + last;
      return Number(`${len}${first}`);
    };

    for (const level of LEVELS) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'riddle');
        const q = item.question;
        expect(q.format).toBe('riddle');
        if (q.format !== 'riddle') continue;

        // Les trois prénoms donnés portent bien la valeur qu'annonce la règle.
        for (const name of q.rule.names.slice(0, 3)) {
          expect(q.prompt).toContain(`${name} a ${expected(q.rule.type, name)} ans.`);
        }
        expect(q.prompt).toContain(`Quel âge a ${q.rule.target} ?`);
        expect(q.options[q.correctIndex]).toBe(`${expected(q.rule.type, q.rule.target)} ans`);
        checkMcq(item);
      }
    }
  });
});
