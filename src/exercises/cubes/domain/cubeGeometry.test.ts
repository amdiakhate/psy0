import { describe, expect, it } from 'vitest';
import { POS } from '../cube-model';
import {
  getClockwiseNeighbors,
  getNeighborAtEdge,
  getOppositePosition,
  getSharedEdge,
  rotateEdge,
} from './cubeGeometry';

describe('géométrie publique du cube', () => {
  it('dérive les opposées et l’anneau de la face avant depuis les repères', () => {
    expect(getOppositePosition(POS.L)).toBe(POS.R);
    expect(getOppositePosition(POS.F)).toBe(POS.B);
    expect(getOppositePosition(POS.U)).toBe(POS.D);
    expect(getClockwiseNeighbors(POS.F)).toEqual([POS.U, POS.R, POS.D, POS.L]);
    expect(getClockwiseNeighbors(POS.B)).toEqual([POS.U, POS.L, POS.D, POS.R]);
  });

  it('retrouve les arêtes physiques communes et leur rotation', () => {
    expect(getNeighborAtEdge(POS.F, 'top')).toBe(POS.U);
    expect(getSharedEdge(POS.F, POS.U)).toEqual({ aEdge: 'top', bEdge: 'bottom' });
    expect(rotateEdge('top', 0)).toBe('top');
    expect(rotateEdge('top', 1)).toBe('left');
    expect(rotateEdge('top', 2)).toBe('bottom');
    expect(rotateEdge('top', 3)).toBe('right');
  });
});
