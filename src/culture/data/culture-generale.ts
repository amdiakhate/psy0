import type { CultureEntry } from '../types';

/**
 * Littérature, films, institutions, espace.
 *
 * Pilotest le dit sans détour : l'épreuve mesure la passion, pas l'érudition.
 * C'est le thème où cela se voit le plus — personne ne révise « Vol de nuit »
 * la veille, on l'a lu ou on ne l'a pas lu. Les questions ci-dessous couvrent ce
 * qu'un lecteur de la Ligne, un spectateur d'« Aviator » et un lecteur
 * d'Aerobuzz auraient retenu.
 */
export const cultureGenerale: CultureEntry[] = [
  {
    id: 'cult-terre-des-hommes',
    theme: 'culture-generale',
    prompt: 'Qui a écrit « Terre des hommes » ?',
    options: ['Antoine de Saint-Exupéry', 'Joseph Kessel', 'Pierre Clostermann', 'Romain Gary'],
    correct: 0,
    difficulty: 1,
    explain:
      "Prix de l'Académie française en 1939. C'est là qu'il raconte la marche de Guillaumet dans les Andes — l'un des textes fondateurs de la culture aéronautique française.",
  },
  {
    id: 'cult-vol-de-nuit',
    theme: 'culture-generale',
    prompt: 'De quoi parle « Vol de nuit » de Saint-Exupéry ?',
    options: [
      'Des débuts du courrier aérien de nuit en Amérique du Sud',
      'De la bataille d’Angleterre',
      'Du premier vol transatlantique',
      'De la conquête spatiale',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Prix Femina 1931. Le personnage de Rivière, chef inflexible, est inspiré de Didier Daurat, le chef d'exploitation de la Ligne.",
  },
  {
    id: 'cult-courrier-sud',
    theme: 'culture-generale',
    prompt: 'Quel roman de Saint-Exupéry se déroule sur la ligne Toulouse-Dakar ?',
    options: ['Courrier Sud', 'Pilote de guerre', 'Le Petit Prince', 'Citadelle'],
    correct: 0,
    difficulty: 3,
    explain:
      'Son premier roman, publié en 1929, nourri de son expérience de chef d’escale à Cap Juby, dans le Sahara espagnol.',
  },
  {
    id: 'cult-petit-prince',
    theme: 'culture-generale',
    prompt: 'Quel événement vécu par Saint-Exupéry a inspiré l’ouverture du « Petit Prince » ?',
    options: [
      'Son crash dans le désert de Libye en 1935',
      'Sa disparition en Méditerranée',
      'Son passage à l’Aéropostale',
      'Son exil aux États-Unis',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Avec son mécanicien Prévot, il survit cinq jours sans eau avant d'être sauvé par un Bédouin. Le livre paraît à New York en 1943.",
  },
  {
    id: 'cult-kessel-mermoz',
    theme: 'culture-generale',
    prompt: 'Qui a écrit la biographie « Mermoz » ?',
    options: ['Joseph Kessel', 'Antoine de Saint-Exupéry', 'Pierre Clostermann', 'Jules Roy'],
    correct: 0,
    difficulty: 3,
    explain:
      "Kessel, lui-même aviateur pendant la Grande Guerre, publie ce livre en 1938, deux ans après la disparition de Mermoz. Il est aussi coauteur du « Chant des partisans ».",
  },
  {
    id: 'cult-grand-cirque',
    theme: 'culture-generale',
    prompt: 'De quoi parle « Le Grand Cirque » de Pierre Clostermann ?',
    options: [
      'De son expérience de pilote de chasse français dans la RAF',
      'Des débuts de l’Aéropostale',
      'De la conquête de l’espace',
      'De la construction de Concorde',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Paru en 1948, l’un des plus grands succès de librairie de l’après-guerre. Clostermann fut l’un des pilotes français les plus décorés du conflit.',
  },
  {
    id: 'cult-aviator-film',
    theme: 'culture-generale',
    prompt: 'De qui le film « Aviator » de Martin Scorsese retrace-t-il la vie ?',
    options: ['Howard Hughes', 'Charles Lindbergh', 'Amelia Earhart', 'Antoine de Saint-Exupéry'],
    correct: 0,
    difficulty: 2,
    explain:
      "Industriel, cinéaste, pilote et propriétaire de la TWA — la compagnie qui exploita le Constellation sur Paris-New York. Le film couvre les années 1927 à 1947.",
  },
  {
    id: 'cult-mayday-serie',
    theme: 'culture-generale',
    prompt: 'Que raconte la série documentaire « Mayday » (Air Crash) ?',
    options: [
      'Les enquêtes sur les accidents aériens et leurs enseignements',
      "L'histoire des compagnies aériennes",
      'La formation des pilotes de ligne',
      'La construction des avions de ligne',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Elle reconstitue le travail des bureaux d'enquête. Pilotest la recommande explicitement : c'est le moyen le plus rapide de comprendre pourquoi les procédures existent.",
  },
  {
    id: 'cult-sully-film',
    theme: 'culture-generale',
    prompt: 'Quel événement le film « Sully » de Clint Eastwood retrace-t-il ?',
    options: [
      "L'amerrissage d'un A320 sur l'Hudson en 2009",
      "L'accident du Concorde à Gonesse",
      "La disparition du vol MH370",
      "Le pont aérien de Berlin",
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le film porte moins sur l'amerrissage que sur l'enquête qui a suivi, et sur la question du temps réellement disponible pour décider. Un bon support de réflexion pour un entretien.",
  },
  {
    id: 'cult-etoffe-des-heros',
    theme: 'culture-generale',
    prompt: 'De quoi parle « L’Étoffe des héros » ?',
    options: [
      'Des pilotes d’essai américains et des premiers astronautes du programme Mercury',
      'Des pilotes de l’Aéropostale',
      'De la bataille d’Angleterre',
      'Des débuts d’Airbus',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Livre de Tom Wolfe, porté à l'écran en 1983. Il s'ouvre sur Chuck Yeager et le franchissement du mur du son en 1947.",
  },
  {
    id: 'cult-aerobuzz',
    theme: 'culture-generale',
    prompt: 'Qu’est-ce qu’Aerobuzz ?',
    options: [
      "Un site d'actualité aéronautique francophone",
      "Une compagnie aérienne régionale",
      'Un salon aéronautique annuel',
      'Un simulateur de vol grand public',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Pilotest le recommande comme source d'actualité. L'épreuve peut porter sur des faits récents : un candidat qui suit le secteur depuis six mois y gagne des points faciles.",
  },
  {
    id: 'cult-salon-bourget',
    theme: 'culture-generale',
    prompt: 'Où se tient le plus ancien et l’un des plus grands salons aéronautiques du monde ?',
    options: ['Au Bourget', 'À Farnborough', 'À Dubaï', 'À Toulouse-Blagnac'],
    correct: 0,
    difficulty: 2,
    explain:
      "Le Salon international de l'aéronautique et de l'espace, tous les deux ans, en alternance avec Farnborough au Royaume-Uni. Le musée de l'Air et de l'Espace y est installé à demeure.",
  },
  {
    id: 'cult-musee-air-espace',
    theme: 'culture-generale',
    prompt: 'Où se trouve le musée de l’Air et de l’Espace ?',
    options: ['Au Bourget', 'À Toulouse', 'À Orly', 'À Versailles'],
    correct: 0,
    difficulty: 3,
    explain:
      "Sur l'aéroport historique du Bourget, là même où Lindbergh s'est posé en 1927. On y voit deux Concorde, dont le prototype 001.",
  },
  {
    id: 'cult-aeroscopia',
    theme: 'culture-generale',
    prompt: 'Quel musée aéronautique se trouve à Toulouse-Blagnac ?',
    options: ['Aeroscopia', 'Le musée de l’Air et de l’Espace', 'La Cité de l’Espace uniquement', 'Le musée Latécoère'],
    correct: 0,
    difficulty: 4,
    explain:
      "Il abrite un Concorde, un Super Guppy et un A300B. La Cité de l'Espace, également toulousaine, est consacrée au spatial — les deux sont distincts.",
  },
  {
    id: 'cult-thomas-pesquet',
    theme: 'culture-generale',
    prompt: 'Quelle est la particularité du parcours de Thomas Pesquet ?',
    options: [
      "Il est ingénieur, pilote de ligne Air France, puis astronaute de l'ESA",
      'Il est pilote militaire devenu astronaute américain',
      'Il est médecin devenu spationaute russe',
      "Il est le premier civil à avoir marché sur la Lune",
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Sélectionné par l'ESA en 2009 alors qu'il volait sur A320 chez Air France. Il a commandé la Station spatiale internationale en 2021 — un parcours que la filière cadets aime citer.",
  },
  {
    id: 'cult-esa',
    theme: 'culture-generale',
    prompt: 'Que fait l’ESA ?',
    options: [
      "C'est l'agence spatiale européenne",
      "C'est l'agence française de l'espace",
      "C'est l'autorité européenne de sécurité aérienne",
      "C'est l'organisme européen de contrôle du trafic",
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "À ne pas confondre avec l'EASA, l'agence de sécurité aérienne, ni avec le CNES, l'agence spatiale française. Kourou, en Guyane, est le port spatial de l'Europe.",
  },
  {
    id: 'cult-kourou',
    theme: 'culture-generale',
    prompt: 'Pourquoi la base de lancement européenne est-elle installée à Kourou ?',
    options: [
      'Sa proximité de l’équateur donne un gain de vitesse au lancement',
      'C’est le seul territoire français sans population',
      'Le climat y est constamment sec',
      'Elle est protégée des regards par la forêt',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "À l'équateur, la rotation terrestre fournit environ 460 m/s gratuits. S'y ajoute un tir vers l'est au-dessus de l'océan, sans zone habitée en dessous.",
  },
  {
    id: 'cult-ariane',
    theme: 'culture-generale',
    prompt: 'Qu’est-ce qu’Ariane ?',
    options: [
      'La famille de lanceurs européens',
      'Un programme de satellites météo',
      'Le nom du premier satellite français',
      'Une station spatiale européenne',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Depuis 1979. Ariane 5 a lancé le télescope James-Webb en 2021 ; Ariane 6 lui a succédé, face à la concurrence des lanceurs réutilisables américains.",
  },
  {
    id: 'cult-safran',
    theme: 'culture-generale',
    prompt: 'Que produit Safran ?',
    options: [
      'Des moteurs d’avion, des trains d’atterrissage et des équipements aéronautiques',
      'Des cellules d’avions de ligne',
      'Des systèmes de contrôle aérien',
      'Des satellites de télécommunication',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Né de la fusion de Snecma et Sagem, c'est le partenaire français de General Electric au sein de CFM International. Un des trois piliers de la filière aéronautique française avec Airbus et Dassault.",
  },
  {
    id: 'cult-thales',
    theme: 'culture-generale',
    prompt: 'Dans quel domaine Thales intervient-il en aéronautique ?',
    options: [
      'L’avionique, les systèmes embarqués et le contrôle aérien',
      'La construction de cellules d’avions',
      'La motorisation',
      'La maintenance lourde',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Calculateurs, radars, systèmes de divertissement à bord, équipements de gestion du trafic. C'est le versant électronique de la filière française.",
  },
  {
    id: 'cult-enac',
    theme: 'culture-generale',
    prompt: 'Que forme l’ENAC ?',
    options: [
      'Des ingénieurs, des pilotes et des contrôleurs de l’aviation civile',
      'Uniquement des pilotes militaires',
      'Des mécaniciens aéronautiques exclusivement',
      'Des personnels navigants commerciaux',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "École nationale de l'aviation civile, à Toulouse, sous tutelle de la DGAC. C'est la plus grande école aéronautique d'Europe, et un acteur historique de la formation des cadets.",
  },
  {
    id: 'cult-af447',
    theme: 'culture-generale',
    prompt: 'Qu’a mis en évidence l’enquête sur le vol AF447 Rio-Paris de 2009 ?',
    options: [
      "Le givrage des sondes Pitot et la difficulté à reconnaître un décrochage à haute altitude",
      'Une défaillance structurelle de l’A330',
      'Un incendie parti de la soute',
      'Une collision avec un autre appareil',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Les enregistreurs, retrouvés en 2011 à près de 4 000 m de fond, ont mené à une refonte de la formation au décrochage haute altitude et au remplacement des sondes.",
  },
  {
    id: 'cult-uberlingen',
    theme: 'culture-generale',
    prompt: 'Quelle règle la collision d’Überlingen (2002) a-t-elle imposée ?',
    options: [
      'La résolution du TCAS prime sur l’instruction du contrôleur',
      'Le transpondeur devient obligatoire en espace non contrôlé',
      'Les vols de nuit sont interdits au-dessus des zones habitées',
      'Deux contrôleurs sont exigés en permanence',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Un équipage avait suivi le contrôleur, l'autre le TCAS : ils sont partis dans la même direction. La règle est aujourd'hui sans ambiguïté.",
  },
  {
    id: 'cult-mh370',
    theme: 'culture-generale',
    prompt: 'Qu’a changé la disparition du vol MH370 en 2014 ?',
    options: [
      "Le renforcement du suivi de position des avions au-dessus des océans",
      "L'interdiction des vols de nuit transocéaniques",
      'Le doublement des enregistreurs de vol',
      'La fin des vols en biréacteur au-dessus du Pacifique',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'OACI a imposé un report de position rapproché en zone océanique et travaille sur les enregistreurs éjectables. L'épave n'a jamais été retrouvée.",
  },
  {
    id: 'cult-boeing-max',
    theme: 'culture-generale',
    prompt: 'Quel système est au cœur des deux accidents du Boeing 737 MAX en 2018 et 2019 ?',
    options: ['Le MCAS', 'Le TCAS', 'Le GPWS', 'Le FADEC'],
    correct: 0,
    difficulty: 4,
    explain:
      "Un dispositif d'assistance au tangage, alimenté par une seule sonde d'incidence et mal documenté auprès des équipages. La flotte mondiale est restée clouée au sol près de deux ans.",
  },
  {
    id: 'cult-decarbonation',
    theme: 'culture-generale',
    prompt: 'Quels sont les principaux leviers de décarbonation avancés par le transport aérien ?',
    options: [
      'Renouvellement des flottes, carburants durables et optimisation des trajectoires',
      'Réduction du nombre de passagers par vol',
      'Retour aux avions à hélices sur tous les réseaux',
      'Vol à plus basse altitude',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "C'est le discours officiel du secteur, et un sujet d'entretien quasi certain. Un candidat crédible sait aussi en citer les limites : disponibilité du SAF, coût, et rythme de renouvellement des flottes.",
  },
  {
    id: 'cult-traînees-condensation',
    theme: 'culture-generale',
    prompt: 'Pourquoi les traînées de condensation posent-elles question sur le plan climatique ?',
    options: [
      'Les cirrus qu’elles forment retiennent le rayonnement infrarouge',
      'Elles contiennent des particules toxiques',
      'Elles réfléchissent le soleil et refroidissent la planète',
      'Elles détruisent la couche d’ozone',
    ],
    correct: 0,
    difficulty: 5,
    explain:
      "Leur effet de réchauffement pourrait égaler celui du CO₂ émis. D'où les essais d'évitement des zones propices à leur formation par ajustement d'altitude.",
  },
  {
    id: 'cult-pnt-pnc',
    theme: 'culture-generale',
    prompt: 'Que désigne le sigle PNT dans une compagnie aérienne ?',
    options: [
      'Le personnel navigant technique, c’est-à-dire les pilotes',
      'Le personnel navigant commercial',
      'Le personnel au sol',
      'Le plan de navigation théorique',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "PNT pour les pilotes, PNC pour les hôtesses et stewards. Ensemble ils forment le personnel navigant, avec un statut et une réglementation propres.",
  },
  {
    id: 'cult-chef-de-cabine',
    theme: 'culture-generale',
    prompt: 'Comment appelle-t-on le responsable de l’équipage commercial sur un long-courrier ?',
    options: ['Le chef de cabine principal', 'Le commandant de bord', 'Le copilote de cabine', 'Le régulateur'],
    correct: 0,
    difficulty: 3,
    explain:
      "Souvent appelé « purser » dans l'usage international. Il rend compte au commandant de bord, qui reste seul responsable de l'ensemble du vol.",
  },
  {
    id: 'cult-jet-lag',
    theme: 'culture-generale',
    prompt: 'Pourquoi le décalage horaire est-il plus difficile vers l’est ?',
    options: [
      "Il faut avancer son horloge interne, ce qui est plus dur que la retarder",
      'Les vols vers l’est sont plus longs',
      'On y perd systématiquement une nuit de sommeil',
      'Les vents de face fatiguent davantage',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Le rythme circadien humain tourne un peu au-delà de 24 h : le retarder est naturel, l'avancer ne l'est pas. C'est un vrai sujet de gestion de la fatigue pour un navigant long-courrier.",
  },
  {
    id: 'cult-pressurisation-altitude-cabine',
    theme: 'culture-generale',
    prompt: 'À quelle altitude équivalente la cabine d’un avion de ligne est-elle pressurisée ?',
    options: [
      'Autour de 6 000 à 8 000 ft',
      'Au niveau de la mer exactement',
      'Autour de 15 000 ft',
      'À l’altitude réelle de croisière',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Un compromis entre confort et fatigue de la structure. Les fuselages composites du 787 et de l'A350 permettent de descendre vers 6 000 ft, d'où une moindre fatigue en fin de vol.",
  },
  {
    id: 'cult-hypoxie',
    theme: 'culture-generale',
    prompt: 'Pourquoi faut-il mettre son masque à oxygène avant d’aider son voisin ?',
    options: [
      "Parce que l'hypoxie fait perdre conscience en quelques secondes en altitude",
      'Parce que les masques se déploient dans un ordre précis',
      'Parce que l’oxygène est en quantité limitée',
      'Parce que la consigne facilite l’évacuation',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le temps de conscience utile à 35 000 ft se compte en secondes, et l'hypoxie donne une sensation d'euphorie, pas d'alarme. C'est pourquoi l'ordre des gestes est prescrit.",
  },
];
