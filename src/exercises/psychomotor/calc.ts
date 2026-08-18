import { randInt } from '../../core/rng';
import type { Rng } from '../../core/rng';

/**
 * Calculs du Psychomoteur, format officiel Pilotest : des ÉGALITÉS À DEUX
 * MEMBRES, chacun pouvant porter une opération.
 *   « 10×3 = 120/4 »   « -27+15 = 2-14 »   « 8×13 = 1+103 »   « -51 = 2-5 »
 *
 * Une version antérieure produisait « a op b = résultat », ce qui laissait
 * lire la réponse sans jamais calculer le second membre.
 *
 * Les faux sont PLAUSIBLES, et de deux natures complémentaires :
 *   · `unites-fausses` — le chiffre des unités diffère : comparer les unités
 *     suffit à trancher, c'est le raccourci qui fait gagner du temps ;
 *   · `unites-ok` — l'écart est un multiple de 10, donc les unités CONCORDENT :
 *     le raccourci ne voit rien et il faut calculer pour de bon.
 * Entraîner l'un sans l'autre apprendrait soit la lenteur, soit un réflexe faux.
 */

export type Op = '+' | '-' | '×' | '/';

export type Side =
  | { kind: 'num'; value: number }
  | { kind: 'op'; a: number; op: Op; b: number };

export type Trap = 'aucun' | 'unites-ok' | 'unites-fausses';

export interface Calc {
  left: Side;
  right: Side;
  /** Vrai si l'égalité est FAUSSE — c'est alors qu'il faut presser F. */
  wrong: boolean;
  trap: Trap;
  display: string;
}

export function valueOf(side: Side): number {
  if (side.kind === 'num') return side.value;
  switch (side.op) {
    case '+': return side.a + side.b;
    case '-': return side.a - side.b;
    case '×': return side.a * side.b;
    case '/': return side.a / side.b;
  }
}

/**
 * Un opérande négatif est absorbé dans le signe : « 67+-86 » s'écrit « 67-86 ».
 * Pilotest n'affiche jamais deux signes à la suite, et cette collure est un
 * bruit de lecture pur — elle ralentit sans rien tester.
 */
export function render(side: Side): string {
  if (side.kind === 'num') return String(side.value);
  const { a, op, b } = side;
  if (b < 0 && (op === '+' || op === '-')) {
    return `${a}${op === '+' ? '-' : '+'}${Math.abs(b)}`;
  }
  return `${a}${op}${b}`;
}

export function displayOf(calc: Pick<Calc, 'left' | 'right'>): string {
  return `${render(calc.left)} = ${render(calc.right)}`;
}

const FREE_KINDS = ['add', 'sub', 'mul', 'div', 'num'] as const;
type Kind = (typeof FREE_KINDS)[number];

/** Un membre quelconque, dont on relève la valeur obtenue. */
function freeSide(rng: Rng, kind: Kind): Side {
  switch (kind) {
    case 'num': return { kind: 'num', value: randInt(rng, -60, 120) };
    case 'add': return { kind: 'op', a: randInt(rng, -30, 100), op: '+', b: randInt(rng, 1, 100) };
    case 'sub': return { kind: 'op', a: randInt(rng, -20, 100), op: '-', b: randInt(rng, 1, 60) };
    case 'mul': return { kind: 'op', a: randInt(rng, 2, 15), op: '×', b: randInt(rng, 2, 15) };
    case 'div': {
      // Division ENTIÈRE uniquement : « 120/4 », jamais « 7/2 ».
      const b = randInt(rng, 2, 9);
      const q = randInt(rng, 2, 20);
      return { kind: 'op', a: b * q, op: '/', b };
    }
  }
}

/** Un membre valant EXACTEMENT `target`, pour fabriquer l'égalité voulue. */
function exactSide(rng: Rng, kind: Kind, target: number): Side {
  switch (kind) {
    case 'num': return { kind: 'num', value: target };
    case 'add': {
      const a = randInt(rng, -30, 80);
      return { kind: 'op', a, op: '+', b: target - a };
    }
    case 'sub': {
      const b = randInt(rng, 1, 60);
      return { kind: 'op', a: target + b, op: '-', b };
    }
    case 'div': {
      const b = randInt(rng, 2, 9);
      return { kind: 'op', a: target * b, op: '/', b };
    }
    case 'mul': {
      // La multiplication n'atteint `target` que s'il admet un petit diviseur ;
      // sinon on se rabat sur l'addition, toujours réalisable.
      for (let b = 12; b >= 2; b--) {
        if (target !== 0 && target % b === 0 && Math.abs(target / b) <= 99) {
          return { kind: 'op', a: target / b, op: '×', b };
        }
      }
      return exactSide(rng, 'add', target);
    }
  }
}

/** Écarts qui gardent le même chiffre des unités : le raccourci ne les voit pas. */
const DELTAS_UNITES_OK = [10, -10, 20, -20, 30, -30];
/** Écarts qui changent le chiffre des unités : le raccourci suffit. */
const DELTAS_UNITES_FAUSSES = [1, -1, 2, -2, 3, -3];

export interface CalcOptions {
  /** Probabilité que l'égalité soit fausse. Pilotest : environ la moitié. */
  wrongRate: number;
  /** Part des faux qui gardent le bon chiffre des unités. */
  unitTrapRate?: number;
}

export function makeCalc(rng: Rng, { wrongRate, unitTrapRate = 0.5 }: CalcOptions): Calc {
  const leftKind = FREE_KINDS[randInt(rng, 0, FREE_KINDS.length - 1)];
  // Un nombre seul des DEUX côtés ne serait plus un calcul.
  const rightPool = FREE_KINDS.filter((k) => k !== 'num' || leftKind !== 'num');
  const rightKind = rightPool[randInt(rng, 0, rightPool.length - 1)];

  const left = freeSide(rng, leftKind);
  const truth = valueOf(left);

  const wrong = rng() < wrongRate;
  if (!wrong) {
    const right = exactSide(rng, rightKind, truth);
    return { left, right, wrong: false, trap: 'aucun', display: displayOf({ left, right }) };
  }

  const unitTrap = rng() < unitTrapRate;
  const deltas = unitTrap ? DELTAS_UNITES_OK : DELTAS_UNITES_FAUSSES;
  const delta = deltas[randInt(rng, 0, deltas.length - 1)];
  const right = exactSide(rng, rightKind, truth + delta);

  return {
    left,
    right,
    wrong: true,
    trap: unitTrap ? 'unites-ok' : 'unites-fausses',
    display: displayOf({ left, right }),
  };
}

/** Vérité recalculée depuis les membres — jamais depuis ce que le calcul prétend. */
export function isWrong(calc: Pick<Calc, 'left' | 'right'>): boolean {
  return valueOf(calc.left) !== valueOf(calc.right);
}
