import type { Mastery } from './progress';

/**
 * Composition d'une mêlée.
 *
 * Deux principes, tous deux contre-intuitifs mais établis :
 *
 * 1. On donne plus de place à ce qui est fragile, sans jamais abandonner ce qui
 *    est acquis — une technique cesse d'être disponible sous stress si on ne la
 *    revoit plus jamais.
 *
 * 2. On ENTRELACE. Enchaîner vingt fois la même technique donne l'illusion de
 *    la maîtriser : on n'a plus à la reconnaître, on l'applique en pilote
 *    automatique. Or au test, la difficulté est précisément de reconnaître
 *    LAQUELLE s'applique. D'où l'interdiction de deux items consécutifs de même
 *    technique tant qu'une autre est disponible.
 */

export const WEIGHTS: Record<Mastery, number> = {
  fragile: 4,
  neuf: 3,
  'en-cours': 2,
  acquis: 1,
};

export interface Candidate {
  id: string;
  mastery: Mastery;
}

/** Ordre de travail : le plus fragile d'abord, à poids égal l'ordre du catalogue. */
export function focusOrder(candidates: Candidate[]): Candidate[] {
  return candidates
    .map((c, i) => ({ c, i }))
    .sort((a, b) => WEIGHTS[b.c.mastery] - WEIGHTS[a.c.mastery] || a.i - b.i)
    .map(({ c }) => c);
}

/**
 * Répartit `count` items entre les techniques proportionnellement à leur poids,
 * puis les ordonne sans jamais répéter deux fois de suite la même — en piochant
 * toujours dans celle à qui il reste le plus d'items.
 */
export function composeMelee(candidates: Candidate[], count: number): string[] {
  if (candidates.length === 0 || count <= 0) return [];

  const ordered = focusOrder(candidates);
  const total = ordered.reduce((s, c) => s + WEIGHTS[c.mastery], 0);

  // Répartition proportionnelle, le reste allant aux plus fragiles : ce sont
  // elles qui ouvrent la liste, donc elles qui reçoivent les items en trop.
  const quota = new Map<string, number>();
  let placed = 0;
  for (const c of ordered) {
    const n = Math.floor((WEIGHTS[c.mastery] * count) / total);
    quota.set(c.id, n);
    placed += n;
  }
  for (let i = 0; placed < count; i++, placed++) {
    const c = ordered[i % ordered.length];
    quota.set(c.id, (quota.get(c.id) ?? 0) + 1);
  }

  const out: string[] = [];
  let previous: string | null = null;
  for (let i = 0; i < count; i++) {
    // La plus fournie d'abord : c'est la seule façon de garantir qu'aucune ne
    // se retrouve en fin de liste avec assez d'items pour devoir se répéter.
    const next = ordered
      .filter((c) => (quota.get(c.id) ?? 0) > 0 && c.id !== previous)
      .sort((a, b) => (quota.get(b.id) ?? 0) - (quota.get(a.id) ?? 0))[0];
    // Une seule technique reste : on la répète plutôt que d'écourter la séance.
    const chosen = next ?? ordered.find((c) => (quota.get(c.id) ?? 0) > 0);
    if (!chosen) break;
    quota.set(chosen.id, (quota.get(chosen.id) ?? 0) - 1);
    out.push(chosen.id);
    previous = chosen.id;
  }
  return out;
}

/** Un drill ciblé : une seule technique, répétée. Le seul cas où répéter est le but. */
export function composeDrill(id: string, count: number): string[] {
  return Array.from({ length: Math.max(0, count) }, () => id);
}

export const DRILL_COUNT = 10;
export const MELEE_COUNT = 20;
