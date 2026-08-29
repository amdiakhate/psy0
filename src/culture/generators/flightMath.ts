import type { Rng } from '../../core/rng';
import type { CultureQuestion } from '../types';

const MINUTES = [5, 10, 15, 20, 30, 45] as const;
const SPEEDS = [60, 90, 120, 150, 180, 240, 300, 360, 420] as const;

function pick<T>(rng: Rng, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)];
}

function fraction(minutes: number): { numerator: number; denominator: number; label: string } {
  const map: Record<number, [number, number]> = {
    5: [1, 12], 10: [1, 6], 15: [1, 4], 20: [1, 3], 30: [1, 2], 45: [3, 4],
  };
  const [numerator, denominator] = map[minutes];
  return { numerator, denominator, label: numerator === 1 ? `1/${denominator}` : `${numerator}/${denominator}` };
}

function base(id: string, question: string, answer: number, explanation: string): CultureQuestion {
  return {
    id,
    category: 'mental-math',
    categories: ['mental-math', 'navigation'],
    tags: ['vitesse-distance-temps', 'généré'],
    question,
    type: 'numeric',
    answer,
    acceptedAnswers: [answer],
    explanation,
    difficulty: 1,
    isTimeSensitive: false,
    highYield: true,
    memoryTip: 'Convertis les minutes en fraction simple avant de calculer.',
  };
}

export function generateFlightMathQuestion(rng: Rng): CultureQuestion {
  const kind = Math.floor(rng() * 3) as 0 | 1 | 2;
  let minutes = pick(rng, MINUTES);
  let speed = pick(rng, SPEEDS);
  let f = fraction(minutes);
  let distance = speed * f.numerator / f.denominator;
  for (let tries = 0; !Number.isInteger(distance) && tries < 20; tries += 1) {
    minutes = pick(rng, MINUTES);
    speed = pick(rng, SPEEDS);
    f = fraction(minutes);
    distance = speed * f.numerator / f.denominator;
  }
  const nonce = Math.floor(rng() * 1_000_000);
  if (kind === 0) {
    return base(`generated-distance-${nonce}`, `À ${speed} kt pendant ${minutes} min, quelle distance parcours-tu en NM ?`, distance, `${minutes} min = ${f.label} h. D = V × T = ${speed} × ${f.label} = ${distance} NM.`);
  }
  if (kind === 1) {
    return base(`generated-time-${nonce}`, `Tu dois parcourir ${distance} NM à ${speed} kt. Combien de minutes faut-il ?`, minutes, `T = D ÷ V = ${distance} ÷ ${speed} h = ${f.label} h, soit ${minutes} minutes.`);
  }
  return base(`generated-speed-${nonce}`, `Quelle vitesse en kt faut-il pour parcourir ${distance} NM en ${minutes} min ?`, speed, `${minutes} min = ${f.label} h. V = D ÷ T = ${distance} ÷ ${f.label} = ${speed} kt.`);
}
