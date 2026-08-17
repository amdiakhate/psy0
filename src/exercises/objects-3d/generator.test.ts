import { describe, expect, it } from 'vitest';
import { generate, validate } from './generator';
import {
  FALLBACK_LAYOUTS,
  LEVELS,
  SCENE_RADIUS,
  VIEWPOINT_COUNT,
  VIEW_RADIUS,
} from './config';
import {
  OBJECT_KINDS,
  allSignatures,
  depthOf,
  discernable,
  lateralOf,
  layoutIsUnique,
  occlusionOk,
  screenXOf,
  separationOk,
  spacingOk,
  viewOrders,
  viewSignature,
  viewpointAngle,
  viewpointPosition,
} from './scene';
import type { SceneObject } from './scene';

const SEEDS = 150;

describe('scene : la géométrie de la vue', () => {
  it('les 8 points de vue sont régulièrement répartis sur le cercle', () => {
    for (let k = 0; k < VIEWPOINT_COUNT; k++) {
      const p = viewpointPosition(k);
      expect(Math.hypot(p.x, p.z)).toBeCloseTo(VIEW_RADIUS, 6);
      expect(viewpointAngle(k)).toBeCloseTo((k * Math.PI) / 4, 9);
    }
  });

  it('un objet placé AU point de vue est à profondeur nulle et centré à l’écran', () => {
    const a = viewpointAngle(3);
    const here = viewpointPosition(3);
    expect(depthOf(here, a)).toBeCloseTo(0, 6);
    expect(lateralOf(here, a)).toBeCloseTo(0, 6);
    // À l'opposé du cercle : au fond, toujours centré.
    const far = { x: -here.x, z: -here.z };
    expect(depthOf(far, a)).toBeCloseTo(2 * VIEW_RADIUS, 6);
    expect(screenXOf(far, a)).toBeCloseTo(0, 6);
  });

  it('depuis le point de vue opposé, l’ordre gauche→droite s’inverse', () => {
    const objs: SceneObject[] = [
      { kind: 'cube', x: 3, z: 1 },
      { kind: 'rocher', x: -2, z: 2.5 },
      { kind: 'cactus', x: 0.5, z: -3 },
    ];
    const a = viewOrders(objs, viewpointAngle(1)).leftToRight;
    const b = viewOrders(objs, viewpointAngle(5)).leftToRight;
    expect(b).toEqual([...a].reverse());
  });

  it('viewSignature est pure : mêmes entrées, même sortie', () => {
    const objs: SceneObject[] = [
      { kind: 'tour', x: 1, z: 2 },
      { kind: 'pyramide', x: -3, z: 0.5 },
    ];
    expect(viewSignature(objs, 1.234)).toBe(viewSignature(objs, 1.234));
  });

  it('rejette une disposition ambiguë (deux objets confondus)', () => {
    const ambiguous: SceneObject[] = [
      { kind: 'cube', x: 2, z: 2 },
      { kind: 'rocher', x: 2.05, z: 2.05 },
      { kind: 'cactus', x: -3, z: 1 },
    ];
    expect(spacingOk(ambiguous)).toBe(false);
    expect(layoutIsUnique(ambiguous)).toBe(false);
  });

  it('rejette une disposition à symétrie parfaite d’ordre 8', () => {
    // 8 objets en octogone régulier : les vues se répètent — ici réduit à 4 objets
    // en carré parfait, indiscernable entre points de vue à 90°.
    const square: SceneObject[] = [
      { kind: 'cube', x: 4, z: 0 },
      { kind: 'rocher', x: 0, z: 4 },
      { kind: 'cactus', x: -4, z: 0 },
      { kind: 'tour', x: 0, z: -4 },
    ];
    // Les vues restent distinctes car les OBJETS sont distincts, mais le carré
    // parfait crée des quasi-alignements : la disposition doit être refusée.
    expect(separationOk(square)).toBe(false);
  });

  it('détecte un objet totalement caché derrière un autre', () => {
    // Le cube (bas, étroit) juste derrière la pyramide (large, haute), aligné avec
    // le point de vue 0 : il disparaît de l'image.
    const hidden: SceneObject[] = [
      { kind: 'pyramide', x: 3.6, z: 0 },
      { kind: 'cube', x: 1.2, z: 0 },
      { kind: 'antenne', x: -3, z: 3 },
    ];
    expect(occlusionOk(hidden)).toBe(false);
    expect(layoutIsUnique(hidden)).toBe(false);
  });

  it('les dispositions de secours satisfont l’invariant, avec LEUR attribution d’objets', () => {
    for (const n of [3, 4, 5]) {
      const objs = FALLBACK_LAYOUTS[n].map((p, i) => ({ kind: OBJECT_KINDS[i], ...p }));
      expect(objs.length, `n=${n}`).toBe(n);
      expect(layoutIsUnique(objs), `n=${n}`).toBe(true);
      expect(new Set(allSignatures(objs)).size, `n=${n}`).toBe(VIEWPOINT_COUNT);
      for (const o of objs) expect(Math.hypot(o.x, o.z), `n=${n}`).toBeLessThanOrEqual(SCENE_RADIUS);
    }
  });
});

describe('generator — L’INVARIANT : les 8 signatures de vue sont deux à deux distinctes', () => {
  it('est déterministe', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('aucun couple de points de vue ne partage la même signature', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { question: q } = generate(seed, level);
        const sigs = allSignatures(q.objects);
        expect(sigs.length).toBe(VIEWPOINT_COUNT);
        expect(new Set(sigs).size, `seed=${seed} level=${level}`).toBe(VIEWPOINT_COUNT);
      }
    }
  });

  it('les 28 couples de points de vue sont discernables de façon LISIBLE', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { question: q } = generate(seed, level);
        for (let k1 = 0; k1 < VIEWPOINT_COUNT; k1++) {
          for (let k2 = k1 + 1; k2 < VIEWPOINT_COUNT; k2++) {
            expect(discernable(q.objects, k1, k2), `seed=${seed} level=${level} ${k1}/${k2}`).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it('aucun quasi-alignement à l’écran, aucun amas au sol', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { question: q } = generate(seed, level);
        expect(separationOk(q.objects), `seed=${seed} level=${level}`).toBe(true);
        expect(spacingOk(q.objects), `seed=${seed} level=${level}`).toBe(true);
        // Les n objets sont TOUS visibles sur l'image : l'ordre lu est complet.
        expect(occlusionOk(q.objects), `seed=${seed} level=${level}`).toBe(true);
      }
    }
  });

  it('les objets sont distincts et restent dans le désert', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { question: q } = generate(seed, level);
        expect(new Set(q.objects.map((o) => o.kind)).size).toBe(q.objects.length);
        for (const o of q.objects) {
          expect(Math.hypot(o.x, o.z)).toBeLessThanOrEqual(SCENE_RADIUS + 0.05);
        }
      }
    }
  });

  it('le point de vue attendu est dans 0-7 et couvre les 8 positions', () => {
    const counts = new Array(VIEWPOINT_COUNT).fill(0);
    for (let seed = 0; seed < 400; seed++) {
      const { question: q } = generate(seed, 3);
      expect(q.viewpoint).toBeGreaterThanOrEqual(0);
      expect(q.viewpoint).toBeLessThan(VIEWPOINT_COUNT);
      counts[q.viewpoint]++;
    }
    for (const c of counts) expect(c).toBeGreaterThan(15);
  });

  it('validate ne reconnaît que le bon point de vue', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 60; seed++) {
        const item = generate(seed, level);
        for (let k = 0; k < VIEWPOINT_COUNT; k++) {
          expect(validate(item, k)).toBe(k === item.question.viewpoint);
        }
      }
    }
  });
});

describe('generator — tags et difficulté', () => {
  it('tag du nombre d’objets cohérent avec le niveau', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        expect(item.question.objects.length).toBe(cfg.nObjects);
        expect(item.tags).toContain(`objects-${cfg.nObjects}`);
      }
    }
  });

  it('forceTag objects-N impose le nombre d’objets', () => {
    for (const n of [3, 4, 5]) {
      for (let seed = 0; seed < 60; seed++) {
        const item = generate(seed, 1, `objects-${n}`);
        expect(item.question.objects.length).toBe(n);
        expect(item.tags).toContain(`objects-${n}`);
        expect(layoutIsUnique(item.question.objects)).toBe(true);
      }
    }
  });

  it('forceTag impose le type de disposition, sans casser l’unicité', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 60; seed++) {
        const sym = generate(seed, level, 'symmetric-layout');
        expect(sym.question.layout).toBe('symmetric');
        expect(sym.tags).toContain('symmetric-layout');
        expect(new Set(allSignatures(sym.question.objects)).size).toBe(VIEWPOINT_COUNT);

        const spread = generate(seed, level, 'spread-layout');
        expect(spread.question.layout).toBe('spread');
        expect(spread.tags).toContain('spread-layout');
        expect(new Set(allSignatures(spread.question.objects)).size).toBe(VIEWPOINT_COUNT);
      }
    }
  });

  it('une disposition symétrique est bien plus régulière qu’une étalée', () => {
    const radiusSpread = (layout: 'symmetric' | 'spread') => {
      let total = 0;
      for (let seed = 0; seed < 120; seed++) {
        const q = generate(seed, 3, `${layout}-layout`).question;
        const radii = q.objects.map((o) => Math.hypot(o.x, o.z));
        total += Math.max(...radii) - Math.min(...radii);
      }
      return total / 120;
    };
    expect(radiusSpread('symmetric')).toBeLessThan(radiusSpread('spread'));
  });

  it('les exemples de la page d’astuces sont bien générables', () => {
    expect(generate(11, 2, 'spread-layout').question.objects.length).toBe(5);
    expect(generate(4, 5, 'symmetric-layout').question.objects.length).toBe(3);
  });
});
