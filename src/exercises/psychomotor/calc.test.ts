import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { displayOf, isWrong, makeCalc, valueOf } from './calc';
import type { Calc } from './calc';

/** 400 calculs par jeu d'options : assez pour juger une distribution. */
function batch(options: Parameters<typeof makeCalc>[1], n = 400): Calc[] {
  const rng = mulberry32(12345);
  return Array.from({ length: n }, () => makeCalc(rng, options));
}

describe('makeCalc — véracité', () => {
  it('annonce toujours la vérité, recalculée depuis les membres', () => {
    // L'invariant central : on ne croit pas le drapeau `wrong`, on le vérifie.
    for (const c of batch({ wrongRate: 0.5 })) {
      expect(c.wrong).toBe(isWrong(c));
    }
  });

  it('produit des divisions entières uniquement', () => {
    // « 7/2 » n'existe pas sur Pilotest : la valeur doit rester entière.
    for (const c of batch({ wrongRate: 0.5 })) {
      for (const side of [c.left, c.right]) {
        if (side.kind === 'op' && side.op === '/') {
          expect(side.b).not.toBe(0);
          // `===` et non `toBe` : en JS, -36 % 3 vaut -0, que Object.is
          // distingue de 0 alors que la division est bien entière.
          expect(side.a % side.b === 0).toBe(true);
        }
      }
      expect(Number.isInteger(valueOf(c.left))).toBe(true);
      expect(Number.isInteger(valueOf(c.right))).toBe(true);
    }
  });

  it('n’affiche jamais deux nombres nus — ce ne serait plus un calcul', () => {
    for (const c of batch({ wrongRate: 0.5 })) {
      expect(c.left.kind === 'num' && c.right.kind === 'num').toBe(false);
    }
  });

  it('n’affiche jamais deux signes à la suite', () => {
    // « 67+-86 » se lit mal et ne teste rien de plus que « 67-86 ».
    for (const c of batch({ wrongRate: 0.5 })) {
      expect(c.display).not.toMatch(/[+×/]-\d/);
      expect(c.display).not.toMatch(/--/);
    }
  });

  it('rend une égalité lisible des deux côtés', () => {
    for (const c of batch({ wrongRate: 0.5 }).slice(0, 50)) {
      expect(c.display).toBe(displayOf(c));
      expect(c.display).toMatch(/^-?\d+([+\-×/]-?\d+)? = -?\d+([+\-×/]-?\d+)?$/);
    }
  });
});

describe('makeCalc — proportion de faux', () => {
  it('respecte le taux demandé', () => {
    for (const rate of [0.3, 0.5, 0.7]) {
      const faux = batch({ wrongRate: rate }).filter((c) => c.wrong).length / 400;
      expect(Math.abs(faux - rate)).toBeLessThan(0.08);
    }
  });

  it('ne produit que des vrais à 0, que des faux à 1', () => {
    expect(batch({ wrongRate: 0 }, 80).every((c) => !c.wrong)).toBe(true);
    expect(batch({ wrongRate: 1 }, 80).every((c) => c.wrong)).toBe(true);
  });
});

describe('makeCalc — pièges sur les unités', () => {
  const unites = (n: number) => ((n % 10) + 10) % 10;

  it('« unites-ok » garde le même chiffre des unités des deux côtés', () => {
    // C'est ce qui rend le raccourci « je compare les unités » insuffisant.
    const pieges = batch({ wrongRate: 1, unitTrapRate: 1 });
    expect(pieges.length).toBeGreaterThan(0);
    for (const c of pieges) {
      expect(c.trap).toBe('unites-ok');
      expect(unites(valueOf(c.left))).toBe(unites(valueOf(c.right)));
      expect(c.wrong).toBe(true);
    }
  });

  it('« unites-fausses » change le chiffre des unités', () => {
    for (const c of batch({ wrongRate: 1, unitTrapRate: 0 })) {
      expect(c.trap).toBe('unites-fausses');
      expect(unites(valueOf(c.left))).not.toBe(unites(valueOf(c.right)));
    }
  });

  it('mélange les deux pièges à peu près à parts égales par défaut', () => {
    // Sans mélange, on entraînerait soit un réflexe faux, soit la lenteur.
    const faux = batch({ wrongRate: 1 });
    const ok = faux.filter((c) => c.trap === 'unites-ok').length / faux.length;
    expect(ok).toBeGreaterThan(0.35);
    expect(ok).toBeLessThan(0.65);
  });

  it('garde les faux PLAUSIBLES : jamais d’écart grossier', () => {
    for (const c of batch({ wrongRate: 1 })) {
      const ecart = Math.abs(valueOf(c.left) - valueOf(c.right));
      expect(ecart).toBeGreaterThan(0);
      expect(ecart).toBeLessThanOrEqual(30);
    }
  });

  it('marque les vrais comme sans piège', () => {
    for (const c of batch({ wrongRate: 0 }, 100)) expect(c.trap).toBe('aucun');
  });
});

describe('makeCalc — déterminisme', () => {
  it('même graine, mêmes calculs', () => {
    const a = mulberry32(999);
    const b = mulberry32(999);
    for (let i = 0; i < 50; i++) {
      expect(makeCalc(a, { wrongRate: 0.5 })).toEqual(makeCalc(b, { wrongRate: 0.5 }));
    }
  });
});
