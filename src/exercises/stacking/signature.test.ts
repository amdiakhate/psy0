import { describe, expect, it } from 'vitest';
import { MIRROR_MAT, findLessonTrihedron, handOf, mapTrihedron, tripleSign } from './signature';
import type { Trihedron } from './signature';
import { ROTATIONS, alignToCanonical, canonical, isChiral, mirror, normalize, rotate } from './model';
import { makeShape } from './grow';
import { mulberry32 } from '../../core/rng';
import { SHAPES } from './data';

/**
 * Ce que ces tests protègent : la MÉTHODE ENSEIGNÉE. Si le sens de circulation
 * du trièdre cessait de coïncider avec la chiralité réelle, la leçon
 * entraînerait à une règle fausse — le pire cas possible.
 */

const BOSSE = SHAPES.find((s) => s.name === 'bosse-5')!.cells;

/**
 * Trièdre de la figure de la leçon.
 *   bras (0,0,0)-(1,0,0)-(2,0,0), cube du dessus en (0,1,0), saillie en (1,0,1).
 *   origine = le cube de la saillie ; u va vers l'extrémité qui porte le dessus.
 */
const T: Trihedron = {
  origin: [1, 0, 0],
  u: [-1, 0, 0],
  v: [0, 0, 1],
  w: [0, 1, 0],
};

describe('le sens de circulation du trièdre', () => {
  it('est non dégénéré : les trois directions ne sont pas coplanaires', () => {
    expect(tripleSign(T)).not.toBe(0);
  });

  it('NE CHANGE PAS quand on tourne la figure — c’est ce qui le rend utilisable', () => {
    const reference = tripleSign(T);
    for (const r of ROTATIONS) {
      expect(tripleSign(mapTrihedron(T, r))).toBe(reference);
    }
  });

  it('S’INVERSE par symétrie — c’est ce qui le rend décisif', () => {
    expect(tripleSign(mapTrihedron(T, MIRROR_MAT))).toBe(-tripleSign(T));
  });

  it('s’inverse encore après symétrie PUIS rotation quelconque', () => {
    // Le cas réel : le miroir n'est jamais présenté dans l'orientation d'origine.
    const reference = tripleSign(T);
    for (const r of ROTATIONS) {
      const miroirTourne = mapTrihedron(mapTrihedron(T, MIRROR_MAT), r);
      expect(tripleSign(miroirTourne)).toBe(-reference);
    }
  });
});

describe('la main de référence', () => {
  it('est invariante par rotation et inversée par symétrie', () => {
    for (let size = 5; size <= 10; size++) {
      for (let seed = 0; seed < 12; seed++) {
        const shape = makeShape(mulberry32(seed * 13 + size), size);
        const hand = handOf(shape.cells);
        for (const r of ROTATIONS) {
          expect(handOf(rotate(shape.cells, r)), shape.name).toBe(hand);
        }
        expect(handOf(mirror(shape.cells)), shape.name).toBe(-hand);
      }
    }
  });

  it('n’a de sens que sur une figure chirale — toutes celles du jeu le sont', () => {
    for (let seed = 0; seed < 30; seed++) {
      const shape = makeShape(mulberry32(seed + 500), 9);
      expect(isChiral(shape.cells)).toBe(true);
      // Sur une figure achirale, forme et miroir ont la même canonique : la
      // comparaison serait arbitraire, et la question sans réponse.
      expect(canonical(shape.cells)).not.toBe(canonical(mirror(shape.cells)));
    }
  });
});

describe('la méthode enseignée dit la VÉRITÉ', () => {
  it('le sens de circulation lu sur la figure coïncide avec sa main réelle, dans les 48 présentations', () => {
    const reference = tripleSign(T) * handOf(BOSSE);
    for (const base of [normalize(BOSSE), mirror(BOSSE)]) {
      for (const r of ROTATIONS) {
        const vue = rotate(base, r);
        const t = findLessonTrihedron(vue);
        expect(t, 'trièdre introuvable sur une vue').not.toBeNull();
        // Le produit « sens lu × main réelle » doit rester constant : c'est dire
        // que le sens détermine la main, sans exception.
        expect(tripleSign(t!) * handOf(vue)).toBe(reference);
      }
    }
  });
});

describe('remise en orientation canonique', () => {
  it('rend le MÊME dessin pour deux vues du même objet — c’est la preuve visuelle', () => {
    // Ce que voit l'élève dans la correction : une fois les figures ramenées à
    // la même orientation, la paire se superpose exactement. Si ce test tombe,
    // la « démonstration » affichée ne démontre plus rien.
    for (let size = 5; size <= 10; size++) {
      for (let seed = 0; seed < 10; seed++) {
        const shape = makeShape(mulberry32(seed * 31 + size), size);
        const reference = alignToCanonical(shape.cells);
        for (const r of ROTATIONS) {
          expect(alignToCanonical(rotate(shape.cells, r)), shape.name).toEqual(reference);
        }
      }
    }
  });

  it('rend un dessin DIFFÉRENT pour le symétrique, sous toutes ses vues', () => {
    for (let size = 5; size <= 10; size++) {
      for (let seed = 0; seed < 10; seed++) {
        const shape = makeShape(mulberry32(seed * 17 + size), size);
        const reference = alignToCanonical(shape.cells);
        for (const r of ROTATIONS) {
          expect(alignToCanonical(rotate(mirror(shape.cells), r)), shape.name).not.toEqual(reference);
        }
      }
    }
  });

  it('est stable : réaligner une figure déjà alignée ne la bouge plus', () => {
    for (let seed = 0; seed < 30; seed++) {
      const cells = makeShape(mulberry32(seed + 99), 9).cells;
      const once = alignToCanonical(cells);
      expect(alignToCanonical(once)).toEqual(once);
    }
  });
});
