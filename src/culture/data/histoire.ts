import type { CultureEntry } from '../types';

/**
 * Histoire de l'aviation.
 *
 * C'est le thème le plus présent dans les annales, et le seul qui se révise
 * vraiment par cœur : des noms, des dates, des appareils. La bonne nouvelle est
 * qu'il est fini — quelques dizaines de faits couvrent l'essentiel de ce qui
 * tombe depuis des années.
 */
export const histoire: CultureEntry[] = [
  {
    id: 'hist-bleriot-manche',
    theme: 'histoire',
    prompt: 'Qui a traversé la Manche en avion le premier, et en quelle année ?',
    options: [
      'Louis Blériot, en 1909',
      'Roland Garros, en 1913',
      'Charles Lindbergh, en 1927',
      'Les frères Wright, en 1903',
    ],
    correct: 0,
    difficulty: 1,
    explain:
      'Le 25 juillet 1909, sur son Blériot XI, de Calais à Douvres en 37 minutes. L’exploit a rendu tangible l’idée qu’une île pouvait cesser d’en être une.',
    asked: '2019',
  },
  {
    id: 'hist-garros-mediterranee',
    theme: 'histoire',
    prompt: 'Quelle traversée Roland Garros a-t-il réalisée en 1913 ?',
    options: [
      'La première traversée de la Méditerranée en avion',
      'La première traversée de la Manche',
      'La première traversée de l’Atlantique sud',
      'Le premier tour du monde aérien',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Le 23 septembre 1913, de Fréjus à Bizerte sur un Morane-Saulnier. Il mourra au combat en 1918 ; le stade parisien porte son nom depuis 1928.',
    asked: '2019',
  },
  {
    id: 'hist-wright-1903',
    theme: 'histoire',
    prompt: 'Qui réussit le premier vol motorisé contrôlé, en 1903 ?',
    options: [
      'Les frères Wright, à Kitty Hawk',
      'Clément Ader, à Armainvilliers',
      'Alberto Santos-Dumont, à Bagatelle',
      'Louis Blériot, à Calais',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Le 17 décembre 1903, 12 secondes et 36 mètres. Leur apport décisif n’est pas le moteur mais le contrôle sur trois axes, par gauchissement de l’aile.',
  },
  {
    id: 'hist-santos-dumont',
    theme: 'histoire',
    prompt: 'Quel vol Alberto Santos-Dumont réalise-t-il à Bagatelle en 1906 ?',
    options: [
      'Le premier vol officiellement homologué en Europe',
      'La première traversée de la Manche',
      'Le premier vol de nuit',
      'Le premier looping',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Son 14-bis décolle par ses propres moyens devant témoins et chronométreurs. C'est pourquoi le Brésil le tient pour l'inventeur de l'avion : les Wright utilisaient une catapulte.",
  },
  {
    id: 'hist-lindbergh',
    theme: 'histoire',
    prompt: 'Quel exploit Charles Lindbergh accomplit-il en mai 1927 ?',
    options: [
      "La première traversée de l'Atlantique nord en solitaire et sans escale",
      'Le premier vol supersonique',
      'Le premier tour du monde en avion',
      'La première traversée du Pacifique',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "New York – Paris en 33 h 30 sur le Spirit of St. Louis, atterrissage au Bourget. Il volait d'ouest en est, avec le vent : le sens inverse est bien plus dur.",
  },
  {
    id: 'hist-nungesser-coli',
    theme: 'histoire',
    prompt: 'Qui tenta la traversée de l’Atlantique d’est en ouest quelques jours avant Lindbergh ?',
    options: [
      'Nungesser et Coli, à bord de L’Oiseau Blanc',
      'Alcock et Brown, sur un Vickers Vimy',
      'Mermoz et Dabry, sur le Comte de La Vaulx',
      'Costes et Bellonte, sur le Point d’Interrogation',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Partis du Bourget le 8 mai 1927, disparus sans laisser de trace. Le sens est-ouest impose le vent de face : c'est ce qui rend la tentative si dangereuse.",
    asked: '2018',
  },
  {
    id: 'hist-alcock-brown',
    theme: 'histoire',
    prompt: 'Qui réalisa la première traversée de l’Atlantique nord sans escale, en 1919 ?',
    options: [
      'Alcock et Brown',
      'Charles Lindbergh',
      'Nungesser et Coli',
      'Amelia Earhart',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Terre-Neuve – Irlande sur un Vickers Vimy bimoteur, huit ans avant Lindbergh. La différence : ils volaient à deux, et l'exploit de Lindbergh était d'être seul.",
  },
  {
    id: 'hist-mermoz-atlantique-sud',
    theme: 'histoire',
    prompt: 'Quel exploit Jean Mermoz réalise-t-il en mai 1930 ?',
    options: [
      'La première traversée de l’Atlantique sud avec du courrier postal',
      'La première traversée de la Manche de nuit',
      'Le premier vol au-dessus des Andes',
      'Le premier vol commercial supersonique',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Saint-Louis du Sénégal – Natal sur le Latécoère 28 hydravion « Comte de La Vaulx », avec Dabry et Gimié. La ligne d’Amérique du Sud cessait d’avoir besoin d’un bateau.',
  },
  {
    id: 'hist-mermoz-disparition',
    theme: 'histoire',
    prompt: 'Sur quel appareil Jean Mermoz disparaît-il le 7 décembre 1936 ?',
    options: [
      'Le Latécoère 300 « Croix du Sud »',
      'Le Latécoère 28 « Comte de La Vaulx »',
      'Un Potez 25',
      'Un Breguet 14',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Au large de Dakar, en route vers Natal. Dernier message : « Coupons moteur arrière droit. » L’équipage de cinq hommes ne fut jamais retrouvé.',
    asked: '2019',
  },
  {
    id: 'hist-guillaumet-andes',
    theme: 'histoire',
    prompt: 'Quel aviateur a dit : « Ce que j’ai fait, je te jure, jamais aucune bête ne l’aurait fait » ?',
    options: ['Henri Guillaumet', 'Jean Mermoz', 'Antoine de Saint-Exupéry', 'Didier Daurat'],
    correct: 0,
    difficulty: 3,
    explain:
      'Après son crash dans les Andes en juin 1930 et cinq jours de marche dans la neige. Il le dit à Saint-Exupéry, qui en fait un des sommets de « Terre des hommes ».',
    asked: '2019',
  },
  {
    id: 'hist-saint-ex-disparition',
    theme: 'histoire',
    prompt: 'Sur quel avion Antoine de Saint-Exupéry disparaît-il le 31 juillet 1944 ?',
    options: [
      'Un Lockheed P-38 Lightning',
      'Un Breguet 14',
      'Un Potez 25',
      'Un Supermarine Spitfire',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Décollé de Corse pour une mission de reconnaissance, disparu en Méditerranée. L'épave, retrouvée au large de Marseille en 2000, fut identifiée grâce à sa gourmette.",
    asked: '2019',
  },
  {
    id: 'hist-earhart',
    theme: 'histoire',
    prompt: 'Quel exploit a réalisé Amelia Earhart en 1932 ?',
    options: [
      "La première traversée de l'Atlantique nord en solitaire par une femme",
      'Le premier tour du monde en avion',
      'La première traversée du Pacifique',
      'Le premier vol de nuit transatlantique',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Sur son Lockheed Vega 5B. Elle avait déjà traversé en 1928, mais comme passagère. Elle disparaît en 1937 au-dessus du Pacifique lors d'une tentative de tour du monde.",
    asked: '2019',
  },
  {
    id: 'hist-aeropostale-daurat',
    theme: 'histoire',
    prompt: 'Qui dirigeait l’exploitation des lignes Latécoère, futures Aéropostale ?',
    options: ['Didier Daurat', 'Pierre-Georges Latécoère', 'Marcel Bouilloux-Lafont', 'Pierre Cot'],
    correct: 0,
    difficulty: 4,
    explain:
      "Chef d'exploitation intraitable, il est le « Rivière » de « Vol de nuit ». Latécoère fonda la ligne, Bouilloux-Lafont la racheta et lui donna le nom d'Aéropostale en 1927.",
  },
  {
    id: 'hist-aeropostale-ligne',
    theme: 'histoire',
    prompt: 'Quelle liaison l’Aéropostale a-t-elle ouverte au fil des années 1920 ?',
    options: [
      'Toulouse – Casablanca – Dakar – Amérique du Sud',
      'Paris – Moscou – Pékin',
      'Marseille – Le Caire – Bombay',
      'Paris – Londres – New York',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "La Ligne descendait l'Afrique puis franchissait l'Atlantique sud, d'abord par aviso, ensuite par les airs. C'est le décor de Mermoz, Guillaumet et Saint-Exupéry.",
  },
  {
    id: 'hist-blues-hydravion-pionniers',
    theme: 'histoire',
    prompt: 'Quel avion de l’Aéropostale, issu du surplus de la Grande Guerre, ouvrit la Ligne ?',
    options: ['Le Breguet 14', 'Le Latécoère 300', 'Le Potez 25', 'Le Caudron Simoun'],
    correct: 0,
    difficulty: 4,
    explain:
      'Biplan robuste et réparable partout, il fut produit à des milliers d’exemplaires. Sa fiabilité relative rendait la Ligne concevable — pas confortable.',
  },
  {
    id: 'hist-p51-mustang',
    theme: 'histoire',
    prompt: 'Quel avion surnommait-on « Mustang » ?',
    options: [
      'Le North American P-51',
      'Le Lockheed P-38',
      'Le Supermarine Spitfire',
      'Le Messerschmitt Bf 109',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Chasseur américain de la Seconde Guerre mondiale. Doté du moteur britannique Merlin, il escortait les bombardiers jusqu'à Berlin — un rayon d'action décisif.",
    asked: '2018',
  },
  {
    id: 'hist-me262',
    theme: 'histoire',
    prompt: 'Quel fut le premier avion à réaction engagé opérationnellement ?',
    options: [
      'Le Messerschmitt Me 262',
      'Le De Havilland Comet',
      'Le Gloster Meteor',
      'Le Lockheed P-80',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Engagé par la Luftwaffe en 1944, il volait 150 km/h plus vite que tout le reste. Trop tardif et trop peu fiable pour changer l’issue du conflit.',
  },
  {
    id: 'hist-comet-premier-jet',
    theme: 'histoire',
    prompt: 'Quel fut le premier avion de ligne à réaction du monde ?',
    options: [
      'Le De Havilland Comet',
      'La Caravelle',
      'Le Boeing 707',
      'Le Douglas DC-8',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Mis en service en 1952. Une série d'accidents dus à la fatigue du fuselage autour des hublots carrés le cloua au sol — et fit naître la science moderne de la fatigue des structures.",
    asked: '2019',
  },
  {
    id: 'hist-caravelle',
    theme: 'histoire',
    prompt: 'Quelle innovation la Caravelle a-t-elle imposée aux avions de ligne ?',
    options: [
      "Les réacteurs placés à l'arrière du fuselage",
      'Le train tricycle',
      'La cabine pressurisée',
      "L'aile en flèche",
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Aile propre, cabine bien plus silencieuse. Premier vol en 1955, exploitée intensivement par Air France dès 1959 : c'est le premier grand succès commercial français de l'ère du jet.",
  },
  {
    id: 'hist-constellation',
    theme: 'histoire',
    prompt: 'Qu’est-ce qu’un Lockheed Constellation ?',
    options: [
      'Un quadrimoteur à hélices d’après-guerre, à fuselage courbe',
      'Un quadriréacteur des années 1960',
      'Un hydravion transatlantique',
      'Un bombardier lourd américain',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Surnommé « Connie », reconnaissable à sa triple dérive et à son dos de dauphin. Exploité par la TWA de Howard Hughes puis par Air France, il fut balayé par les jets en moins de dix ans.",
    asked: '2019',
  },
  {
    id: 'hist-dc3',
    theme: 'histoire',
    prompt: 'Quelle est la place du Douglas DC-3 dans l’histoire du transport aérien ?',
    options: [
      'Le premier avion à rendre le transport de passagers rentable par lui-même',
      'Le premier avion de ligne à réaction',
      'Le premier avion pressurisé',
      'Le premier avion à franchir l’Atlantique sans escale',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Avant lui, les compagnies vivaient du courrier. Sorti en 1935, produit à plus de 16 000 exemplaires avec sa version militaire C-47, il vole encore aujourd'hui.",
  },
  {
    id: 'hist-b707',
    theme: 'histoire',
    prompt: 'Quel avion a fait entrer l’Amérique dans l’ère du jet commercial en 1958 ?',
    options: ['Le Boeing 707', 'Le Douglas DC-8', 'Le Boeing 727', 'Le Convair 880'],
    correct: 0,
    difficulty: 3,
    explain:
      "Il a divisé par deux les temps de traversée de l'Atlantique et lancé le « Jet Set ». Le DC-8 arrive presque en même temps, mais c'est le 707 qui a marqué les esprits.",
  },
  {
    id: 'hist-b747',
    theme: 'histoire',
    prompt: 'Quel surnom porte le Boeing 747 ?',
    options: ['Jumbo Jet', 'Super Guppy', 'Queen of the Skies uniquement en version cargo', 'Whale Jet'],
    correct: 0,
    difficulty: 2,
    explain:
      "Premier vol en 1969, mise en service en 1970. Son pont supérieur venait d'un projet militaire à nez ouvrant : Boeing pensait que le supersonique tuerait le subsonique et prévoyait une reconversion en cargo.",
  },
  {
    id: 'hist-concorde-premier-vol',
    theme: 'histoire',
    prompt: 'En quelle année le Concorde a-t-il effectué son premier vol ?',
    options: ['1969', '1962', '1976', '1958'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le 2 mars 1969 à Toulouse, aux mains d'André Turcat. L'accord franco-britannique datait de 1962 ; la mise en service commerciale n'arrivera qu'en 1976.",
  },
  {
    id: 'hist-concorde-service-af',
    theme: 'histoire',
    prompt: 'En quelles années le Concorde a-t-il été mis en service puis retiré chez Air France ?',
    options: ['1976 puis 2003', '1969 puis 2000', '1973 puis 1999', '1980 puis 2005'],
    correct: 0,
    difficulty: 2,
    explain:
      "Mise en service le 21 janvier 1976, retrait en 2003. L'accident de Gonesse en juillet 2000, puis l'effondrement du trafic après 2001, ont eu raison d'un appareil déjà déficitaire.",
    asked: '2018',
  },
  {
    id: 'hist-concorde-vitesse',
    theme: 'histoire',
    prompt: 'À quelle vitesse de croisière volait le Concorde ?',
    options: ['Environ Mach 2', 'Environ Mach 1,2', 'Environ Mach 3', 'Environ Mach 0,95'],
    correct: 0,
    difficulty: 2,
    explain:
      'Soit environ 2 100 km/h, à plus de 50 000 ft. Paris – New York en 3 h 30, et une arrivée à une heure locale antérieure au départ.',
    asked: '2019',
  },
  {
    id: 'hist-tupolev-144',
    theme: 'histoire',
    prompt: 'Quel appareil vola avant le Concorde et fut le premier avion de ligne supersonique en vol ?',
    options: ['Le Tupolev Tu-144', 'Le Boeing 2707', 'Le Mirage IV', 'Le Sud-Aviation Super Caravelle'],
    correct: 0,
    difficulty: 4,
    explain:
      "Premier vol le 31 décembre 1968, deux mois avant le Concorde. Sa carrière commerciale fut brève : accidents, consommation ruineuse, exploitation abandonnée dès 1978.",
  },
  {
    id: 'hist-airbus-1970',
    theme: 'histoire',
    prompt: 'En quelle année Airbus Industrie a-t-il été officiellement constitué ?',
    options: ['1970', '1967', '1974', '1980'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le 18 décembre 1970, groupement d'intérêt économique entre Aérospatiale et Deutsche Airbus, rejoints ensuite par l'Espagne et le Royaume-Uni. Le premier appareil, l'A300, vole en 1972.",
    asked: '2019',
  },
  {
    id: 'hist-a300-premier',
    theme: 'histoire',
    prompt: 'Quel fut le premier avion produit par Airbus ?',
    options: ["L'A300", "L'A320", "L'A310", "L'A340"],
    correct: 0,
    difficulty: 3,
    explain:
      "Premier vol en 1972 : c'est aussi le premier gros-porteur biréacteur du monde, à une époque où l'on tenait quatre moteurs pour indispensables sur long-courrier.",
  },
  {
    id: 'hist-a320-premier-vol',
    theme: 'histoire',
    prompt: 'Quelle rupture technique l’A320 a-t-il introduite en 1987 ?',
    options: [
      'Les commandes de vol électriques sur un avion de ligne civil',
      'Le premier fuselage en composite',
      'Le premier biréacteur transatlantique',
      'La première cabine pressurisée',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Premier vol le 22 février 1987, premier vol chez Air France en avril 1988. Le fly-by-wire avec protections d'enveloppe est devenu depuis le standard de l'industrie.",
    asked: '2019',
  },
  {
    id: 'hist-a380-premier-vol',
    theme: 'histoire',
    prompt: 'En quelle année l’Airbus A380 a-t-il effectué son premier vol ?',
    options: ['2005', '2000', '2009', '2012'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le 27 avril 2005 à Toulouse. Air France l'a exploité de 2009 à 2020 ; Airbus a livré le dernier exemplaire en 2021, le marché des très gros porteurs ne s'étant jamais matérialisé.",
  },
  {
    id: 'hist-chuck-yeager',
    theme: 'histoire',
    prompt: 'Qui franchit le mur du son pour la première fois, en 1947 ?',
    options: [
      'Chuck Yeager, sur Bell X-1',
      'André Turcat, sur Concorde',
      'Neil Armstrong, sur X-15',
      'Scott Crossfield, sur Douglas Skyrocket',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Le 14 octobre 1947, largué depuis un B-29, deux côtes cassées la veille. L’épisode ouvre « L’Étoffe des héros » de Tom Wolfe.',
  },
  {
    id: 'hist-jean-loup-chretien',
    theme: 'histoire',
    prompt: 'Qui fut le premier spationaute français ?',
    options: ['Jean-Loup Chrétien', 'Patrick Baudry', 'Thomas Pesquet', 'Claudie Haigneré'],
    correct: 0,
    difficulty: 2,
    explain:
      "En 1982, à bord de Soyouz T-6 vers la station Saliout 7 : premier Français et premier Européen de l'Ouest dans l'espace. Claudie Haigneré sera la première Française, en 1996.",
    asked: '2019',
  },
  {
    id: 'hist-gagarine',
    theme: 'histoire',
    prompt: 'Qui fut le premier homme dans l’espace ?',
    options: ['Youri Gagarine, en 1961', 'Neil Armstrong, en 1969', 'Alan Shepard, en 1961', 'Valentina Terechkova, en 1963'],
    correct: 0,
    difficulty: 1,
    explain:
      'Le 12 avril 1961, un tour de Terre à bord de Vostok 1. Valentina Terechkova sera la première femme en 1963, Armstrong marchera sur la Lune en 1969.',
  },
  {
    id: 'hist-helicoptere-sikorsky',
    theme: 'histoire',
    prompt: 'Qui a mis au point le premier hélicoptère produit en série, en 1939-1942 ?',
    options: ['Igor Sikorsky', 'Louis Breguet', 'Paul Cornu', 'Juan de la Cierva'],
    correct: 0,
    difficulty: 4,
    explain:
      "Sa formule — un rotor principal, un rotor anticouple en queue — est restée la norme. Breguet et Cornu avaient décollé bien plus tôt, mais sans contrôle exploitable.",
  },
  {
    id: 'hist-bataille-angleterre',
    theme: 'histoire',
    prompt: 'Quel avion britannique est le plus associé à la bataille d’Angleterre ?',
    options: ['Le Supermarine Spitfire', 'Le Hawker Harrier', 'Le De Havilland Mosquito', 'Le Gloster Meteor'],
    correct: 0,
    difficulty: 2,
    explain:
      "Aux côtés du Hawker Hurricane, plus nombreux mais moins célèbre. C'est aussi la première bataille de l'histoire décidée par la puissance aérienne seule.",
  },
  {
    id: 'hist-clostermann',
    theme: 'histoire',
    prompt: 'Qui est l’auteur du « Grand Cirque », récit de pilote de chasse ?',
    options: ['Pierre Clostermann', 'Joseph Kessel', 'Romain Gary', 'Jules Roy'],
    correct: 0,
    difficulty: 3,
    explain:
      'As français des Forces aériennes françaises libres, il vola sur Spitfire puis Tempest dans la RAF. Son livre, paru en 1948, est un classique de la littérature aéronautique.',
  },
  {
    id: 'hist-pont-aerien-berlin',
    theme: 'histoire',
    prompt: 'Qu’est-ce que le pont aérien de Berlin (1948-1949) ?',
    options: [
      'Le ravitaillement d’une ville entière par avion pendant près d’un an',
      'Une liaison postale expérimentale',
      'Le premier vol commercial est-ouest',
      'Une opération de secours après un séisme',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Berlin-Ouest, bloquée par voie terrestre, fut approvisionnée par un avion toutes les quelques minutes. C'est la démonstration inaugurale de la logistique aérienne moderne.",
  },
  {
    id: 'hist-tenerife',
    theme: 'histoire',
    prompt: 'Quel est l’accident le plus meurtrier de l’histoire de l’aviation civile ?',
    options: [
      'La collision au sol de Tenerife, en 1977',
      "L'accident du vol AF447, en 2009",
      'Le crash du Concorde à Gonesse, en 2000',
      'La collision d’Überlingen, en 2002',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Deux Boeing 747 sur la même piste dans le brouillard : 583 morts. Il a transformé la phraséologie, la notion de clairance de décollage et l'enseignement du travail en équipage.",
  },
  {
    id: 'hist-crm',
    theme: 'histoire',
    prompt: 'Qu’a apporté le CRM (Crew Resource Management) à la sécurité aérienne ?',
    options: [
      'Une manière de travailler en équipage où chacun peut contester une décision',
      'Un nouveau système anticollision',
      'Une procédure de maintenance préventive',
      'Un mode de calcul du carburant embarqué',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Né de l'analyse d'accidents où le copilote avait vu l'erreur sans oser l'exprimer. C'est un sujet d'entretien classique pour un candidat cadet : la sécurité y est un fait collectif.",
  },
  {
    id: 'hist-concorde-gonesse',
    theme: 'histoire',
    prompt: 'Quelle est la cause retenue de l’accident du Concorde à Gonesse en 2000 ?',
    options: [
      'Une lamelle métallique sur la piste ayant fait éclater un pneu',
      'Une panne des quatre réacteurs',
      'Une erreur de calcul de masse et centrage',
      'Un incendie parti de la soute',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Un débris tombé d'un DC-10 précédent perce un pneu ; un fragment frappe l'aile et rompt un réservoir. L'appareil ne reprendra du service qu'un an, avant retrait définitif.",
  },
];
