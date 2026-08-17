/**
 * Boîtes à mots (PSY0 cadets) — champs lexicaux façon Pilotest.
 *
 * Contraintes tenues par les tests :
 *  - les banques sont GLOBALEMENT disjointes : aucun mot n'appartient à deux thèmes ;
 *  - les paires de thèmes trop proches (« races de chiens » vs « animaux sauvages »…)
 *    sont déclarées incompatibles et ne peuvent jamais tomber dans la même série ;
 *  - au moins 14 thèmes, au moins 8 mots par thème.
 */

export const THEMES = [
  'Races de chiens',
  'Ustensiles de cuisine',
  'Mathématiques',
  'Boissons',
  'Astronomie',
  'Animaux sauvages',
  'Instruments de musique',
  'Métiers du bâtiment',
  'Fleurs',
  'Poissons',
  'Sports collectifs',
  'Météo',
  'Vêtements',
  'Outils de jardin',
  'Épices',
  'Pays d’Europe',
  'Véhicules',
] as const;

export type Theme = (typeof THEMES)[number];

export const BANK: Record<Theme, string[]> = {
  'Races de chiens': [
    'épagneul', 'caniche', 'labrador', 'beagle', 'teckel', 'dalmatien', 'bouledogue', 'colley',
    'lévrier', 'chihuahua', 'dobermann', 'rottweiler', 'braque', 'setter',
  ],
  'Ustensiles de cuisine': [
    'louche', 'spatule', 'passoire', 'fouet', 'écumoire', 'casserole', 'poêle', 'marmite',
    'entonnoir', 'presse-ail', 'saladier', 'faitout', 'cocotte', 'économe',
  ],
  Mathématiques: [
    'hypoténuse', 'logarithme', 'dérivée', 'matrice', 'polynôme', 'intégrale', 'cosinus',
    'équation', 'fraction', 'théorème', 'asymptote', 'médiane', 'quotient', 'factorielle',
  ],
  Boissons: [
    'limonade', 'cidre', 'tisane', 'orangeade', 'soda', 'café', 'thé', 'lait', 'infusion',
    'nectar', 'grenadine', 'diabolo', 'panaché', 'kéfir',
  ],
  Astronomie: [
    'galaxie', 'comète', 'nébuleuse', 'quasar', 'astéroïde', 'constellation', 'éclipse',
    'satellite', 'cratère', 'orbite', 'pulsar', 'météorite', 'télescope', 'zénith',
  ],
  'Animaux sauvages': [
    'girafe', 'éléphant', 'zèbre', 'gazelle', 'hyène', 'rhinocéros', 'hippopotame', 'guépard',
    'gnou', 'buffle', 'léopard', 'antilope', 'phacochère', 'okapi',
  ],
  'Instruments de musique': [
    'violon', 'trompette', 'clarinette', 'accordéon', 'harpe', 'saxophone', 'banjo', 'mandoline',
    'trombone', 'hautbois', 'tambourin', 'contrebasse', 'ukulélé', 'cornemuse',
  ],
  'Métiers du bâtiment': [
    'maçon', 'couvreur', 'charpentier', 'plaquiste', 'carreleur', 'grutier', 'terrassier',
    'plâtrier', 'ferrailleur', 'coffreur', 'étancheur', 'échafaudeur', 'vitrier', 'zingueur',
  ],
  Fleurs: [
    'tulipe', 'marguerite', 'pivoine', 'jonquille', 'glaïeul', 'camélia', 'dahlia', 'orchidée',
    'jacinthe', 'anémone', 'bégonia', 'lilas', 'renoncule', 'primevère',
  ],
  Poissons: [
    'sardine', 'maquereau', 'cabillaud', 'merlan', 'saumon', 'truite', 'colin', 'églefin',
    'rouget', 'anchois', 'hareng', 'turbot', 'lotte', 'flétan',
  ],
  'Sports collectifs': [
    'football', 'rugby', 'handball', 'basketball', 'volleyball', 'hockey', 'waterpolo',
    'baseball', 'cricket', 'futsal', 'ultimate', 'kayak-polo',
  ],
  Météo: [
    'averse', 'brouillard', 'verglas', 'canicule', 'bourrasque', 'grêle', 'bruine', 'orage',
    'tempête', 'givre', 'crachin', 'éclaircie', 'redoux', 'blizzard',
  ],
  Vêtements: [
    'chemisier', 'pantalon', 'écharpe', 'imperméable', 'pull', 'gilet', 'salopette', 'anorak',
    'chemise', 'veste', 'cravate', 'jupe', 'bonnet', 'pyjama',
  ],
  'Outils de jardin': [
    'sécateur', 'binette', 'arrosoir', 'râteau', 'bêche', 'tondeuse', 'serfouette', 'brouette',
    'cisaille', 'greffoir', 'transplantoir', 'houe', 'plantoir', 'motobineuse',
  ],
  Épices: [
    'cannelle', 'muscade', 'curcuma', 'safran', 'paprika', 'gingembre', 'cumin', 'coriandre',
    'girofle', 'poivre', 'piment', 'vanille', 'cardamome', 'anis',
  ],
  'Pays d’Europe': [
    'Portugal', 'Hongrie', 'Norvège', 'Autriche', 'Belgique', 'Danemark', 'Slovénie', 'Croatie',
    'Irlande', 'Pologne', 'Grèce', 'Suède', 'Finlande', 'Roumanie',
  ],
  Véhicules: [
    'camion', 'tracteur', 'autocar', 'tramway', 'scooter', 'camionnette', 'fourgon', 'remorque',
    'motocyclette', 'berline', 'cabriolet', 'break', 'téléphérique', 'funiculaire',
  ],
};

/**
 * Paires de thèmes trop proches : jamais ensemble dans une même série.
 * Sinon le classement devient ambigu (« épagneul » va-t-il dans « races de chiens »
 * ou dans « animaux sauvages » ?), et l'exercice ne teste plus la mémoire associative
 * mais la lecture dans les pensées de l'examinateur.
 */
export const INCOMPATIBLE_PAIRS: readonly (readonly [Theme, Theme])[] = [
  ['Races de chiens', 'Animaux sauvages'],
  ['Poissons', 'Animaux sauvages'],
  ['Poissons', 'Races de chiens'],
  ['Ustensiles de cuisine', 'Outils de jardin'],
  ['Ustensiles de cuisine', 'Épices'],
  ['Épices', 'Boissons'],
  ['Fleurs', 'Outils de jardin'],
  ['Métiers du bâtiment', 'Outils de jardin'],
  ['Mathématiques', 'Astronomie'],
  ['Météo', 'Astronomie'],
  ['Véhicules', 'Sports collectifs'],
  ['Poissons', 'Ustensiles de cuisine'],
];

const INCOMPATIBLE_KEYS = new Set(
  INCOMPATIBLE_PAIRS.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]),
);

export function areIncompatible(a: Theme, b: Theme): boolean {
  return INCOMPATIBLE_KEYS.has(`${a}|${b}`);
}

/** Les thèmes auxquels un mot appartient (les banques sont disjointes → 0 ou 1). */
export function themesOf(word: string): Theme[] {
  return THEMES.filter((t) => BANK[t].includes(word));
}
