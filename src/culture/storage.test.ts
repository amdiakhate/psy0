import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CULTURE_STORAGE_KEY,
  emptyCultureStore,
  loadCultureStore,
  markQuestionUnderstood,
  migrateCultureStore,
  recordCultureAnswer,
  saveCultureStore,
  setFinalStretch,
  toggleFavoriteLesson,
  toggleFavoriteQuestion,
} from './storage';

const values = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => void values.set(key, value),
  removeItem: (key: string) => void values.delete(key),
  key: (index: number) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
});

describe('stockage Culture V2', () => {
  beforeEach(() => values.clear());

  it('part d’un schéma versionné vide', () => {
    expect(loadCultureStore()).toEqual(emptyCultureStore());
  });

  it('ignore la clé de l’ancien module', () => {
    values.set('psy0.culture', JSON.stringify({ ancien: true }));
    expect(loadCultureStore()).toEqual(emptyCultureStore());
    expect(values.get('psy0.culture')).toContain('ancien');
  });

  it('sauvegarde et recharge progression, favoris et mode final', () => {
    let store = emptyCultureStore();
    store = toggleFavoriteQuestion(store, 'doc26-01');
    store = toggleFavoriteLesson(store, 'lesson-vdt');
    store = setFinalStretch(store, true);
    store = recordCultureAnswer({ store, questionId: 'doc26-01', category: 'mental-math', verdict: 'known', sessionId: 's1', mode: 'review', now: new Date('2026-08-29T10:00:00Z') });
    saveCultureStore(store);
    expect(values.has(`psy0.${CULTURE_STORAGE_KEY}`)).toBe(true);
    expect(loadCultureStore()).toEqual(store);
  });

  it('retombe sur un store vide pour un JSON invalide ou une version inconnue', () => {
    values.set(`psy0.${CULTURE_STORAGE_KEY}`, '{');
    expect(loadCultureStore()).toEqual(emptyCultureStore());
    expect(migrateCultureStore({ version: 99, progress: { q: {} } })).toEqual(emptyCultureStore());
  });

  it('marque une question comprise sans la supprimer', () => {
    let store = recordCultureAnswer({ store: emptyCultureStore(), questionId: 'doc26-01', category: 'mental-math', verdict: 'wrong', sessionId: 's1', mode: 'errors', now: new Date('2026-08-29T10:00:00Z') });
    store = markQuestionUnderstood(store, 'doc26-01', new Date('2026-08-29T11:00:00Z'));
    expect(store.progress['doc26-01']).toMatchObject({ incorrectCount: 1, understoodAt: '2026-08-29T11:00:00.000Z' });
  });
});
