import { describe, expect, it } from 'vitest';
import { CUBE_CENTER, FACE_SPECS, foldedFaces, rotateAboutLine } from './fold-model';
import type { V3 } from './fold-model';
import { POS } from './cube-model';

const close = (a: V3, b: V3) => {
  expect(a[0]).toBeCloseTo(b[0], 9);
  expect(a[1]).toBeCloseTo(b[1], 9);
  expect(a[2]).toBeCloseTo(b[2], 9);
};

describe('rotation de Rodrigues', () => {
  it('laisse la droite de rotation immobile', () => {
    for (const t of [0.3, 1.2, 2.9]) {
      close(rotateAboutLine([1, 0, t], [1, 0, 0], [0, 0, 1], 1.1), [1, 0, t]);
    }
  });

  it('fait un quart de tour exact', () => {
    close(rotateAboutLine([1, 0, 0], [0, 0, 0], [0, 0, 1], Math.PI / 2), [0, 1, 0]);
  });
});

describe('le pliage du patron', () => {
  it('à t=0, reproduit EXACTEMENT la disposition à plat de NetSvg', () => {
    const faces = foldedFaces(0);
    for (const f of faces) {
      for (const c of f.corners) expect(c[1]).toBeCloseTo(0, 12);
    }
    const F = faces.find((f) => f.pos === POS.F)!;
    close(F.corners[0], [0, 0, 0]);
    close(F.corners[2], [1, 0, 1]);
    const B = faces.find((f) => f.pos === POS.B)!;
    close(B.corners[0], [2, 0, 0]);
    close(B.corners[2], [3, 0, 1]);
  });

  it('à t=1, les six faces forment exactement le cube unité', () => {
    // La preuve géométrique du modèle : chaque coin plié est un sommet de
    // [0,1]×[−1,0]×[0,1] (le pliage plonge sous le plan du patron), et chaque
    // face occupe un plan distinct du cube.
    const faces = foldedFaces(1);
    const planes = new Set<string>();
    for (const f of faces) {
      for (const c of f.corners) {
        const [x, y, z] = c;
        expect(Math.abs(x) < 1e-9 || Math.abs(x - 1) < 1e-9, `${f.pos}: ${c}`).toBe(true);
        expect(Math.abs(y) < 1e-9 || Math.abs(y + 1) < 1e-9, `${f.pos}: ${c}`).toBe(true);
        expect(Math.abs(z) < 1e-9 || Math.abs(z - 1) < 1e-9, `${f.pos}: ${c}`).toBe(true);
      }
      // Le plan de la face : l'axe sur lequel les 4 coins sont constants.
      for (let axis = 0; axis < 3; axis++) {
        const values = new Set(f.corners.map((c) => Math.round(c[axis] * 1e6) / 1e6));
        if (values.size === 1) planes.add(`${axis}:${[...values][0]}`);
      }
    }
    expect(planes.size).toBe(6);
  });

  it('à t=1, chaque normale imprimée pointe VERS L’EXTÉRIEUR du cube', () => {
    // Les symboles doivent finir lisibles depuis l'extérieur — un cube dont les
    // dessins seraient à l'intérieur serait un pliage inversé.
    for (const f of foldedFaces(1)) {
      const center = f.corners.reduce<V3>((s, c) => [s[0] + c[0] / 4, s[1] + c[1] / 4, s[2] + c[2] / 4], [0, 0, 0]);
      const out = [center[0] - CUBE_CENTER[0], center[1] - CUBE_CENTER[1], center[2] - CUBE_CENTER[2]];
      const d = f.normal[0] * out[0] + f.normal[1] * out[1] + f.normal[2] * out[2];
      expect(d, `face ${f.pos}`).toBeGreaterThan(0);
    }
  });

  it('les faces ne se déchirent pas : chaque charnière reste collée pendant tout le pliage', () => {
    for (const t of [0, 0.2, 0.45, 0.7, 0.9, 1]) {
      const faces = new Map(foldedFaces(t).map((f) => [f.pos, f]));
      const F = faces.get(POS.F)!;
      const R = faces.get(POS.R)!;
      const B = faces.get(POS.B)!;
      const L = faces.get(POS.L)!;
      const U = faces.get(POS.U)!;
      const D = faces.get(POS.D)!;
      // F–R partagent l'arête x=1 du patron : coins haut-droite/bas-droite de F.
      close(F.corners[1], R.corners[0]);
      close(F.corners[2], R.corners[3]);
      // R–B partagent l'arête extérieure de R.
      close(R.corners[1], B.corners[0]);
      close(R.corners[2], B.corners[3]);
      // F–L, F–U, F–D.
      close(F.corners[0], L.corners[1]);
      close(F.corners[3], L.corners[2]);
      close(F.corners[0], U.corners[3]);
      close(F.corners[1], U.corners[2]);
      close(F.corners[3], D.corners[0]);
      close(F.corners[2], D.corners[1]);
    }
  });

  it('couvre les six positions du cube, une fois chacune', () => {
    const seen = new Set(FACE_SPECS.map((s) => s.pos));
    expect(seen.size).toBe(6);
  });
});
