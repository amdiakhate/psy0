import { describe, expect, it } from 'vitest';
import { scoreOf, stanineOf } from './scoring';
import type { PsyTally } from './scoring';

const tally = (o: Partial<PsyTally> = {}): PsyTally => ({
  trackedMs: 0, totalMs: 0,
  shapeHits: 0, shapeTargets: 0, shapeFalse: 0,
  calcHits: 0, calcTargets: 0, calcFalse: 0,
  ...o,
});

describe('stanineOf — barème officiel écrasé', () => {
  it('place chaque seuil sur la bonne classe', () => {
    const attendu: Array<[number, number]> = [
      [96, 9], [95, 8], [93, 7], [90, 6], [85, 5], [79, 4], [69, 3], [57, 2],
    ];
    for (const [pct, classe] of attendu) expect(stanineOf(pct)).toBe(classe);
  });

  it('bascule exactement AU seuil, pas un point avant', () => {
    expect(stanineOf(95)).toBe(8);
    expect(stanineOf(94)).toBe(7);
    expect(stanineOf(90)).toBe(6);
    expect(stanineOf(89)).toBe(5);
  });

  it('donne 1 en dessous du premier seuil', () => {
    for (const pct of [0, 30, 56]) expect(stanineOf(pct)).toBe(1);
  });

  it('reste monotone : mieux réussir ne fait jamais baisser la classe', () => {
    for (let p = 0; p < 100; p++) expect(stanineOf(p + 1)).toBeGreaterThanOrEqual(stanineOf(p));
  });

  it('montre pourquoi la classe seule est trompeuse', () => {
    // 11 points d'écart réel tiennent dans une seule classe...
    expect(stanineOf(85)).toBe(stanineOf(89));
    // ...tandis que 2 points en font gagner deux, plus haut sur l'échelle.
    expect(stanineOf(93)).toBe(7);
    expect(stanineOf(95)).toBe(8);
  });
});

describe('scoreOf — les trois tâches pèsent autant', () => {
  it('donne 100 % quand tout est réussi', () => {
    const s = scoreOf(tally({
      trackedMs: 300000, totalMs: 300000,
      shapeHits: 20, shapeTargets: 20,
      calcHits: 30, calcTargets: 30,
    }));
    expect(s.percent).toBe(100);
    expect(s.stanine).toBe(9);
  });

  it('pondère à parts égales, sans laisser la poursuite dominer', () => {
    // Poursuite parfaite mais deux tâches ratées : le score doit s'effondrer,
    // alors qu'un comptage par événement l'aurait maintenu très haut.
    const s = scoreOf(tally({
      trackedMs: 300000, totalMs: 300000,
      shapeHits: 0, shapeTargets: 20,
      calcHits: 0, calcTargets: 30,
    }));
    expect(s.percent).toBe(33);
    expect(s.stanine).toBe(1);
  });

  it('retranche les faux positifs : appuyer partout ne paie pas', () => {
    const propre = scoreOf(tally({ trackedMs: 100, totalMs: 100, shapeHits: 10, shapeTargets: 10 }));
    const arrose = scoreOf(tally({ trackedMs: 100, totalMs: 100, shapeHits: 10, shapeTargets: 10, shapeFalse: 5 }));
    expect(arrose.percent).toBeLessThan(propre.percent);
    expect(arrose.shapes).toBeCloseTo(0.5, 5);
  });

  it('ne descend jamais sous zéro sur une tâche', () => {
    const s = scoreOf(tally({ trackedMs: 100, totalMs: 100, shapeHits: 1, shapeTargets: 2, shapeFalse: 50 }));
    expect(s.shapes).toBe(0);
    expect(s.percent).toBeGreaterThanOrEqual(0);
  });

  it('ne pénalise pas une tâche sans cible, mais sanctionne les appuis inutiles', () => {
    // Une séance sans forme identique ne doit pas coûter un tiers du score.
    expect(scoreOf(tally({ trackedMs: 10, totalMs: 10 })).percent).toBe(100);
    expect(scoreOf(tally({ trackedMs: 10, totalMs: 10, shapeFalse: 3 })).shapes).toBe(0);
  });

  it('mesure la poursuite en proportion du temps', () => {
    const s = scoreOf(tally({ trackedMs: 240000, totalMs: 300000, shapeHits: 10, shapeTargets: 10, calcHits: 10, calcTargets: 10 }));
    expect(s.tracking).toBeCloseTo(0.8, 5);
    expect(s.percent).toBe(93);
  });
});
