import type { Shape } from './model';

export interface PolycubeDef {
  name: string;
  size: 4 | 5 | 6 | 7;
  cells: Shape;
  /**
   * true ⟺ orbite de 24 vues (aucune symétrie de rotation propre).
   * Seules ces formes peuvent produire trois vues DEUX À DEUX très éloignées
   * (≥ 120°), donc les items `hard-orientation`.
   */
  supportsHard: boolean;
}

/**
 * Polycubes retenus après TROIS filtres, tous revérifiés par les tests :
 *
 * 1. CHIRALITÉ — le miroir n'est atteignable par aucune rotation, sans quoi la
 *    question n'aurait pas de réponse ;
 * 2. pas d'ÉNANTIOMÈRES dans le pool — le miroir d'une forme n'est jamais une
 *    autre forme de la liste ;
 * 3. LISIBILITÉ ISOMÉTRIQUE — les 48 orientations (24 vues + 24 vues du miroir)
 *    produisent 48 dessins deux à deux distincts. Ce filtre est indispensable :
 *    en isométrie des cubes sont cachés, et certaines formes (par ex. le
 *    pentacube « ergot ») ont des orientations où l'empilement et son miroir se
 *    dessinent EXACTEMENT pareil — item impossible à trancher.
 *
 * Le tétracube « vis » est le seul tétracube chiral existant ; il possède un axe
 * d'ordre 2 (12 vues seulement, 24 dessins distincts), d'où supportsHard: false.
 */
export const SHAPES: PolycubeDef[] = [
  // ---- 4 cubes ----
  { name: 'vis-4', size: 4, supportsHard: false, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0]] },

  // ---- 5 cubes ----
  { name: 'crochet-5', size: 5, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0], [2, 0, 0]] },
  { name: 'bosse-5', size: 5, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 0, 1], [2, 0, 0]] },
  { name: 'aile-5', size: 5, supportsHard: true, cells: [[0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 1, 0], [2, 0, 0]] },

  // ---- 6 cubes ----
  { name: 'marche-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 0, 1], [2, 0, 0]] },
  { name: 'pince-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0]] },
  { name: 'banc-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 1, 0], [2, 0, 0]] },
  { name: 'trefle-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 0, 1], [1, 1, 0], [2, 0, 0]] },
  { name: 'tour-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1], [2, 0, 0]] },
  { name: 'equerre-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [2, 0, 1]] },
  { name: 'fourche-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 1, 1], [2, 0, 0]] },
  { name: 'coude-6', size: 6, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [2, 0, 0]] },

  // ---- 7 cubes ----
  { name: 'bloc-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [2, 0, 0]] },
  { name: 'rail-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 0, 1], [2, 0, 0], [2, 0, 1]] },
  { name: 'chaise-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 0, 1], [2, 0, 0], [2, 1, 0]] },
  { name: 'pupitre-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [2, 0, 0], [2, 1, 0]] },
  { name: 'escalier-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0], [2, 1, 1]] },
  { name: 'crete-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1], [2, 0, 0]] },
  { name: 'plateau-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [2, 0, 0]] },
  { name: 'pont-7', size: 7, supportsHard: true, cells: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 1, 0], [2, 0, 0], [2, 0, 1]] },
];
