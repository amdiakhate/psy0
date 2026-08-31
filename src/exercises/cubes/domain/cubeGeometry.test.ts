import { describe, expect, it } from 'vitest';
import { POS } from '../cube-model';
import { ALL_ROTATIONS } from '../cube-model';
import type { FacePosition } from './types';
import {
  applyGeometryRotation,
  getClockwiseNeighbors,
  getNeighborAtEdge,
  getOppositePosition,
  getSharedEdge,
  rotateEdge,
  sameCubeGeometry,
} from './cubeGeometry';

const POSITIONS: readonly FacePosition[] = [0, 1, 2, 3, 4, 5];

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

  it('dérive pour chacune des six faces une opposée involutive et quatre voisines distinctes', () => {
    for (const position of POSITIONS) {
      const opposite = getOppositePosition(position);
      const neighbors = getClockwiseNeighbors(position);
      expect(getOppositePosition(opposite)).toBe(position);
      expect(new Set(neighbors).size).toBe(4);
      expect(neighbors).not.toContain(position);
      expect(neighbors).not.toContain(opposite);
      for (const neighbor of neighbors) {
        const shared = getSharedEdge(position, neighbor);
        const reversed = getSharedEdge(neighbor, position);
        expect(shared).not.toBeNull();
        expect(reversed).toEqual(shared && { aEdge: shared.bEdge, bEdge: shared.aEdge });
      }
    }
  });

  it('fait revenir chaque arête à sa place après quatre quarts de tour', () => {
    for (const edge of ['top', 'right', 'bottom', 'left'] as const) {
      expect(rotateEdge(rotateEdge(rotateEdge(rotateEdge(edge, 1), 1), 1), 1)).toBe(edge);
      expect(new Set([0, 1, 2, 3].map((turn) => rotateEdge(edge, turn as 0 | 1 | 2 | 3))).size).toBe(4);
    }
  });

  it('accepte les 24 rotations du même cube avec identités et orientations', () => {
    const cube = POSITIONS.map((position) => ({ id: `face-${position}`, originalPosition: position, sym: position, rot: position % 4 as 0 | 1 | 2 | 3 }));
    for (const rotation of ALL_ROTATIONS) {
      expect(sameCubeGeometry(cube, applyGeometryRotation(cube, rotation))).toBe(true);
    }
  });
});
