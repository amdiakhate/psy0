import { describe, expect, it } from 'vitest';
import { generate, validate } from './generator';
import { HARD_MIN_TURN_DEG, EASY_MAX_TURN_DEG, LEVELS } from './config';
import { SHAPES } from './data';
import {
  ROTATIONS,
  allIsoImageKeys,
  canonical,
  isChiral,
  isoBounds,
  isoFaces,
  isoImageKey,
  mirror,
  orbitSize,
  rotationAngleDeg,
  sameShape,
  serialize,
} from './model';

const SEEDS = 150;

describe('model : le groupe des 24 rotations', () => {
  it('contient exactement 24 matrices distinctes, toutes de déterminant +1', () => {
    expect(ROTATIONS.length).toBe(24);
    expect(new Set(ROTATIONS.map((m) => m.join(','))).size).toBe(24);
    for (const m of ROTATIONS) {
      const det =
        m[0] * (m[4] * m[8] - m[5] * m[7]) -
        m[1] * (m[3] * m[8] - m[5] * m[6]) +
        m[2] * (m[3] * m[7] - m[4] * m[6]);
      expect(det).toBe(1);
    }
  });

  it('les angles du groupe sont 0, 90, 120 et 180 degrés', () => {
    const angles = new Set(ROTATIONS.map(rotationAngleDeg));
    expect([...angles].sort((a, b) => a - b)).toEqual([0, 90, 120, 180]);
  });
});

describe('data : le pool de polycubes', () => {
  it('toutes les formes sont CHIRALES — sinon la question n’aurait pas de réponse', () => {
    for (const s of SHAPES) {
      expect(isChiral(s.cells), s.name).toBe(true);
      expect(sameShape(s.cells, mirror(s.cells)), s.name).toBe(false);
    }
  });

  it('les formes ont la taille annoncée et sont deux à deux distinctes, miroirs compris', () => {
    const seen = new Set<string>();
    for (const s of SHAPES) {
      expect(s.cells.length, s.name).toBe(s.size);
      const a = canonical(s.cells);
      const b = canonical(mirror(s.cells));
      expect(seen.has(a), s.name).toBe(false);
      expect(seen.has(b), s.name).toBe(false);
      seen.add(a);
      seen.add(b);
    }
  });

  it('supportsHard ⟺ orbite de 24 vues', () => {
    for (const s of SHAPES) {
      expect(orbitSize(s.cells) === 24, s.name).toBe(s.supportsHard);
    }
  });

  it('LISIBILITÉ : les 48 orientations (24 vues + 24 vues du miroir) donnent 48 dessins distincts', () => {
    // Sans ce filtre, certaines formes ont des orientations où l'empilement et son
    // miroir se dessinent EXACTEMENT pareil en isométrie (cubes cachés) : l'item
    // serait alors impossible à trancher.
    for (const s of SHAPES) {
      const expected = s.supportsHard ? 48 : 24;
      expect(new Set(allIsoImageKeys(s.cells)).size, s.name).toBe(expected);
    }
  });

  it('toutes les formes tiennent dans la fenêtre de rendu de 9 unités', () => {
    for (const s of SHAPES) {
      for (const r of ROTATIONS) {
        const { minX, maxX, minY, maxY } = isoBounds(isoFaces(s.cells.map((c) => [
          r[0] * c[0] + r[1] * c[1] + r[2] * c[2],
          r[3] * c[0] + r[4] * c[1] + r[5] * c[2],
          r[6] * c[0] + r[7] * c[1] + r[8] * c[2],
        ])));
        expect(Math.max(maxX - minX, maxY - minY), s.name).toBeLessThan(9);
      }
    }
  });

  it('couvre les tailles 4 à 7', () => {
    for (const n of [4, 5, 6, 7]) {
      expect(SHAPES.some((s) => s.size === n)).toBe(true);
    }
  });
});

describe('generator — L’INVARIANT : exactement un empilement est le symétrique', () => {
  it('est déterministe', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('deux empilements sont des rotations l’un de l’autre, le troisième est leur miroir', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { question: q } = generate(seed, level);
        expect(q.stacks.length).toBe(3);

        const others = [0, 1, 2].filter((i) => i !== q.answerIndex);
        const [a, b] = others.map((i) => q.stacks[i]);
        const m = q.stacks[q.answerIndex];

        // Les deux non-réponses : même objet à rotation près.
        expect(sameShape(a, b)).toBe(true);
        // La réponse : inatteignable par rotation depuis les deux autres…
        expect(sameShape(m, a)).toBe(false);
        expect(sameShape(m, b)).toBe(false);
        // … mais c'est bien LEUR miroir.
        expect(sameShape(mirror(m), a)).toBe(true);
        expect(sameShape(mirror(m), b)).toBe(true);
      }
    }
  });

  it('les trois vues affichées sont deux à deux différentes (aucun doublon à l’écran)', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { question: q } = generate(seed, level);
        expect(new Set(q.stacks.map(serialize)).size).toBe(3);
        expect(q.stacks.every((s) => s.length === q.size)).toBe(true);
      }
    }
  });

  it('les trois DESSINS affichés sont deux à deux différents', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 20; seed++) {
        const { question: q } = generate(seed, level);
        const images = q.stacks.map((s) => isoImageKey(s));
        expect(new Set(images).size, `seed=${seed} level=${level}`).toBe(3);
      }
    }
  });

  it('validate ne reconnaît que l’empilement symétrique', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        for (let i = 0; i < 3; i++) {
          expect(validate(item, i)).toBe(i === item.question.answerIndex);
        }
      }
    }
  });

  it('la réponse est répartie sur les trois positions', () => {
    const counts = [0, 0, 0];
    for (let seed = 0; seed < 300; seed++) counts[generate(seed, 3).question.answerIndex]++;
    for (const c of counts) expect(c).toBeGreaterThan(50);
  });
});

describe('generator — tags et difficulté', () => {
  it('tag de taille cohérent avec le niveau et avec la figure', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        expect(item.tags).toContain(`size-${item.question.size}`);
        expect(cfg.sizes).toContain(item.question.size as 4 | 5 | 6 | 7);
      }
    }
  });

  it('easy-orientation : les deux empilements identiques sont à un quart de tour au plus', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'easy-orientation');
        expect(item.tags).toContain('easy-orientation');
        expect(item.question.pairTurnDeg).toBeGreaterThan(0);
        expect(item.question.pairTurnDeg).toBeLessThanOrEqual(EASY_MAX_TURN_DEG);
      }
    }
  });

  it('hard-orientation : les trois vues sont deux à deux à 120° ou plus', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level, 'hard-orientation');
        expect(item.tags).toContain('hard-orientation');
        expect(item.question.minTurnDeg).toBeGreaterThanOrEqual(HARD_MIN_TURN_DEG);
        // Le tétracube « vis » n'a que 12 vues : il ne peut pas produire d'item difficile.
        expect(item.question.size).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('forceTag size-N impose la taille', () => {
    for (const n of [4, 5, 6, 7]) {
      for (let seed = 0; seed < 60; seed++) {
        const item = generate(seed, 1, `size-${n}`);
        expect(item.question.size).toBe(n);
        expect(item.tags).toContain(`size-${n}`);
      }
    }
  });

  it('les niveaux hauts produisent bien des items difficiles', () => {
    let hard = 0;
    for (let seed = 0; seed < 100; seed++) {
      if (generate(seed, 5).tags.includes('hard-orientation')) hard++;
    }
    expect(hard).toBe(100);
    let easy = 0;
    for (let seed = 0; seed < 100; seed++) {
      if (generate(seed, 1).tags.includes('easy-orientation')) easy++;
    }
    expect(easy).toBe(100);
  });

  it('les exemples de la page d’astuces sont bien générables', () => {
    expect(generate(7, 2, 'easy-orientation').question.stacks.length).toBe(3);
    expect(generate(21, 5, 'hard-orientation').question.minTurnDeg).toBeGreaterThanOrEqual(
      HARD_MIN_TURN_DEG,
    );
  });
});
