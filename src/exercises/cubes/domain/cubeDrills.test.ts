import { describe, expect, it } from 'vitest';
import { generateCubeDrill, validateCubeDrill } from './cubeDrills';
import type { CubeDrillType } from './cubeDrills';
import { symbolName } from '../CubeSvg';

const TYPES: CubeDrillType[] = [
  'opposites',
  'adjacency',
  'rings',
  'mirror',
  'rotation',
  'two-remaining',
  'orientation-only',
  'full-puzzle',
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

  it('nomme toujours les faces avec le symbole réellement affiché', () => {
    for (const type of ['opposites', 'adjacency', 'rings', 'rotation'] as const) {
      for (let seed = 0; seed < 250; seed++) {
        const drill = generateCubeDrill(seed, type);
        const focusCube = type === 'rotation' && drill.target ? drill.target : drill.reference;
        const focusLabel = symbolName(focusCube[drill.focusPosition].sym);
        expect(drill.prompt, `${type}, seed ${seed}`).toContain(focusLabel);

        for (const option of drill.choices) {
          if (!option.faceIds) continue;
          for (const id of option.faceIds) {
            const face = drill.reference.find((candidate) => candidate.id === id);
            expect(face, `${type}, seed ${seed}, face ${id}`).toBeDefined();
            expect(option.label).toContain(symbolName(face!.sym));
          }
        }
      }
    }
  });

  it('affiche les deux pièces visibles dans le drill deux faces restantes', () => {
    for (let seed = 0; seed < 250; seed++) {
      const drill = generateCubeDrill(seed, 'two-remaining');
      for (const option of drill.choices) {
        const piece = drill.pieces.find((candidate) => candidate.faceId === option.id);
        expect(piece, `seed ${seed}, choix ${option.id}`).toBeDefined();
        expect(option.label).toBe(symbolName(piece!.sym));
      }
    }
  });
});
