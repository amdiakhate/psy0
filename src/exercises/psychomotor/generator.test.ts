import { describe, expect, it } from 'vitest';
import { SCROLL_MAX, allCalcs, calcIndexAt, directionAt, generate, scrollOffsetAt, shapeIndexAt } from './generator';
import { CALC_LANE_SIZE, DIRECTIONS, LEVELS, SCHEDULE_HORIZON_S } from './config';

/** Évalue un membre « a+b » / « 120/4 » / « -51 » — recalcul indépendant. */
function evalMembre(texte: string): number {
  const m = texte.match(/^(-?\d+)([+\-×/])(-?\d+)$/);
  if (!m) return Number(texte);
  const [, a, op, b] = m;
  if (op === '+') return +a + +b;
  if (op === '-') return +a - +b;
  if (op === '×') return +a * +b;
  return +a / +b;
}

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

  it('③ les calculs : `wrong` est recalculé depuis les deux membres', () => {
    // Format officiel : une ÉGALITÉ à deux membres (« 10×3 = 120/4 »), et non
    // « a op b = résultat », qui laissait lire la réponse sans rien calculer.
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        for (const calc of allCalcs(generate(seed, level).question.waves)) {
          const [gauche, droite] = calc.display.split(' = ');
          expect(droite).toBeDefined();
          expect(calc.wrong).toBe(evalMembre(gauche) !== evalMembre(droite));
        }
      }
    }
  });

  it('③ le bandeau montre quatre calculs par vague, à vitesse variable', () => {
    // C'est ce qui permet d'ANTICIPER : lire les calculs avant qu'ils soient
    // entourés. Un calcul unique à la fois n'entraîne pas cette compétence.
    const { waves } = generate(5, 3).question;
    expect(waves.length).toBeGreaterThan(5);
    for (const w of waves) expect(w.calcs).toHaveLength(CALC_LANE_SIZE);
    const vitesses = new Set(waves.map((w) => w.speed));
    expect(vitesses.size).toBeGreaterThan(waves.length / 2);
  });

  it('③ environ la moitié des calculs sont faux', () => {
    const calcs = allCalcs(generate(7, 3).question.waves);
    const faux = calcs.filter((c) => c.wrong).length / calcs.length;
    expect(faux).toBeGreaterThan(0.3);
    expect(faux).toBeLessThan(0.65);
  });

  it('③ les deux pièges sur les unités sont présents', () => {
    // Sans les deux, on entraînerait soit un réflexe faux, soit la lenteur.
    const faux = allCalcs(generate(9, 4).question.waves).filter((c) => c.wrong);
    expect(faux.some((c) => c.trap === 'unites-ok')).toBe(true);
    expect(faux.some((c) => c.trap === 'unites-fausses')).toBe(true);
  });

  it('les trois plannings couvrent l’épreuve sans trou', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const q = generate(3, level).question;
      expect(q.shapes[q.shapes.length - 1].t).toBeGreaterThan(SCHEDULE_HORIZON_S - 10);
      expect(allCalcs(q.waves)[allCalcs(q.waves).length - 1].t).toBeGreaterThan(SCHEDULE_HORIZON_S - 10);
      // À tout instant de l'épreuve, une direction, une paire et un calcul sont définis.
      for (let t = 3; t < 300; t += 7) {
        expect(DIRECTIONS).toContain(directionAt(q.segments, t));
        expect(shapeIndexAt(q.shapes, t, q.shapeIntervalMs)).toBeGreaterThanOrEqual(0);
        expect(calcIndexAt(allCalcs(q.waves), t, q.calcIntervalMs)).toBeGreaterThanOrEqual(0);
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
    const calcForced = allCalcs(generate(11, 3, 'calc-wrong').question.waves).filter((c) => c.wrong).length;
    const calcBase = allCalcs(generate(11, 3).question.waves).filter((c) => c.wrong).length;
    expect(calcForced).toBeGreaterThan(calcBase);
  });
});

describe('défilement du bandeau', () => {
  it('ne fait jamais sortir les calculs de l’écran', () => {
    // Au-delà, les derniers calculs seraient hors champ avant d'être entourés :
    // impossible de les lire à l'avance, donc plus rien à anticiper.
    for (let seed = 0; seed < 20; seed++) {
      const q = generate(seed, 5).question;
      for (const w of q.waves.slice(0, 5)) {
        const span = (CALC_LANE_SIZE * q.calcIntervalMs) / 1000;
        for (let t = w.t; t <= w.t + span; t += 0.5) {
          const off = scrollOffsetAt(w, t, q.calcIntervalMs);
          expect(off).toBeGreaterThanOrEqual(0);
          expect(off).toBeLessThanOrEqual(SCROLL_MAX);
        }
      }
    }
  });

  it('progresse de manière monotone pendant la vague', () => {
    const q = generate(3, 2).question;
    const w = q.waves[0];
    let precedent = -1;
    for (let t = w.t; t < w.t + 10; t += 0.4) {
      const off = scrollOffsetAt(w, t, q.calcIntervalMs);
      expect(off).toBeGreaterThanOrEqual(precedent);
      precedent = off;
    }
  });
});
