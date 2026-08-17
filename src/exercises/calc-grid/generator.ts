import { mulberry32, pick, randInt, shuffle } from '../../core/rng';
import type { Item } from '../../core/types';
import type { Rng } from '../../core/rng';
import { GRID_SIZE, LEVELS, MAX_WRONG } from './config';
import type { CalcKind } from './config';

/**
 * Grilles de calculs (règle officielle) : « Une grille de 9 calculs vous est
 * donnée. Les calculs peuvent être faux. Chaque grille peut contenir de 0 à 4
 * calculs faux. Vous devez cliquer sur les cases qui contiennent un calcul faux. »
 * 10 grilles, 45 s chacune.
 */

export interface CalcCell {
  /** Énoncé complet AVEC le résultat proposé, ex. « 47 + 38 = 85 ». */
  display: string;
  /** Résultat proposé (parfois faux). */
  shown: number;
  /** Résultat exact. */
  truth: number;
  wrong: boolean;
  kind: CalcKind;
}

export interface CalcQuestion {
  cells: CalcCell[];
  /** Indices des cases fausses (la réponse attendue). */
  wrongIndices: number[];
}

function makeOp(rng: Rng, kind: CalcKind, level: number): { display: string; answer: number; tags: string[] } {
  switch (kind) {
    case 'add': {
      const max = level >= 2 ? 999 : 99;
      const a = randInt(rng, 12, max);
      const b = randInt(rng, 12, Math.min(max, 99));
      return { display: `${a} + ${b}`, answer: a + b, tags: ['add'] };
    }
    case 'sub': {
      // Sans retenue : chaque chiffre du second ≤ chiffre correspondant du premier.
      const tens = randInt(rng, 3, 9);
      const units = randInt(rng, 3, 9);
      const a = tens * 10 + units;
      const b = randInt(rng, 1, tens - 1) * 10 + randInt(rng, 0, units);
      return { display: `${a} − ${b}`, answer: a - b, tags: ['sub'] };
    }
    case 'sub-carry': {
      // Avec retenue : unité du second > unité du premier.
      const aU = randInt(rng, 0, 4);
      const bU = randInt(rng, aU + 1, 9);
      const aT = randInt(rng, 3, 9);
      const bT = randInt(rng, 1, aT - 1);
      const a = aT * 10 + aU;
      const b = bT * 10 + bU;
      return { display: `${a} − ${b}`, answer: a - b, tags: ['sub-carry'] };
    }
    case 'mul': {
      if (level <= 2) {
        const a = randInt(rng, 3, 9);
        const b = randInt(rng, 3, 9);
        return { display: `${a} × ${b}`, answer: a * b, tags: ['mul'] };
      }
      const a = randInt(rng, 12, level >= 5 ? 29 : 19);
      const b = randInt(rng, 3, 9);
      return { display: `${a} × ${b}`, answer: a * b, tags: ['mul'] };
    }
    case 'div': {
      const b = randInt(rng, 3, 12);
      const q = randInt(rng, 4, 15);
      return { display: `${b * q} ÷ ${b}`, answer: q, tags: ['div'] };
    }
    case 'percent': {
      const options: Array<[number, number]> = [
        [10, randInt(rng, 3, 45) * 10],
        [20, randInt(rng, 3, 40) * 5],
        [25, randInt(rng, 4, 30) * 4],
        [50, randInt(rng, 6, 60) * 2],
        [75, randInt(rng, 4, 25) * 4],
      ];
      const [p, base] = pick(rng, options);
      return { display: `${p} % de ${base}`, answer: (p * base) / 100, tags: ['percent'] };
    }
    case 'fraction': {
      const options: Array<[string, number, number, number]> = [
        ['1/2', 1, 2, randInt(rng, 8, 60) * 2],
        ['1/4', 1, 4, randInt(rng, 4, 30) * 4],
        ['3/4', 3, 4, randInt(rng, 4, 25) * 4],
        ['1/3', 1, 3, randInt(rng, 5, 30) * 3],
        ['2/3', 2, 3, randInt(rng, 5, 25) * 3],
      ];
      const [label, num, den, base] = pick(rng, options);
      return { display: `${label} de ${base}`, answer: (num * base) / den, tags: ['fraction'] };
    }
    case 'chain': {
      // Opérations en chaîne, appliquées de gauche à droite.
      const nOps = level >= 4 ? 3 : 2;
      let value = randInt(rng, 15, 80);
      let display = String(value);
      const tags = ['chain'];
      for (let i = 0; i < nOps; i++) {
        let op = pick(rng, level >= 4 ? ['+', '−', '×'] : ['+', '−']);
        // Les résultats intermédiaires restent positifs (comme au test) :
        // si la valeur est trop basse pour soustraire, on additionne.
        if (op === '−' && value < 12) op = '+';
        if (op === '+') {
          const b = randInt(rng, 8, 60);
          value += b;
          display += ` + ${b}`;
        } else if (op === '−') {
          const b = randInt(rng, 5, Math.min(60, value - 1));
          value -= b;
          display += ` − ${b}`;
        } else {
          const b = randInt(rng, 2, 4);
          value *= b;
          display += ` × ${b}`;
        }
      }
      return { display, answer: value, tags };
    }
  }
}

const ALL_KINDS: CalcKind[] = ['add', 'sub', 'sub-carry', 'mul', 'div', 'percent', 'fraction', 'chain'];

/**
 * Résultat faux PLAUSIBLE : erreur de retenue (±10), erreur d'unité (±1/±2),
 * ou inversion des deux derniers chiffres. Jamais un écart grossier — sinon
 * l'exercice se joue à l'ordre de grandeur au lieu du calcul.
 */
function plausibleWrong(rng: Rng, truth: number): number {
  const candidates: number[] = [];
  candidates.push(truth + 10, truth - 10); // retenue oubliée / en trop
  candidates.push(truth + 1, truth - 1, truth + 2, truth - 2); // erreur d'unité
  if (Math.abs(truth) >= 10) {
    const s = String(Math.abs(truth));
    const swappedStr = s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1);
    // On rejette les swaps qui perdent un chiffre (30 → « 03 » = 3) : le faux
    // doit rester du même ordre de grandeur que le vrai.
    if (!swappedStr.startsWith('0') && Number(swappedStr) !== Math.abs(truth)) {
      candidates.push(truth < 0 ? -Number(swappedStr) : Number(swappedStr));
    }
  }
  const valid = candidates.filter((c) => c !== truth && Number.isInteger(c) && c >= 0);
  return valid[randInt(rng, 0, valid.length - 1)];
}

export function generate(seed: number, level: number, forceTag?: string): Item<CalcQuestion> {
  const rng = mulberry32(seed);
  const pool = LEVELS[Math.min(level, LEVELS.length) - 1];
  const forcedKind = forceTag && ALL_KINDS.includes(forceTag as CalcKind) ? (forceTag as CalcKind) : null;

  // Nombre de calculs faux : 0 à 4 (règle officielle). Les grilles sans erreur
  // existent — c'est un piège assumé du test.
  let wrongCount = randInt(rng, 0, MAX_WRONG);
  if (forceTag === 'no-error') wrongCount = 0;
  if (forceTag === 'many-errors') wrongCount = MAX_WRONG;

  const wrongSlots = new Set(shuffle(rng, [...Array(GRID_SIZE).keys()]).slice(0, wrongCount));

  const cells: CalcCell[] = [];
  const kindTags = new Set<string>();
  for (let i = 0; i < GRID_SIZE; i++) {
    const kind = forcedKind ?? pick(rng, pool);
    const op = makeOp(rng, kind, level);
    const wrong = wrongSlots.has(i);
    const shown = wrong ? plausibleWrong(rng, op.answer) : op.answer;
    cells.push({
      display: `${op.display} = ${shown}`,
      shown,
      truth: op.answer,
      wrong,
      kind,
    });
    op.tags.forEach((t) => kindTags.add(t));
  }

  const wrongIndices = cells.map((c, i) => (c.wrong ? i : -1)).filter((i) => i >= 0);
  const tags = [...kindTags, `wrong-${wrongCount}`];
  if (wrongCount === 0) tags.push('no-error');
  if (wrongCount === MAX_WRONG) tags.push('many-errors');

  return { question: { cells, wrongIndices }, seed, level, tags };
}

/** La réponse est l'ensemble des cases cochées : elle doit être EXACTEMENT l'ensemble des fausses. */
export function validate(item: Item<CalcQuestion>, answer: number[]): boolean {
  const given = [...new Set(answer)].sort((a, b) => a - b);
  const expected = [...item.question.wrongIndices].sort((a, b) => a - b);
  return given.length === expected.length && given.every((v, i) => v === expected[i]);
}
