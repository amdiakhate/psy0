import type { CultureEntry } from '../types';

/**
 * Instruments et systèmes.
 *
 * Les annales 2019 posent la panne de prise statique et la panne de Pitot :
 * deux questions qui ne s'apprennent pas par cœur mais se déduisent, dès qu'on
 * a compris que l'altimètre et le variomètre ne lisent QUE la pression statique,
 * et l'anémomètre la DIFFÉRENCE entre totale et statique.
 */
export const instruments: CultureEntry[] = [
  {
    id: 'instr-altimetre-mesure',
    theme: 'instruments',
    prompt: 'Quelle grandeur physique un altimètre mesure-t-il réellement ?',
    options: ['Une pression', 'Une altitude', 'Une température', 'Une vitesse verticale'],
    correct: 0,
    difficulty: 2,
    explain:
      "L'altimètre est un baromètre gradué en pieds. Il convertit la pression statique en altitude à partir d'une référence affichée par le pilote — d'où l'importance vitale du calage.",
    asked: '2018',
  },
  {
    id: 'instr-variometre',
    theme: 'instruments',
    prompt: 'Que mesure un variomètre ?',
    options: [
      'La vitesse verticale (Vz)',
      "L'inclinaison latérale",
      'La vitesse par rapport au sol',
      'La variation de cap',
    ],
    correct: 0,
    difficulty: 1,
    explain:
      "Il compare la pression statique actuelle à celle d'il y a quelques secondes : la différence donne le taux de montée ou de descente, en pieds par minute.",
    asked: '2019',
  },
  {
    id: 'instr-machmetre',
    theme: 'instruments',
    prompt: 'Que lit-on sur un machmètre ?',
    options: [
      'Le rapport entre la vitesse de l’avion et celle du son',
      'La vitesse vraie en nœuds',
      'La vitesse par rapport au sol',
      'La vitesse verticale',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Mach 0,85 signifie 85 % de la vitesse du son du moment. Comme celle-ci dépend de la température, un même Mach correspond à des vitesses vraies différentes selon le jour et l’altitude.',
    asked: '2019',
  },
  {
    id: 'instr-statique-bouchee',
    theme: 'instruments',
    prompt: 'La prise de pression statique se bouche. Quels instruments sont affectés ?',
    options: [
      "L'altimètre, le variomètre et l'anémomètre",
      'Le compas et le conservateur de cap',
      "L'horizon artificiel seul",
      'Aucun : la statique n’est qu’une redondance',
    ],
    correct: 0,
    difficulty: 5,
    explain:
      "Les trois instruments dits « de pression » en dépendent. Altimètre et variomètre se figent ; l'anémomètre, qui lit la différence entre pression totale et statique, se met à sous-estimer en montée et surestimer en descente.",
    asked: '2019',
  },
  {
    id: 'instr-pitot-bouche',
    theme: 'instruments',
    prompt: 'Le tube de Pitot givre et se bouche. Comment se comporte l’anémomètre ?',
    options: [
      'Il se comporte comme un altimètre : il monte quand l’avion monte',
      'Il tombe immédiatement à zéro',
      'Il reste figé sur la dernière valeur',
      'Il n’est pas affecté, seul le variomètre l’est',
    ],
    correct: 0,
    difficulty: 5,
    explain:
      "La pression totale est piégée dans le tube ; seule la statique varie. L'indication suit alors l'altitude et non la vitesse — piège mortel, à l'origine de la perte du vol AF447 en 2009.",
    asked: '2019',
  },
  {
    id: 'instr-radioaltimetre',
    theme: 'instruments',
    prompt: 'Que donne un radioaltimètre (radiosonde) ?',
    options: [
      'La hauteur instantanée au-dessus du sol survolé',
      "L'altitude par rapport au niveau de la mer",
      'La distance à la balise VOR',
      'La température extérieure',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Il mesure par onde radio la distance verticale au relief, indépendamment de toute pression. C'est lui qui annonce « fifty, forty, thirty » à l'arrondi et qui rend l'autoland possible par très faible visibilité.",
    asked: '2018',
  },
  {
    id: 'instr-tcas',
    theme: 'instruments',
    prompt: 'Que fait un TCAS ?',
    options: [
      'Il détecte les avions proches et propose une manœuvre d’évitement verticale',
      'Il détecte le relief devant l’avion',
      'Il alerte en cas de cisaillement de vent',
      'Il surveille les paramètres moteurs',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Traffic Alert and Collision Avoidance System : il interroge les transpondeurs voisins. Une résolution TCAS prime sur l'instruction du contrôleur — leçon tirée de la collision d'Überlingen en 2002.",
    asked: '2018',
  },
  {
    id: 'instr-gpws',
    theme: 'instruments',
    prompt: 'À quoi sert le GPWS / EGPWS ?',
    options: [
      'À alerter d’un rapprochement dangereux du relief',
      'À éviter les autres avions',
      'À détecter les orages',
      'À surveiller la pressurisation',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Ground Proximity Warning System, avec son « PULL UP » caractéristique. Sa généralisation a fait s'effondrer les accidents de type CFIT — vol en état de contrôle vers le sol.",
  },
  {
    id: 'instr-transpondeur-7700',
    theme: 'instruments',
    prompt: 'Que signifie le code transpondeur 7700 ?',
    options: [
      'Urgence générale',
      'Panne de radio',
      'Détournement',
      'Vol VFR non contrôlé',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Trois codes à connaître par cœur : 7500 détournement, 7600 panne de radio, 7700 urgence. Un moyen mnémotechnique courant : « seven five, taken alive ; seven six, radio fix ; seven seven, going to heaven ».',
  },
  {
    id: 'instr-transpondeur-7600',
    theme: 'instruments',
    prompt: 'Un équipage affiche 7600 au transpondeur. Que signale-t-il ?',
    options: ['Une panne de radio', 'Une urgence générale', 'Un détournement', 'Une panne moteur'],
    correct: 0,
    difficulty: 3,
    explain:
      'Le contrôleur voit immédiatement que l’avion ne l’entend plus et bascule sur des procédures sans communication. 7500 signale un détournement, 7700 une urgence.',
  },
  {
    id: 'instr-horizon-artificiel',
    theme: 'instruments',
    prompt: 'Que donne l’horizon artificiel ?',
    options: [
      "L'assiette et l'inclinaison de l'avion",
      'Le cap magnétique',
      'La vitesse verticale',
      'La symétrie du vol',
    ],
    correct: 0,
    difficulty: 1,
    explain:
      "C'est l'instrument gyroscopique de référence en vol sans visibilité : il remplace l'horizon naturel. Sa perte, ou sa mauvaise interprétation, mène en quelques secondes à la spirale engagée.",
  },
  {
    id: 'instr-bille-aiguille',
    theme: 'instruments',
    prompt: 'Que traduit une bille décentrée à gauche ?',
    options: [
      'Un vol dissymétrique : il faut mettre du pied à gauche',
      'Un virage à droite trop serré',
      'Une panne du gyroscope',
      'Un vent de travers venant de la droite',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Règle de pilotage : « du pied du côté de la bille ». Une bille décentrée signale du dérapage, coûteux en traînée et dangereux à basse vitesse.',
  },
  {
    id: 'instr-conservateur-cap',
    theme: 'instruments',
    prompt: 'Pourquoi recale-t-on régulièrement le conservateur de cap sur le compas ?',
    options: [
      'À cause de la dérive du gyroscope',
      'Parce que la déclinaison magnétique change en vol',
      'Parce que le compas est plus précis en virage',
      'Pour compenser la pression atmosphérique',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Le gyroscope dérive de quelques degrés par quart d’heure. Le compas magnétique, lui, est fiable mais inutilisable en virage et en accélération : chacun corrige le défaut de l’autre.',
  },
  {
    id: 'instr-calage-standard',
    theme: 'instruments',
    prompt: 'Que signifie caler l’altimètre au calage standard ?',
    options: [
      'Afficher 1013,25 hPa comme référence',
      'Afficher la pression du terrain de départ',
      'Afficher 0 sur l’altimètre au parking',
      'Afficher la pression réduite au niveau de la mer du jour',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Au-dessus de l'altitude de transition, tout le monde adopte la même référence : les avions ne connaissent plus leur hauteur réelle, mais ils sont sûrs d'être séparés entre eux. On parle alors de niveaux de vol.",
    asked: '2018',
  },
  {
    id: 'instr-qnh-qfe',
    theme: 'instruments',
    prompt: 'Altimètre calé au QFE, que lit-on posé sur la piste ?',
    options: ['Zéro', "L'altitude du terrain", 'Le niveau de vol 000', '1013 pieds'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le QFE est la pression au niveau du terrain : l'altimètre affiche donc la hauteur au-dessus de lui. Calé au QNH, il afficherait l'altitude du terrain au-dessus de la mer.",
  },
  {
    id: 'instr-fmc',
    theme: 'instruments',
    prompt: 'À quoi sert le FMS (Flight Management System) ?',
    options: [
      'À gérer la navigation, le profil de vol et les performances',
      'À piloter directement les gouvernes',
      'À surveiller les paramètres moteurs',
      'À gérer la pressurisation cabine',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "C'est le cerveau du vol moderne : la route est chargée au sol, le calculateur optimise altitude et vitesse, et pilote automatique comme automanette y puisent leurs consignes.",
  },
  {
    id: 'instr-ils-composantes',
    theme: 'instruments',
    prompt: 'De quoi se compose un ILS ?',
    options: [
      'Un localizer et un glide, complétés de balises de distance',
      "D'un radar de surveillance et d'un VOR",
      'D’un GPS différentiel et d’un transpondeur',
      'D’un radiophare NDB et d’un DME',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le localizer donne l'axe latéral, le glide le plan de descente, en général 3°. C'est le moyen de précision par excellence, jusqu'à l'atterrissage automatique en catégorie III.",
  },
  {
    id: 'instr-cat3',
    theme: 'instruments',
    prompt: 'Une approche ILS de catégorie III permet…',
    options: [
      "d'atterrir avec une visibilité et une hauteur de décision très réduites, voire nulles",
      'de descendre jusqu’à 1 000 pieds seulement',
      'de se passer d’équipement au sol',
      'de voler en VFR de nuit',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "En CAT III b, la hauteur de décision descend sous 50 ft pour une RVR de l'ordre de 50 à 200 m. Il faut l'équipement au sol, l'avion certifié ET l'équipage qualifié — les trois, jamais deux.",
    asked: '2018',
  },
  {
    id: 'instr-rvr',
    theme: 'instruments',
    prompt: 'Que mesure la RVR ?',
    options: [
      'La portée visuelle de piste',
      'Le taux de descente en approche',
      'La longueur de piste disponible au décollage',
      'La rugosité du revêtement',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Runway Visual Range : la distance à laquelle un pilote aligné voit les marques ou les feux. C'est elle, et non la visibilité générale, qui autorise ou interdit une approche par faible visibilité.",
  },
  {
    id: 'instr-boite-noire-couleur',
    theme: 'instruments',
    prompt: 'De quelle couleur sont les « boîtes noires » ?',
    options: ['Orange vif', 'Noires', 'Rouges', 'Blanches'],
    correct: 0,
    difficulty: 1,
    explain:
      'Orange, pour être retrouvées dans un champ de débris. Il y en a deux : le CVR enregistre les voix du cockpit, le FDR les paramètres de vol.',
  },
  {
    id: 'instr-cvr-fdr',
    theme: 'instruments',
    prompt: 'Que contient le CVR ?',
    options: [
      'Les sons et conversations du poste de pilotage',
      'Les paramètres de vol',
      'Les messages échangés avec la compagnie',
      'La liste des passagers',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Cockpit Voice Recorder pour les voix, Flight Data Recorder pour les centaines de paramètres. Ensemble, ils permettent de reconstituer un vol seconde par seconde.',
  },
  {
    id: 'instr-inertielle',
    theme: 'instruments',
    prompt: 'Comment fonctionne une centrale à inertie ?',
    options: [
      'Elle intègre les accélérations mesurées à bord pour calculer la position',
      'Elle triangule des balises au sol',
      'Elle compare la pression et la température extérieures',
      'Elle reçoit sa position par satellite',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Totalement autonome : ni satellite, ni balise. Sa dérive s'accumule avec le temps, d'où le recalage permanent par GPS ou par DME sur les vols longs.",
    asked: '2018',
  },
  {
    id: 'instr-gps-transat',
    theme: 'instruments',
    prompt: 'Comment se fait la navigation sur un vol transatlantique moderne ?',
    options: [
      'Principalement par GPS, la centrale inertielle étant recalée quand c’est possible',
      'Uniquement au compas et à l’estime',
      'Par suivi radar continu depuis le sol',
      'Par balises NDB flottantes',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Au milieu de l'océan, aucune balise ne porte : le satellite et l'inertie prennent le relais. Le contrôle se fait par position rapportée et par liaison de données, pas par écho radar.",
    asked: '2018',
  },
  {
    id: 'instr-pilote-automatique-cat',
    theme: 'instruments',
    prompt: 'Que fait l’automanette (autothrottle / autothrust) ?',
    options: [
      'Elle régule la poussée pour tenir une vitesse ou un régime',
      'Elle braque les gouvernes',
      'Elle gère la pressurisation',
      'Elle commande les inverseurs après le toucher',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Elle complète le pilote automatique : celui-ci tient la trajectoire, elle tient la vitesse. Sur Airbus, les manettes restent fixes ; sur Boeing, elles bougent sous la main du pilote.',
  },
  {
    id: 'instr-acars',
    theme: 'instruments',
    prompt: 'À quoi sert l’ACARS ?',
    options: [
      'À échanger des messages de données entre l’avion, la compagnie et le contrôle',
      'À enregistrer les paramètres de vol',
      'À guider l’avion en approche finale',
      'À détecter les turbulences',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Aircraft Communications Addressing and Reporting System : plans de vol, météo, messages de maintenance. Ce sont ses messages automatiques qui ont donné les premiers indices sur l'accident de l'AF447.",
  },
  {
    id: 'instr-elt',
    theme: 'instruments',
    prompt: 'Que fait une balise ELT ?',
    options: [
      'Elle émet un signal de détresse localisable après un accident',
      'Elle transmet la position en temps réel pendant tout le vol',
      'Elle sert de secours au transpondeur',
      'Elle mesure la décélération à l’impact',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Emergency Locator Transmitter, déclenchée par le choc ou manuellement. Les satellites Cospas-Sarsat la captent sur 406 MHz et transmettent la position aux secours.",
  },
  {
    id: 'instr-pfd-nd',
    theme: 'instruments',
    prompt: 'Que présente le PFD (Primary Flight Display) ?',
    options: [
      'Assiette, vitesse, altitude, cap — les paramètres de pilotage',
      'La carte de navigation et la route',
      'Les paramètres moteurs',
      'L’état des systèmes hydrauliques',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le PFD rassemble les instruments primaires en un seul écran, le ND affiche la navigation, et l'ECAM (Airbus) ou l'EICAS (Boeing) surveille les systèmes.",
  },
  {
    id: 'instr-ecam',
    theme: 'instruments',
    prompt: 'Sur Airbus, que désigne l’ECAM ?',
    options: [
      'Le système de surveillance des moteurs et des systèmes, avec ses procédures',
      'Le calculateur de commandes de vol',
      "L'ordinateur de navigation",
      'Le système anticollision',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Electronic Centralized Aircraft Monitor : en cas de panne, il affiche l'alarme ET la liste d'actions à faire. Chez Boeing, l'équivalent s'appelle EICAS.",
  },
  {
    id: 'instr-anemometre-ias-tas',
    theme: 'instruments',
    prompt: 'Pourquoi la vitesse vraie (TAS) dépasse-t-elle la vitesse indiquée (IAS) en altitude ?',
    options: [
      "Parce que l'air est moins dense : même pression dynamique, vitesse réelle plus grande",
      'Parce que le Pitot chauffe et fausse la mesure',
      'Parce que le vent est plus fort en altitude',
      'Parce que la température est plus basse',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'anémomètre lit une pression dynamique, pas une vitesse. En altitude, il faut aller beaucoup plus vite pour produire la même pression : à FL350, 280 kt indiqués valent environ 480 kt vrais.",
  },
  {
    id: 'instr-degivrage-sol',
    theme: 'instruments',
    prompt: 'À quoi sert le liquide de dégivrage appliqué à l’avion avant le décollage ?',
    options: [
      'À retirer la glace et à retarder sa reformation sur les surfaces portantes',
      'À réchauffer les réservoirs de carburant',
      'À nettoyer les hublots',
      'À protéger la peinture du sel de piste',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Quelques millimètres de givre sur l'aile suffisent à ruiner la portance. Le type I dégivre, le type II ou IV protège pendant un temps limité, le fameux « holdover time ».",
  },
];
