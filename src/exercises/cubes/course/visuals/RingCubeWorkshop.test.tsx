import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COURSE_FACE_IDS, getCourseRing } from '../courseFixtures';
import { RingCubeWorkshop, mirrorCourseRing, rotateCourseRing } from './RingCubeWorkshop';

describe('RingCubeWorkshop', () => {
  it('keeps the same direction for rotations and reverses only the mirror', () => {
    for (const center of COURSE_FACE_IDS) {
      const ring = getCourseRing(center);
      expect(rotateCourseRing(ring, 1)).toEqual([ring[1], ring[2], ring[3], ring[0]]);
      expect(mirrorCourseRing(ring)).toEqual([ring[0], ring[3], ring[2], ring[1]]);
    }
  });

  it('renders synchronized numbered cube and ring views', () => {
    const html = renderToStaticMarkup(<RingCubeWorkshop />);
    expect(html).toContain('Cube éclaté');
    expect(html).toContain('anneau aplati');
    expect(html).toContain('Tourner cube + anneau');
    expect(html).toContain('Voir l’ordre miroir');
  });
});

