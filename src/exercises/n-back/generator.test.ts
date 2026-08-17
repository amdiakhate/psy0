import { describe, expect, it } from 'vitest';
import { generate } from './generator';
import { DIGIT_MS, LEVELS, N, SEQ_LENGTH } from './config';

const SEEDS = 150;
const LEVELS_RANGE = Array.from({ length: LEVELS.length }, (_, i) => i + 1);

describe('n-back generator', () => {
  it('est déterministe : même seed → même séquence', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('N vaut 2 à tous les niveaux, et la série fait 42 chiffres', () => {
    expect(N).toBe(2);
    expect(SEQ_LENGTH).toBe(42);
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        expect(q.n).toBe(2);
        expect(q.positions).toHaveLength(42);
        expect(generate(seed, level).tags).toEqual(['n=2']);
      }
    }
  });

  it('le dispositif temporel vient du niveau : 1 s d’affichage, fenêtre de réponse ≤ 3 s', () => {
    for (const level of LEVELS_RANGE) {
      const cfg = LEVELS[level - 1];
      const q = generate(1, level).question;
      expect(q.digitMs).toBe(DIGIT_MS);
      expect(q.digitMs).toBe(1000);
      expect(q.responseMs).toBe(cfg.responseMs);
      expect(q.responseMs).toBeLessThanOrEqual(3000);
      expect(q.responseMs).toBeGreaterThanOrEqual(2000);
    }
  });

  it('les fenêtres de réponse se resserrent aux niveaux élevés', () => {
    expect(LEVELS[0].responseMs).toBe(3000);
    expect(LEVELS[LEVELS.length - 1].responseMs).toBeLessThan(LEVELS[0].responseMs);
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].responseMs).toBeLessThanOrEqual(LEVELS[i - 1].responseMs);
    }
  });

  it('les kinds reflètent exactement les valeurs (match ⇔ digit[i] === digit[i-2])', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { positions } = generate(seed, level).question;
        positions.forEach((pos, i) => {
          if (i < 2) {
            expect(pos.kind).toBe('warmup');
            expect(pos.expected).toBe(false);
            return;
          }
          const isMatch = pos.digit === positions[i - 2].digit;
          expect(pos.expected).toBe(isMatch);
          if (isMatch) expect(pos.kind).toBe('match');
          else expect(['lure', 'plain']).toContain(pos.kind);
          if (pos.kind === 'lure') {
            const isNMinus1 = pos.digit === positions[i - 1].digit;
            const isNPlus1 = i >= 3 && pos.digit === positions[i - 3].digit;
            expect(isNMinus1 || isNPlus1).toBe(true);
          }
          if (pos.kind === 'plain') {
            const isNMinus1 = pos.digit === positions[i - 1].digit;
            const isNPlus1 = i >= 3 && pos.digit === positions[i - 3].digit;
            expect(isNMinus1 || isNPlus1).toBe(false);
          }
        });
      }
    }
  });

  it('taux de lures exploitable à chaque niveau, et croissant avec le niveau', () => {
    const lureRate = (level: number) => {
      let lures = 0;
      let evaluable = 0;
      for (let seed = 0; seed < SEEDS; seed++) {
        for (const pos of generate(seed, level).question.positions) {
          if (pos.kind === 'warmup') continue;
          evaluable++;
          if (pos.kind === 'lure') lures++;
        }
      }
      return lures / evaluable;
    };
    const rates = LEVELS_RANGE.map(lureRate);
    for (const r of rates) expect(r).toBeGreaterThan(0.1);
    expect(rates[rates.length - 1]).toBeGreaterThan(rates[0] * 1.5);
  });

  it('contient des matches en proportion raisonnable (20-45 %) à tous les niveaux', () => {
    for (const level of LEVELS_RANGE) {
      let matches = 0;
      let evaluable = 0;
      for (let seed = 0; seed < SEEDS; seed++) {
        for (const pos of generate(seed, level).question.positions) {
          if (pos.kind === 'warmup') continue;
          evaluable++;
          if (pos.kind === 'match') matches++;
        }
      }
      const rate = matches / evaluable;
      expect(rate).toBeGreaterThan(0.2);
      expect(rate).toBeLessThan(0.45);
    }
  });

  it('forceTag=lure augmente nettement le taux de lures', () => {
    let base = 0;
    let forced = 0;
    for (let seed = 0; seed < SEEDS; seed++) {
      base += generate(seed, 1).question.positions.filter((p) => p.kind === 'lure').length;
      forced += generate(seed, 1, 'lure').question.positions.filter((p) => p.kind === 'lure').length;
    }
    expect(forced).toBeGreaterThan(base * 1.5);
  });

  it('forceTag=match augmente nettement le taux de matches', () => {
    let base = 0;
    let forced = 0;
    for (let seed = 0; seed < SEEDS; seed++) {
      base += generate(seed, 5).question.positions.filter((p) => p.kind === 'match').length;
      forced += generate(seed, 5, 'match').question.positions.filter(
        (p) => p.kind === 'match',
      ).length;
    }
    expect(forced).toBeGreaterThan(base * 1.3);
  });

  it('chaque série contient au moins un match et un lure', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const kinds = generate(seed, level).question.positions.map((p) => p.kind);
        expect(kinds).toContain('match');
        expect(kinds).toContain('lure');
      }
    }
  });
});
