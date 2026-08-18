/**
 * Timelines d'animation PURES : une suite de segments (valeur cible, durée,
 * lissage), évaluée à un instant t. Les composants ne font que dériver la
 * valeur du temps — tout ce qui se calcule est ici, donc testable, et le rendu
 * reste identique qu'on anime, qu'on fasse défiler au curseur, ou qu'on soit
 * en `prefers-reduced-motion`.
 */

export type Ease = (x: number) => number;

export const linear: Ease = (x) => x;

/** Accélère puis freine — le mouvement « physique » par défaut. */
export const easeInOut: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export interface Segment {
  /** Valeur atteinte à la fin du segment. Égale à la précédente = temps de pause. */
  to: number;
  ms: number;
  ease?: Ease;
}

export function duration(segments: Segment[]): number {
  return segments.reduce((s, seg) => s + seg.ms, 0);
}

/**
 * Valeur de la timeline à l'instant t (ms). Part de `from`, enchaîne les
 * segments ; en boucle, t est replié modulo la durée totale.
 */
export function valueAt(segments: Segment[], tMs: number, from = 0, loop = true): number {
  const total = duration(segments);
  if (total <= 0) return from;
  let t = loop ? ((tMs % total) + total) % total : Math.min(Math.max(tMs, 0), total);
  let start = from;
  for (const seg of segments) {
    if (t <= seg.ms) {
      if (seg.ms === 0) return seg.to;
      const x = (seg.ease ?? easeInOut)(t / seg.ms);
      return start + (seg.to - start) * x;
    }
    t -= seg.ms;
    start = seg.to;
  }
  return start;
}

/**
 * Le cycle standard des démonstrations : aller (plier), tenir, retour
 * (déplier), tenir. Les pauses aux extrémités laissent VOIR les deux états —
 * une boucle sans repos ne montre que du mouvement, jamais un état.
 */
export function foldCycle(goMs = 2200, holdMs = 1100): Segment[] {
  return [
    { to: 1, ms: goMs },
    { to: 1, ms: holdMs },
    { to: 0, ms: goMs },
    { to: 0, ms: holdMs },
  ];
}
