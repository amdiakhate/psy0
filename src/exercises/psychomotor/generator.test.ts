import { describe, expect, it } from 'vitest';
import { calcIndexAt, directionAt, generate, shapeIndexAt } from './generator';
import { DIRECTIONS, LEVELS, SCHEDULE_HORIZON_S } from './config';

/**
 * 40 seeds × 5 niveaux : chaque item planifie ~500 événements sur 330 s
 * d'horizon, donc un balayage plus large coûte des minutes sans rien couvrir
 * de plus (les invariants portent sur la structure, pas sur des cas rares).
 */
const SEEDS = 40;

describe('psychomotor : les trois tâches (règle officielle)', () => {
  it('est déterministe', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 40; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('① les segments couvrent toute l’épreuve, sont triés, et changent de direction à chaque fois', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { segments } = generate(seed, level).question;
        expect(segments[0].t).toBe(0);
        expect(segments[segments.length - 1].t).toBeGreaterThan(SCHEDULE_HORIZON_S - 5);
        for (let i = 1; i < segments.length; i++) {
          expect(segments[i].t).toBeGreaterThan(segments[i - 1].t);
          // Deux segments consécutifs de même direction seraient invisibles pour le joueur.
          expect(segments[i].direction).not.toBe(segments[i - 1].direction);
          expect(DIRECTIONS).toContain(segments[i].direction);
        }
      }
    }
  });

  it('② les paires de formes : `match` est vrai si et seulement si les deux formes sont égales', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        for (const pair of generate(seed, level).question.shapes) {
          expect(pair.match).toBe(pair.left === pair.inCircle);
        }
      }
    }
  });

  it('② le taux de paires identiques reste dans une fourchette jouable (20-45 %)', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      let matches = 0;
      let total = 0;
      for (let seed = 0; seed < SEEDS; seed++) {
        for (const pair of generate(seed, level).question.shapes) {
          total++;
          if (pair.match) matches++;
        }
      }
      const rate = matches / total;
      expect(rate).toBeGreaterThan(0.2);
      expect(rate).toBeLessThan(0.45);
    }
  });

  it('③ les calculs : `wrong` correspond exactement au résultat affiché', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        for (const calc of generate(seed, level).question.calcs) {
          const m = calc.display.match(/^(\d+) ([+−×]) (\d+) = (-?\d+)$/);
          expect(m).not.toBeNull();
          const [, a, op, b, shown] = m!;
          const truth = op === '+' ? +a + +b : op === '−' ? +a - +b : +a * +b;
          expect(calc.wrong).toBe(Number(shown) !== truth);
        }
      }
    }
  });

  it('③ les faux calculs restent plausibles (écart ≤ 10)', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      for (const calc of generate(seed, 4).question.calcs) {
        if (!calc.wrong) continue;
        const m = calc.display.match(/^(\d+) ([+−×]) (\d+) = (-?\d+)$/)!;
        const truth = m[2] === '+' ? +m[1] + +m[3] : m[2] === '−' ? +m[1] - +m[3] : +m[1] * +m[3];
        expect(Math.abs(Number(m[4]) - truth)).toBeLessThanOrEqual(10);
      }
    }
  });

  it('les trois plannings couvrent l’épreuve sans trou', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const q = generate(3, level).question;
      expect(q.shapes[q.shapes.length - 1].t).toBeGreaterThan(SCHEDULE_HORIZON_S - 10);
      expect(q.calcs[q.calcs.length - 1].t).toBeGreaterThan(SCHEDULE_HORIZON_S - 10);
      // À tout instant de l'épreuve, une direction, une paire et un calcul sont définis.
      for (let t = 3; t < 300; t += 7) {
        expect(DIRECTIONS).toContain(directionAt(q.segments, t));
        expect(shapeIndexAt(q.shapes, t, q.shapeIntervalMs)).toBeGreaterThanOrEqual(0);
        expect(calcIndexAt(q.calcs, t, q.calcIntervalMs)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('directionAt renvoie bien la direction du segment courant', () => {
    const { segments } = generate(5, 2).question;
    for (let i = 0; i < Math.min(segments.length - 1, 40); i++) {
      const mid = (segments[i].t + segments[i + 1].t) / 2;
      expect(directionAt(segments, mid)).toBe(segments[i].direction);
    }
  });

  it('la difficulté monte : intervalles plus courts aux niveaux élevés', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].shapeIntervalMs).toBeLessThan(LEVELS[i - 1].shapeIntervalMs);
      expect(LEVELS[i].calcIntervalMs).toBeLessThan(LEVELS[i - 1].calcIntervalMs);
      expect(LEVELS[i].driftSegmentMs[1]).toBeLessThan(LEVELS[i - 1].driftSegmentMs[1]);
    }
  });

  it('forceTag oriente les tâches secondaires', () => {
    const shapeForced = generate(11, 3, 'shape-match').question.shapes.filter((s) => s.match).length;
    const shapeBase = generate(11, 3).question.shapes.filter((s) => s.match).length;
    expect(shapeForced).toBeGreaterThan(shapeBase);
    const calcForced = generate(11, 3, 'calc-wrong').question.calcs.filter((c) => c.wrong).length;
    const calcBase = generate(11, 3).question.calcs.filter((c) => c.wrong).length;
    expect(calcForced).toBeGreaterThan(calcBase);
  });
});
