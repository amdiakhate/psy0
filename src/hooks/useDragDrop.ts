import { useCallback, useEffect, useState } from 'react';

/**
 * Glisser-déposer au pointeur, comme sur Pilotest (Cubes, Formes glissées).
 *
 * Pointer Events plutôt que l'API HTML5 `draggable` : celle-ci ne fonctionne
 * pas au doigt sur mobile, ne permet pas de dessiner un aperçu correct dans un
 * SVG, et son image de glissement échappe au style de l'application.
 *
 * La cible est résolue au relâchement via `document.elementFromPoint`, en
 * remontant au premier ancêtre portant `data-drop`. Les zones de dépôt n'ont
 * donc rien à enregistrer : il suffit de poser l'attribut.
 */

export interface DragState<T> {
  payload: T;
  /** Position courante du pointeur, pour dessiner l'aperçu. */
  x: number;
  y: number;
  /** Zone survolée à cet instant (`data-drop`), pour la mettre en évidence. */
  over: string | null;
}

/** Distance en pixels au-delà de laquelle on considère que c'est un glissement. */
const DRAG_THRESHOLD = 4;

export function useDragDrop<T>(onDrop: (payload: T, zone: string) => void) {
  const [drag, setDrag] = useState<DragState<T> | null>(null);
  const [moved, setMoved] = useState(false);

  const zoneAt = (x: number, y: number): string | null =>
    document.elementFromPoint(x, y)?.closest('[data-drop]')?.getAttribute('data-drop') ?? null;

  const startDrag = useCallback(
    (payload: T) => (e: React.PointerEvent) => {
      // Bouton gauche / doigt uniquement : un clic droit ne doit rien saisir.
      if (e.button !== 0) return;
      e.preventDefault();
      setMoved(false);
      setDrag({ payload, x: e.clientX, y: e.clientY, over: zoneAt(e.clientX, e.clientY) });
    },
    [],
  );

  useEffect(() => {
    if (!drag) return;

    const move = (e: PointerEvent) => {
      setMoved((m) => m || Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > DRAG_THRESHOLD);
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, over: zoneAt(e.clientX, e.clientY) } : d));
    };

    const finish = (e: PointerEvent) => {
      const zone = zoneAt(e.clientX, e.clientY);
      if (zone) onDrop(drag.payload, zone);
      setDrag(null);
    };

    // `pointercancel` : un glissement interrompu (geste système, perte de focus)
    // ne doit rien déposer — sinon une pièce atterrit à un endroit non voulu.
    const cancel = () => setDrag(null);

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [drag, onDrop]);

  return {
    drag,
    startDrag,
    /**
     * Vrai si le pointeur a bougé au-delà du seuil : permet de distinguer un
     * glissement d'un simple clic, et donc de garder le clic pour retourner
     * une face (Cubes) sans qu'un micro-mouvement ne l'annule.
     */
    moved,
  };
}
