import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ItemEvent } from './types';

/**
 * L'event log garde un cache mémoire flushé en différé. Le piège : un flush
 * déclenché APRÈS un import ou une réinitialisation réécrit l'ancien contenu
 * par-dessus le nouveau — la sauvegarde restaurée disparaît en silence.
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

const event = (seed: number): ItemEvent => ({
  ts: 1_755_000_000_000 + seed,
  sessionId: 's1',
  mode: 'guided60',
  exercise: 'cubes',
  level: 2,
  seed,
  tags: ['mirror-trap'],
  rtMs: 3000,
  correct: true,
  given: 'a',
  expected: 'a',
  posInSession: seed,
  minuteInSession: 0,
});

async function freshModule() {
  vi.resetModules();
  return import('./eventlog');
}

describe('eventlog', () => {
  beforeEach(() => store.clear());

  it('relit ce qui a été flushé', async () => {
    const log = await freshModule();
    log.appendEvent(event(1));
    log.flushNow();
    expect(JSON.parse(store.get('psy0.events')!)).toHaveLength(1);
  });

  it('discardCache abandonne le cache sans l’écrire', async () => {
    const log = await freshModule();
    log.appendEvent(event(1));
    log.appendEvent(event(2));
    // Un import écrit directement dans le storage, par-dessus tout.
    store.set('psy0.events', JSON.stringify([event(99)]));

    log.discardCache();
    log.flushNow(); // simule le beforeunload du rechargement qui suit

    // Sans discardCache, ce flush aurait réécrit les 2 events d'avant l'import.
    const persisted = JSON.parse(store.get('psy0.events')!) as ItemEvent[];
    expect(persisted).toHaveLength(1);
    expect(persisted[0].seed).toBe(99);
    // Et la prochaine lecture repart bien du storage.
    expect(log.getEvents()).toHaveLength(1);
  });

  it('discardCache rend visible une réinitialisation', async () => {
    const log = await freshModule();
    log.appendEvent(event(1));
    log.flushNow();

    store.delete('psy0.events'); // resetAll()
    log.discardCache();
    log.flushNow(); // beforeunload

    expect(store.has('psy0.events')).toBe(false);
    expect(log.getEvents()).toEqual([]);
  });

  it('annule le flush différé en attente', async () => {
    vi.useFakeTimers();
    const log = await freshModule();
    log.appendEvent(event(1)); // arme un flush à 1 s
    store.set('psy0.events', JSON.stringify([event(99)]));
    log.discardCache();
    vi.advanceTimersByTime(5000);
    expect(JSON.parse(store.get('psy0.events')!)).toHaveLength(1);
    vi.useRealTimers();
  });
});
