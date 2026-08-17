import { useEffect, useRef } from 'react';

/**
 * Écoute clavier globale — toutes les réponses se donnent au clavier.
 * Le handler est dans une ref : pas de re-abonnement à chaque render,
 * donc aucune latence ni event perdu entre deux items.
 */
export function useKeys(handler: (e: KeyboardEvent) => void, enabled = true): void {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const listen = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      ref.current(e);
    };
    window.addEventListener('keydown', listen);
    return () => window.removeEventListener('keydown', listen);
  }, [enabled]);
}
