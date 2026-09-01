import { describe, expect, it } from 'vitest';
import { POS } from '../cube-model';
import { COURSE_FACE_IDS, COURSE_FACE_TO_POSITION, getCourseOpposite, getCourseRing } from './courseFixtures';

describe('neutral A–F course fixture', () => {
  it('maps the requested net to the verified geometry', () => {
    expect(COURSE_FACE_TO_POSITION).toEqual({ A: POS.L, B: POS.F, C: POS.R, D: POS.B, E: POS.U, F: POS.D });
    expect(COURSE_FACE_IDS.map((face) => [face, getCourseOpposite(face)])).toEqual([
      ['A', 'C'], ['B', 'D'], ['C', 'A'], ['D', 'B'], ['E', 'F'], ['F', 'E'],
    ]);
  });

  it('derives a four-face ring for every possible center', () => {
    for (const face of COURSE_FACE_IDS) {
      const ring = getCourseRing(face);
      expect(ring).toHaveLength(4);
      expect(new Set(ring).size).toBe(4);
      expect(ring).not.toContain(face);
      expect(ring).not.toContain(getCourseOpposite(face));
    }
  });
});

