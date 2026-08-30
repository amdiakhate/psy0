import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CULTURE_STORAGE_KEY,
  emptyCultureStore,
  loadCultureStore,
  markQuestionUnderstood,
  migrateCultureStore,
  recordCultureAnswer,
  recordCultureDrillAttempt,
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

describe('stockage Culture V3', () => {
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
    store = recordCultureDrillAttempt({ store, drillType: 'distance', correct: true, expectedAnswer: 60, givenAnswer: 60, now: new Date('2026-08-29T10:01:00Z') });
    saveCultureStore(store);
    expect(values.has(`psy0.${CULTURE_STORAGE_KEY}`)).toBe(true);
    expect(loadCultureStore()).toEqual(store);
  });

  it('retombe sur un store vide pour un JSON invalide ou une version inconnue', () => {
    values.set(`psy0.${CULTURE_STORAGE_KEY}`, '{');
    expect(loadCultureStore()).toEqual(emptyCultureStore());
    expect(migrateCultureStore({ version: 99, progress: { q: {} } })).toEqual(emptyCultureStore());
  });

  it('migre le store V1 sans perdre la progression et reconstruit le dernier verdict', () => {
    const migrated = migrateCultureStore({
      version: 1,
      progress: { q: { questionId: 'q', seenCount: 1, correctCount: 0, incorrectCount: 1, currentStreak: 0, mastery: 'learning' } },
      attempts: [{ id: 'a', questionId: 'q', category: 'navigation', answeredAt: '2026-08-29T10:00:00.000Z', correct: false, verdict: 'wrong', sessionId: 's1', mode: 'review' }],
      sessions: [], favoriteQuestionIds: [], favoriteLessonIds: [], activeDays: [], finalStretch: true,
    });
    expect(migrated.version).toBe(3);
    expect(migrated.progress.q).toMatchObject({ lastVerdict: 'wrong', activeError: true, examReady: false });
    expect(migrated.finalStretch).toBe(true);
  });

  it('enregistre les drills séparément des tentatives de la banque statique', () => {
    const store = recordCultureDrillAttempt({
      store: emptyCultureStore(),
      drillType: 'heading-turn',
      correct: false,
      expectedAnswer: 30,
      givenAnswer: 40,
      now: new Date('2026-08-30T08:00:00Z'),
    });
    expect(store.attempts).toEqual([]);
    expect(store.drillAttempts).toHaveLength(1);
    expect(store.drillAttempts[0]).toMatchObject({
      drillType: 'heading-turn',
      correct: false,
      expectedAnswer: 30,
      givenAnswer: 40,
      answeredAt: '2026-08-30T08:00:00.000Z',
    });
  });

  it('migre un store V2 avec une liste de drills vide', () => {
    const migrated = migrateCultureStore({
      version: 2, progress: {}, attempts: [], sessions: [],
      favoriteQuestionIds: [], favoriteLessonIds: [], activeDays: [], finalStretch: false,
    });
    expect(migrated).toMatchObject({ version: 3, drillAttempts: [] });
  });

  it('marque une question comprise sans la supprimer', () => {
    let store = recordCultureAnswer({ store: emptyCultureStore(), questionId: 'doc26-01', category: 'mental-math', verdict: 'wrong', sessionId: 's1', mode: 'errors', now: new Date('2026-08-29T10:00:00Z') });
    store = markQuestionUnderstood(store, 'doc26-01', new Date('2026-08-29T11:00:00Z'));
    expect(store.progress['doc26-01']).toMatchObject({ incorrectCount: 1, activeError: true, understoodAt: '2026-08-29T11:00:00.000Z' });
  });

  it('résout une erreur par une bonne réponse dans une session ultérieure', () => {
    let store = recordCultureAnswer({ store: emptyCultureStore(), questionId: 'q', category: 'navigation', verdict: 'wrong', sessionId: 's1', mode: 'review', now: new Date('2026-08-29T10:00:00Z') });
    store = recordCultureAnswer({ store, questionId: 'q', category: 'navigation', verdict: 'known', sessionId: 's2', mode: 'review', now: new Date('2026-08-29T11:00:00Z') });
    expect(store.progress.q.activeError).toBe(false);
  });

  it('demande deux bonnes réponses le même jour dans la session de l’erreur', () => {
    let store = recordCultureAnswer({ store: emptyCultureStore(), questionId: 'q', category: 'navigation', verdict: 'wrong', sessionId: 's1', mode: 'review', now: new Date('2026-08-29T10:00:00Z') });
    store = recordCultureAnswer({ store, questionId: 'q', category: 'navigation', verdict: 'known', sessionId: 's1', mode: 'review', now: new Date('2026-08-29T10:10:00Z') });
    expect(store.progress.q.activeError).toBe(true);
    store = recordCultureAnswer({ store, questionId: 'q', category: 'navigation', verdict: 'known', sessionId: 's1', mode: 'review', now: new Date('2026-08-29T10:20:00Z') });
    expect(store.progress.q.activeError).toBe(false);
  });

  it('exige deux sessions et quatre heures pour examReady puis l’annule sur erreur', () => {
    let store = recordCultureAnswer({ store: emptyCultureStore(), questionId: 'q', category: 'navigation', verdict: 'known', sessionId: 's1', mode: 'review', now: new Date('2026-08-29T10:00:00Z') });
    store = recordCultureAnswer({ store, questionId: 'q', category: 'navigation', verdict: 'known', sessionId: 's2', mode: 'review', now: new Date('2026-08-29T13:59:00Z') });
    expect(store.progress.q.examReady).toBe(false);
    store = recordCultureAnswer({ store, questionId: 'q', category: 'navigation', verdict: 'known', sessionId: 's3', mode: 'review', now: new Date('2026-08-29T14:01:00Z') });
    expect(store.progress.q.examReady).toBe(true);
    store = recordCultureAnswer({ store, questionId: 'q', category: 'navigation', verdict: 'wrong', sessionId: 's4', mode: 'review', now: new Date('2026-08-29T15:00:00Z') });
    expect(store.progress.q.examReady).toBe(false);
  });
});
