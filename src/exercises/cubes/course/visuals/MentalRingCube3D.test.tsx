import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildRingScene } from '../ringSceneModel';
import { MentalRingCube3D, getRingFaceVisual } from './MentalRingCube3D';

describe('MentalRingCube3D', () => {
  it('attribue les numéros 1–4 à l’ordre géométrique affiché', () => {
    const scene = buildRingScene('A', 1);
    scene.displayedNeighbors.forEach((faceId, index) => {
      expect(getRingFaceVisual(scene, faceId, true, true)).toMatchObject({ neighborNumber: index + 1, label: faceId });
    });
    expect(getRingFaceVisual(scene, scene.oppositeFaceId, true, true).opposite).toBe(true);
  });

  it('ne rend aucune scène ni aucun voisin lorsque le cube est caché en mode mental', () => {
    const html = renderToStaticMarkup(<MentalRingCube3D scene={buildRingScene('E', 0)} hidden />);
    expect(html).toContain('Cube 3D masqué avant ta réponse');
    expect(html).not.toContain('data-cube-canvas');
    expect(html).not.toContain('Voisin 1');
  });

  it('décrit la face centrale, l’opposée et les quatre voisins sans dépendre de la couleur', () => {
    const html = renderToStaticMarkup(<MentalRingCube3D scene={buildRingScene('E', 0)} />);
    expect(html).toContain('Face centrale E');
    expect(html).toContain('Face opposée F');
    for (let index = 1; index <= 4; index += 1) expect(html).toContain(`Voisin ${index}`);
  });

  it('ne révèle pas les identités des voisins en mode semi-guidé', () => {
    const html = renderToStaticMarkup(
      <MentalRingCube3D
        scene={buildRingScene('E', 0)}
        layers={{ neighbors: true, opposite: true, numbers: true, edges: true, neighborLabels: false }}
      />,
    );
    expect(html).toContain('Face centrale E');
    expect(html).not.toContain('Voisin 1');
  });
});
