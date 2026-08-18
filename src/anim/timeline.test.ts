import { describe, expect, it } from 'vitest';
import { duration, easeInOut, foldCycle, linear, valueAt } from './timeline';

describe('lissages', () => {
  it('restent dans [0,1] et fixent les extrémités', () => {
    for (const ease of [linear, easeInOut]) {
      expect(ease(0)).toBe(0);
      expect(ease(1)).toBe(1);
      for (let i = 0; i <= 20; i++) {
        const y = ease(i / 20);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(1);
      }
    }
  });

  it('easeInOut est monotone — un mouvement qui recule est un bug visuel', () => {
    let prev = -1;
    for (let i = 0; i <= 100; i++) {
      const y = easeInOut(i / 100);
      expect(y).toBeGreaterThanOrEqual(prev);
      prev = y;
    }
  });
});

describe('valueAt', () => {
  const segs = [
    { to: 1, ms: 1000 },
    { to: 1, ms: 500 },
    { to: 0, ms: 1000 },
    { to: 0, ms: 500 },
  ];

  it('part de la valeur initiale et atteint chaque cible', () => {
    expect(valueAt(segs, 0)).toBe(0);
    expect(valueAt(segs, 1000)).toBe(1);
    expect(valueAt(segs, 2500)).toBe(0);
  });

  it('tient les pauses : la valeur ne bouge pas pendant un segment plat', () => {
    for (const t of [1000, 1100, 1250, 1499]) expect(valueAt(segs, t)).toBe(1);
    for (const t of [2500, 2700, 2999]) expect(valueAt(segs, t)).toBe(0);
  });

  it('boucle proprement, y compris pour t négatif ou très grand', () => {
    expect(valueAt(segs, 3000)).toBe(valueAt(segs, 0));
    expect(valueAt(segs, 3000 * 7 + 1234)).toBeCloseTo(valueAt(segs, 1234), 12);
    expect(valueAt(segs, -500)).toBeCloseTo(valueAt(segs, 2500), 12);
  });

  it('sans boucle, borne aux extrémités au lieu de replier', () => {
    expect(valueAt(segs, -100, 0, false)).toBe(0);
    expect(valueAt(segs, 99999, 0, false)).toBe(0); // fin de cycle = 0
    expect(valueAt([{ to: 1, ms: 100 }], 99999, 0, false)).toBe(1);
  });

  it('reste borné entre 0 et 1 sur tout le cycle standard', () => {
    const cycle = foldCycle();
    for (let t = 0; t < duration(cycle); t += 37) {
      const v = valueAt(cycle, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
