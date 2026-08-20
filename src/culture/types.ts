/**
 * Culture aéronautique — l'épreuve de connaissances de la présélection Cadets.
 *
 * Ce n'est PAS un dix-septième exercice du PSY0 : rien ici n'entre dans le
 * registre des 16, ni dans les rotations, ni dans la stanine. C'est une épreuve
 * de SAVOIR, pas d'aptitude — on ne l'améliore pas en s'entraînant plus vite,
 * on l'améliore en sachant. D'où un module à part, avec sa propre mécanique de
 * révision espacée, comme l'atelier de calcul mental.
 *
 * Format officiel (relevé sur les annales Pilotest 2018 et 2019) :
 *   20 questions · 4 propositions · une seule bonne réponse
 *   +3 si juste, −1 si faux, 0 si « je ne sais pas »
 *   ~15 s par question
 */

export type CultureTheme =
  | 'aerodynamique'
  | 'motorisation'
  | 'instruments'
  | 'meteo'
  | 'navigation'
  | 'reglementation'
  | 'histoire'
  | 'air-france'
  | 'geographie'
  | 'aeronefs'
  | 'culture-generale';

export const THEMES: CultureTheme[] = [
  'aerodynamique',
  'motorisation',
  'instruments',
  'meteo',
  'navigation',
  'reglementation',
  'histoire',
  'air-france',
  'geographie',
  'aeronefs',
  'culture-generale',
];

export const THEME_LABELS: Record<CultureTheme, string> = {
  aerodynamique: 'Aérodynamique et mécanique du vol',
  motorisation: 'Motorisation',
  instruments: 'Instruments et systèmes',
  meteo: 'Météorologie',
  navigation: 'Navigation',
  reglementation: 'Réglementation et espaces aériens',
  histoire: "Histoire de l'aviation",
  'air-france': 'Air France et le groupe',
  geographie: 'Géographie aérienne',
  aeronefs: 'Aéronefs et constructeurs',
  'culture-generale': 'Littérature, films, institutions',
};

/** Une ligne du programme : ce que le thème couvre, pour savoir quoi réviser hors de l'app. */
export const THEME_SCOPE: Record<CultureTheme, string> = {
  aerodynamique:
    'Portance, décrochage, gouvernes, volets et becs, facteur de charge, centrage. Le socle du BIA — et le thème le plus rentable, parce qu’il se raisonne au lieu de s’apprendre.',
  motorisation:
    'Cycle du réacteur, familles de moteurs et qui les monte, hélices et turbopropulseurs, reverses, carburant.',
  instruments:
    'Altimètre, anémomètre, variomètre, machmètre, bille, pannes de pitot et de statique, TCAS, GPWS, transpondeur.',
  meteo:
    'Nuages, atmosphère standard, calages altimétriques, fronts, anticyclones et dépressions, givrage, brouillard, jet-stream, METAR.',
  navigation:
    'Caps et QFU, vent effectif, unités, fuseaux horaires, grand cercle, moyens radio, niveaux de vol.',
  reglementation:
    'Classes d’espace, VFR et IFR, licences, organismes (OACI, EASA, DGAC, IATA), règles de l’air.',
  histoire:
    'Des pionniers à l’Aéropostale, les guerres, l’ère du jet, le Concorde, les grands noms et leurs dates.',
  'air-france':
    'Naissance et fusions, flotte, hubs, réseau, filiales, alliance, dirigeants, chiffres du groupe.',
  geographie:
    'Codes IATA et OACI, grands aéroports, capitales, distances et latitudes, hubs mondiaux.',
  aeronefs:
    'Airbus, Boeing, ATR, Embraer, Dassault : qui construit quoi, motorisations, dimensions, avions de légende.',
  'culture-generale':
    'Saint-Exupéry, Kessel, Clostermann, les films, l’espace, les institutions et les grands accidents qui ont fait la sécurité.',
};

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface CultureEntry {
  /**
   * Identifiant STABLE. C'est la clé de la révision espacée : la renommer
   * revient à effacer tout ce que tu sais déjà de cette question.
   */
  id: string;
  theme: CultureTheme;
  prompt: string;
  /**
   * Convention : la BONNE réponse s'écrit toujours en premier, et l'ordre est
   * mélangé à la composition. Relire une banque où la bonne réponse se promène
   * rend toute vérification humaine impossible — et un test verrouille la
   * convention, ce qui attrape les réordonnancements qui oublient `correct`.
   */
  options: [string, string, string, string];
  correct: number;
  difficulty: Difficulty;
  /**
   * Le POURQUOI. Obligatoire : sur une épreuve de connaissances, on n'apprend
   * pas de son score, on apprend de la correction. Une banque sans explications
   * ne fait que mesurer l'ignorance, elle ne la réduit pas.
   */
  explain: string;
  /**
   * Année où une question de ce type a été RELEVÉE dans les annales Pilotest.
   * Sert à drill « ce qui est réellement tombé » — et à ne pas se raconter que
   * le reste de la banque a la même valeur de preuve.
   */
  asked?: '2018' | '2019';
  /**
   * Chiffre daté. La réponse était vraie à cette année-là et bougera : le
   * libellé porte l'année, et la révision espacée les remonte moins souvent.
   */
  asOf?: number;
}
