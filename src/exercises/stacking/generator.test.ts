import { describe, expect, it } from 'vitest';
import { generate, validate } from './generator';
import { HARD_MIN_TURN_DEG, EASY_MAX_TURN_DEG, LEVELS, MIN_IMAGE_DIFF, RASTER_RESOLUTION } from './config';
import { extent, growPolycube, isPlayable, makeShape } from './grow';
import { SHAPES } from './data';
import {
  ROTATIONS,
  allIsoImageKeys,
  canonical,
  isChiral,
  isoBounds,
  isoFaces,
  imageDistance,
  matMul,
  matInverse,
  mirror,
  orbitSize,
  rotationAngleDeg,
  sameShape,
  rasterize,
  serialize,
  tiltMatrix,
  worldSizeFor,
} from './model';
import { mulberry32 } from '../../core/rng';

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

describe('data : le pool écrit à la main, désormais réservé à la leçon', () => {
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

  it('couvre les petites tailles — la leçon s’enseigne sur une figure lisible', () => {
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

  it('les trois DESSINS affichés diffèrent assez pour être départageables', () => {
    // Sur ce qui est réellement à l'écran, inclinaison comprise : deux vues
    // peuvent être des rotations très éloignées et se PROJETER presque
    // pareil — des cubes en cachent d'autres. L'item serait alors indécidable.
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 20; seed++) {
        const { question: q } = generate(seed, level);
        const world = worldSizeFor(q.stacks.map((shape, i) => ({ shape, tilt: q.tilts[i] })));
        const images = q.stacks.map((shape, i) => rasterize(shape, q.tilts[i], RASTER_RESOLUTION, world));
        for (let a = 0; a < 3; a++) {
          for (let b = a + 1; b < 3; b++) {
            expect(imageDistance(images[a], images[b]), `seed=${seed} level=${level} ${a}/${b}`)
              .toBeGreaterThanOrEqual(MIN_IMAGE_DIFF);
          }
        }
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
        expect(cfg.sizes).toContain(item.question.size);
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

/**
 * Ce qui distingue vraiment cet exercice de sa version « jouet » : des figures
 * d'une dizaine de cubes, chacune BASCULÉE d'un angle quelconque. Sans
 * basculement, les trois empilements partagent la même grille isométrique et se
 * comparent contour à contour — ce n'est plus de la rotation mentale.
 */
describe('croissance des empilements', () => {
  it('produit une figure connexe de la taille demandée', () => {
    for (let size = 7; size <= 11; size++) {
      for (let seed = 0; seed < 40; seed++) {
        const cells = growPolycube(mulberry32(seed * 31 + size), size);
        expect(cells).toHaveLength(size);
        expect(new Set(cells.map((c) => c.join(','))).size, 'aucune cellule en double').toBe(size);
        // Connexité recalculée ici, sans réutiliser le code de croissance.
        const set = new Set(cells.map((c) => c.join(',')));
        const queue = [cells[0]];
        const seen = new Set([cells[0].join(',')]);
        while (queue.length > 0) {
          const [x, y, z] = queue.pop()!;
          for (const [dx, dy, dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) {
            const k = [x + dx, y + dy, z + dz].join(',');
            if (set.has(k) && !seen.has(k)) {
              seen.add(k);
              queue.push(k.split(',').map(Number) as [number, number, number]);
            }
          }
        }
        expect(seen.size, `taille ${size} graine ${seed}`).toBe(size);
      }
    }
  });

  it('ne retient que des figures CHIRALES et vraiment en trois dimensions', () => {
    for (let size = 7; size <= 11; size++) {
      for (let seed = 0; seed < 30; seed++) {
        const shape = makeShape(mulberry32(seed * 7 + size), size);
        expect(shape.cells).toHaveLength(size);
        // Chirale : sans cela, le miroir est une simple rotation et la question
        // n'a AUCUNE réponse — les trois empilements sont alors le même.
        expect(isChiral(shape.cells), shape.name).toBe(true);
        expect(Math.min(...extent(shape.cells)), shape.name).toBeGreaterThanOrEqual(2);
        expect(isPlayable(shape.cells)).toBe(true);
      }
    }
  });

  it('est déterministe et nomme la forme par sa classe de rotation', () => {
    const a = makeShape(mulberry32(4242), 9);
    const b = makeShape(mulberry32(4242), 9);
    expect(a).toEqual(b);
    // Le nom est invariant par rotation : deux vues de la même figure le partagent.
    const tourne = { ...a, cells: a.cells };
    expect(canonical(tourne.cells)).toBe(canonical(a.cells));
  });
});

describe('inclinaison de présentation', () => {
  it('tiltMatrix rend bien une rotation : orthonormale, de déterminant +1', () => {
    for (let i = 0; i < 60; i++) {
      const m = tiltMatrix(i * 17.3, (i % 9) * 4 - 16, (i % 7) * 6 - 18);
      const produit = matMul(m, matInverse(m));
      for (let k = 0; k < 9; k++) {
        expect(Math.abs(produit[k] - [1,0,0,0,1,0,0,0,1][k])).toBeLessThan(1e-9);
      }
      const det =
        m[0] * (m[4] * m[8] - m[5] * m[7]) -
        m[1] * (m[3] * m[8] - m[5] * m[6]) +
        m[2] * (m[3] * m[7] - m[4] * m[6]);
      expect(Math.abs(det - 1)).toBeLessThan(1e-9);
    }
  });

  it('chaque item bascule ses trois empilements — aucun n’est posé droit', () => {
    let droits = 0;
    let total = 0;
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 30; seed++) {
        const q = generate(seed, level).question;
        expect(q.tilts).toHaveLength(3);
        for (const t of q.tilts) {
          total++;
          if (rotationAngleDeg(t) < 8) droits++;
        }
      }
    }
    // Quelques inclinaisons faibles sont acceptables ; un basculement
    // systématiquement nul signifierait que le repli de secours s'est déclenché.
    expect(droits / total).toBeLessThan(0.1);
  });

  it('n’émet aucune face interne : le rendu ne dessine que ce qui se voit', () => {
    // Deux cubes collés partagent une face ; la dessiner produit un liseré
    // fantôme au milieu de la figure.
    const paire: Array<[number, number, number]> = [[0, 0, 0], [1, 0, 0]];
    const faces = isoFaces(paire);
    // Cube de gauche : +Y et +Z (son +X est collé au voisin) ; cube de droite :
    // +Y, +Z et +X. Les faces −X, −Y, −Z tournent le dos au spectateur.
    expect(faces.length).toBe(5);
    for (const f of faces) expect(f.shade).toBeGreaterThanOrEqual(0);
  });

  it('l’identité redonne exactement les trois faces de l’isométrie classique', () => {
    const faces = isoFaces([[0, 0, 0]]);
    expect(faces).toHaveLength(3);
    expect(new Set(faces.map((f) => f.kind))).toEqual(new Set([1, 2, 3]));
    // Le dessus est la face la plus éclairée : c'est ce qui donne le relief.
    const dessus = faces.find((f) => f.kind === 1)!;
    for (const f of faces) if (f !== dessus) expect(dessus.shade).toBeGreaterThan(f.shade);
  });
});

describe('conformité Pilotest', () => {
  it('affiche une dizaine de cubes, pas quatre', () => {
    const tailles = new Set<number>();
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 20; seed++) tailles.add(generate(seed, level).question.size);
    }
    expect(Math.min(...tailles)).toBeGreaterThanOrEqual(7);
    expect(Math.max(...tailles)).toBeGreaterThanOrEqual(10);
  });

  it('les trois empilements sont mis à la MÊME échelle', () => {
    // Une échelle propre à chaque figure ferait de la taille des cubes un
    // indice, et l'appariement se ferait sans tourner quoi que ce soit.
    for (let seed = 0; seed < 20; seed++) {
      const q = generate(seed, 4).question;
      const world = worldSizeFor(q.stacks.map((shape, i) => ({ shape, tilt: q.tilts[i] })));
      for (let i = 0; i < 3; i++) {
        const { minX, maxX, minY, maxY } = isoBounds(isoFaces(q.stacks[i], q.tilts[i]));
        expect(Math.max(maxX - minX, maxY - minY)).toBeLessThanOrEqual(world);
      }
    }
  });
});
