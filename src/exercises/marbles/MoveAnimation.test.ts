import { describe, expect, it } from 'vitest';
import { applyMove, statesOf } from './MoveAnimation';
import type { Move } from './MoveAnimation';
import { CAPACITIES } from './model';
import type { State } from './model';

/**
 * L'animation ne dessine pas des états écrits à la main : elle les DÉDUIT des
 * coups. Un enchaînement faux produirait donc une arrivée fausse — et la leçon
 * enseignerait une solution qui n'en est pas une. C'est ce que ces tests
 * verrouillent.
 */

const START: State = [[0, 1, 2], [], []];
const MOVES: Move[] = [
  { from: 0, to: 2, note: 'bille 2 vers la droite' },
  { from: 0, to: 1, note: 'bille 1 au milieu' },
];

describe('déplacements', () => {
  it('prend la bille du DESSUS et la pose sur le DESSUS', () => {
    const after = applyMove(START, MOVES[0]);
    expect(after).toEqual([[0, 1], [], [2]]);
  });

  it('refuse un tube source vide ou un tube cible plein', () => {
    expect(() => applyMove([[], [], [0]], { from: 0, to: 1, note: '' })).toThrow();
    const plein: State = [[0], [1, 2], []];
    expect(CAPACITIES[1]).toBe(2);
    expect(() => applyMove(plein, { from: 0, to: 1, note: '' })).toThrow();
  });

  it('ne perd ni ne duplique aucune bille', () => {
    const all = (s: State) => s.flat().slice().sort((a, b) => a - b);
    for (const state of statesOf(START, MOVES)) {
      expect(all(state)).toEqual([0, 1, 2]);
    }
  });

  it('respecte les capacités 3-2-3 à chaque étape', () => {
    for (const state of statesOf(START, MOVES)) {
      state.forEach((tube, t) => expect(tube.length).toBeLessThanOrEqual(CAPACITIES[t]));
    }
  });

  it('la séquence de la leçon atteint bien l’arrivée annoncée, en 2 coups', () => {
    const states = statesOf(START, MOVES);
    expect(states).toHaveLength(3);
    expect(states[states.length - 1]).toEqual([[0], [1], [2]]);
  });
});
