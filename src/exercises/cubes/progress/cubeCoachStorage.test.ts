import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appendCubeAttempt, loadCubeCoachState, skillsForCubeDrill } from './cubeCoachStorage';
import { generateCubeDrill } from '../domain/cubeDrills';
import type { CubeAttemptRecord } from './cubeCoachStorage';

const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
});

const record = (): CubeAttemptRecord => ({
  id: 'attempt-1',
  answeredAt: '2026-08-31T10:00:00.000Z',
  mode: 'drill',
  drillType: 'opposites',
  seed: 1,
  level: 1,
  durationMs: 1200,
  correct: true,
  question: null,
  answer: { choiceId: 'A' },
  solution: { choiceId: 'A' },
  errorCauses: [],
  skills: [{ skill: 'opposites', correct: true }],
});

describe('persistance du Coach Cubes', () => {
  beforeEach(() => store.clear());

  it('démarre vide dans un navigateur neuf et résiste à un document corrompu', () => {
    expect(loadCubeCoachState()).toEqual({ schemaVersion: 1, attempts: [] });
    store.set('psy0.cubes-coach', '{cassé');
    expect(loadCubeCoachState()).toEqual({ schemaVersion: 1, attempts: [] });
  });

  it('ajoute une tentative dans le schéma versionné', () => {
    appendCubeAttempt(record());
    expect(loadCubeCoachState().attempts).toEqual([record()]);
  });

  it('borne l’historique aux 500 tentatives les plus récentes', () => {
    for (let index = 0; index < 505; index++) appendCubeAttempt({ ...record(), id: `attempt-${index}` });
    const attempts = loadCubeCoachState().attempts;
    expect(attempts).toHaveLength(500);
    expect(attempts[0].id).toBe('attempt-5');
  });

  it('classe une rotation selon la correction à produire, pas l’orientation absolue', () => {
    const drill = generateCubeDrill(1, 'orientation-only');
    const required = new Set(drill.orientationTargets.map((position) =>
      ((drill.answer.rotations[position] - drill.displayedRotations[position]) % 4 + 4) % 4 === 2
        ? 'rotation-180'
        : 'rotation-90',
    ));
    expect(new Set(skillsForCubeDrill(drill, true).map((result) => result.skill))).toEqual(required);
  });
});
