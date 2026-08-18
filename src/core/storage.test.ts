import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportAll, importAll, resetAll } from './storage';

/**
 * L'export est le dernier recours en cas de perte de données, et il alimente
 * aussi la synchronisation. Une seule clé mal formée le faisait échouer en
 * entier : `psy0.theme` contient `clair`, une chaîne brute, parce qu'un script
 * inline la lit avant tout JavaScript pour éviter le clignotement de l'écran.
 */

const store = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
});

describe('exportAll / importAll', () => {
  beforeEach(() => store.clear());

  it('exporte malgré une valeur qui n’est pas du JSON', () => {
    // Le cas exact de la panne : « Unexpected token 'c', "clair" ».
    store.set('psy0.theme', 'clair');
    store.set('psy0.prefs', JSON.stringify({ priorities: ['cubes'] }));
    expect(() => exportAll()).not.toThrow();
    expect(JSON.parse(exportAll()).data['psy0.theme']).toBe('clair');
  });

  it('restaure à l’identique, valeurs brutes comprises', () => {
    store.set('psy0.theme', 'clair');
    store.set('psy0.prefs', JSON.stringify({ a: 1 }));
    store.set('psy0.events', JSON.stringify([{ ts: 1 }]));
    const dump = exportAll();
    const avant = new Map(store);

    resetAll();
    expect(store.size).toBe(0);
    importAll(dump);

    expect(store.size).toBe(avant.size);
    for (const [k, v] of avant) expect(store.get(k)).toBe(v);
  });

  it('restaure aussi les exports de l’ancien format (valeurs déjà parsées)', () => {
    // Une sauvegarde faite avant ce correctif doit rester restaurable.
    const ancien = JSON.stringify({
      app: 'psy0-trainer',
      data: { 'psy0.prefs': { priorities: ['cubes'] }, 'psy0.events': [{ ts: 1 }] },
    });
    importAll(ancien);
    expect(JSON.parse(store.get('psy0.prefs')!)).toEqual({ priorities: ['cubes'] });
    expect(JSON.parse(store.get('psy0.events')!)).toEqual([{ ts: 1 }]);
  });

  it('n’exporte que les clés de l’application', () => {
    store.set('psy0.prefs', '{}');
    store.set('autre-app', 'ne doit pas sortir');
    const data = JSON.parse(exportAll()).data;
    expect(Object.keys(data)).toEqual(['psy0.prefs']);
  });

  it('refuse un fichier étranger plutôt que d’écraser les données', () => {
    store.set('psy0.prefs', '{"garder":true}');
    expect(() => importAll(JSON.stringify({ app: 'autre', data: {} }))).toThrow();
    expect(store.get('psy0.prefs')).toBe('{"garder":true}');
  });

  it('produit un export vide sans rien casser quand il n’y a aucune donnée', () => {
    expect(JSON.parse(exportAll()).data).toEqual({});
  });
});
