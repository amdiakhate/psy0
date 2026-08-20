import type { CultureEntry } from '../types';

/**
 * Réglementation, espaces aériens, institutions.
 *
 * Thème moins présent dans les annales que l'histoire, mais imbattable en
 * rentabilité : quelques sigles et quelques règles couvrent tout ce qui peut
 * raisonnablement tomber, et ce sont exactement les mêmes notions que
 * l'entretien de motivation peut aborder.
 */
export const reglementation: CultureEntry[] = [
  {
    id: 'regl-oaci',
    theme: 'reglementation',
    prompt: 'Que fait l’OACI (ICAO) ?',
    options: [
      'Elle fixe les normes mondiales de l’aviation civile, sous l’égide de l’ONU',
      'Elle représente les compagnies aériennes auprès des États',
      'Elle certifie les avions en Europe',
      'Elle gère le trafic aérien européen',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Créée par la convention de Chicago en 1944, siège à Montréal. C'est elle qui définit l'alphabet radio, les codes d'aérodrome à quatre lettres et les annexes techniques.",
  },
  {
    id: 'regl-iata',
    theme: 'reglementation',
    prompt: 'Qu’est-ce que l’IATA ?',
    options: [
      "L'association professionnelle des compagnies aériennes",
      "L'agence de l'ONU chargée de l'aviation civile",
      "L'autorité européenne de certification",
      'Le régulateur français des aéroports',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Organisation privée, à ne pas confondre avec l'OACI qui est intergouvernementale. C'est elle qui attribue les codes d'aéroport à trois lettres et les codes compagnie à deux.",
  },
  {
    id: 'regl-easa',
    theme: 'reglementation',
    prompt: 'Quel est le rôle de l’EASA (AESA) ?',
    options: [
      'Certifier les aéronefs et réglementer la sécurité aérienne dans l’Union européenne',
      'Gérer le trafic aérien européen en temps réel',
      'Négocier les droits de trafic entre États',
      'Fixer les tarifs des billets',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Basée à Cologne, elle est l’équivalent européen de la FAA américaine. C’est elle qui délivre le certificat de type d’un A350 ou d’un ATR.',
  },
  {
    id: 'regl-dgac',
    theme: 'reglementation',
    prompt: 'Que fait la DGAC ?',
    options: [
      "Elle est l'administration française de l'aviation civile, et assure le contrôle aérien",
      'Elle exploite les aéroports parisiens',
      'Elle certifie les avions au niveau européen',
      'Elle représente les compagnies françaises',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Direction générale de l'aviation civile, rattachée au ministère chargé des transports. La DSNA, en son sein, rend le service de la navigation aérienne.",
  },
  {
    id: 'regl-eurocontrol',
    theme: 'reglementation',
    prompt: 'Quel est le rôle d’Eurocontrol ?',
    options: [
      'Coordonner et réguler les flux de trafic aérien à l’échelle européenne',
      'Certifier les avions européens',
      'Enquêter sur les accidents',
      'Fixer les redevances aéroportuaires nationales',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Organisation intergouvernementale basée à Bruxelles. C'est elle qui attribue les créneaux de décollage quand le ciel sature, et qui explique bien des retards en cascade.",
  },
  {
    id: 'regl-bea',
    theme: 'reglementation',
    prompt: 'Que fait le BEA en France ?',
    options: [
      'Il enquête sur les accidents et incidents pour comprendre, sans chercher de responsable',
      'Il sanctionne les compagnies fautives',
      'Il délivre les licences de pilote',
      'Il gère les slots aéroportuaires',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Bureau d'enquêtes et d'analyses : son objet est la sécurité, pas la faute. Cette séparation stricte de l'enquête judiciaire est ce qui permet aux témoins de parler librement.",
  },
  {
    id: 'regl-convention-chicago',
    theme: 'reglementation',
    prompt: 'Qu’a établi la convention de Chicago en 1944 ?',
    options: [
      "Le cadre juridique de l'aviation civile internationale et la création de l'OACI",
      'La libéralisation du ciel européen',
      'Le régime d’indemnisation des passagers',
      'Les normes de bruit des aéroports',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Elle pose la souveraineté de chaque État sur son espace aérien et organise les « libertés de l’air », qui régissent encore aujourd’hui les droits de trafic.',
  },
  {
    id: 'regl-espace-classes',
    theme: 'reglementation',
    prompt: 'Quelle classe d’espace aérien est la plus contraignante ?',
    options: ['La classe A', 'La classe G', 'La classe E', 'La classe D'],
    correct: 0,
    difficulty: 4,
    explain:
      "Les classes vont de A à G, du plus contrôlé au moins contrôlé. En classe A, seul l'IFR est admis ; en G, le vol est libre et le service se limite à l'information.",
  },
  {
    id: 'regl-vfr-ifr',
    theme: 'reglementation',
    prompt: 'Quelle est la différence entre VFR et IFR ?',
    options: [
      'Le VFR se pilote en référence visuelle extérieure, l’IFR aux instruments',
      'Le VFR est réservé aux avions monomoteurs',
      "L'IFR n'est autorisé que de nuit",
      'Le VFR interdit la radio',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le VFR exige des conditions météo minimales et la responsabilité de l'anticollision à vue. L'IFR permet de voler dans les nuages, sous séparation assurée par le contrôle.",
  },
  {
    id: 'regl-vmc',
    theme: 'reglementation',
    prompt: 'Que désignent les conditions VMC ?',
    options: [
      'Les conditions météorologiques permettant le vol à vue',
      'La vitesse maximale en croisière',
      'Le minimum de carburant réglementaire',
      'La visibilité minimale sur piste au décollage',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Visual Meteorological Conditions : des minima de visibilité et de distance aux nuages. En dessous, on est en IMC, et le vol à vue devient illégal — et souvent mortel.",
  },
  {
    id: 'regl-ppl',
    theme: 'reglementation',
    prompt: 'Que permet une licence PPL ?',
    options: [
      'Piloter en privé, sans rémunération',
      'Piloter pour une compagnie aérienne',
      'Instruire des élèves pilotes',
      'Effectuer du travail aérien rémunéré',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Private Pilot Licence. Au-dessus viennent la CPL, qui autorise le transport rémunéré, et l’ATPL, exigée pour commander un avion de ligne.',
  },
  {
    id: 'regl-atpl',
    theme: 'reglementation',
    prompt: 'Quelle licence faut-il pour être commandant de bord sur un avion de ligne ?',
    options: ["L'ATPL", 'Le PPL', 'Le BIA', 'La qualification de vol aux instruments seule'],
    correct: 0,
    difficulty: 2,
    explain:
      "Airline Transport Pilot Licence. C'est vers elle que mène la filière cadets, avec la qualification de type sur l'appareil exploité et une qualification de vol aux instruments.",
  },
  {
    id: 'regl-bia',
    theme: 'reglementation',
    prompt: 'Qu’est-ce que le BIA ?',
    options: [
      'Le brevet d’initiation aéronautique, un diplôme scolaire de culture aéronautique',
      'Une licence permettant de piloter seul',
      'Un examen médical aéronautique',
      'Le brevet des instructeurs avion',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Passé au collège ou au lycée, il ne donne aucun droit de pilotage. Son programme — aérodynamique, météo, navigation, réglementation, histoire — est exactement le niveau attendu à l'épreuve de culture.",
  },
  {
    id: 'regl-classe1',
    theme: 'reglementation',
    prompt: 'Que sanctionne le certificat médical de classe 1 ?',
    options: [
      "L'aptitude médicale exigée des pilotes professionnels",
      'La réussite de la formation théorique ATPL',
      "L'aptitude au vol de nuit",
      'La qualification de type sur un appareil donné',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Vue, audition, cardiologie, examen ORL : il se renouvelle chaque année et se perd. C'est le prérequis absolu de la filière cadets — sans lui, aucun dossier n'existe.",
  },
  {
    id: 'regl-priorite-vue',
    theme: 'reglementation',
    prompt: 'Deux avions se rapprochent de face en VFR. Que doivent-ils faire ?',
    options: [
      'Chacun oblique vers sa droite',
      'Chacun oblique vers sa gauche',
      'Le plus rapide passe au-dessus',
      'Le plus léger cède le passage et descend',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Même logique qu'en mer : chacun à droite. En convergence, c'est l'avion qui voit l'autre sur sa droite qui cède ; un aéronef en dépassement contourne par la droite.",
  },
  {
    id: 'regl-priorite-planeur',
    theme: 'reglementation',
    prompt: 'Dans l’ordre de priorité en vol, qui passe avant un avion à moteur ?',
    options: [
      'Un ballon, un planeur ou un aéronef remorquant',
      'Un hélicoptère',
      'Un avion militaire',
      'Un avion de ligne commercial',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "La règle suit la manœuvrabilité : le moins capable de s'écarter a la priorité. Ordre décroissant : ballon, planeur, dirigeable, aéronef remorquant, puis avion à moteur.",
  },
  {
    id: 'regl-niveau-semi-circulaire',
    theme: 'reglementation',
    prompt: 'Pourquoi les niveaux de croisière dépendent-ils du cap suivi ?',
    options: [
      'Pour séparer verticalement les trafics de sens opposés',
      'Pour économiser du carburant selon le vent',
      'Pour respecter les zones militaires',
      'Pour limiter le bruit au sol',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "C'est la règle semi-circulaire : caps est, niveaux impairs ; caps ouest, niveaux pairs. Deux avions face à face ne peuvent ainsi jamais se trouver au même niveau.",
  },
  {
    id: 'regl-rvsm',
    theme: 'reglementation',
    prompt: 'Qu’a permis la mise en place du RVSM ?',
    options: [
      'Réduire la séparation verticale de 2 000 à 1 000 ft en haute altitude',
      "D'augmenter la vitesse maximale autorisée en croisière",
      'De supprimer le plan de vol sur les liaisons courtes',
      'De voler sans transpondeur au-dessus du FL 290',
    ],
    correct: 0,
    difficulty: 5,
    explain:
      "Reduced Vertical Separation Minimum : deux fois plus de niveaux disponibles au-dessus du FL 290. Cela exige des altimètres certifiés d'une précision particulière.",
  },
  {
    id: 'regl-temps-de-vol',
    theme: 'reglementation',
    prompt: 'Pourquoi la réglementation limite-t-elle le temps de vol des équipages ?',
    options: [
      'Parce que la fatigue dégrade les performances et la sécurité',
      'Pour répartir le travail entre les compagnies',
      'Pour limiter l’usure des appareils',
      'Pour respecter les quotas de bruit',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Les règles FTL encadrent temps de vol, temps de service et repos minimal. La fatigue est reconnue comme facteur contributif dans une part importante des accidents.",
  },
  {
    id: 'regl-sterile-cockpit',
    theme: 'reglementation',
    prompt: 'Que prescrit la règle du « cockpit stérile » ?',
    options: [
      'Aucune conversation non essentielle sous 10 000 ft',
      'Un nettoyage du poste avant chaque vol',
      'L’interdiction de manger à bord',
      'La fermeture de la porte du poste en croisière',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Décollage, montée initiale, descente et approche concentrent la charge de travail et les erreurs. Née d'accidents où l'équipage parlait d'autre chose au pire moment.",
  },
  {
    id: 'regl-mel',
    theme: 'reglementation',
    prompt: 'À quoi sert la MEL (Minimum Equipment List) ?',
    options: [
      'À dire quels équipements peuvent être en panne sans interdire le vol',
      'À lister le matériel de secours embarqué',
      'À inventorier les pièces détachées d’une base',
      'À fixer la dotation minimale de carburant',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "La redondance des avions modernes permet de voler avec certaines pannes, sous conditions et pour une durée limitée. Sans MEL, le moindre défaut clouerait la flotte au sol.",
  },
  {
    id: 'regl-slots',
    theme: 'reglementation',
    prompt: 'Qu’est-ce qu’un slot aéroportuaire ?',
    options: [
      'Un droit d’atterrir ou décoller à un créneau donné sur un aéroport saturé',
      'Un emplacement de stationnement au terminal',
      'Une plage horaire de maintenance',
      'Une réservation de couloir aérien',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Sur les plateformes coordonnées, les créneaux sont une ressource rare et une valeur patrimoniale. Ils expliquent l'attachement des compagnies à leurs positions historiques.",
  },
  {
    id: 'regl-indemnisation-261',
    theme: 'reglementation',
    prompt: 'Que prévoit le règlement européen 261/2004 ?',
    options: [
      'L’indemnisation des passagers en cas de retard important, d’annulation ou de refus d’embarquement',
      'Les normes de bruit des aéroports européens',
      'Les règles de certification des avions',
      'Le régime social des navigants',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Un texte que tout candidat devrait connaître : c'est le cadre juridique des relations avec le passager, et il pèse lourd dans les décisions opérationnelles d'une compagnie.",
  },
  {
    id: 'regl-corsia',
    theme: 'reglementation',
    prompt: 'Que vise le dispositif CORSIA de l’OACI ?',
    options: [
      'Compenser la croissance des émissions de CO₂ du transport aérien international',
      'Réduire le bruit au décollage',
      'Harmoniser les licences de pilote',
      'Encadrer les droits de trafic',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Carbon Offsetting and Reduction Scheme for International Aviation. Avec le SAF et la modernisation des flottes, c'est l'un des trois leviers que les compagnies mettent en avant.",
  },
  {
    id: 'regl-cdb-autorite',
    theme: 'reglementation',
    prompt: 'Qui détient l’autorité finale sur la conduite d’un vol ?',
    options: [
      'Le commandant de bord',
      'Le contrôleur aérien',
      'Le responsable des opérations de la compagnie',
      'Le chef de cabine',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Il peut déroger à toute règle si la sécurité l'exige, à charge d'en rendre compte. C'est une notion qu'un entretien de sélection aime voir comprise, et pas seulement récitée.",
  },
  {
    id: 'regl-just-culture',
    theme: 'reglementation',
    prompt: 'Que désigne la « culture juste » (just culture) dans l’aviation ?',
    options: [
      'Un cadre où l’on rapporte ses erreurs sans être sanctionné, sauf faute délibérée',
      'L’égalité de traitement entre compagnies',
      'La transparence tarifaire envers les passagers',
      'La parité dans le recrutement des équipages',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Le retour d'expérience ne fonctionne que si déclarer une erreur ne coûte rien. C'est le fondement du système de sécurité aérien, et un sujet d'entretien récurrent.",
  },
];
