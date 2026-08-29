import type { Rng } from '../../core/rng';
import type { CultureQuestion } from '../types';

function pick<T>(rng: Rng, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)];
}

function normalize(value: number): number {
  return ((value % 360) + 360) % 360;
}

function display(value: number): string {
  return String(normalize(value)).padStart(3, '0');
}

function numeric(id: string, question: string, answer: number, explanation: string, tags: string[]): CultureQuestion {
  return {
    id,
    tier: 'core',
    category: 'navigation',
    categories: ['navigation', 'aerodromes'],
    tags: [...tags, 'généré'],
    question,
    type: 'numeric',
    answer,
    acceptedAnswers: [answer, display(answer)],
    explanation,
    difficulty: 1,
    isTimeSensitive: false,
    highYield: true,
    memoryTip: 'Normalise toujours le résultat entre 000° et 359°.',
  };
}

export function generateHeadingQuestion(rng: Rng): CultureQuestion {
  const kind = Math.floor(rng() * 5);
  const nonce = Math.floor(rng() * 1_000_000);
  const headings = Array.from({ length: 36 }, (_, index) => index * 10);
  const current = pick(rng, headings);

  if (kind === 0) {
    const delta = pick(rng, [30, 40, 60, 70, 80, 100, 120, 150, 170]);
    const right = rng() >= 0.5;
    const answer = normalize(current + (right ? delta : -delta));
    return numeric(`generated-turn-${nonce}`, `Cap actuel ${display(current)}°. Tourne à ${right ? 'droite' : 'gauche'} de ${delta}°. Nouveau cap ?`, answer, `${display(current)} ${right ? '+' : '−'} ${delta} = ${right ? current + delta : current - delta}. Après passage éventuel par 360°, le cap est ${display(answer)}°.`, ['caps']);
  }
  if (kind === 1) {
    const other = pick(rng, headings.filter((heading) => heading !== current));
    const direct = Math.abs(other - current);
    const answer = Math.min(direct, 360 - direct);
    return numeric(`generated-angle-${nonce}`, `Quelle est la plus petite différence angulaire entre ${display(current)}° et ${display(other)}° ?`, answer, `Écart direct : ${direct}°. Écart par le nord : ${360 - direct}°. Le plus petit vaut ${answer}°.`, ['caps', 'différence angulaire']);
  }
  if (kind === 2) {
    const answer = normalize(current + 180);
    return numeric(`generated-opposite-${nonce}`, `Quel est le cap opposé de ${display(current)}° ?`, answer, `Un cap opposé diffère de 180° : ${display(current)} + 180°, normalisé, donne ${display(answer)}°.`, ['caps', 'cap opposé']);
  }
  if (kind === 3) {
    const cardinal = pick(rng, [
      { name: 'Nord', answer: '000°' }, { name: 'Est', answer: '090°' },
      { name: 'Sud', answer: '180°' }, { name: 'Ouest', answer: '270°' },
    ]);
    return {
      id: `generated-cardinal-${nonce}`,
      tier: 'core',
      category: 'navigation', categories: ['navigation'], tags: ['caps', 'orientation cardinale', 'généré'],
      question: `Quel cap correspond au point cardinal ${cardinal.name} ?`, type: 'single-choice',
      choices: ['000°', '090°', '180°', '270°'], answer: cardinal.answer,
      explanation: `${cardinal.name} correspond au cap ${cardinal.answer}.`, difficulty: 1,
      isTimeSensitive: false, highYield: true, memoryTip: 'N 000, E 090, S 180, W 270.',
    };
  }
  const qfu = pick(rng, Array.from({ length: 36 }, (_, index) => index + 1));
  const cap = qfu * 10 === 360 ? 360 : qfu * 10;
  return numeric(`generated-qfu-${nonce}`, `Quel QFU correspond approximativement au cap ${String(cap).padStart(3, '0')}° ?`, qfu, `Le QFU retire le zéro final du cap arrondi à la dizaine : ${String(cap).padStart(3, '0')}° → ${String(qfu).padStart(2, '0')}.`, ['QFU', 'caps']);
}
