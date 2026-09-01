import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { POS } from './cube-model';
import { FoldingNet } from './FoldingNet';
import { COURSE_CUBE } from './course/courseFixtures';
import { IsoCubeSvg } from './CubeSvg';
import { CUBE_3D_CAMERA_POSITION } from './Cube3DTip';

const LABELS = {
  [POS.R]: 'RIGHT',
  [POS.L]: 'LEFT',
  [POS.U]: 'TOP',
  [POS.D]: 'BOTTOM',
  [POS.F]: 'FRONT',
  [POS.B]: 'BACK',
} as const;

describe('caméra du patron plié', () => {
  it('montre dessus, avant et droite quand le cube est fermé', () => {
    const html = renderToStaticMarkup(
      <FoldingNet cube={COURSE_CUBE} t={1} faceLabels={LABELS} />,
    );

    expect(html).toContain('>TOP</text>');
    expect(html).toContain('>FRONT</text>');
    expect(html).toContain('>RIGHT</text>');
    expect(html).not.toContain('>BOTTOM</text>');
    expect(html).not.toContain('>BACK</text>');
    expect(html).not.toContain('>LEFT</text>');
  });
});

describe('convention des autres caméras Cubes', () => {
  it('la vue SVG isométrique montre uniquement dessus, avant et droite', () => {
    const html = renderToStaticMarkup(<IsoCubeSvg cube={COURSE_CUBE} />);

    // COURSE_CUBE porte G sur U, Q sur F et L sur R.
    expect(html).toContain('>G</text>');
    expect(html).toContain('>Q</text>');
    expect(html).toContain('>L</text>');
    // Les glyphes F/J/E appartiennent respectivement à L/D/B, donc aux faces cachées.
    expect(html).not.toContain('>F</text>');
    expect(html).not.toContain('>J</text>');
    expect(html).not.toContain('>E</text>');
  });

  it('la caméra Three.js regarde les axes dessus, avant et droite positifs', () => {
    expect(CUBE_3D_CAMERA_POSITION[0]).toBeGreaterThan(0); // droite (+X)
    expect(CUBE_3D_CAMERA_POSITION[1]).toBeGreaterThan(0); // dessus (+Y)
    expect(CUBE_3D_CAMERA_POSITION[2]).toBeGreaterThan(0); // avant (+Z)
  });
});
