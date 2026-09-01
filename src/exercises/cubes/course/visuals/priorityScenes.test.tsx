import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COURSE_FACE_IDS, getCourseRing } from '../courseFixtures';
import { PhysicalEdgeRotation, RecenterWorkshop, RingWorkshop } from './PriorityWorkshops';

describe('priority Cubes course scenes', () => {
  it('derives every center ring from geometry', () => {
    for (const center of COURSE_FACE_IDS) {
      const ring = getCourseRing(center);
      expect(ring).toHaveLength(4);
      expect(new Set([center, ...ring]).size).toBe(5);
    }
  });

  it('renders the recenter proof, numbered ring, and physical edge controls', () => {
    const recenter = renderToStaticMarkup(<RecenterWorkshop />);
    expect(recenter).toContain('Recentrer sans changer de cube');
    expect(recenter).toContain('Le patron change, mais le cube ne change pas');
    const ring = renderToStaticMarkup(<RingWorkshop />);
    expect(ring).toContain('Reconstruire l’anneau de tête');
    expect(ring).toContain('Cube 3D manipulable');
    const edge = renderToStaticMarkup(<PhysicalEdgeRotation />);
    expect(edge).toContain('Le même bord physique');
    expect(edge).toContain('Rejouer');
    expect(edge).toContain('Voisin ancre');
  });
});
