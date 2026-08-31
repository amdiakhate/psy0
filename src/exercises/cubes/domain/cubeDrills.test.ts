import { describe, expect, it } from 'vitest';
import { generateCubeDrill, validateCubeDrill } from './cubeDrills';
import type { CubeDrillType } from './cubeDrills';

const TYPES: CubeDrillType[] = [
  'opposites',
  'adjacency',
  'rings',
  'mirror',
  'rotation',
  'two-remaining',
  'orientation-only',
];

describe('générateurs de drills Cubes', () => {
  it('produit une réponse acceptée pour chaque sous-compétence', () => {
    for (const type of TYPES) {
      for (let seed = 0; seed < 100; seed++) {
        const drill = generateCubeDrill(seed, type);
        expect(validateCubeDrill(drill, drill.answer), `${type}, seed ${seed}`).toBe(true);
      }
    }
  });

  it('alterne ambiguïté centrale et hors centre pour les deux faces restantes', () => {
    const locations = new Set(
      Array.from({ length: 100 }, (_, seed) => generateCubeDrill(seed, 'two-remaining')).map(
        (drill) => drill.ambiguityLocation,
      ),
    );
    expect(locations).toEqual(new Set(['center', 'non-center']));
  });

  it('oriente une à trois faces dans le drill spécialisé', () => {
    const counts = new Set(
      Array.from({ length: 60 }, (_, seed) => generateCubeDrill(seed, 'orientation-only')).map(
        (drill) => drill.orientationTargets.length,
      ),
    );
    expect(counts).toEqual(new Set([1, 2, 3]));
  });
});
