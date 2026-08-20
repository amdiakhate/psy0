import type { CultureEntry } from '../types';

/**
 * Géographie aérienne.
 *
 * Les annales en tirent deux familles de questions. Les codes et les capitales
 * s'apprennent. Les comparaisons — quelle ville est la plus au nord, la plus
 * loin de Paris — se raisonnent : elles ne demandent pas de connaître la
 * distance, seulement de savoir où sont les choses sur un globe.
 */
export const geographie: CultureEntry[] = [
  {
    id: 'geo-cdg-code',
    theme: 'geographie',
    prompt: 'Quel est le code IATA de Paris-Charles-de-Gaulle ?',
    options: ['CDG', 'ORY', 'LFPG', 'PAR'],
    correct: 0,
    difficulty: 1,
    explain:
      'CDG en IATA (trois lettres), LFPG en OACI (quatre lettres). PAR est le code de zone qui désigne l’ensemble des aéroports parisiens.',
  },
  {
    id: 'geo-ory-code',
    theme: 'geographie',
    prompt: 'Quel est le code OACI de Paris-Orly ?',
    options: ['LFPO', 'ORY', 'LFPG', 'EGLL'],
    correct: 0,
    difficulty: 3,
    explain:
      'Les codes OACI sont géographiques : LF pour la France métropolitaine, EG pour le Royaume-Uni, ED pour l’Allemagne, KJ… pour les États-Unis (K en préfixe).',
  },
  {
    id: 'geo-heathrow',
    theme: 'geographie',
    prompt: 'À quelle ville correspond l’aéroport de Heathrow (LHR) ?',
    options: ['Londres', 'Manchester', 'Dublin', 'Édimbourg'],
    correct: 0,
    difficulty: 1,
    explain:
      'Londres compte plusieurs aéroports : Heathrow (LHR), Gatwick (LGW), Stansted (STN), Luton (LTN), City (LCY). Heathrow est le hub de British Airways.',
  },
  {
    id: 'geo-ohare',
    theme: 'geographie',
    prompt: 'Dans quelle ville se trouve l’aéroport O’Hare ?',
    options: ['Chicago', 'New York', 'Boston', 'Denver'],
    correct: 0,
    difficulty: 2,
    explain:
      'Code ORD, hérité de son ancien nom Orchard Field — un des rares codes IATA totalement contre-intuitifs. C’est un hub majeur de United et d’American.',
    asked: '2019',
  },
  {
    id: 'geo-jfk',
    theme: 'geographie',
    prompt: 'Quels sont les trois principaux aéroports de la région de New York ?',
    options: [
      'JFK, Newark (EWR) et LaGuardia (LGA)',
      'JFK, Boston (BOS) et Philadelphie (PHL)',
      'LaGuardia, Dulles (IAD) et Newark',
      'JFK, LaGuardia et O’Hare',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Air France dessert JFK. Newark est en réalité dans le New Jersey, LaGuardia est réservé aux étapes courtes — c'est de là que décollait le vol 1549 posé sur l'Hudson.",
  },
  {
    id: 'geo-atlanta-premier',
    theme: 'geographie',
    prompt: 'Quel aéroport est traditionnellement le premier du monde en trafic passagers ?',
    options: ['Atlanta-Hartsfield-Jackson', 'Dubaï', 'Londres-Heathrow', 'Pékin-Capital'],
    correct: 0,
    difficulty: 3,
    explain:
      "Il le doit à son rôle de hub géant pour Delta, partenaire d'Air France dans SkyTeam. Dubaï domine, lui, le classement du trafic INTERNATIONAL.",
    asked: '2019',
  },
  {
    id: 'geo-schiphol',
    theme: 'geographie',
    prompt: 'Quel est le hub de KLM ?',
    options: ['Amsterdam-Schiphol', 'Rotterdam', 'Bruxelles-Zaventem', 'Düsseldorf'],
    correct: 0,
    difficulty: 2,
    explain:
      'Code AMS. Sa particularité est d’être bâti sous le niveau de la mer, sur un ancien lac asséché, avec six pistes très espacées.',
  },
  {
    id: 'geo-luanda',
    theme: 'geographie',
    prompt: 'De quel pays Luanda est-elle la capitale ?',
    options: ['Angola', 'Mozambique', 'Zambie', 'Congo'],
    correct: 0,
    difficulty: 3,
    explain:
      'Sur la côte atlantique de l’Afrique australe. Air France dessert historiquement une large partie de l’Afrique subsaharienne — d’où ce type de question.',
    asked: '2019',
  },
  {
    id: 'geo-ouagadougou',
    theme: 'geographie',
    prompt: 'De quel pays Ouagadougou est-elle la capitale ?',
    options: ['Burkina Faso', 'Mali', 'Niger', 'Bénin'],
    correct: 0,
    difficulty: 2,
    explain:
      'Bamako est au Mali, Niamey au Niger, Porto-Novo au Bénin (Cotonou en étant la capitale économique). Les capitales d’Afrique de l’Ouest tombent régulièrement.',
    asked: '2019',
  },
  {
    id: 'geo-nairobi-equateur',
    theme: 'geographie',
    prompt: 'Parmi ces villes, laquelle est la plus proche de l’équateur ?',
    options: ['Nairobi', 'Manille', 'Tunis', 'Le Caire'],
    correct: 0,
    difficulty: 3,
    explain:
      'Nairobi est à environ 1° de latitude sud, quasiment sur la ligne. Manille est à 14° nord, Tunis à 36° nord.',
    asked: '2019',
  },
  {
    id: 'geo-saint-petersbourg-nord',
    theme: 'geographie',
    prompt: 'Parmi ces villes, laquelle est la plus au nord ?',
    options: ['Saint-Pétersbourg', 'Moscou', 'Montréal', 'Varsovie'],
    correct: 0,
    difficulty: 3,
    explain:
      'Environ 60° nord, d’où ses fameuses nuits blanches de juin. Moscou est à 55°, Varsovie à 52°, Montréal à seulement 45° — plus au sud que Bordeaux.',
    asked: '2019',
  },
  {
    id: 'geo-tokyo-plus-loin',
    theme: 'geographie',
    prompt: 'Parmi ces villes, laquelle est la plus éloignée de Paris ?',
    options: ['Tokyo', 'Atlanta', 'Lagos', 'Delhi'],
    correct: 0,
    difficulty: 3,
    explain:
      'Environ 9 700 km par le grand cercle, contre 7 000 pour Atlanta, 6 500 pour Delhi et 4 600 pour Lagos. Le repère : de Paris, l’Asie orientale est plus loin que l’Amérique du Nord-Est.',
    asked: '2018',
  },
  {
    id: 'geo-la-paz-altitude',
    theme: 'geographie',
    prompt: 'Parmi ces aéroports, lequel se situe à la plus haute altitude ?',
    options: ['La Paz', 'Quito', 'Mexico', 'Tegucigalpa'],
    correct: 0,
    difficulty: 4,
    explain:
      'El Alto culmine à plus de 4 000 m, contre environ 2 800 pour Quito et 2 240 pour Mexico. À cette altitude, l’air raréfié allonge énormément les distances de décollage.',
    asked: '2019',
  },
  {
    id: 'geo-coucher-soleil-sud',
    theme: 'geographie',
    prompt: 'Dans l’hémisphère sud, dans quelle direction se couche le soleil ?',
    options: ["À l'ouest", "À l'est", 'Au nord', 'Au sud'],
    correct: 0,
    difficulty: 2,
    explain:
      "Le sens de rotation de la Terre ne change pas d'un hémisphère à l'autre : le soleil se lève toujours à l'est et se couche à l'ouest. Ce qui change, c'est sa hauteur — il culmine au nord au lieu du sud.",
    asked: '2019',
  },
  {
    id: 'geo-fuseaux-nombre',
    theme: 'geographie',
    prompt: 'Combien de fuseaux horaires théoriques compte la Terre ?',
    options: ['24', '12', '36', '60'],
    correct: 0,
    difficulty: 2,
    explain:
      '360° divisés par 24 heures : un fuseau tous les 15° de longitude. En pratique, les frontières politiques en font une carte bien plus tortueuse.',
  },
  {
    id: 'geo-france-fuseau',
    theme: 'geographie',
    prompt: 'Quel pays compte le plus de fuseaux horaires au monde ?',
    options: ['La France, grâce à ses territoires ultramarins', 'La Russie', 'Les États-Unis', 'La Chine'],
    correct: 0,
    difficulty: 4,
    explain:
      "Douze fuseaux, de la Polynésie à la Nouvelle-Calédonie. La Russie n'en a que onze, et la Chine, malgré son étendue, n'en applique officiellement qu'un seul.",
  },
  {
    id: 'geo-dubai-hub',
    theme: 'geographie',
    prompt: 'De quelle compagnie Dubaï est-il le hub ?',
    options: ['Emirates', 'Qatar Airways', 'Etihad', 'Turkish Airlines'],
    correct: 0,
    difficulty: 2,
    explain:
      "Qatar Airways est à Doha, Etihad à Abou Dabi, Turkish à Istanbul. Ces hubs du Golfe captent le trafic Europe-Asie en profitant d'une position à mi-chemin.",
  },
  {
    id: 'geo-istanbul',
    theme: 'geographie',
    prompt: 'Quelle particularité géographique a Istanbul ?',
    options: [
      'Elle est à cheval sur deux continents',
      "C'est la capitale de la Turquie",
      'Elle est bâtie sous le niveau de la mer',
      'Elle se trouve sur le tropique du Cancer',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le Bosphore sépare sa partie européenne de sa partie asiatique. La capitale de la Turquie est Ankara — un piège classique.",
  },
  {
    id: 'geo-capitale-australie',
    theme: 'geographie',
    prompt: 'Quelle est la capitale de l’Australie ?',
    options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'],
    correct: 0,
    difficulty: 2,
    explain:
      'Ville créée de toutes pièces en 1913 pour trancher la rivalité entre Sydney et Melbourne. Le même piège existe avec Ottawa au Canada et Wellington en Nouvelle-Zélande.',
  },
  {
    id: 'geo-capitale-bresil',
    theme: 'geographie',
    prompt: 'Quelle est la capitale du Brésil ?',
    options: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'],
    correct: 0,
    difficulty: 2,
    explain:
      "Inaugurée en 1960 pour attirer le peuplement vers l'intérieur. Air France dessert surtout São Paulo (GRU) et Rio (GIG), qui restent les portes d'entrée économiques.",
  },
  {
    id: 'geo-capitale-afrique-du-sud',
    theme: 'geographie',
    prompt: 'Quelle ville abrite le siège du gouvernement sud-africain ?',
    options: ['Pretoria', 'Le Cap', 'Johannesburg', 'Durban'],
    correct: 0,
    difficulty: 4,
    explain:
      "L'Afrique du Sud a trois capitales : Pretoria pour l'exécutif, Le Cap pour le législatif, Bloemfontein pour le judiciaire. Johannesburg, la plus grande, n'en est aucune.",
  },
  {
    id: 'geo-natal-dakar',
    theme: 'geographie',
    prompt: 'Pourquoi la liaison Dakar–Natal fut-elle choisie pour la traversée de l’Atlantique sud ?',
    options: [
      "C'est là que l'océan est le plus étroit",
      'Les deux villes étaient déjà reliées par câble télégraphique',
      'Le vent y souffle toujours d’ouest',
      'Ce sont les deux seuls ports en eau profonde de la région',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Environ 3 000 km entre la pointe du Sénégal et celle du Brésil, contre plus de 5 000 sur l'Atlantique nord. Avec les avions des années 1930, cet écart faisait toute la différence.",
  },
  {
    id: 'geo-groenland-mercator',
    theme: 'geographie',
    prompt: 'Pourquoi le Groenland paraît-il immense sur une carte du monde classique ?',
    options: [
      'La projection de Mercator dilate énormément les hautes latitudes',
      'Il est réellement plus grand que l’Afrique',
      'Les cartes sont centrées sur l’hémisphère nord',
      'Sa calotte glaciaire est comptée dans sa surface',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Mercator conserve les angles, ce qui est précieux pour naviguer, mais déforme les surfaces. C'est aussi pourquoi les routes aériennes y semblent partir de travers.",
  },
  {
    id: 'geo-tropiques',
    theme: 'geographie',
    prompt: 'À quelle latitude se situe le tropique du Cancer ?',
    options: ['Environ 23,5° nord', 'Environ 45° nord', 'Environ 66,5° nord', "Sur l'équateur"],
    correct: 0,
    difficulty: 3,
    explain:
      "Les 23,5° sont l'inclinaison de l'axe terrestre : ils fixent les tropiques et, à 90° de là, les cercles polaires à 66,5°. Toute la mécanique des saisons tient dans ce chiffre.",
  },
  {
    id: 'geo-cercle-polaire',
    theme: 'geographie',
    prompt: 'Que définit le cercle polaire arctique ?',
    options: [
      'La limite au-delà de laquelle le soleil ne se couche pas au solstice d’été',
      'La limite de la banquise permanente',
      'Le 60e parallèle nord',
      'La limite nord de la navigation aérienne',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Environ 66,5° nord. Saint-Pétersbourg, à 60°, est juste en dessous : d’où ses nuits blanches sans être tout à fait un jour permanent.',
  },
  {
    id: 'geo-routes-polaires',
    theme: 'geographie',
    prompt: 'Pourquoi les routes polaires sont-elles particulièrement contraignantes ?',
    options: [
      'Peu de terrains de dégagement, froid extrême et risque de gel du carburant',
      'Le champ magnétique y rend le GPS inutilisable',
      'Le vent y souffle toujours de face',
      'Elles rallongent systématiquement le trajet',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Elles raccourcissent la route, mais il faut prévoir des terrains en Sibérie ou au Canada arctique et surveiller la température du carburant. L'activité solaire perturbe aussi les liaisons HF.",
  },
  {
    id: 'geo-mer-la-plus-basse',
    theme: 'geographie',
    prompt: 'Quel aéroport commercial se situe le plus bas sous le niveau de la mer ?',
    options: ['Bar Yehuda, près de la mer Morte', 'Amsterdam-Schiphol', 'La Nouvelle-Orléans', 'Rotterdam'],
    correct: 0,
    difficulty: 5,
    explain:
      "Environ 380 m sous le niveau de la mer. Schiphol, à environ 4 m sous le zéro, est le plus bas des grands aéroports internationaux — d'où un altimètre calé au QNH qui affiche une valeur négative au parking.",
  },
  {
    id: 'geo-antipode-paris',
    theme: 'geographie',
    prompt: 'Quel océan se trouve à l’antipode de la France métropolitaine ?',
    options: ["Le Pacifique sud", "L'Atlantique sud", "L'océan Indien", "L'océan Arctique"],
    correct: 0,
    difficulty: 4,
    explain:
      'L’antipode de Paris tombe dans le Pacifique sud, au large de la Nouvelle-Zélande. C’est ce qui rend Auckland l’une des destinations les plus lointaines possibles depuis la France.',
  },
  {
    id: 'geo-tahiti-liaison',
    theme: 'geographie',
    prompt: 'Quelle est la plus longue liaison régulière opérée depuis Paris par Air France ?',
    options: [
      'Paris – Papeete (Tahiti)',
      'Paris – Tokyo',
      'Paris – Santiago du Chili',
      'Paris – Johannesburg',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Près de 16 000 km, longtemps opérés avec une escale, aujourd'hui possibles d'une traite en 787 ou 777. C'est la desserte de l'outre-mer le plus lointain de la République.",
  },
];
