/**
 * Matière première des deux formats non numériques.
 *
 * Les prénoms servent aux énigmes « Emma a 51 ans » : le nombre s'y déduit des
 * LETTRES du prénom. Ils sont donc choisis pour leur variété de première et
 * dernière lettre — sinon toutes les questions se ressembleraient.
 */
export const FIRST_NAMES = [
  'Emma', 'Gabriel', 'Maika', 'Gabrielle', 'Louis', 'Chloé', 'Adam', 'Jade',
  'Raphael', 'Louise', 'Arthur', 'Alice', 'Hugo', 'Lina', 'Jules', 'Rose',
  'Nathan', 'Anna', 'Ethan', 'Camille', 'Paul', 'Sarah', 'Victor', 'Julia',
  'Antoine', 'Manon', 'Theo', 'Zoe', 'Marius', 'Iris', 'Noah', 'Eva',
  'Simon', 'Nina', 'Oscar', 'Lea', 'Timeo', 'Clara', 'Basile', 'Maya',
] as const;

/**
 * Mots courants pour les séries « lit - cou - été - gaz ». Groupés par
 * longueur : c'est la propriété que Pilotest emploie, et le générateur doit
 * pouvoir tirer autant de mots de même longueur que de longueurs différentes.
 */
export const WORDS_BY_LENGTH: Record<number, string[]> = {
  3: ['lit', 'cou', 'été', 'gaz', 'sup', 'mur', 'rue', 'pas', 'vin', 'sol', 'air', 'feu', 'nez', 'oie', 'pot', 'bal'],
  4: ['item', 'mont', 'sept', 'lame', 'rire', 'pont', 'gare', 'joue', 'cave', 'noix', 'bras', 'tour', 'fils', 'rame'],
  5: ['route', 'table', 'livre', 'chien', 'porte', 'verre', 'plage', 'salon', 'ferme', 'bille', 'carte', 'sucre'],
  6: ['maison', 'jardin', 'bureau', 'garage', 'sirene', 'nuages', 'papier', 'balcon', 'soleil', 'cheval'],
  7: ['soulier', 'voiture', 'cuisine', 'fenetre', 'journal', 'lanceur', 'plafond'],
  8: ['carabine', 'escalier', 'fontaine', 'clavecin', 'montagne', 'pantalon', 'triangle'],
};

/** Toutes les longueurs qui ont assez de mots pour bâtir une question. */
export const USABLE_LENGTHS = Object.keys(WORDS_BY_LENGTH)
  .map(Number)
  .filter((n) => WORDS_BY_LENGTH[n].length >= 8);
