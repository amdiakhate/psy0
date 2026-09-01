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
    expect(recenter).toContain('Même cube, nouvelle face centrale');
    expect(recenter).toContain('même face physique');
    const ring = renderToStaticMarkup(<RingWorkshop />);
    expect(ring).toContain('L’anneau des quatre voisins');
    expect(ring).toContain('ordre horaire');
    const edge = renderToStaticMarkup(<PhysicalEdgeRotation />);
    expect(edge).toContain('Le même bord physique');
    expect(edge).toContain('Rejouer');
    expect(edge).toContain('Voisin ancre');
  });
});
