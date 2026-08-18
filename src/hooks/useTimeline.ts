import { useEffect, useRef, useState } from 'react';
import { valueAt } from '../anim/timeline';
import type { Segment } from '../anim/timeline';

/** `prefers-reduced-motion` : le mouvement n'est pas une information — sans lui, le curseur reste. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fait vivre une timeline au rythme de l'écran. Rend la valeur courante et les
 * commandes ; en pause, le temps se fige et reprend où il s'était arrêté.
 * `scrub` fige l'animation ET impose la valeur — c'est le curseur manuel.
 */
export function useTimeline(segments: Segment[], autoplay = true): {
  value: number;
  playing: boolean;
  toggle: () => void;
  scrub: (v: number) => void;
} {
  const [playing, setPlaying] = useState(autoplay && !prefersReducedMotion());
  const [value, setValue] = useState(() => valueAt(segments, 0));
  const elapsedRef = useRef(0);
  const segsRef = useRef(segments);
  segsRef.current = segments;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      setValue(valueAt(segsRef.current, elapsedRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return {
    value,
    playing,
    toggle: () => setPlaying((p) => !p),
    scrub: (v: number) => {
      setPlaying(false);
      // Se caler au point du cycle correspondant : reprendre lecture depuis là.
      elapsedRef.current = 0;
      setValue(v);
    },
  };
}
