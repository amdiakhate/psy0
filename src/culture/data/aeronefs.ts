import type { CultureEntry } from '../types';

/**
 * Aéronefs et constructeurs.
 *
 * Le réflexe attendu est de savoir lire une désignation : un A330 est un
 * biréacteur, un A340 un quadriréacteur, un B777 un biréacteur. La règle Airbus
 * — le troisième chiffre de la série 300 dit le nombre de moteurs — n'est pas
 * universelle, mais elle règle bien des questions.
 */
export const aeronefs: CultureEntry[] = [
  {
    id: 'aero-a330-moteurs',
    theme: 'aeronefs',
    prompt: 'Combien de moteurs a un Airbus A330 ?',
    options: ['Deux', 'Quatre', 'Trois', 'Cela dépend de la version'],
    correct: 0,
    difficulty: 1,
    explain:
      "Biréacteur long-courrier, jumeau de cellule de l'A340 quadriréacteur. Airbus a longtemps proposé les deux avec la même aile : le marché a choisi les deux moteurs.",
    asked: '2019',
  },
  {
    id: 'aero-a340-moteurs',
    theme: 'aeronefs',
    prompt: 'Combien de moteurs a un Airbus A340 ?',
    options: ['Quatre', 'Deux', 'Trois', 'Six'],
    correct: 0,
    difficulty: 2,
    explain:
      "Conçu quand la certification ETOPS ne permettait pas encore à un biréacteur de traverser librement les océans. Ses quatre CFM56 le rendaient sûr, mais coûteux.",
    asked: '2018',
  },
  {
    id: 'aero-a380-envergure',
    theme: 'aeronefs',
    prompt: 'Quelle est l’envergure d’un Airbus A380 ?',
    options: ['Environ 80 m', 'Environ 60 m', 'Environ 100 m', 'Environ 45 m'],
    correct: 0,
    difficulty: 3,
    explain:
      "Presque exactement 80 m — la limite volontairement retenue pour rester compatible avec les aires de stationnement de catégorie F. Le 747 en fait 68, l'A320 environ 36.",
    asked: '2019',
  },
  {
    id: 'aero-a380-passagers',
    theme: 'aeronefs',
    prompt: 'Combien de passagers l’A380 d’Air France pouvait-il transporter ?',
    options: ['Environ 500', 'Environ 250', 'Environ 850', 'Environ 150'],
    correct: 0,
    difficulty: 3,
    explain:
      "Environ 516 en configuration Air France, soit un 777-200 et un A340 réunis. La certification autorise jusqu'à 853 places en configuration mono-classe.",
    asked: '2019',
  },
  {
    id: 'aero-a320-famille',
    theme: 'aeronefs',
    prompt: 'Quels appareils composent la famille A320 ?',
    options: [
      'A318, A319, A320 et A321',
      'A320, A330 et A340',
      'A300, A310 et A320',
      'A319, A320 et A350',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Même cockpit, même qualification de type : un pilote passe de l'un à l'autre sans nouvelle formation lourde. C'est l'argument commercial décisif du concept de famille.",
  },
  {
    id: 'aero-a321-plus-long',
    theme: 'aeronefs',
    prompt: 'Quel est le plus long appareil de la famille A320 ?',
    options: ["L'A321", "L'A320", "L'A319", "L'A318"],
    correct: 0,
    difficulty: 2,
    explain:
      "La numérotation suit la longueur : A318 le plus court, A321 le plus long. La version A321XLR pousse le rayon d'action jusqu'au transatlantique.",
  },
  {
    id: 'aero-b737-famille',
    theme: 'aeronefs',
    prompt: 'Quel avion est le concurrent direct de l’A320 chez Boeing ?',
    options: ['Le 737', 'Le 757', 'Le 767', 'Le 717'],
    correct: 0,
    difficulty: 1,
    explain:
      "Le duopole du monocouloir : A320 contre 737, environ la moitié de tous les avions de ligne en service. Le 737 vole depuis 1967, l'A320 depuis 1987.",
  },
  {
    id: 'aero-b787-surnom',
    theme: 'aeronefs',
    prompt: 'Quel est le surnom du Boeing 787 ?',
    options: ['Dreamliner', 'Jumbo Jet', 'Triple Seven', 'Super Guppy'],
    correct: 0,
    difficulty: 2,
    explain:
      'Premier avion de ligne à fuselage majoritairement en composite carbone. Cela permet une pressurisation plus généreuse et une humidité cabine plus élevée.',
  },
  {
    id: 'aero-b777-versions',
    theme: 'aeronefs',
    prompt: 'Quelles versions du Boeing 777 Air France exploite-t-elle principalement ?',
    options: ['Les 777-200ER et 777-300ER', 'Les 777-100 et 777-400', 'Le 777X uniquement', 'Les 777-200LR et 777-8'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le suffixe ER signifie Extended Range. Le 777-300ER est le gros-porteur le plus répandu du long-courrier mondial ; sa succession, le 777X, se fait attendre.",
    asked: '2019',
  },
  {
    id: 'aero-atr-constructeur',
    theme: 'aeronefs',
    prompt: 'Qui construit l’ATR 72 ?',
    options: [
      'Un consortium franco-italien (Airbus et Leonardo)',
      'Bombardier, au Canada',
      'Embraer, au Brésil',
      'De Havilland Canada',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "ATR signifie Avions de Transport Régional. Son turbopropulseur reste le choix de référence pour les liaisons courtes, où le jet ne serait pas rentable.",
  },
  {
    id: 'aero-embraer-nationalite',
    theme: 'aeronefs',
    prompt: 'De quelle nationalité est le constructeur Embraer ?',
    options: ['Brésilienne', 'Canadienne', 'Argentine', 'Portugaise'],
    correct: 0,
    difficulty: 2,
    explain:
      "Troisième constructeur mondial d'avions de ligne derrière Airbus et Boeing, spécialisé dans le régional. Sa famille E-Jets équipe de nombreuses filiales européennes.",
  },
  {
    id: 'aero-bombardier-nationalite',
    theme: 'aeronefs',
    prompt: 'De quelle nationalité est le constructeur Bombardier ?',
    options: ['Canadienne', 'Brésilienne', 'Suédoise', 'Américaine'],
    correct: 0,
    difficulty: 2,
    explain:
      "Il a produit trains et avions, dont les CRJ. Sa CSeries, cédée à Airbus, est devenue l'A220 ; il ne fabrique plus aujourd'hui que des jets d'affaires.",
    asked: '2019',
  },
  {
    id: 'aero-dassault',
    theme: 'aeronefs',
    prompt: 'Que produit Dassault Aviation ?',
    options: [
      'Des avions de combat Rafale et des jets d’affaires Falcon',
      'Des avions de ligne moyen-courrier',
      'Des turbopropulseurs régionaux',
      'Des hélicoptères civils',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "L'entreprise remonte à Marcel Bloch, devenu Marcel Dassault après la guerre. Le Mirage, puis le Rafale, en ont fait le pilier français de l'aviation de combat.",
  },
  {
    id: 'aero-airbus-siege',
    theme: 'aeronefs',
    prompt: 'Où se trouve le siège d’Airbus ?',
    options: ['À Toulouse', 'À Hambourg', 'À Paris', 'À Madrid'],
    correct: 0,
    difficulty: 2,
    explain:
      "Toulouse assemble les A320, A330 et A350 ; Hambourg une partie des A320 et les A321. La production est répartie entre France, Allemagne, Espagne et Royaume-Uni.",
  },
  {
    id: 'aero-boeing-siege',
    theme: 'aeronefs',
    prompt: 'Où les Boeing 777 et 787 sont-ils assemblés ?',
    options: [
      'À Everett et Charleston, aux États-Unis',
      'À Seattle et Montréal',
      'À Wichita et Toronto',
      'À Long Beach et Dallas',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'usine d'Everett, dans l'État de Washington, est le plus grand bâtiment du monde en volume. Une partie de la production du 787 a été transférée en Caroline du Sud.",
  },
  {
    id: 'aero-beluga',
    theme: 'aeronefs',
    prompt: 'À quoi sert le Beluga d’Airbus ?',
    options: [
      'À transporter les tronçons d’avions entre les sites de production',
      'À transporter des passagers sur les lignes régionales',
      'À ravitailler les avions en vol',
      'À lutter contre les incendies',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Sa bosse démesurée lui donne un volume de soute unique. Il succède au Super Guppy, lui-même dérivé du Boeing 377 Stratocruiser.",
  },
  {
    id: 'aero-a400m',
    theme: 'aeronefs',
    prompt: 'Qu’est-ce que l’A400M ?',
    options: [
      'Un avion de transport militaire à quatre turbopropulseurs',
      'Un avion de ligne moyen-courrier',
      'Un ravitailleur dérivé de l’A330',
      'Un drone de surveillance',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le programme européen de transport tactique, qui remplace les Transall. Le ravitailleur dérivé de l'A330, lui, s'appelle A330 MRTT — le Phénix chez les Français.",
  },
  {
    id: 'aero-rafale',
    theme: 'aeronefs',
    prompt: 'Quel avion de combat équipe aujourd’hui l’armée de l’Air et la Marine françaises ?',
    options: ['Le Rafale', 'Le Mirage 2000 uniquement', 'Le F-16', 'L’Eurofighter Typhoon'],
    correct: 0,
    difficulty: 2,
    explain:
      "Il est dit « omnirôle » : chasse, attaque au sol, reconnaissance, dissuasion. La France s'était retirée du programme Eurofighter pour développer un appareil embarquable sur porte-avions.",
  },
  {
    id: 'aero-cargo-nose',
    theme: 'aeronefs',
    prompt: 'Quelle particularité a la version cargo du Boeing 747 ?',
    options: [
      'Son nez s’ouvre pour charger des pièces très longues',
      'Elle n’a pas de pont supérieur',
      'Elle vole sans pressurisation',
      'Elle n’a que deux moteurs',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "C'est précisément pourquoi le cockpit du 747 est perché au-dessus : Boeing avait prévu dès l'origine une reconversion cargo, persuadé que le supersonique emporterait le marché passagers.",
  },
  {
    id: 'aero-canadair',
    theme: 'aeronefs',
    prompt: 'À quoi servent les Canadair (CL-415) ?',
    options: [
      'À la lutte aérienne contre les incendies',
      'Au transport régional de passagers',
      'À la surveillance maritime',
      'À la formation des pilotes militaires',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Ils écopent en vol rasant sur un plan d'eau. En France, la base de la Sécurité civile est à Nîmes-Garons depuis le transfert de Marignane.",
  },
  {
    id: 'aero-hydravion',
    theme: 'aeronefs',
    prompt: 'Quel rôle les hydravions ont-ils joué dans l’aviation commerciale d’avant-guerre ?',
    options: [
      "Ils assuraient les longues traversées, faute de pistes assez longues",
      'Ils étaient réservés au courrier militaire',
      'Ils servaient uniquement à la formation',
      'Ils n’ont jamais été utilisés commercialement',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Les Clippers de la Pan Am et les Latécoère de l'Aéropostale se posaient sur l'eau, disponible partout et sans limite de longueur. La construction de vraies pistes pendant la guerre les a rendus inutiles.",
  },
  {
    id: 'aero-vtol-helicoptere',
    theme: 'aeronefs',
    prompt: 'À quoi sert le rotor de queue d’un hélicoptère classique ?',
    options: [
      'À compenser le couple du rotor principal et à contrôler le lacet',
      'À fournir une partie de la portance',
      'À freiner en descente',
      'À refroidir la transmission',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Sans lui, le fuselage tournerait en sens inverse du rotor. Les formules à rotors contrarotatifs, comme le Kamov, s'en passent parce que les couples s'annulent entre eux.",
  },
  {
    id: 'aero-drone-uas',
    theme: 'aeronefs',
    prompt: 'Quel est le principal enjeu réglementaire des drones pour l’aviation commerciale ?',
    options: [
      'Leur intégration sûre dans un espace aérien partagé',
      'Leur consommation de carburant',
      'Leur bruit au décollage',
      'Leur autonomie limitée',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Un drone aux abords d'un aéroport ferme la plateforme : Gatwick a été paralysé en décembre 2018. Détection, identification à distance et zones d'exclusion sont devenues des sujets majeurs.",
  },
  {
    id: 'aero-superconstellation',
    theme: 'aeronefs',
    prompt: 'Qu’est-ce qu’un Super Constellation ?',
    options: [
      "Un quadrimoteur à hélices d'après-guerre, vite supplanté par les jets",
      'Un quadriréacteur des années 1960',
      'Un hydravion transatlantique des années 1930',
      'Un bombardier stratégique américain',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Version allongée du Constellation de Lockheed. Il régnait sur l'Atlantique nord jusqu'à ce que le Boeing 707 divise par deux les temps de vol, en 1958.",
    asked: '2018',
  },
  {
    id: 'aero-mig21',
    theme: 'aeronefs',
    prompt: 'Parmi ces appareils, lequel n’était PAS à réaction ?',
    options: ['Le Douglas DC-7', 'Le De Havilland Comet', 'Le Boeing 707', 'Le MiG-21'],
    correct: 0,
    difficulty: 4,
    explain:
      "Le DC-7 était un quadrimoteur à pistons, dernier de sa lignée avant l'ère du jet. Le Lockheed L-188 Electra, autre piège classique, était un quadri-turbopropulseur.",
    asked: '2018',
  },
  {
    id: 'aero-a220-origine',
    theme: 'aeronefs',
    prompt: 'D’où vient l’Airbus A220 ?',
    options: [
      'De la CSeries conçue par Bombardier, reprise par Airbus en 2018',
      "D'un développement Airbus entièrement nouveau",
      "D'une version raccourcie de l'A320",
      'D’un programme commun avec Embraer',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Bombardier avait un excellent avion sans la surface commerciale pour le vendre. Airbus a pris le contrôle du programme pour un dollar symbolique — et l'a transformé en succès.",
  },
  {
    id: 'aero-a350-composite',
    theme: 'aeronefs',
    prompt: 'Quelle est la principale innovation structurelle de l’A350 et du 787 ?',
    options: [
      'Un fuselage largement en composite carbone',
      'Une aile entièrement métallique renforcée',
      "L'abandon de la pressurisation cabine",
      'Un train d’atterrissage escamotable en composite',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Plus léger et insensible à la corrosion, le carbone autorise une pression cabine plus forte et une humidité plus élevée — le confort ressenti sur long-courrier en dépend directement.",
  },
  {
    id: 'aero-crj',
    theme: 'aeronefs',
    prompt: 'Que désigne le sigle CRJ ?',
    options: [
      'Canadair Regional Jet',
      'Compact Regional Jetliner',
      'Commercial Rapid Jet',
      'Cargo Regional Jet',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Dérivé du jet d'affaires Challenger, il a inventé le jet régional moderne. Longtemps exploité en France par les filiales régionales d'Air France, il en a aujourd'hui disparu.",
  },
  {
    id: 'aero-plus-gros-avion',
    theme: 'aeronefs',
    prompt: 'Quel avion détenait le record de la plus grande capacité d’emport avant sa destruction en 2022 ?',
    options: ["L'Antonov An-225 Mriya", "L'Airbus A380", 'Le Boeing 747-8F', "L'Antonov An-124"],
    correct: 0,
    difficulty: 4,
    explain:
      "Construit pour transporter la navette soviétique Bourane, six réacteurs et 32 roues. Il a été détruit au sol en Ukraine, sur l'aérodrome d'Hostomel, en février 2022.",
  },
];
