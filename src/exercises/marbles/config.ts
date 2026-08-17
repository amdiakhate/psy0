export interface MarblesLevel {
  /** Nombre de billes. Capacité totale = 8 (3+2+3) : au-delà de 6 billes,
   *  l'espace de manœuvre s'effondre (7 billes → 3 déplacements possibles au plus,
   *  8 billes → tout est plein, aucun mouvement). Mesuré, pas supposé. */
  marbles: number;
  /** Fourchette du nombre minimal de déplacements attendu. */
  minMoves: number;
  maxMoves: number;
  /** Couleurs distinctes (moins de couleurs = billes interchangeables = plus subtil). */
  colors: number;
}

export const LEVELS: MarblesLevel[] = [
  { marbles: 4, minMoves: 2, maxMoves: 3, colors: 4 },
  { marbles: 4, minMoves: 3, maxMoves: 5, colors: 4 },
  { marbles: 5, minMoves: 4, maxMoves: 6, colors: 5 },
  { marbles: 5, minMoves: 6, maxMoves: 8, colors: 3 },
  { marbles: 6, minMoves: 6, maxMoves: 9, colors: 3 },
];

/** Palette des billes (couleurs franches, lisibles sur fond sombre). */
export const MARBLE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
