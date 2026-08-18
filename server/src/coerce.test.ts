import { describe, expect, it } from 'vitest';
import { toInt, toIso, usable } from './coerce.ts';

describe('toInt', () => {
  it('arrondit les décimales de performance.now()', () => {
    // Le cas exact qui a fait échouer la synchronisation en production.
    expect(toInt(966.7999999998137)).toBe(967);
    expect(toInt(0.4)).toBe(0);
    expect(toInt(1499.5)).toBe(1500);
  });

  it('laisse les entiers intacts', () => {
    for (const n of [0, 1, 42, 300000, -5]) expect(toInt(n)).toBe(n);
  });

  it('retombe sur la valeur par défaut plutôt que de propager NaN', () => {
    // Un NaN passé à Postgres ferait échouer le lot entier.
    for (const bad of [undefined, null, 'abc', NaN, Infinity, {}]) {
      expect(toInt(bad)).toBe(0);
      expect(toInt(bad, 1)).toBe(1);
    }
  });

  it('accepte les nombres sous forme de chaîne', () => {
    expect(toInt('123')).toBe(123);
    expect(toInt('966.79')).toBe(967);
  });
});

describe('toIso', () => {
  it('convertit un horodatage valide', () => {
    expect(toIso(1755000000000)).toBe(new Date(1755000000000).toISOString());
  });

  it('remplace un horodatage corrompu au lieu de lever', () => {
    const fixe = 1755000000000;
    for (const bad of [undefined, null, 'nawak', NaN, '']) {
      expect(toIso(bad, () => fixe)).toBe(new Date(fixe).toISOString());
    }
  });

  it('refuse de dater un event de 1970', () => {
    // new Date(0) est une date VALIDE : sans garde, un ts nul produirait un
    // event de 1970 qui fausserait fatigue, tendances et créneaux horaires.
    const fixe = 1755000000000;
    for (const bad of [0, -1, 42]) {
      expect(toIso(bad, () => fixe)).toBe(new Date(fixe).toISOString());
    }
  });
});

describe('usable', () => {
  it('accepte un event identifiable', () => {
    expect(usable({ sessionId: 's-1', posInSession: 0 })).toBe(true);
    expect(usable({ sessionId: 's-1', posInSession: '12' })).toBe(true);
  });

  it('écarte ce qui ne peut pas être dédoublonné', () => {
    // (session_id, pos_in_session) porte l'index unique : sans eux, l'insertion
    // dupliquerait l'historique à chaque synchronisation.
    expect(usable({ sessionId: '', posInSession: 0 })).toBe(false);
    expect(usable({ posInSession: 0 })).toBe(false);
    expect(usable({ sessionId: 's-1' })).toBe(false);
    expect(usable({ sessionId: 's-1', posInSession: 'x' })).toBe(false);
  });
});
