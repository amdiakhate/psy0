import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ALL_ROTATIONS, POS, applyRotation } from '../../cube-model';
import { getSharedEdge } from '../../domain/cubeGeometry';
import { COURSE_CUBE } from '../courseFixtures';
import { PhysicalEdgeJourney } from './PhysicalEdgeJourney';

describe('PhysicalEdgeJourney', () => {
  it('shows the original net, isolated face, target net, and all manual turns', () => {
    const rotation = ALL_ROTATIONS.find((candidate) => candidate.dest[POS.D] === POS.F && candidate.dest[POS.F] === POS.L)!;
    const target = applyRotation(COURSE_CUBE, rotation);
    const source = getSharedEdge(POS.D, POS.F)!;
    const targetEdge = getSharedEdge(POS.F, POS.L)!;
    const html = renderToStaticMarkup(
      <PhysicalEdgeJourney
        originalCube={COURSE_CUBE} targetCube={target}
        faceId={COURSE_CUBE[POS.D].id} anchorFaceId={COURSE_CUBE[POS.F].id}
        sourceEdge={source.aEdge} targetEdge={targetEdge.aEdge}
        referenceRot={COURSE_CUBE[POS.D].rot} expectedRot={target[POS.F].rot}
        faceLabel={(id) => id}
        interactive
      />,
    );
    expect(html).toContain('1 · Patron original');
    expect(html).toContain('2 · Face isolée');
    expect(html).toContain('3 · Patron cible');
    expect(html).toContain('90° antihoraire');
    expect(html).toContain('90° horaire');
    expect(html).toContain('Même arête physique');
  });
});
