import { describe, expect, it } from 'vitest';
import { BANK } from './bank';
import {
  BOX_DELAYS_DAYS,
  EMPTY_CARD,
  MAX_BOX,
  cardOf,
  coverage,
  isDue,
  record,
  review,
  reviewOrder,
} from './progress';
import type { CultureProgress } from './progress';

const DAY = 86_400_000;
const T0 = 1_700_000_000_000;

describe('boîtes de Leitner', () => {
  it('fait monter d’un cran sur une bonne réponse', () => {
    expect(review(EMPTY_CARD, 'correct', T0).box).toBe(1);
    expect(review({ ...EMPTY_CARD, box: 2 }, 'correct', T0).box).toBe(3);
  });

  it('plafonne à la dernière boîte', () => {
    expect(review({ ...EMPTY_CARD, box: MAX_BOX }, 'correct', T0).box).toBe(MAX_BOX);
  });

  /** Une fausse croyance se reprend depuis le début ; un trou, non. */
  it('renvoie une erreur à zéro et ne rétrograde une abstention que d’un cran', () => {
    expect(review({ ...EMPTY_CARD, box: 4 }, 'wrong', T0).box).toBe(0);
    expect(review({ ...EMPTY_CARD, box: 4 }, 'skip', T0).box).toBe(3);
    expect(review({ ...EMPTY_CARD, box: 0 }, 'skip', T0).box).toBe(0);
  });

  it('tient les compteurs', () => {
    const c1 = review(EMPTY_CARD, 'correct', T0);
    const c2 = review(c1, 'wrong', T0 + 1000);
    expect(c2).toMatchObject({ seen: 2, ok: 1, lastSeen: T0 + 1000 });
  });
});

describe('échéance', () => {
  it('considère une question jamais vue comme due', () => {
    expect(isDue(EMPTY_CARD, T0)).toBe(true);
  });

  it('respecte le délai de la boîte', () => {
    for (const box of BOX_DELAYS_DAYS.keys()) {
      const card = { box, lastSeen: T0, seen: 1, ok: 1 };
      const delay = BOX_DELAYS_DAYS[box] * DAY;
      // La boîte 0 n'a pas de délai : elle est due dès la seconde suivante, et
      // il n'y a pas d'« avant » à tester sans remonter le temps.
      if (delay > 0) expect(isDue(card, T0 + delay - 1), `boîte ${box}`).toBe(false);
      expect(isDue(card, T0 + delay), `boîte ${box}`).toBe(true);
    }
  });

  it('espace de plus en plus', () => {
    for (let i = 1; i < BOX_DELAYS_DAYS.length; i++) {
      expect(BOX_DELAYS_DAYS[i]).toBeGreaterThan(BOX_DELAYS_DAYS[i - 1]);
    }
  });
});

describe('ordre de révision', () => {
  const pool = BANK.slice(0, 6);

  it('place les questions dues avant les autres', () => {
    let p: CultureProgress = {};
    // Les trois premières viennent d'être réussies : leur boîte 1 les repousse d'un jour.
    for (const e of pool.slice(0, 3)) p = record(p, e.id, 'correct', T0);
    const order = reviewOrder(pool, p, T0 + DAY / 2).map((e) => e.id);
    expect(order.slice(0, 3).sort()).toEqual(pool.slice(3).map((e) => e.id).sort());
  });

  it('remonte d’abord ce qui a été raté', () => {
    let p: CultureProgress = {};
    p = record(p, pool[4].id, 'wrong', T0); // boîte 0, due immédiatement
    p = record(p, pool[5].id, 'correct', T0); // boîte 1
    const order = reviewOrder(pool, p, T0 + 30 * DAY).map((e) => e.id);
    expect(order[0]).toBe(pool[4].id);
    // Les jamais-vues passent avant l'acquise.
    expect(order.indexOf(pool[5].id)).toBe(order.length - 1);
  });

  it('rend toujours tout le vivier', () => {
    expect(reviewOrder(pool, {}, T0)).toHaveLength(pool.length);
  });
});

describe('couverture', () => {
  it('part de zéro et tout est dû', () => {
    const c = coverage(BANK, {}, T0);
    expect(c).toMatchObject({ total: BANK.length, seen: 0, solid: 0, due: BANK.length });
  });

  it('compte comme solide une question montée en boîte 3', () => {
    let p: CultureProgress = {};
    const id = BANK[0].id;
    for (let i = 0; i < 3; i++) p = record(p, id, 'correct', T0 + i);
    expect(cardOf(p, id).box).toBe(3);
    const c = coverage([BANK[0]], p, T0 + 3);
    expect(c).toMatchObject({ seen: 1, solid: 1, due: 0 });
  });
});
