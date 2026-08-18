import { describe, expect, it } from 'vitest';
import { MELEE_COUNT, WEIGHTS, composeDrill, composeMelee, focusOrder } from './drill';
import type { Candidate } from './drill';
import type { Mastery } from './progress';

const CANDIDATES: Candidate[] = [
  { id: 'a', mastery: 'acquis' },
  { id: 'b', mastery: 'fragile' },
  { id: 'c', mastery: 'en-cours' },
  { id: 'd', mastery: 'neuf' },
  { id: 'e', mastery: 'acquis' },
];

function counts(ids: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return m;
}

describe('ordre de travail', () => {
  it('met le fragile devant et l’acquis derrière', () => {
    expect(focusOrder(CANDIDATES).map((c) => c.id)).toEqual(['b', 'd', 'c', 'a', 'e']);
  });

  it('conserve l’ordre du catalogue à poids égal', () => {
    const same: Candidate[] = [
      { id: 'x', mastery: 'acquis' },
      { id: 'y', mastery: 'acquis' },
      { id: 'z', mastery: 'acquis' },
    ];
    expect(focusOrder(same).map((c) => c.id)).toEqual(['x', 'y', 'z']);
  });
});

describe('mêlée', () => {
  it('produit exactement le nombre d’items demandé', () => {
    for (const n of [1, 5, 20, 37]) expect(composeMelee(CANDIDATES, n)).toHaveLength(n);
  });

  it('ne tire que parmi les techniques proposées', () => {
    const ids = new Set(CANDIDATES.map((c) => c.id));
    for (const id of composeMelee(CANDIDATES, MELEE_COUNT)) expect(ids.has(id)).toBe(true);
  });

  it('n’enchaîne jamais deux fois la même technique quand une autre est disponible', () => {
    const suite = composeMelee(CANDIDATES, MELEE_COUNT);
    for (let i = 1; i < suite.length; i++) expect(suite[i], suite.join(' ')).not.toBe(suite[i - 1]);
  });

  it('n’abandonne jamais une technique acquise : elle garde au moins un passage', () => {
    const suite = composeMelee(CANDIDATES, MELEE_COUNT);
    for (const c of CANDIDATES) expect(counts(suite).get(c.id) ?? 0, c.id).toBeGreaterThan(0);
  });

  it('donne d’autant plus de place que la technique est fragile', () => {
    const n = counts(composeMelee(CANDIDATES, 40));
    const at = (id: string) => n.get(id) ?? 0;
    expect(at('b')).toBeGreaterThan(at('d'));
    expect(at('d')).toBeGreaterThan(at('c'));
    expect(at('c')).toBeGreaterThan(at('a'));
  });

  it('respecte les poids annoncés, à une unité près', () => {
    const count = 100;
    const total = CANDIDATES.reduce((s, c) => s + WEIGHTS[c.mastery], 0);
    const n = counts(composeMelee(CANDIDATES, count));
    for (const c of CANDIDATES) {
      const attendu = (WEIGHTS[c.mastery] * count) / total;
      expect(Math.abs((n.get(c.id) ?? 0) - attendu), c.id).toBeLessThanOrEqual(1);
    }
  });

  it('se replie sans boucler quand il ne reste qu’une technique', () => {
    const seule: Candidate[] = [{ id: 'a', mastery: 'fragile' }];
    expect(composeMelee(seule, 4)).toEqual(['a', 'a', 'a', 'a']);
  });

  it('ne rend rien sur une demande vide ou un catalogue vide', () => {
    expect(composeMelee(CANDIDATES, 0)).toEqual([]);
    expect(composeMelee([], 10)).toEqual([]);
  });

  it('reste déterministe : aucune part d’aléatoire dans la composition', () => {
    expect(composeMelee(CANDIDATES, MELEE_COUNT)).toEqual(composeMelee(CANDIDATES, MELEE_COUNT));
  });

  it('répartit une population homogène de façon équilibrée', () => {
    const homogene: Candidate[] = ['a', 'b', 'c', 'd'].map((id) => ({ id, mastery: 'en-cours' as Mastery }));
    const n = counts(composeMelee(homogene, 20));
    for (const c of homogene) expect(n.get(c.id)).toBe(5);
  });
});

describe('drill ciblé', () => {
  it('répète la technique visée — le seul cas où répéter est le but', () => {
    expect(composeDrill('mul-11', 3)).toEqual(['mul-11', 'mul-11', 'mul-11']);
    expect(composeDrill('mul-11', 0)).toEqual([]);
  });
});
