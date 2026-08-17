export type ThemeId =
  | 'musique'
  | 'physique'
  | 'mathematiques'
  | 'informatique'
  | 'botanique'
  | 'geologie'
  | 'oiseaux'
  | 'marine'
  | 'medecine'
  | 'architecture'
  | 'cuisine'
  | 'textile';

export interface ThemeDef {
  id: ThemeId;
  label: string;
  /**
   * Mots en MAJUSCULES sans accent : le tri alphabétique du joueur et celui du
   * générateur doivent coïncider exactement (comparaison ASCII directe).
   * Chaque mot n'appartient sans ambiguïté qu'à une seule thématique.
   */
  words: string[];
}

/** Ordre canonique (affichage et tirage déterministes). */
export const THEME_IDS: ThemeId[] = [
  'musique',
  'physique',
  'mathematiques',
  'informatique',
  'botanique',
  'geologie',
  'oiseaux',
  'marine',
  'medecine',
  'architecture',
  'cuisine',
  'textile',
];

export const THEMES: Record<ThemeId, ThemeDef> = {
  musique: {
    id: 'musique',
    label: 'Musique classique',
    words: [
      'ADAGIO', 'ARCHET', 'ARIA', 'CADENCE', 'CLAVECIN', 'CROCHE', 'FUGUE',
      'LEGATO', 'MOTET', 'OPUS', 'PARTITION', 'SONATE', 'SOUPIR', 'STACCATO',
      'TREMOLO',
    ],
  },
  physique: {
    id: 'physique',
    label: 'Physique',
    words: [
      'AIMANT', 'ATOME', 'ELECTRON', 'INERTIE', 'ISOTOPE', 'JOULE', 'NEUTRON',
      'NEWTON', 'PENDULE', 'PHOTON', 'PRISME', 'PROTON', 'QUARK', 'RADIANT',
      'WATT',
    ],
  },
  mathematiques: {
    id: 'mathematiques',
    label: 'Mathématiques',
    words: [
      'ALGEBRE', 'ASYMPTOTE', 'AXIOME', 'BISSECTRICE', 'COSINUS', 'DERIVEE',
      'EQUATION', 'FACTORIELLE', 'HYPOTENUSE', 'INTEGRALE', 'LEMME',
      'LOGARITHME', 'MATRICE', 'MEDIANE', 'POLYNOME', 'QUOTIENT', 'SINUS',
      'TANGENTE', 'THEOREME',
    ],
  },
  informatique: {
    id: 'informatique',
    label: 'Informatique',
    words: [
      'ALGORITHME', 'BINAIRE', 'COMPILATEUR', 'CURSEUR', 'DEBOGAGE', 'FICHIER',
      'LOGICIEL', 'NAVIGATEUR', 'OCTET', 'PIXEL', 'POINTEUR', 'PROCESSEUR',
      'ROUTEUR', 'TABLEUR',
    ],
  },
  botanique: {
    id: 'botanique',
    label: 'Botanique',
    words: [
      'BOURGEON', 'BRACTEE', 'BULBE', 'COROLLE', 'ETAMINE', 'GRAINE', 'LIANE',
      'PETALE', 'PISTIL', 'POLLEN', 'RHIZOME', 'SEPALE', 'SEVE', 'STIPULE',
      'VRILLE',
    ],
  },
  geologie: {
    id: 'geologie',
    label: 'Géologie',
    words: [
      'BASALTE', 'CALCAIRE', 'CRATERE', 'EROSION', 'ERUPTION', 'FAILLE',
      'GNEISS', 'GRANITE', 'LAVE', 'MAGMA', 'OBSIDIENNE', 'QUARTZ', 'SCHISTE',
      'SEDIMENT', 'SEISME', 'STRATE', 'TECTONIQUE',
    ],
  },
  oiseaux: {
    id: 'oiseaux',
    label: 'Oiseaux',
    words: [
      'ALOUETTE', 'BUSARD', 'CHOUETTE', 'CIGOGNE', 'COLIBRI', 'CORMORAN',
      'ETOURNEAU', 'FAUCON', 'GOELAND', 'HERON', 'HIRONDELLE', 'MERLE',
      'MESANGE', 'MOINEAU', 'MOUETTE', 'PELICAN', 'PERDRIX', 'PIGEON',
      'PINSON', 'ROITELET', 'ROSSIGNOL', 'VAUTOUR',
    ],
  },
  marine: {
    id: 'marine',
    label: 'Marine',
    words: [
      'AMARRE', 'ANCRE', 'BABORD', 'BEAUPRE', 'CABESTAN', 'CARENE', 'ECOUTILLE',
      'ETRAVE', 'GOUVERNAIL', 'HAUBAN', 'HUBLOT', 'MISAINE', 'PROUE', 'QUILLE',
      'SABORD', 'TRIBORD', 'VERGUE',
    ],
  },
  medecine: {
    id: 'medecine',
    label: 'Médecine',
    words: [
      'ARTERE', 'BISTOURI', 'DIAGNOSTIC', 'FIEVRE', 'GREFFE', 'LIGAMENT',
      'ORDONNANCE', 'PANSEMENT', 'PERFUSION', 'POSOLOGIE', 'SCALPEL',
      'STETHOSCOPE', 'SUTURE', 'SYMPTOME', 'TENDON', 'THORAX', 'VACCIN',
      'VERTEBRE',
    ],
  },
  architecture: {
    id: 'architecture',
    label: 'Architecture',
    words: [
      'ARCADE', 'BALUSTRE', 'CHAPITEAU', 'CHARPENTE', 'CLOCHETON', 'COLONNE',
      'CORNICHE', 'ENTABLEMENT', 'FRISE', 'FRONTON', 'LINTEAU', 'LUCARNE',
      'MEZZANINE', 'PIGNON', 'PILASTRE', 'PORTIQUE', 'ROTONDE', 'VOUTE',
    ],
  },
  cuisine: {
    id: 'cuisine',
    label: 'Cuisine',
    words: [
      'BOUILLON', 'CASSEROLE', 'COCOTTE', 'ECUMOIRE', 'EMINCE', 'FOUET',
      'JULIENNE', 'LOUCHE', 'MARINADE', 'MARMITE', 'MIXEUR', 'NAPPAGE',
      'PASSOIRE', 'POELE', 'RAMEQUIN', 'ROUX', 'SAUTEUSE', 'SPATULE', 'TAMIS',
      'VINAIGRETTE',
    ],
  },
  textile: {
    id: 'textile',
    label: 'Textile',
    words: [
      'BOBINE', 'BRODERIE', 'CANEVAS', 'COUTURE', 'DENTELLE', 'ETOFFE',
      'FILATURE', 'JERSEY', 'LAINAGE', 'OURLET', 'POPELINE', 'SATIN', 'TISSAGE',
      'TRAME', 'TWEED', 'VELOURS', 'VISCOSE',
    ],
  },
};

/**
 * Paires de thématiques sémantiquement PROCHES : le tri « à quelle famille
 * appartient ce mot ? » cesse d'être automatique, ce qui est exactement le
 * piège des niveaux élevés.
 */
export const CLOSE_PAIRS: Array<[ThemeId, ThemeId]> = [
  ['physique', 'mathematiques'],
  ['physique', 'informatique'],
  ['mathematiques', 'informatique'],
  ['physique', 'medecine'],
  ['musique', 'mathematiques'],
  ['musique', 'architecture'],
  ['botanique', 'oiseaux'],
  ['botanique', 'geologie'],
  ['botanique', 'medecine'],
  ['botanique', 'cuisine'],
  ['geologie', 'marine'],
  ['geologie', 'architecture'],
  ['marine', 'architecture'],
  ['marine', 'oiseaux'],
  ['cuisine', 'textile'],
  ['cuisine', 'medecine'],
  ['textile', 'architecture'],
];

function pairKey(a: ThemeId, b: ThemeId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

const CLOSE_SET = new Set(CLOSE_PAIRS.map(([a, b]) => pairKey(a, b)));

export function isClosePair(a: ThemeId, b: ThemeId): boolean {
  return CLOSE_SET.has(pairKey(a, b));
}

/** Toutes les paires NON proches, dans un ordre canonique (tirage déterministe). */
export const FAR_PAIRS: Array<[ThemeId, ThemeId]> = (() => {
  const out: Array<[ThemeId, ThemeId]> = [];
  for (let i = 0; i < THEME_IDS.length; i++) {
    for (let j = i + 1; j < THEME_IDS.length; j++) {
      const a = THEME_IDS[i];
      const b = THEME_IDS[j];
      if (!isClosePair(a, b)) out.push([a, b]);
    }
  }
  return out;
})();
