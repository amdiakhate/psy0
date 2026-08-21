import { describe, expect, it } from 'vitest';
import {
  ACCIDENT_COST,
  CLOSE_COST,
  GLOBAL_COST,
  bestPossiblePercent,
  passationPercent,
  seriesScore,
  stanineFor,
} from './scoring';
import { SERIES_PER_PASSATION } from './config';
import { generate } from './generator';

describe('score d’une série', () => {
  it('donne 100 à une série sans accident et sans fermeture', () => {
    expect(seriesScore({ closures: 0, globals: 0, accident: false })).toBe(100);
  });

  it('retire un point par voie fermée', () => {
    expect(seriesScore({ closures: 1, globals: 0, accident: false })).toBe(100 - CLOSE_COST);
    expect(seriesScore({ closures: 4, globals: 0, accident: false })).toBe(100 - 4 * CLOSE_COST);
  });

  it('facture le bouton global bien plus cher', () => {
    expect(seriesScore({ closures: 0, globals: 1, accident: false })).toBe(100 - GLOBAL_COST);
    expect(GLOBAL_COST).toBeGreaterThan(CLOSE_COST);
  });

  /**
   * Le dilemme du test, exprimé en chiffres : le bouton global vaut cinq
   * fermetures. Il est perdant tant qu'on peut s'en tirer avec quatre voies, et
   * gagnant dès qu'il en faudrait six.
   */
  it('rend le global rentable seulement au-delà de cinq voies à fermer', () => {
    const global = seriesScore({ closures: 0, globals: 1, accident: false });
    expect(seriesScore({ closures: 4, globals: 0, accident: false })).toBeGreaterThan(global);
    expect(seriesScore({ closures: 5, globals: 0, accident: false })).toBe(global);
    expect(seriesScore({ closures: 6, globals: 0, accident: false })).toBeLessThan(global);
  });

  it('sanctionne lourdement l’accident', () => {
    expect(seriesScore({ closures: 0, globals: 0, accident: true })).toBe(100 - ACCIDENT_COST);
    // Un accident coûte plus cher que de fermer TOUTES les voies d'un groupe.
    expect(ACCIDENT_COST).toBeGreaterThan(12 * CLOSE_COST);
  });

  it('ne descend jamais sous zéro', () => {
    expect(seriesScore({ closures: 40, globals: 4, accident: true })).toBe(0);
  });
});

describe('pourcentage de passation', () => {
  it('moyenne les séries', () => {
    expect(passationPercent([100, 100, 50, 50])).toBe(75);
  });

  it('rend zéro sans série jouée', () => {
    expect(passationPercent([])).toBe(0);
  });
});

describe('table stanine officielle', () => {
  it('respecte les seuils annoncés', () => {
    for (const [percent, expected] of [
      [25, 2],
      [35, 3],
      [50, 4],
      [65, 5],
      [80, 6],
      [90, 7],
      [95, 8],
      [100, 9],
    ] as const) {
      expect(stanineFor(percent), `${percent} %`).toBe(expected);
    }
  });

  it('lit les seuils comme « atteint », pas « dépassé »', () => {
    expect(stanineFor(89)).toBe(6);
    expect(stanineFor(90)).toBe(7);
    expect(stanineFor(94)).toBe(7);
    expect(stanineFor(95)).toBe(8);
    expect(stanineFor(99)).toBe(8);
  });

  it('tombe en classe 1 sous 25 %', () => {
    expect(stanineFor(24)).toBe(1);
    expect(stanineFor(0)).toBe(1);
  });

  it('est monotone', () => {
    for (let p = 1; p <= 100; p++) {
      expect(stanineFor(p)).toBeGreaterThanOrEqual(stanineFor(p - 1));
    }
  });
});

describe('la classe 9 doit rester hors d’atteinte', () => {
  /**
   * Le garde-fou demandé : la classe 9 exige 100 %, donc une passation sans
   * aucune fermeture. Chaque série générée en force au moins une, donc même un
   * jeu PARFAIT plafonne sous 100 %. Sans cette propriété, l'app décernerait la
   * meilleure classe du barème pour une performance que le test ne récompense
   * jamais — et le candidat se croirait prêt.
   */
  it('même une passation parfaite reste sous 100 %, sur plusieurs parties', () => {
    for (const seed of [11, 22, 33, 44]) {
      const { series } = generate(seed, 3).question;
      const best = bestPossiblePercent(series.map((s) => s.par));
      expect(best, `graine ${seed}`).toBeLessThan(100);
      expect(stanineFor(best), `graine ${seed}`).toBeLessThan(9);
    }
  });

  it('reste vrai à tous les niveaux adaptatifs', () => {
    for (let level = 1; level <= 5; level++) {
      const { series } = generate(1234 + level, level).question;
      expect(series).toHaveLength(SERIES_PER_PASSATION);
      expect(bestPossiblePercent(series.map((s) => s.par)), `niveau ${level}`).toBeLessThan(100);
    }
  });

  /** …sans pour autant rendre les bonnes classes inaccessibles : le jeu parfait doit payer. */
  it('laisse une passation parfaite atteindre au moins la classe 7', () => {
    for (const seed of [11, 22, 33, 44]) {
      const { series } = generate(seed, 3).question;
      const best = bestPossiblePercent(series.map((s) => s.par));
      expect(stanineFor(best), `graine ${seed}`).toBeGreaterThanOrEqual(7);
    }
  });
});
