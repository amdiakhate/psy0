import type { Rng } from '../core/rng';
import { shuffle } from '../core/rng';
import type { MentalItem } from './techniques';

/**
 * Les options d'un item posé en QCM.
 *
 * Au PSY0 on ne PRODUIT jamais un résultat : sur les Grilles de calculs on
 * clique les cases fausses, sur le Psychomoteur on appuie sur F. Les deux fois
 * on JUGE un résultat proposé. Le drill doit donc savoir poser ses items dans
 * cette posture-là, et pas seulement en saisie libre.
 *
 * Les leurres matérialisent des ERREURS PLAUSIBLES — un cran d'écart, une
 * retenue oubliée, deux chiffres inversés, une lettre voisine. Des nombres au
 * hasard se repéreraient à l'ordre de grandeur et le QCM se jouerait sans
 * calculer, ce qui viderait l'exercice de son objet.
 */

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Inversion des deux derniers chiffres : 84 → 48. L'erreur de transcription classique. */
function swapLast(n: number): number | null {
  const s = String(Math.abs(n));
  if (s.length < 2) return null;
  const swapped = s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1);
  if (swapped.startsWith('0') || Number(swapped) === Math.abs(n)) return null;
  return n < 0 ? -Number(swapped) : Number(swapped);
}

function numericDistractors(rng: Rng, answer: number): number[] {
  const candidates = [
    answer + 1,
    answer - 1,
    answer + 10,
    answer - 10,
    swapLast(answer),
    answer + 2,
    answer - 2,
    answer * 2,
  ].filter((v): v is number => v !== null && v > 0 && Number.isInteger(v) && v !== answer);

  const out: number[] = [];
  const seen = new Set([answer]);
  for (const c of shuffle(rng, candidates)) {
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
    if (out.length === 3) return out;
  }
  for (let k = 3; out.length < 3; k++) {
    if (seen.has(answer + k)) continue;
    seen.add(answer + k);
    out.push(answer + k);
  }
  return out;
}

function letterDistractors(rng: Rng, answer: string): string[] {
  const rank = ALPHA.indexOf(answer) + 1;
  const at = (r: number) => ALPHA[(((r - 1) % 26) + 26) % 26];
  // Les erreurs réelles : un cran de trop ou de trop peu en comptant, et le
  // miroir — qu'on prend pour la réponse dès qu'un énoncé parle d'inverse.
  const candidates = [at(rank + 1), at(rank - 1), at(27 - rank), at(rank + 2), at(rank - 2), at(rank + 5)];
  const out: string[] = [];
  const seen = new Set([answer]);
  for (const c of shuffle(rng, candidates)) {
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
    if (out.length === 3) return out;
  }
  for (let k = 3; out.length < 3; k++) {
    const c = at(rank + k);
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out;
}

export interface Choices {
  /** Les quatre options affichées, dans l'ordre. */
  options: string[];
  correctIndex: number;
}

/** Les quatre options d'un item. `null` pour un verdict, qui se répond déjà d'une touche. */
export function choicesFor(item: MentalItem, rng: Rng): Choices | null {
  if (item.kind === 'verdict') return null;

  const answer = String(item.answer);
  const wrong =
    item.kind === 'value'
      ? numericDistractors(rng, item.answer).map(String)
      : letterDistractors(rng, item.answer);

  const options = shuffle(rng, [answer, ...wrong]);
  return { options, correctIndex: options.indexOf(answer) };
}
