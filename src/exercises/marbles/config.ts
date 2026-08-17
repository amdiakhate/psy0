export interface MarblesLevel {
  /** Nombre de billes. Capacité totale = 8 (3+2+3) : au-delà de 6 billes,
   *  l'espace de manœuvre s'effondre (7 billes → 3 déplacements possibles au plus,
   *  8 billes → tout est plein, aucun mouvement). Mesuré, pas supposé. */
  marbles: number;
  /** Fourchette du nombre minimal de déplacements attendu. */
  minMoves: number;
  maxMoves: number;
}

/**
 * Sur Pilotest, chaque bille porte un NUMÉRO unique : elles sont toutes
 * distinctes, jamais interchangeables. Une version antérieure réutilisait des
 * couleurs en double aux niveaux élevés, ce qui rendait certaines billes
 * permutables et faisait baisser le minimum de déplacements — un exercice plus
 * facile que l'original, et surtout un raisonnement différent.
 */
export const LEVELS: MarblesLevel[] = [
  { marbles: 3, minMoves: 2, maxMoves: 3 },
  { marbles: 4, minMoves: 3, maxMoves: 5 },
  { marbles: 4, minMoves: 4, maxMoves: 6 },
  { marbles: 5, minMoves: 5, maxMoves: 7 },
  { marbles: 5, minMoves: 6, maxMoves: 9 },
];

/**
 * Une couleur par bille, indexée par son numéro. La couleur double le numéro
 * comme repère visuel — c'est le numéro qui identifie la bille.
 */
export const MARBLE_COLORS = ['#3b82f6', '#eab308', '#a855f7', '#ef4444', '#22c55e', '#ec4899'];

/**
 * Réponses proposées par le QCM. Pilotest ne fait pas saisir le nombre : il
 * propose huit boutons, de 2 à 9. Les niveaux doivent donc rester dans cette
 * fourchette, sinon la bonne réponse serait absente des choix.
 */
export const ANSWER_CHOICES = [2, 3, 4, 5, 6, 7, 8, 9] as const;
