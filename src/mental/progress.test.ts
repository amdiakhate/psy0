import { describe, expect, it } from 'vitest';
import {
  EMPTY_STAT,
  MASTERY_MIN_ATTEMPTS,
  RECENT_WINDOW,
  assess,
  median,
  record,
} from './progress';
import type { Attempt, TechniqueStat } from './progress';

const TARGET = 4000;

function build(attempts: Attempt[]): TechniqueStat {
  return attempts.reduce(record, EMPTY_STAT);
}

const ok = (ms: number): Attempt => ({ ok: true, ms });
const ko = (ms: number): Attempt => ({ ok: false, ms });

describe('médiane', () => {
  it('renvoie null sur une série vide', () => {
    expect(median([])).toBeNull();
  });

  it('prend la valeur centrale, et la moyenne des deux centrales en nombre pair', () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('ignore un essai aberrant, là où la moyenne le suivrait', () => {
    const values = [1000, 1100, 1200, 1300, 60000];
    const moyenne = values.reduce((a, b) => a + b, 0) / values.length;
    expect(median(values)).toBe(1200);
    expect(moyenne).toBeGreaterThan(12000);
  });
});

describe('enregistrement', () => {
  it('cumule les totaux sans les plafonner', () => {
    const stat = build(Array.from({ length: 25 }, (_, i) => (i % 5 === 0 ? ko(3000) : ok(3000))));
    expect(stat.attempts).toBe(25);
    expect(stat.correct).toBe(20);
  });

  it('ne garde que la fenêtre récente, et dans l’ordre', () => {
    const stat = build(Array.from({ length: 25 }, (_, i) => ok(i)));
    expect(stat.recent).toHaveLength(RECENT_WINDOW);
    expect(stat.recent[0].ms).toBe(25 - RECENT_WINDOW);
    expect(stat.recent[RECENT_WINDOW - 1].ms).toBe(24);
  });
});

describe('maîtrise', () => {
  it('reste « neuve » tant qu’il y a trop peu d’essais pour conclure', () => {
    expect(assess(EMPTY_STAT, TARGET).level).toBe('neuf');
    expect(assess(build([ok(500), ok(500), ok(500), ok(500)]), TARGET).level).toBe('neuf');
  });

  it('devient « acquise » quand c’est juste ET rapide', () => {
    const stat = build(Array.from({ length: MASTERY_MIN_ATTEMPTS }, () => ok(TARGET - 500)));
    const verdict = assess(stat, TARGET);
    expect(verdict.level).toBe('acquis');
    expect(verdict.accuracy).toBe(1);
    expect(verdict.tooSlow).toBe(false);
  });

  it('refuse « acquise » à ce qui est juste mais trop lent, et le dit', () => {
    const stat = build(Array.from({ length: 10 }, () => ok(TARGET + 1500)));
    const verdict = assess(stat, TARGET);
    expect(verdict.level).toBe('en-cours');
    expect(verdict.accuracy).toBe(1);
    expect(verdict.tooSlow).toBe(true);
  });

  it('bascule en « fragile » sous 70 % de justesse', () => {
    const stat = build([ok(900), ko(900), ko(900), ok(900), ko(900), ok(900), ko(900), ok(900)]);
    expect(assess(stat, TARGET).level).toBe('fragile');
  });

  it('chronomètre les seuls essais justes : une erreur expédiée ne fait pas gagner', () => {
    const rapideEtFaux = build([...Array.from({ length: 7 }, () => ko(200)), ok(TARGET + 5000)]);
    expect(assess(rapideEtFaux, TARGET).medianMs).toBe(TARGET + 5000);
    expect(assess(rapideEtFaux, TARGET).level).toBe('fragile');
  });

  it('oublie un mauvais départ dès que la fenêtre a défilé', () => {
    const debut = Array.from({ length: RECENT_WINDOW }, () => ko(9000));
    const suite = Array.from({ length: RECENT_WINDOW }, () => ok(1000));
    expect(assess(build(debut), TARGET).level).toBe('fragile');
    expect(assess(build([...debut, ...suite]), TARGET).level).toBe('acquis');
  });
});
