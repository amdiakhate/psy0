import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COURSE_FACE_IDS } from '../courseFixtures';
import { RecenterSequence, faceAtFrontAfterRecentering } from './RecenterSequence';

describe('RecenterSequence', () => {
  it('can put each physical face in front without changing its identity', () => {
    for (const face of COURSE_FACE_IDS) expect(faceAtFrontAfterRecentering(face)).toBe(face);
  });

  it('renders the six stages and all manual controls', () => {
    const html = renderToStaticMarkup(<RecenterSequence />);
    expect(html).toContain('étape 1/6');
    expect(html).toContain('Le cube tourne');
    expect(html).toContain('Étape précédente');
    expect(html).toContain('Étape suivante');
    expect(html).toContain('Le patron change, mais le cube ne change pas');
  });
});
