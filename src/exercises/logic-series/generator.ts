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
  SERIES_LENGTHS,
} from './config';
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
  | { type: 'mul-add'; start: number; k: number; m: number };

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
    case 'mul-add':
      return { type, start: randInt(rng, 2, 6), k: randInt(rng, 2, 3), m: randInt(rng, 3, 12) };
  }
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
  | { type: 'letter-interleaved'; startA: number; dA: number; startB: number; dB: number };

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Index 0-25 → lettre, avec repli cyclique sur l'alphabet. */
export function toLetter(index: number): string {
  return ALPHABET[((index % 26) + 26) % 26];
}

/** Les 6 rangs alphabétiques de la série, construits DEPUIS la règle. */
export function lettersFromRule(rule: LetterRule): number[] {
  switch (rule.type) {
    case 'letter-step':
      return Array.from({ length: 6 }, (_, i) => rule.start + i * rule.step);
    case 'letter-alternate': {
      const out = [rule.start];
      for (let i = 0; i < 5; i++) out.push(out[out.length - 1] + (i % 2 === 0 ? rule.a : rule.b));
      return out;
    }
    case 'letter-interleaved':
      return Array.from({ length: 6 }, (_, i) =>
        i % 2 === 0 ? rule.startA + (i / 2) * rule.dA : rule.startB + ((i - 1) / 2) * rule.dB,
      );
  }
}

function makeLetterRule(rng: Rng, type: LetterRuleType): LetterRule {
  switch (type) {
    case 'letter-step': {
      const step = pick(rng, [2, 3, 4, 5, 6, 7, 8, -2, -3, -4, -5]);
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
  }
}

/**
 * Distracteurs alphabétiques : ±1 cran (l'erreur de comptage la plus fréquente),
 * le pas appliqué deux fois, et le pas appliqué à l'envers.
 */
function letterDistractors(rng: Rng, shown: number[], answer: number): string[] {
  const last = shown[shown.length - 1];
  const step = answer - last;
  const candidates = [answer + 1, answer - 1, answer + step, last - step, last, answer + 2];
  const out: string[] = [];
  const seen = new Set([toLetter(answer)]);
  for (const c of shuffle(rng, candidates)) {
    const letter = toLetter(c);
    if (seen.has(letter)) continue;
    seen.add(letter);
    out.push(letter);
    if (out.length === 3) return out;
  }
  for (let k = 3; out.length < 3; k++) {
    const letter = toLetter(answer + k);
    if (seen.has(letter)) continue;
    seen.add(letter);
    out.push(letter);
  }
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
  const options = shuffle(rng, [answer, ...numericDistractors(rng, terms, answer)]);
  return { format: 'numeric', terms, options, correctIndex: options.indexOf(answer), rule };
}

function generateLetters(rng: Rng, level: number, forcedRule?: LetterRuleType): LogicQuestion {
  const pool = LETTER_RULES[Math.min(level, LETTER_RULES.length) - 1];
  const type = forcedRule ?? pick(rng, pool);
  const rule = makeLetterRule(rng, type);
  const all = lettersFromRule(rule);
  const shownCount = pick(rng, SERIES_LENGTHS);
  const terms = all.slice(0, shownCount).map(toLetter);
  const answer = toLetter(all[shownCount]);
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
          : generateFigural(rng, lvl);
  }

  const tags =
    question.format === 'figural'
      ? ['figural', `attrs-${question.rule.attrs.length}`]
      : [question.format, question.rule.type];
  return { question, seed, level, tags };
}
