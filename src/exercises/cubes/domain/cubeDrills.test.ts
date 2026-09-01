import { describe, expect, it } from 'vitest';
import { generateCubeDrill, validateCubeDrill } from './cubeDrills';
import type { CubeDrillType } from './cubeDrills';
import { symbolName } from '../CubeSvg';
import { skillsForCubeDrill } from '../progress/cubeCoachStorage';

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

  it('conserve des identités de faces dans les anneaux du drill miroir', () => {
    for (let seed = 0; seed < 1_000; seed++) {
      const drill = generateCubeDrill(seed, 'mirror');
      const ids = new Set(drill.reference.map((face) => face.id));
      expect(drill.ringA?.every((id) => ids.has(id)), `anneau A, seed ${seed}`).toBe(true);
      expect(drill.ringB?.every((id) => ids.has(id)), `anneau B, seed ${seed}`).toBe(true);
    }
  });

  it('refuse une orientation omise même lorsque la réponse attendue vaut 3', () => {
    const drill = Array.from({ length: 2_000 }, (_, seed) => generateCubeDrill(seed, 'orientation-only'))
      .find((candidate) => candidate.orientationTargets.every((position) => candidate.answer.rotations[position] === 3));
    expect(drill).toBeDefined();
    expect(validateCubeDrill(drill!, { rotations: {} })).toBe(false);
  });

  it('ne classe pas « aucune rotation » comme une rotation à 90°', () => {
    const drill = Array.from({ length: 100 }, (_, seed) => generateCubeDrill(seed, 'rotation'))
      .find((candidate) => candidate.answer.choiceId === '0');
    expect(drill).toBeDefined();
    expect(skillsForCubeDrill(drill!, true)).toEqual([]);
  });

  it('génère des choix uniques avec une seule réponse acceptée', () => {
    const choiceTypes = ['opposites', 'adjacency', 'rings', 'mirror', 'rotation', 'two-remaining'] as const;
    for (const type of choiceTypes) {
      for (let seed = 0; seed < 2_000; seed++) {
        const drill = generateCubeDrill(seed, type);
        if (!('choices' in drill) || !('choiceId' in drill.answer)) throw new Error(`Drill à choix attendu : ${type}`);
        expect(new Set(drill.choices.map((option) => option.id)).size, `${type}, seed ${seed}`).toBe(drill.choices.length);
        const accepted = drill.choices.filter((option) => validateCubeDrill(drill, { choiceId: option.id }));
        expect(accepted, `${type}, seed ${seed}`).toHaveLength(1);
        expect(accepted[0].id).toBe(drill.answer.choiceId);
      }
    }
  });
});
