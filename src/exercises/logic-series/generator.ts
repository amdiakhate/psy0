import { mulberry32, pick, randInt, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import {
  ALL_LETTER_RULES,
  ALL_NUMERIC_RULES,
  FIGURAL_ATTR_COUNT,
  FORMATS,
  LETTER_RULES,
  NUMERIC_RULES,
  RIDDLE_RULES,
  SERIES_LENGTHS,
  WORD_RULES,
} from './config';
import type { RiddleRuleType, WordRuleType } from './config';
import { FIRST_NAMES, WORDS_BY_LENGTH } from './data';
import type { LetterRuleType, NumericRuleType, SeriesFormat } from './config';

/* ------------------------------------------------------------------ */
/* Numérique                                                           */
/* ------------------------------------------------------------------ */

export type RuleDesc =
  | { type: 'arith'; start: number; k: number }
  | { type: 'arith-neg'; start: number; k: number }
  | { type: 'geo'; start: number; k: number }
  | { type: 'second-order'; start: number; d0: number; c: number }
  | { type: 'alternate'; start: number; a: number; b: number }
  | { type: 'two-rules'; startA: number; dA: number; startB: number; dB: number }
  | { type: 'squares'; n0: number; c: number }
  | { type: 'cubes'; n0: number; c: number }
  | { type: 'fibo'; t1: number; t2: number }
  | { type: 'mul-add'; start: number; k: number; m: number }
  | { type: 'palindrome'; terms: number[] }
  | { type: 'concat-product'; pairs: Array<[number, number]> };

/** Les 6 termes de la suite, construits DEPUIS la règle. */
export function seriesFromRule(rule: RuleDesc): number[] {
  switch (rule.type) {
    case 'arith':
      return Array.from({ length: 6 }, (_, i) => rule.start + i * rule.k);
    case 'arith-neg':
      return Array.from({ length: 6 }, (_, i) => rule.start - i * rule.k);
    case 'geo':
      return Array.from({ length: 6 }, (_, i) => rule.start * rule.k ** i);
    case 'second-order': {
      const out = [rule.start];
      let d = rule.d0;
      for (let i = 0; i < 5; i++) {
        out.push(out[out.length - 1] + d);
        d += rule.c;
      }
      return out;
    }
    case 'alternate': {
      const out = [rule.start];
      for (let i = 0; i < 5; i++) {
        out.push(out[out.length - 1] + (i % 2 === 0 ? rule.a : -rule.b));
      }
      return out;
    }
    case 'two-rules':
      // Positions paires (0,2,4) : suite A ; positions impaires (1,3,5) : suite B.
      return Array.from({ length: 6 }, (_, i) =>
        i % 2 === 0 ? rule.startA + (i / 2) * rule.dA : rule.startB + ((i - 1) / 2) * rule.dB,
      );
    case 'squares':
      return Array.from({ length: 6 }, (_, i) => (rule.n0 + i) ** 2 + rule.c);
    case 'cubes':
      return Array.from({ length: 6 }, (_, i) => (rule.n0 + i) ** 3 + rule.c);
    case 'fibo': {
      const out = [rule.t1, rule.t2];
      for (let i = 0; i < 4; i++) out.push(out[out.length - 1] + out[out.length - 2]);
      return out;
    }
    case 'palindrome':
      // Aucune progression : chaque terme est un palindrome, un point c'est tout.
      return rule.terms;
    case 'concat-product':
      // a, puis a×b, puis b, collés bout à bout. Là encore aucune progression :
      // la loi se lit à l'intérieur du nombre.
      return rule.pairs.map(([a, b]) => Number(`${a}${a * b}${b}`));
    case 'mul-add': {
      const out = [rule.start];
      for (let i = 0; i < 5; i++) {
        out.push(i % 2 === 0 ? out[out.length - 1] * rule.k : out[out.length - 1] + rule.m);
      }
      return out;
    }
  }
}

/** Les termes affichés suivent-ils une règle plus simple (arith., géo., 2e ordre) ? */
function looksSimpler(shown: number[]): boolean {
  const d = shown.slice(1).map((t, i) => t - shown[i]);
  if (d.every((x) => x === d[0])) return true;
  const dd = d.slice(1).map((t, i) => t - d[i]);
  if (dd.every((x) => x === dd[0])) return true;
  if (shown.every((t) => t !== 0)) {
    const r = shown[1] / shown[0];
    if (shown.slice(1).every((t, i) => t / shown[i] === r)) return true;
  }
  return false;
}

function makeRule(rng: Rng, type: NumericRuleType): RuleDesc {
  switch (type) {
    case 'arith':
      return { type, start: randInt(rng, 1, 30), k: randInt(rng, 2, 12) };
    case 'arith-neg':
      return { type, start: randInt(rng, 60, 150), k: randInt(rng, 4, 17) };
    case 'geo':
      return { type, start: randInt(rng, 2, 5), k: randInt(rng, 2, 3) };
    case 'second-order':
      return { type, start: randInt(rng, 1, 15), d0: randInt(rng, 2, 9), c: randInt(rng, 1, 5) };
    case 'alternate': {
      const a = randInt(rng, 6, 20);
      let b = randInt(rng, 2, 15);
      if (b === a) b = b === 2 ? 3 : b - 1;
      return { type, start: randInt(rng, 15, 50), a, b };
    }
    case 'two-rules': {
      // Rejeter les tirages où la suite entrelacée ressemble à une règle simple.
      for (let attempt = 0; attempt < 80; attempt++) {
        const dA = randInt(rng, 2, 12);
        let dB = randInt(rng, 2, 12);
        if (dB === dA) dB = dB === 2 ? 3 : dB - 1;
        const rule: RuleDesc = {
          type,
          startA: randInt(rng, 1, 30),
          dA,
          startB: randInt(rng, 1, 30),
          dB,
        };
        if (!looksSimpler(seriesFromRule(rule).slice(0, 4))) return rule;
      }
      return { type, startA: 3, dA: 4, startB: 10, dB: 7 }; // filet déterministe, non ambigu
    }
    case 'squares':
      return { type, n0: randInt(rng, 1, 6), c: randInt(rng, -5, 9) };
    case 'cubes':
      return { type, n0: randInt(rng, 1, 2), c: randInt(rng, -5, 5) };
    case 'fibo': {
      const t1 = randInt(rng, 1, 9);
      return { type, t1, t2: t1 + randInt(rng, 1, 9) };
    }
    case 'palindrome': {
      // Longueurs VARIÉES d'un terme à l'autre : c'est ce qui interdit de
      // chercher une progression et force à regarder le terme lui-même.
      const terms = Array.from({ length: 6 }, () => {
        const half = randInt(rng, 2, 4); // 4 à 9 chiffres, comme Pilotest
        const digits = Array.from({ length: half }, (_, i) =>
          i === 0 ? randInt(rng, 1, 9) : randInt(rng, 0, 9),
        );
        const odd = rng() < 0.5;
        const full = odd
          ? [...digits, randInt(rng, 0, 9), ...[...digits].reverse()]
          : [...digits, ...[...digits].reverse()];
        return Number(full.join(''));
      });
      return { type, terms };
    }
    case 'concat-product': {
      const pairs = Array.from({ length: 6 }, () => {
        const a = randInt(rng, 2, 9);
        const b = randInt(rng, 3, 20);
        return [a, b] as [number, number];
      });
      return { type, pairs };
    }
    case 'mul-add':
      return { type, start: randInt(rng, 2, 6), k: randInt(rng, 2, 3), m: randInt(rng, 3, 12) };
  }
}

/**
 * Distracteurs d'une série de palindromes : des nombres de longueur comparable
 * qui n'en sont PAS. Les distracteurs habituels (dernier écart prolongé, pas
 * inversé) n'ont ici aucun sens — il n'y a pas de pas — et produisaient des
 * nombres absurdes qui désignaient la bonne réponse par élimination.
 */
function palindromeDistractors(rng: Rng, shown: number[], answer: number): number[] {
  const isPal = (n: number) => {
    const d = String(n);
    return d === [...d].reverse().join('');
  };
  const out: number[] = [];
  const seen = new Set([answer, ...shown]);
  // Un palindrome dont on casse la symétrie : c'est le leurre le plus fort,
  // il ressemble en tout point à la bonne réponse.
  for (let guard = 0; guard < 200 && out.length < 3; guard++) {
    const model = pick(rng, [answer, ...shown]);
    const digits = String(model).split('');
    const i = randInt(rng, 0, digits.length - 1);
    digits[i] = String((Number(digits[i]) + randInt(rng, 1, 8)) % 10);
    if (digits[0] === '0') continue;
    const candidate = Number(digits.join(''));
    if (seen.has(candidate) || isPal(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  for (let k = 1; out.length < 3; k++) {
    const candidate = answer + k;
    if (seen.has(candidate) || isPal(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  return out;
}

/**
 * Distracteurs d'une série « a / a×b / b » : des nombres bâtis SUR LE MÊME
 * MOULE mais dont le produit est faux. Le leurre doit être structurellement
 * crédible — sinon il suffirait de compter les chiffres.
 */
function concatProductDistractors(rng: Rng, shown: number[], answer: number): number[] {
  const out: number[] = [];
  const seen = new Set([answer, ...shown]);
  for (let guard = 0; guard < 300 && out.length < 3; guard++) {
    const a = randInt(rng, 2, 9);
    const b = randInt(rng, 3, 20);
    // Le produit affiché est FAUX : c'est exactement ce que le candidat doit voir.
    const faux = a * b + pick(rng, [-3, -2, -1, 1, 2, 3, 10, -10]);
    if (faux <= 0) continue;
    const candidate = Number(`${a}${faux}${b}`);
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  for (let k = 1; out.length < 3; k++) {
    if (seen.has(answer + k)) continue;
    seen.add(answer + k);
    out.push(answer + k);
  }
  return out;
}

/**
 * Distracteurs numériques : chacun matérialise une ERREUR PLAUSIBLE et non un
 * nombre au hasard — prolongement linéaire (on applique le dernier écart),
 * erreur de signe, terme précédent recopié, pas appliqué deux fois.
 */
function numericDistractors(rng: Rng, shown: number[], answer: number): number[] {
  const last = shown[shown.length - 1];
  const prev = shown[shown.length - 2];
  const step = answer - last;
  const candidates = [
    last + (last - prev), // prolongement linéaire du dernier écart
    last - step, // erreur de signe sur le pas
    answer + step, // pas appliqué une fois de trop
    prev, // recopie du terme précédent
    last, // recopie du dernier terme
    answer + (step >= 0 ? 1 : -1), // voisin immédiat, dans le sens de la suite
  ];
  const out: number[] = [];
  const seen = new Set([answer]);
  for (const c of shuffle(rng, candidates)) {
    if (!Number.isFinite(c) || !Number.isInteger(c) || seen.has(c)) continue;
    seen.add(c);
    out.push(c);
    if (out.length === 3) return out;
  }
  for (let k = 1; out.length < 3; k++) {
    for (const c of [answer + k, answer - k]) {
      if (seen.has(c) || out.length === 3) continue;
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Lettres                                                             */
/* ------------------------------------------------------------------ */

export type LetterRule =
  | { type: 'letter-step'; start: number; step: number }
  | { type: 'letter-alternate'; start: number; a: number; b: number }
  | { type: 'letter-interleaved'; startA: number; dA: number; startB: number; dB: number }
  | { type: 'pair-columns'; startA: number; dA: number; startB: number; dB: number }
  | { type: 'pair-internal'; firsts: number[]; delta: number }
  | { type: 'letter-rank'; letters: number[] }
  | { type: 'calendar'; kind: 'months' | 'days'; start: number };

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Index 0-25 → lettre, avec repli cyclique sur l'alphabet. */
export function toLetter(index: number): string {
  return ALPHABET[((index % 26) + 26) % 26];
}

/**
 * Les 6 termes de la série, construits DEPUIS la règle. Chaque terme est une
 * liste de rangs : une seule lettre pour les séries simples, DEUX pour les
 * séries en groupes — c'est le format que pose Pilotest.
 */
export function lettersFromRule(rule: LetterRule): number[][] {
  switch (rule.type) {
    case 'letter-step':
      return Array.from({ length: 6 }, (_, i) => [rule.start + i * rule.step]);
    case 'letter-alternate': {
      const out = [rule.start];
      for (let i = 0; i < 5; i++) out.push(out[out.length - 1] + (i % 2 === 0 ? rule.a : rule.b));
      return out.map((v) => [v]);
    }
    case 'letter-interleaved':
      return Array.from({ length: 6 }, (_, i) => [
        i % 2 === 0 ? rule.startA + (i / 2) * rule.dA : rule.startB + ((i - 1) / 2) * rule.dB,
      ]);
    case 'pair-columns':
      // Deux lois indépendantes, une par colonne. Chaque colonne se lit seule.
      return Array.from({ length: 6 }, (_, i) => [
        rule.startA + i * rule.dA,
        rule.startB + i * rule.dB,
      ]);
    case 'pair-internal':
      // La loi vit DANS le terme : la seconde lettre se déduit de la première,
      // et les premières ne progressent pas. Chercher un pas entre les termes
      // ne mène nulle part — c'est tout l'intérêt de cette famille.
      return rule.firsts.map((f) => [f, f + rule.delta]);
    case 'letter-rank':
    case 'calendar':
      // Ces deux familles produisent directement du TEXTE (« U21 », « M3 ») :
      // elles ne passent pas par des rangs alphabétiques.
      return [];
  }
}

/** Rangs d'un terme → le texte affiché, « ZT » ou « N ». */
export function termToText(ranks: number[]): string {
  return ranks.map(toLetter).join('');
}

function makeLetterRule(rng: Rng, type: LetterRuleType): LetterRule {
  switch (type) {
    case 'letter-step': {
      const step = pick(rng, [2, 3, 4, 5, 6, 7, 8, -2, -3, -4, -5, -6, -7, -8]);
      return { type, start: randInt(rng, 0, 25), step };
    }
    case 'letter-alternate': {
      const a = pick(rng, [2, 3, 4, 5, 6, 7]);
      let b = pick(rng, [-1, -2, -3, 1, 8, 9]);
      if (b === a) b = a + 1;
      return { type, start: randInt(rng, 0, 25), a, b };
    }
    case 'letter-interleaved': {
      const dA = pick(rng, [1, 2, 3, 4, 5]);
      let dB = pick(rng, [1, 2, 3, 4, 5, 6]);
      if (dB === dA) dB = dA === 1 ? 2 : dA - 1;
      return {
        type,
        startA: randInt(rng, 0, 25),
        dA,
        startB: randInt(rng, 0, 25),
        dB,
      };
    }
    case 'pair-columns': {
      // Les deux pas peuvent être ÉGAUX — « TU - QR - NO - KL », les deux
      // lettres reculent de 3 ensemble. C'est le cas facile de la famille, et
      // Pilotest le pose : l'interdire aurait retiré une variante réelle.
      const dA = pick(rng, [2, 3, 4, 5, 6, 7, 8, -3, -4, -5, -7, -9]);
      const dB = pick(rng, [-3, -5, -7, -9, 3, 5, 9, 11, dA, dA]);
      return { type, startA: randInt(rng, 0, 25), dA, startB: randInt(rng, 0, 25), dB };
    }
    case 'letter-rank': {
      // Lettres tirées au hasard : la seule loi est que le nombre accolé EST le
      // rang de la lettre. Aucun pas ne relie les termes.
      return { type, letters: Array.from({ length: 6 }, () => randInt(rng, 0, 25)) };
    }
    case 'calendar': {
      const kind = pick(rng, ['months', 'days'] as const);
      return { type, kind, start: randInt(rng, 0, kind === 'months' ? 5 : 0) };
    }
    case 'pair-internal': {
      const delta = pick(rng, [-5, -7, -9, -11, 4, 6, 8, 10]);
      // Les premières lettres sont TIRÉES AU HASARD, et on s'assure qu'aucun pas
      // constant ne s'installe par accident : la seule loi doit être interne.
      let firsts: number[] = [];
      for (let attempt = 0; attempt < 40; attempt++) {
        firsts = Array.from({ length: 6 }, () => randInt(rng, 0, 25));
        const steps = firsts.slice(1).map((v, i) => (((v - firsts[i]) % 26) + 26) % 26);
        const constant = steps.every((v) => v === steps[0]);
        const distinct = new Set(firsts).size >= 5;
        if (!constant && distinct) break;
      }
      return { type, firsts, delta };
    }
  }
}

/**
 * Distracteurs alphabétiques : ±1 cran (l'erreur de comptage la plus fréquente),
 * le pas appliqué deux fois, et le pas appliqué à l'envers.
 */
function letterDistractors(rng: Rng, shown: number[][], answer: number[]): string[] {
  const seen = new Set([termToText(answer)]);
  const out: string[] = [];
  const push = (ranks: number[]) => {
    const text = termToText(ranks);
    if (seen.has(text) || out.length === 3) return;
    seen.add(text);
    out.push(text);
  };

  if (answer.length === 1) {
    const last = shown[shown.length - 1][0];
    const step = answer[0] - last;
    for (const c of shuffle(rng, [answer[0] + 1, answer[0] - 1, answer[0] + step, last - step, last, answer[0] + 2])) {
      push([c]);
    }
    for (let k = 3; out.length < 3; k++) push([answer[0] + k]);
    return out;
  }

  // Groupes de deux : les erreurs réelles sont le décalage d'un cran sur UNE
  // des deux lettres, l'inversion des deux, et le pas appliqué à l'envers.
  // Un leurre qui satisferait la loi serait une seconde bonne réponse : on ne
  // touche donc jamais aux deux lettres du même écart.
  const [a, b] = answer;
  const candidates: number[][] = [
    [a + 1, b],
    [a, b + 1],
    [a - 1, b],
    [a, b - 1],
    [b, a],
    [a + 2, b],
    [a, b - 2],
    [a - 2, b + 1],
  ];
  for (const c of shuffle(rng, candidates)) push(c);
  for (let k = 3; out.length < 3; k++) push([a + k, b + 1]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Figural                                                             */
/* ------------------------------------------------------------------ */

export type FigShape = 'circle' | 'square' | 'triangle';
export type FigSize = 's' | 'm' | 'l';
export type FigAttr = 'count' | 'rotation' | 'size' | 'filled';

export interface FigDesc {
  shape: FigShape;
  count: number;
  /** 0 | 45 | 90 — toujours 0 hors triangle (rotation invisible sinon). */
  rotation: number;
  filled: boolean;
  size: FigSize;
}

export interface FigRule {
  /** Les attributs qui progressent avec le rang dans la série. */
  attrs: FigAttr[];
  base: FigDesc;
}

const ROTATIONS = [0, 45, 90];
const SIZES: FigSize[] = ['s', 'm', 'l'];

/**
 * Description de l'item de rang `index` — fonction déterministe de la règle.
 * Les attributs ternaires (nombre, rotation, taille) cyclent sur 3 ; le
 * remplissage alterne.
 */
export function cellDesc(rule: FigRule, index: number): FigDesc {
  const d: FigDesc = { ...rule.base };
  for (const attr of rule.attrs) {
    if (attr === 'count') d.count = 1 + (index % 3);
    else if (attr === 'rotation') d.rotation = ROTATIONS[index % 3];
    else if (attr === 'size') d.size = SIZES[index % 3];
    else d.filled = index % 2 === 0;
  }
  return d;
}

function makeFigRule(rng: Rng, nAttrs: number): FigRule {
  const attrs = shuffle(rng, ['count', 'rotation', 'size', 'filled'] as FigAttr[]).slice(0, nAttrs);
  const rotates = attrs.includes('rotation');
  // La rotation n'est visible que sur un triangle (le carré à 90° = carré à 0°).
  const shape: FigShape = rotates
    ? 'triangle'
    : pick(rng, ['circle', 'square', 'triangle'] as FigShape[]);
  const base: FigDesc = {
    shape,
    count: randInt(rng, 1, 3),
    rotation: shape === 'triangle' ? pick(rng, ROTATIONS) : 0,
    filled: rng() < 0.5,
    size: pick(rng, SIZES),
  };
  return { attrs, base };
}

export function figKey(d: FigDesc): string {
  return `${d.shape}|${d.count}|${d.rotation}|${d.filled}|${d.size}`;
}

/** Mutations un-attribut de la bonne réponse : chaque distracteur est réellement faux. */
function figDistractors(rng: Rng, answer: FigDesc): FigDesc[] {
  const muts: FigDesc[] = [];
  for (const count of [1, 2, 3]) if (count !== answer.count) muts.push({ ...answer, count });
  for (const size of SIZES) if (size !== answer.size) muts.push({ ...answer, size });
  muts.push({ ...answer, filled: !answer.filled });
  if (answer.shape === 'triangle') {
    for (const rotation of ROTATIONS) if (rotation !== answer.rotation) muts.push({ ...answer, rotation });
  }
  return shuffle(rng, muts).slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* Item                                                                */
/* ------------------------------------------------------------------ */

export type LogicQuestion =
  | {
      format: 'numeric';
      terms: number[];
      options: number[];
      correctIndex: number;
      rule: RuleDesc;
    }
  | {
      format: 'letters';
      terms: string[];
      options: string[];
      correctIndex: number;
      rule: LetterRule;
    }
  | {
      format: 'words';
      terms: string[];
      options: string[];
      correctIndex: number;
      rule: WordRule;
    }
  | {
      format: 'riddle';
      /** L'énoncé en prose : « Emma a 51 ans. … Quel âge a Gabrielle ? » */
      prompt: string;
      options: string[];
      correctIndex: number;
      rule: RiddleRule;
    }
  | {
      format: 'figural';
      cells: FigDesc[];
      options: FigDesc[];
      correctIndex: number;
      rule: FigRule;
    };

/** L'index de l'option choisie, en chaîne (QCM à 4 choix dans les trois formats). */
export type LogicAnswer = string;

function generateNumeric(rng: Rng, level: number, forcedRule?: NumericRuleType): LogicQuestion {
  const pool = NUMERIC_RULES[Math.min(level, NUMERIC_RULES.length) - 1];
  const type = forcedRule ?? pick(rng, pool);
  const rule = makeRule(rng, type);
  const all = seriesFromRule(rule);
  const shownCount = pick(rng, SERIES_LENGTHS);
  const terms = all.slice(0, shownCount);
  const answer = all[shownCount];
  const distractors =
    rule.type === 'palindrome'
      ? palindromeDistractors(rng, terms, answer)
      : rule.type === 'concat-product'
        ? concatProductDistractors(rng, terms, answer)
        : numericDistractors(rng, terms, answer);
  const options = shuffle(rng, [answer, ...distractors]);
  return { format: 'numeric', terms, options, correctIndex: options.indexOf(answer), rule };
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/**
 * Les familles dont les termes sont du TEXTE — « U21 », « M3 » — et non des
 * rangs alphabétiques. Elles court-circuitent `lettersFromRule`, qui ne sait
 * produire que des lettres.
 */
function textTerms(rule: LetterRule): string[] {
  if (rule.type === 'letter-rank') {
    return rule.letters.map((l) => `${toLetter(l)}${(((l % 26) + 26) % 26) + 1}`);
  }
  if (rule.type === 'calendar') {
    const source = rule.kind === 'months' ? MONTHS : DAYS;
    return Array.from({ length: 6 }, (_, i) => {
      const idx = (rule.start + i) % source.length;
      return `${source[idx][0].toUpperCase()}${idx + 1}`;
    });
  }
  return [];
}

/** Leurres textuels : la même forme, mais la relation interne est fausse. */
function textDistractors(rng: Rng, answer: string): string[] {
  const out: string[] = [];
  const seen = new Set([answer]);
  for (let guard = 0; guard < 300 && out.length < 3; guard++) {
    const letter = toLetter(randInt(rng, 0, 25));
    const trueRank = ALPHABET.indexOf(letter) + 1;
    // Le nombre est DÉCALÉ du vrai rang : le leurre a la bonne allure et la
    // mauvaise relation, ce qui est exactement l'erreur à repérer.
    const shown = trueRank + pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4]);
    if (shown < 1 || shown > 26) continue;
    const candidate = `${letter}${shown}`;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  for (let k = 1; out.length < 3; k++) {
    const candidate = `${toLetter(k)}${k + 3}`;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  return out;
}

function generateLetters(rng: Rng, level: number, forcedRule?: LetterRuleType): LogicQuestion {
  const pool = LETTER_RULES[Math.min(level, LETTER_RULES.length) - 1];
  const type = forcedRule ?? pick(rng, pool);
  const rule = makeLetterRule(rng, type);

  if (rule.type === 'letter-rank' || rule.type === 'calendar') {
    const all = textTerms(rule);
    const shownCount = pick(rng, SERIES_LENGTHS);
    const terms = all.slice(0, shownCount);
    const answer = all[shownCount];
    const options = shuffle(rng, [answer, ...textDistractors(rng, answer)]);
    return { format: 'letters', terms, options, correctIndex: options.indexOf(answer), rule };
  }
  const all = lettersFromRule(rule);
  const shownCount = pick(rng, SERIES_LENGTHS);
  const terms = all.slice(0, shownCount).map(termToText);
  const answer = termToText(all[shownCount]);
  const options = shuffle(rng, [
    answer,
    ...letterDistractors(rng, all.slice(0, shownCount), all[shownCount]),
  ]);
  return { format: 'letters', terms, options, correctIndex: options.indexOf(answer), rule };
}

function generateFigural(rng: Rng, level: number): LogicQuestion {
  const nAttrs = FIGURAL_ATTR_COUNT[Math.min(level, FIGURAL_ATTR_COUNT.length) - 1];
  const rule = makeFigRule(rng, nAttrs);
  const shownCount = pick(rng, SERIES_LENGTHS);
  const cells = Array.from({ length: shownCount }, (_, i) => cellDesc(rule, i));
  const answer = cellDesc(rule, shownCount);
  const options = shuffle(rng, [answer, ...figDistractors(rng, answer)]);
  return {
    format: 'figural',
    cells,
    options,
    correctIndex: options.findIndex((o) => figKey(o) === figKey(answer)),
    rule,
  };
}

export function generate(seed: number, level: number, forceTag?: string): Item<LogicQuestion> {
  const rng = mulberry32(seed);
  const lvl = Math.min(Math.max(level, 1), 5);

  let question: LogicQuestion;
  if ((FORMATS as readonly string[]).includes(forceTag ?? '')) {
    const format = forceTag as SeriesFormat;
    question =
      format === 'numeric'
        ? generateNumeric(rng, lvl)
        : format === 'letters'
          ? generateLetters(rng, lvl)
          : format === 'words'
            ? generateWords(rng)
            : format === 'riddle'
              ? generateRiddle(rng)
              : generateFigural(rng, lvl);
  } else if (forceTag && (ALL_NUMERIC_RULES as string[]).includes(forceTag)) {
    question = generateNumeric(rng, lvl, forceTag as NumericRuleType);
  } else if (forceTag && (ALL_LETTER_RULES as string[]).includes(forceTag)) {
    question = generateLetters(rng, lvl, forceTag as LetterRuleType);
  } else {
    const format = pick(rng, FORMATS);
    question =
      format === 'numeric'
        ? generateNumeric(rng, lvl)
        : format === 'letters'
          ? generateLetters(rng, lvl)
          : format === 'words'
            ? generateWords(rng)
            : format === 'riddle'
              ? generateRiddle(rng)
              : generateFigural(rng, lvl);
  }

  const tags =
    question.format === 'figural'
      ? ['figural', `attrs-${question.rule.attrs.length}`]
      : [question.format, question.rule.type];
  return { question, seed, level, tags };
}

/* ------------------------------------------------------------------ */
/* Mots et énigmes                                                     */
/* ------------------------------------------------------------------ */

export type WordRule = { type: WordRuleType; value: string };

/** La propriété d'un mot, selon la règle. */
function wordKey(rule: WordRuleType, word: string): string {
  if (rule === 'same-length') return String(word.length);
  if (rule === 'same-initial') return word[0];
  return word[word.length - 1];
}

const ALL_WORDS = Object.values(WORDS_BY_LENGTH).flat();

function generateWords(rng: Rng): LogicQuestion {
  // On ne retient une propriété que si assez de mots la partagent ET assez de
  // mots ne la partagent PAS : sans les seconds, il n'y a pas de distracteur.
  const type = pick(rng, WORD_RULES);
  const groups = new Map<string, string[]>();
  for (const w of ALL_WORDS) {
    const k = wordKey(type, w);
    groups.set(k, [...(groups.get(k) ?? []), w]);
  }
  const usable = [...groups.entries()].filter(([, ws]) => ws.length >= 6);
  if (usable.length === 0) return generateWords(mulberry32(randInt(rng, 1, 1e9)));

  const [value, family] = pick(rng, usable);
  const chosen = shuffle(rng, family);
  const shownCount = pick(rng, SERIES_LENGTHS);
  const terms = chosen.slice(0, shownCount);
  const answer = chosen[shownCount];
  const others = shuffle(rng, ALL_WORDS.filter((w) => wordKey(type, w) !== value));
  const options = shuffle(rng, [answer, ...others.slice(0, 3)]);
  return {
    format: 'words',
    terms,
    options,
    correctIndex: options.indexOf(answer),
    rule: { type, value },
  };
}

export type RiddleRule = { type: RiddleRuleType; names: string[]; target: string };

/** Le nombre associé à un prénom, selon la règle. */
export function riddleValue(type: RiddleRuleType, name: string): number {
  const clean = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
  const rank = (c: string) => ALPHABET.indexOf(c) + 1;
  const first = rank(clean[0]);
  const last = rank(clean[clean.length - 1]);
  if (type === 'first-last-concat') return Number(`${first}${last}`);
  if (type === 'first-last-sum') return first + last;
  return Number(`${clean.length}${first}`);
}

function generateRiddle(rng: Rng): LogicQuestion {
  const type = pick(rng, RIDDLE_RULES);
  const picked = shuffle(rng, [...FIRST_NAMES]).slice(0, 4);
  const target = picked[3];
  const answer = riddleValue(type, target);
  const prompt = picked
    .slice(0, 3)
    .map((n) => `${n} a ${riddleValue(type, n)} ans.`)
    .join(' ');

  const seen = new Set([answer]);
  const wrong: number[] = [];
  // Les leurres sont les valeurs qu'AUTRES règles donneraient sur le même
  // prénom : ils punissent la relation mal identifiée, pas le calcul raté.
  for (const other of RIDDLE_RULES) {
    const v = riddleValue(other, target);
    if (!seen.has(v)) {
      seen.add(v);
      wrong.push(v);
    }
  }
  for (const n of shuffle(rng, picked)) {
    if (wrong.length >= 3) break;
    const v = riddleValue(type, n);
    if (!seen.has(v)) {
      seen.add(v);
      wrong.push(v);
    }
  }
  for (let k = 1; wrong.length < 3; k++) {
    if (seen.has(answer + k)) continue;
    seen.add(answer + k);
    wrong.push(answer + k);
  }

  const options = shuffle(rng, [answer, ...wrong.slice(0, 3)]).map((v) => `${v} ans`);
  return {
    format: 'riddle',
    prompt: `${prompt} Quel âge a ${target} ?`,
    options,
    correctIndex: options.indexOf(`${answer} ans`),
    rule: { type, names: picked, target },
  };
}
