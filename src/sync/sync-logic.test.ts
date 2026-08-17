import { describe, expect, it } from 'vitest';
import { chunk, decideSync, describeStatus, pendingEvents } from './sync-logic';
import type { SyncState } from './sync-logic';

const state = (over: Partial<SyncState> = {}): SyncState => ({
  localBaseVersion: 0,
  localDirty: false,
  localHasData: false,
  serverVersion: 0,
  ...over,
});

describe('decideSync', () => {
  it('ne fait rien à la toute première utilisation', () => {
    expect(decideSync(state()).kind).toBe('nothing');
  });

  it('tire quand le local est vierge et le serveur peuplé', () => {
    // Cas du nouvel appareil : on récupère la progression sans rien écraser.
    expect(decideSync(state({ serverVersion: 7 })).kind).toBe('pull');
  });

  it('pousse quand seul le local a avancé', () => {
    const d = decideSync(state({ localHasData: true, localDirty: true, localBaseVersion: 3, serverVersion: 3 }));
    expect(d.kind).toBe('push');
  });

  it('tire quand seul le serveur a avancé', () => {
    // Séance faite sur un autre appareil : rien de local à perdre.
    const d = decideSync(state({ localHasData: true, localDirty: false, localBaseVersion: 3, serverVersion: 5 }));
    expect(d.kind).toBe('pull');
  });

  it('ne fait rien quand les deux sont alignés', () => {
    expect(decideSync(state({ localHasData: true, localBaseVersion: 4, serverVersion: 4 })).kind).toBe('in-sync');
  });

  it('déclare un conflit quand les deux ont avancé — jamais d’écrasement silencieux', () => {
    const d = decideSync(state({ localHasData: true, localDirty: true, localBaseVersion: 3, serverVersion: 5 }));
    expect(d).toEqual({ kind: 'conflict', serverVersion: 5, localBaseVersion: 3 });
  });

  it('privilégie le serveur quand le local est vierge, même marqué modifié', () => {
    // Un local vide « modifié » n'a rien qui vaille la peine d'être défendu.
    const d = decideSync(state({ localHasData: false, localDirty: true, serverVersion: 2 }));
    expect(d.kind).toBe('pull');
  });

  it('ne déclare jamais de conflit si le local n’a pas de données', () => {
    for (let serverVersion = 0; serverVersion <= 5; serverVersion++) {
      for (const localDirty of [false, true]) {
        const d = decideSync(state({ localHasData: false, localDirty, serverVersion, localBaseVersion: 0 }));
        expect(d.kind).not.toBe('conflict');
      }
    }
  });
});

describe('pendingEvents', () => {
  const events = [{ ts: 1000 }, { ts: 2000 }, { ts: 3000 }, { ts: 4000 }];

  it('renvoie tout quand rien n’a jamais été synchronisé', () => {
    expect(pendingEvents(events, 0, 0)).toHaveLength(4);
  });

  it('ne renvoie que ce qui suit le dernier envoi', () => {
    expect(pendingEvents(events, 2000, 0).map((e) => e.ts)).toEqual([3000, 4000]);
  });

  it('renvoie une marge de recouvrement : mieux vaut doublonner que perdre', () => {
    // Le serveur dédoublonne sur (sessionId, posInSession) : renvoyer un peu
    // trop est sans conséquence, alors qu'un envoi manqué perd des items.
    expect(pendingEvents(events, 3000, 1500).map((e) => e.ts)).toEqual([2000, 3000, 4000]);
  });

  it('ne renvoie rien quand tout est déjà parti', () => {
    expect(pendingEvents(events, 10_000, 0)).toEqual([]);
  });
});

describe('chunk', () => {
  it('découpe sans rien perdre ni dupliquer', () => {
    const items = Array.from({ length: 2500 }, (_, i) => i);
    const lots = chunk(items, 1000);
    expect(lots).toHaveLength(3);
    expect(lots.flat()).toEqual(items);
    for (const lot of lots) expect(lot.length).toBeLessThanOrEqual(1000);
  });

  it('gère la liste vide', () => {
    expect(chunk([], 100)).toEqual([]);
  });

  it('refuse une taille de lot absurde plutôt que de boucler sans fin', () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow();
  });
});

describe('describeStatus', () => {
  it('formule chaque état sans jamais laisser croire à tort que c’est sauvegardé', () => {
    expect(describeStatus({ state: 'hors-ligne' })).toContain('cet appareil');
    expect(describeStatus({ state: 'deconnecte' })).toContain('cet appareil uniquement');
    expect(describeStatus({ state: 'en-attente' })).toContain('en attente');
    expect(describeStatus({ state: 'erreur', message: 'timeout' })).toContain('timeout');
    expect(describeStatus({ state: 'conflit', serverVersion: 5, localBaseVersion: 3 })).toContain('5');
  });
});
