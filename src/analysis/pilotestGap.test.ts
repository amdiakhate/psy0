import { describe, expect, it } from 'vitest';
import {
  GAP_THRESHOLD,
  isAtLocalCeiling,
  normalizeLevel,
  pilotestGap,
} from './pilotestGap';

describe('normalizeLevel', () => {
  it('projette les bornes sur les bornes de l’échelle Stanine', () => {
    expect(normalizeLevel(1, 5)).toBe(1);
    expect(normalizeLevel(5, 5)).toBe(9);
    expect(normalizeLevel(1, 9)).toBe(1);
    expect(normalizeLevel(9, 9)).toBe(9);
  });

  it('projette linéairement le milieu', () => {
    expect(normalizeLevel(3, 5)).toBe(5);
    expect(normalizeLevel(2, 5)).toBe(3);
    expect(normalizeLevel(4, 5)).toBe(7);
  });

  it('reste dans 1-9 quel que soit l’entrant', () => {
    for (let maxLevel = 1; maxLevel <= 10; maxLevel++) {
      for (let level = -3; level <= maxLevel + 3; level++) {
        const c = normalizeLevel(level, maxLevel);
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(9);
      }
    }
  });

  it('reste monotone : monter d’un niveau ne fait jamais baisser la classe', () => {
    for (let maxLevel = 2; maxLevel <= 9; maxLevel++) {
      for (let level = 1; level < maxLevel; level++) {
        expect(normalizeLevel(level + 1, maxLevel)).toBeGreaterThanOrEqual(normalizeLevel(level, maxLevel));
      }
    }
  });

  it('ne projette rien pour un exercice à niveau unique', () => {
    expect(normalizeLevel(1, 1)).toBe(5);
    expect(normalizeLevel(1, 0)).toBe(5);
  });
});

describe('pilotestGap', () => {
  it('déclare « surestime » quand le local est en avance d’au moins 2 classes', () => {
    // Niveau 5/5 → classe 9 locale ; Pilotest dit 6 → l'app flatte de 3 points.
    const g = pilotestGap(5, 5, 6);
    expect(g.localClass).toBe(9);
    expect(g.gap).toBe(3);
    expect(g.verdict).toBe('surestime');
  });

  it('déclare « sous-estime » quand le local est en retard d’au moins 2 classes', () => {
    const g = pilotestGap(2, 5, 7);
    expect(g.localClass).toBe(3);
    expect(g.gap).toBe(-4);
    expect(g.verdict).toBe('sous-estime');
  });

  it('déclare « cohérent » dans la bande de tolérance', () => {
    for (const delta of [-1, 0, 1]) {
      const local = normalizeLevel(3, 5); // 5
      expect(pilotestGap(3, 5, local - delta).verdict).toBe('coherent');
    }
  });

  it('bascule exactement au seuil, pas avant', () => {
    const local = normalizeLevel(3, 5); // 5
    expect(pilotestGap(3, 5, local - (GAP_THRESHOLD - 1)).verdict).toBe('coherent');
    expect(pilotestGap(3, 5, local - GAP_THRESHOLD).verdict).toBe('surestime');
    expect(pilotestGap(3, 5, local + GAP_THRESHOLD).verdict).toBe('sous-estime');
  });

  it('inverse le verdict quand on inverse les deux mesures', () => {
    // Même paire de classes (9 et 4), lue dans les deux sens.
    const localAhead = pilotestGap(5, 5, 4); // local 9 vs Pilotest 4
    const pilotestAhead = pilotestGap(1, 5, 9); // local 1 vs Pilotest 9
    expect(localAhead.verdict).toBe('surestime');
    expect(localAhead.gap).toBe(5);
    expect(pilotestAhead.verdict).toBe('sous-estime');
    expect(pilotestAhead.gap).toBe(-8);
  });
});

describe('isAtLocalCeiling', () => {
  it('détecte le plafond de la difficulté adaptative', () => {
    expect(isAtLocalCeiling(5, 5)).toBe(true);
    expect(isAtLocalCeiling(4, 5)).toBe(false);
    // Un niveau persisté au-delà du max (registre modifié) compte aussi.
    expect(isAtLocalCeiling(6, 5)).toBe(true);
  });

  it('ne déclare rien pour un exercice sans niveau', () => {
    expect(isAtLocalCeiling(1, 0)).toBe(false);
  });
});
