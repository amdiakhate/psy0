import type { CultureEntry } from '../types';

/**
 * Navigation.
 *
 * Le cœur du thème est une seule mécanique, posée trois fois dans les annales :
 * une piste porte les DIZAINES de son cap magnétique, et un vent est nommé par
 * sa PROVENANCE. Piste 18, vent du 170 : la piste pointe au 180, le vent vient
 * du 170, donc il vient d'en face. Tout le reste en découle.
 */
export const navigation: CultureEntry[] = [
  {
    id: 'nav-qfu-dizaines',
    theme: 'navigation',
    prompt: 'Que signifie le numéro d’une piste, par exemple « piste 27 » ?',
    options: [
      'Son cap magnétique arrondi à la dizaine : environ 270°',
      'Sa longueur en centaines de mètres',
      'Son numéro d’ordre sur l’aérodrome',
      'Son altitude en centaines de pieds',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Une piste porte deux numéros opposés de 18 : la 27 dans un sens est la 09 dans l’autre. Deux pistes parallèles se distinguent par L, C ou R.',
  },
  {
    id: 'nav-vent-face-piste18',
    theme: 'navigation',
    prompt: 'Vous décollez piste 18 avec un vent du 170 pour 8 kt. Ce vent est…',
    options: [
      'de face, donc favorable',
      'arrière, donc pénalisant',
      'de travers pur, sans composante longitudinale',
      'arrière et traversier',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'La piste 18 pointe vers le sud (180°) ; le vent VIENT du 170°, donc du sud, donc de face à 10° près. Un vent de face raccourcit le roulage et redresse la pente de montée.',
    asked: '2018',
  },
  {
    id: 'nav-vent-piste03-ouest',
    theme: 'navigation',
    prompt: 'Vous décollez piste 03 avec un vent d’ouest. Ce vent est…',
    options: [
      'arrière et traversier par la gauche',
      'de face et traversier par la droite',
      'de face pur',
      'de travers pur',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "La piste 03 pointe au nord-est (030°). Un vent d'ouest vient du 270°, donc de l'arrière-gauche de l'avion : composante arrière ET traversière.",
    asked: '2019',
  },
  {
    id: 'nav-vent-piste30-est',
    theme: 'navigation',
    prompt: 'Vous êtes en finale piste 30 avec un vent d’est. Ce vent est…',
    options: [
      'arrière et traversier par la droite',
      'de face et traversier par la gauche',
      'de face pur',
      'arrière et traversier par la gauche',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Piste 30 = cap 300°, vers le nord-ouest. Un vent d’est vient du 090°, soit de l’arrière-droite : composante arrière, très pénalisante à l’atterrissage.',
    asked: '2019',
  },
  {
    id: 'nav-noeud-definition',
    theme: 'navigation',
    prompt: 'À quoi correspond un nœud ?',
    options: [
      'Un mille nautique par heure, soit 1,852 km/h',
      'Un kilomètre par heure',
      'Un mille terrestre par heure',
      'Un mètre par seconde',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le mille nautique vaut une minute d'arc de méridien, soit 1 852 m. C'est ce lien direct avec la géométrie du globe qui a imposé l'unité en mer comme en l'air.",
  },
  {
    id: 'nav-mille-nautique-latitude',
    theme: 'navigation',
    prompt: 'Un degré de latitude correspond à…',
    options: ['60 milles nautiques', '100 milles nautiques', '60 kilomètres', '30 milles nautiques'],
    correct: 0,
    difficulty: 3,
    explain:
      "Une minute d'arc = 1 NM, donc un degré = 60 NM ≈ 111 km. La règle vaut pour la latitude partout, mais pour la longitude seulement à l'équateur.",
  },
  {
    id: 'nav-pied-metre',
    theme: 'navigation',
    prompt: 'Un pied vaut environ…',
    options: ['0,30 m', '0,10 m', '1 m', '3 m'],
    correct: 0,
    difficulty: 1,
    explain:
      'Repère utile : 1 000 ft ≈ 300 m, et 3 300 ft ≈ 1 000 m. Il suffit pour convertir de tête une altitude ou un plafond.',
  },
  {
    id: 'nav-fl-definition',
    theme: 'navigation',
    prompt: 'Que désigne le niveau de vol FL 350 ?',
    options: [
      '35 000 ft indiqués au calage standard 1013 hPa',
      '35 000 m au-dessus du sol',
      '3 500 ft au-dessus de la mer',
      '350 hPa de pression atmosphérique',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Un niveau de vol n'est pas une altitude vraie : c'est une surface isobare. Tous les avions calés pareil restent séparés entre eux, même si aucun ne connaît sa hauteur exacte au-dessus du sol.",
  },
  {
    id: 'nav-grand-cercle',
    theme: 'navigation',
    prompt: 'Pourquoi un vol Paris–San Francisco survole-t-il le Groenland ?',
    options: [
      'Parce que la route la plus courte sur une sphère est un arc de grand cercle',
      'Parce que les vents y sont plus favorables',
      'Parce que les terrains de dégagement y sont nombreux',
      'Parce que l’espace aérien y est moins encombré',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Sur un planisphère, la route paraît absurde ; sur un globe, c'est une ligne droite. Les cartes Mercator déforment massivement les hautes latitudes.",
    asked: '2018',
  },
  {
    id: 'nav-ils-precision',
    theme: 'navigation',
    prompt: 'Quelle procédure d’approche est la plus précise ?',
    options: ["L'ILS", 'Le VOR/DME', 'Le NDB', "L'approche à vue"],
    correct: 0,
    difficulty: 2,
    explain:
      "Classement par précision croissante : NDB, VOR, VOR/DME, ILS. Seul l'ILS fournit un guidage vertical, ce qui permet de descendre jusqu'à quelques dizaines de pieds sans voir le sol.",
    asked: '2018',
  },
  {
    id: 'nav-vor',
    theme: 'navigation',
    prompt: 'Que fournit un VOR ?',
    options: [
      'Un relèvement magnétique par rapport à la balise',
      'Une distance à la balise',
      'Une position en latitude et longitude',
      'Un guidage vertical de descente',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'VHF Omnidirectional Range : il découpe l’espace en 360 radiales. Couplé à un DME, qui donne la distance, il fournit une position complète.',
  },
  {
    id: 'nav-dme',
    theme: 'navigation',
    prompt: 'Que mesure un DME ?',
    options: [
      'La distance oblique entre l’avion et la balise',
      'La distance au sol depuis la verticale de la balise',
      'La vitesse par rapport au sol',
      'Le cap magnétique à suivre',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Il chronomètre un aller-retour radio, donc mesure la distance directe, pas la distance projetée. À la verticale d'une balise à 30 000 ft, il indique encore environ 5 NM.",
  },
  {
    id: 'nav-ndb-adf',
    theme: 'navigation',
    prompt: 'Quel est le principal défaut du couple NDB / ADF ?',
    options: [
      'Il est imprécis et l’aiguille peut pointer vers un orage',
      'Il ne fonctionne que de nuit',
      'Il exige un équipement satellite',
      'Il ne porte qu’à 5 milles nautiques',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'ADF pointe la source d'émission la plus forte : un cumulonimbus qui crépite peut voler la vedette à la balise. C'est le plus ancien et le moins fiable des moyens radio.",
    asked: '2018',
  },
  {
    id: 'nav-rnav-gnss',
    theme: 'navigation',
    prompt: 'Que permet la navigation RNAV / PBN ?',
    options: [
      'Voler d’un point à l’autre sans suivre les balises au sol',
      'Voler uniquement à vue',
      'Se passer de plan de vol',
      'Descendre sous les minima d’un ILS de catégorie III',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "La navigation de surface libère les routes du réseau de balises : trajectoires plus directes, espace mieux rempli, et des approches guidées là où aucun ILS n'existe.",
  },
  {
    id: 'nav-utc',
    theme: 'navigation',
    prompt: 'Sur quelle référence horaire travaille l’aéronautique ?',
    options: ['UTC', "L'heure locale du terrain de départ", "L'heure locale d'arrivée", "L'heure solaire"],
    correct: 0,
    difficulty: 2,
    explain:
      "Plans de vol, METAR, clairances : tout est en UTC, aussi appelé Zulu. C'est la seule façon d'éviter les malentendus quand un vol traverse huit fuseaux.",
  },
  {
    id: 'nav-tokyo-paris-heure',
    theme: 'navigation',
    prompt: 'Il est 12 h 00 à Paris en hiver. Quelle heure est-il à Tokyo ?',
    options: ['20 h 00', '18 h 00', '04 h 00', '22 h 00'],
    correct: 0,
    difficulty: 3,
    explain:
      'Paris est en UTC+1 l’hiver, Tokyo en UTC+9 toute l’année : huit heures d’écart. En été, Paris passe à UTC+2 et l’écart tombe à sept heures.',
    asked: '2019',
  },
  {
    id: 'nav-ligne-changement-date',
    theme: 'navigation',
    prompt: 'Que se passe-t-il en franchissant la ligne de changement de date vers l’est ?',
    options: [
      'On recule d’un jour dans le calendrier',
      'On avance d’un jour',
      'On change d’heure mais pas de date',
      'Rien : la date est calée sur UTC',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Elle suit approximativement le 180e méridien. Un vol Tokyo–Los Angeles peut atterrir « avant » son heure de départ en heure locale.",
  },
  {
    id: 'nav-declinaison',
    theme: 'navigation',
    prompt: 'Qu’est-ce que la déclinaison magnétique ?',
    options: [
      "L'écart angulaire entre le nord vrai et le nord magnétique",
      "L'écart entre le cap et la route suivie",
      "L'erreur du compas due aux masses métalliques de l'avion",
      "L'inclinaison du champ magnétique par rapport à l'horizontale",
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Elle varie selon le lieu et dérive lentement dans le temps. L'erreur propre à l'avion, elle, s'appelle déviation — d'où la chaîne cap vrai, cap magnétique, cap compas.",
  },
  {
    id: 'nav-route-cap-derive',
    theme: 'navigation',
    prompt: 'Quelle est la différence entre le cap et la route ?',
    options: [
      "Le cap est la direction où pointe l'avion, la route celle qu'il suit vraiment",
      'Ce sont deux mots pour la même chose',
      'Le cap se mesure au nord vrai, la route au nord magnétique',
      'La route ne s’emploie qu’en navigation maritime',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Le vent traversier fait dériver : pour suivre la route voulue, il faut voler « en crabe », le nez décalé face au vent.',
  },
  {
    id: 'nav-vitesse-sol',
    theme: 'navigation',
    prompt: 'La vitesse sol (GS) est la vitesse…',
    options: [
      "de l'avion par rapport au sol",
      "de l'avion par rapport à la masse d'air",
      'lue directement sur l’anémomètre',
      'exprimée en Mach',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'GS = TAS ± vent. C’est la seule qui compte pour calculer une heure d’arrivée — et la seule que le GPS mesure directement.',
  },
  {
    id: 'nav-tas-vs-ias',
    theme: 'navigation',
    prompt: 'Dans quel ordre croissant se classent généralement ces vitesses en croisière ?',
    options: ['IAS < TAS', 'TAS < IAS', 'Elles sont toujours égales', 'IAS = TAS = GS'],
    correct: 0,
    difficulty: 4,
    explain:
      'En altitude l’air est raréfié : l’anémomètre sous-lit. La vitesse vraie dépasse largement l’indiquée, et la vitesse sol s’en écarte encore selon le vent.',
  },
  {
    id: 'nav-plan-de-vol',
    theme: 'navigation',
    prompt: 'À quoi sert le dépôt d’un plan de vol ?',
    options: [
      'À informer les organismes de contrôle et déclencher les recherches en cas de disparition',
      'À réserver un créneau commercial',
      'À obtenir un tarif de carburant',
      'À valider la licence de l’équipage',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "C'est à la fois une demande d'intégration dans le système et une sécurité : si l'avion n'arrive pas, l'alerte part automatiquement.",
  },
  {
    id: 'nav-carburant-degagement',
    theme: 'navigation',
    prompt: 'Que doit couvrir le carburant emporté sur un vol commercial ?',
    options: [
      'Le trajet, le déroutement vers un dégagement, une réserve finale et les imprévus',
      'Uniquement le trajet prévu',
      'Le trajet et le roulage seulement',
      'Le double du trajet prévu',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Roulage, trajet, dégagement, réserve finale (30 min d'attente), plus une marge de route. C'est la réserve finale qu'on ne doit jamais entamer — l'entamer, c'est déclarer une urgence.",
  },
  {
    id: 'nav-holding',
    theme: 'navigation',
    prompt: 'Qu’est-ce qu’un circuit d’attente (holding) ?',
    options: [
      'Un hippodrome volé autour d’un point de report, en attendant une clairance',
      'Le circuit de piste avant l’atterrissage à vue',
      'Un tour de vérification des systèmes avant décollage',
      'La procédure d’évitement du TCAS',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Un virage à droite standard, des branches d’une minute, empilées par niveaux quand l’aéroport sature. C’est là que se consomme le carburant de réserve.',
  },
  {
    id: 'nav-go-around',
    theme: 'navigation',
    prompt: 'Une remise de gaz (go-around) est décidée…',
    options: [
      'chaque fois que l’approche n’est pas stabilisée ou la piste pas dégagée',
      'uniquement en cas de panne moteur',
      'seulement sur ordre du contrôleur',
      'quand le carburant devient critique',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "C'est une manœuvre normale, pas un échec — et le premier réflexe attendu d'un candidat pilote. La poursuivre coûte que coûte est au contraire un facteur d'accident classique.",
  },
  {
    id: 'nav-alphabet-w',
    theme: 'navigation',
    prompt: 'Comment prononce-t-on la lettre W en alphabet aéronautique ?',
    options: ['Whiskey', 'Victor', 'X-ray', 'Yankee'],
    correct: 0,
    difficulty: 1,
    explain:
      "L'alphabet OACI existe pour lever toute ambiguïté sur une radio saturée. Il se récite d'un bout à l'autre sans hésiter — c'est un attendu minimal du candidat.",
    asked: '2019',
  },
  {
    id: 'nav-alphabet-j',
    theme: 'navigation',
    prompt: 'Quel mot désigne la lettre J en alphabet aéronautique ?',
    options: ['Juliett', 'Jupiter', 'Juliet', 'Java'],
    correct: 0,
    difficulty: 3,
    explain:
      "L'orthographe officielle OACI double le t : « Juliett », précisément pour qu'un francophone ne le prononce pas muet. Même logique pour « Alfa » sans ph.",
  },
  {
    id: 'nav-alphabet-q',
    theme: 'navigation',
    prompt: 'Quel mot désigne la lettre Q en alphabet aéronautique ?',
    options: ['Quebec', 'Queen', 'Quito', 'Quartz'],
    correct: 0,
    difficulty: 2,
    explain: 'La séquence à savoir d’un trait : November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform.',
  },
  {
    id: 'nav-mayday-pan',
    theme: 'navigation',
    prompt: 'Quelle différence entre « MAYDAY » et « PAN-PAN » ?',
    options: [
      'MAYDAY signale une détresse, PAN-PAN une urgence sans danger immédiat',
      'MAYDAY s’emploie en vol, PAN-PAN au sol',
      'PAN-PAN est plus grave que MAYDAY',
      'Ce sont deux synonymes',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "MAYDAY vient du français « m'aider », PAN de « panne ». Le premier donne priorité absolue ; le second signale un problème sérieux qui ne menace pas encore le vol.",
  },
  {
    id: 'nav-squawk',
    theme: 'navigation',
    prompt: 'Que demande un contrôleur en disant « squawk 4271 » ?',
    options: [
      "D'afficher ce code sur le transpondeur",
      'De monter au niveau 4271',
      'De contacter la fréquence 42,71',
      'De suivre le cap 427',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le code identifie l'écho sur l'écran radar. Il se compose de quatre chiffres de 0 à 7 — c'est de l'octal, d'où l'absence de 8 et de 9.",
  },
  {
    id: 'nav-paris-newyork-distance',
    theme: 'navigation',
    prompt: 'Quelle est approximativement la distance Paris – New York ?',
    options: ['Environ 5 800 km', 'Environ 3 000 km', 'Environ 9 000 km', 'Environ 12 000 km'],
    correct: 0,
    difficulty: 3,
    explain:
      'Autour de 5 800 km par le grand cercle, soit environ 3 150 NM. Un vol d’environ 8 heures vers l’ouest, une heure de moins au retour grâce au jet-stream.',
    asked: '2019',
  },
];
