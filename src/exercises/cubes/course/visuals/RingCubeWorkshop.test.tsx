import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COURSE_FACE_IDS, getCourseRing } from '../courseFixtures';
import { RingCubeWorkshop, getFaceSelectionFeedback, mirrorCourseRing, rotateCourseRing } from './RingCubeWorkshop';

describe('RingCubeWorkshop', () => {
  it('keeps the same direction for rotations and reverses only the mirror', () => {
    for (const center of COURSE_FACE_IDS) {
      const ring = getCourseRing(center);
      expect(rotateCourseRing(ring, 1)).toEqual([ring[3], ring[0], ring[1], ring[2]]);
      expect(mirrorCourseRing(ring)).toEqual([ring[0], ring[3], ring[2], ring[1]]);
    }
  });

  it('renders synchronized numbered cube and ring views', () => {
    const html = renderToStaticMarkup(<RingCubeWorkshop />);
    expect(html).toContain('Patron 2D de référence');
    expect(html).toContain('Cube 3D manipulable');
    expect(html).toContain('anneau aplati');
    expect(html).toContain('Tourner de 90°');
    expect(html).toContain('Voir l’ordre miroir');
    expect(html).toContain('Faire de tête');
  });

  it('donne un retour pour la face centrale comme pour une autre face', () => {
    expect(getFaceSelectionFeedback('D', 'D')).toBe('D est déjà face à toi.');
    expect(getFaceSelectionFeedback('A', 'D')).toBe('Mettre A devant moi');
  });
});
