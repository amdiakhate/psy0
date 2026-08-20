import type { CultureEntry } from '../types';

/**
 * Motorisation — le thème où l'examinateur vérifie qu'on a ouvert un capot.
 *
 * Les annales 2018 posent la question de qui monte quoi (« quels moteurs sur un
 * A320 chez Air France ? ») et celle du cycle du réacteur. Les deux se
 * préparent : la première par une table à connaître, la seconde par la logique
 * — l'air ne peut brûler qu'après avoir été comprimé.
 */
export const motorisation: CultureEntry[] = [
  {
    id: 'moteur-cycle-ordre',
    theme: 'motorisation',
    prompt: 'Dans un réacteur, dans quel ordre l’air traverse-t-il les éléments ?',
    options: [
      'Compresseur, chambre de combustion, turbine, tuyère',
      'Chambre de combustion, compresseur, turbine, tuyère',
      'Turbine, compresseur, chambre de combustion, tuyère',
      'Compresseur, turbine, chambre de combustion, tuyère',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "On comprime, on brûle, on détend, on éjecte. La turbine récupère juste ce qu'il faut d'énergie pour entraîner le compresseur ; tout le reste part en poussée par la tuyère.",
    asked: '2018',
  },
  {
    id: 'moteur-role-turbine',
    theme: 'motorisation',
    prompt: 'À quoi sert principalement la turbine d’un réacteur ?',
    options: [
      'À entraîner le compresseur',
      'À produire directement la poussée',
      'À refroidir la chambre de combustion',
      'À filtrer l’air avant l’admission',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Elle prélève une part de l'énergie des gaz chauds pour faire tourner le compresseur situé en amont — et, sur un turbofan, la soufflante. C'est ce couplage qui rend le moteur autonome une fois lancé.",
    asked: '2018',
  },
  {
    id: 'moteur-turbofan-flux',
    theme: 'motorisation',
    prompt: 'Sur un turboréacteur double flux moderne, la majorité de la poussée vient…',
    options: [
      'du flux froid, propulsé par la soufflante',
      'du flux chaud, éjecté par la tuyère',
      'des inverseurs de poussée',
      'de la détente dans la turbine',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Sur un moteur à fort taux de dilution, plus de 80 % de la poussée vient de l'énorme masse d'air froid déplacée par la soufflante. Beaucoup d'air lentement accéléré : c'est plus efficace et bien plus silencieux qu'un jet brûlant.",
  },
  {
    id: 'moteur-cfm56-a320',
    theme: 'motorisation',
    prompt: 'Quels moteurs équipent historiquement les A320 d’Air France ?',
    options: ['Deux CFM56', 'Deux GE90', 'Deux Trent 700', 'Quatre PW100'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le CFM56 est le moteur le plus vendu de l'histoire. CFM International est la coentreprise entre Safran (côté français) et General Electric ; son successeur, le LEAP, équipe les A320neo.",
    asked: '2018',
  },
  {
    id: 'moteur-ge90-b777',
    theme: 'motorisation',
    prompt: 'Quel moteur équipe les Boeing 777 d’Air France ?',
    options: ['Le GE90', 'Le CFM56', 'Le PW100', 'Le Trent XWB'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le GE90 de General Electric est le réacteur civil le plus puissant jamais construit : sa soufflante mesure plus de 3 mètres de diamètre, à peu près le fuselage d'un Boeing 737.",
    asked: '2018',
  },
  {
    id: 'moteur-atr72',
    theme: 'motorisation',
    prompt: 'Comment l’ATR 72 est-il motorisé ?',
    options: [
      'Deux turbopropulseurs Pratt & Whitney PW100',
      'Deux turboréacteurs CFM56',
      'Quatre moteurs à pistons',
      'Deux turbopropulseurs Rolls-Royce Trent',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Sur un turbopropulseur, la turbine ne sert presque plus à éjecter des gaz mais à entraîner une hélice. C'est le meilleur rendement sur étapes courtes et basse altitude, d'où son usage régional.",
    asked: '2019',
  },
  {
    id: 'moteur-trent-constructeur',
    theme: 'motorisation',
    prompt: 'Quel constructeur produit la famille de moteurs Trent ?',
    options: ['Rolls-Royce', 'General Electric', 'Pratt & Whitney', 'Safran'],
    correct: 0,
    difficulty: 2,
    explain:
      'Rolls-Royce nomme ses gros réacteurs civils d’après des rivières anglaises : Trent, Avon, Conway. Le Trent XWB est le moteur exclusif de l’A350.',
  },
  {
    id: 'moteur-genx-constructeur',
    theme: 'motorisation',
    prompt: 'Le GEnx est un réacteur produit par…',
    options: ['General Electric', 'Rolls-Royce', 'Pratt & Whitney', 'CFM International'],
    correct: 0,
    difficulty: 3,
    explain:
      'Le GEnx (« next generation ») équipe le Boeing 787 et le 747-8. Il succède au CF6, longtemps monté sur les A330 et les 747.',
    asked: '2018',
  },
  {
    id: 'moteur-cfm-coentreprise',
    theme: 'motorisation',
    prompt: 'CFM International est une coentreprise entre…',
    options: [
      'Safran et General Electric',
      'Airbus et Rolls-Royce',
      'Pratt & Whitney et MTU',
      'Safran et Rolls-Royce',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Née en 1974 pour le CFM56, elle est l’une des alliances industrielles les plus durables du secteur. Safran fabrique la partie basse pression, GE la partie haute pression.',
  },
  {
    id: 'moteur-leap',
    theme: 'motorisation',
    prompt: 'Quel moteur équipe les A320neo et une partie des Boeing 737 MAX ?',
    options: ['Le CFM LEAP', 'Le GE90', 'Le Trent 700', 'Le PW100'],
    correct: 0,
    difficulty: 3,
    explain:
      'Le LEAP succède au CFM56 avec un taux de dilution nettement plus élevé et des aubes en composite : environ 15 % de carburant en moins. Sur A320neo il concurrence le PW1100G de Pratt & Whitney.',
  },
  {
    id: 'moteur-trentxwb-a350',
    theme: 'motorisation',
    prompt: 'Quel réacteur motorise l’Airbus A350 ?',
    options: ['Le Rolls-Royce Trent XWB', 'Le GE90', 'Le CFM56', 'Le PW4000'],
    correct: 0,
    difficulty: 3,
    explain:
      'L’A350 est le seul gros Airbus à moteur unique imposé : Rolls-Royce en a l’exclusivité, contrairement à l’A330 ou au 777 où la compagnie choisit son motoriste.',
  },
  {
    id: 'moteur-dc3-pistons',
    theme: 'motorisation',
    prompt: 'Combien de moteurs a un DC-3, et de quel type ?',
    options: [
      'Deux moteurs à pistons',
      'Quatre moteurs à pistons',
      'Deux turbopropulseurs',
      'Deux turboréacteurs',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le DC-3 (1935) est un bimoteur à hélices, moteurs en étoile. Il a rendu le transport aérien rentable sans subvention postale et vole encore aujourd'hui sous certaines latitudes.",
    asked: '2018',
  },
  {
    id: 'moteur-kerosene',
    theme: 'motorisation',
    prompt: 'Le kérosène ressemble le plus à…',
    options: ['du pétrole peu raffiné', 'de l’essence sans plomb', 'de l’alcool', 'du gazole additivé'],
    correct: 0,
    difficulty: 3,
    explain:
      'C’est une coupe pétrolière intermédiaire, proche du pétrole lampant, moins volatile que l’essence. Le Jet A-1 gèle vers −47 °C, contrainte réelle sur les vols polaires longs.',
    asked: '2018',
  },
  {
    id: 'moteur-jeta1',
    theme: 'motorisation',
    prompt: 'Quel carburant est utilisé par les avions de ligne ?',
    options: ['Le Jet A-1', "L'AVGAS 100LL", 'Le gazole routier', 'Le GPL'],
    correct: 0,
    difficulty: 2,
    explain:
      'Le Jet A-1 est le kérosène standard de l’aviation commerciale. L’AVGAS 100LL est une essence aviation réservée aux petits moteurs à pistons — les deux ne sont jamais interchangeables.',
  },
  {
    id: 'moteur-apu',
    theme: 'motorisation',
    prompt: 'À quoi sert l’APU d’un avion de ligne ?',
    options: [
      'À fournir électricité et air au sol, et à démarrer les réacteurs',
      'À propulser l’avion au roulage',
      'À pressuriser la cabine en croisière',
      'À alimenter les inverseurs de poussée',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "L'Auxiliary Power Unit est une petite turbine, généralement dans le cône de queue. Elle rend l'avion autonome au parking et peut, sur certains modèles, servir de secours en vol.",
  },
  {
    id: 'moteur-etops',
    theme: 'motorisation',
    prompt: 'Que désigne la certification ETOPS ?',
    options: [
      'Le temps de vol maximal autorisé, sur un moteur, jusqu’à un terrain de dégagement',
      'La procédure d’évacuation d’urgence',
      'Le seuil de bruit autorisé au décollage',
      'La durée de vie certifiée d’un réacteur',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Elle a rendu possible la traversée de l'Atlantique par des biréacteurs. Un ETOPS 180 autorise à s'éloigner de 3 heures d'un terrain — ce qui a condamné commercialement les quadriréacteurs.",
  },
  {
    id: 'moteur-fadec',
    theme: 'motorisation',
    prompt: 'Que fait le FADEC ?',
    options: [
      'Il régule électroniquement le moteur en fonction de la manette et des conditions',
      'Il détecte les incendies moteur',
      'Il commande l’ouverture des inverseurs de poussée',
      'Il mesure la consommation de carburant',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Full Authority Digital Engine Control : le pilote demande une poussée, le calculateur choisit le débit de carburant et protège le moteur du survitesse et de la surchauffe. Plus personne ne « règle » un réacteur à la main.",
  },
  {
    id: 'moteur-pompage',
    theme: 'motorisation',
    prompt: 'Qu’est-ce que le pompage (surge) d’un réacteur ?',
    options: [
      'Un décrochage de l’écoulement dans le compresseur, avec refoulement violent',
      'Une pompe carburant en panne',
      'Une vibration normale au ralenti',
      'Un excès de pression dans le réservoir',
    ],
    correct: 0,
    difficulty: 5,
    explain:
      'L’air refoule vers l’avant dans un bang caractéristique, avec flammes à l’admission. Les vannes de décharge et les aubes à calage variable existent précisément pour l’éviter.',
  },
  {
    id: 'moteur-ingestion-oiseau',
    theme: 'motorisation',
    prompt: 'Quel événement a causé l’amerrissage du vol US Airways 1549 sur l’Hudson en 2009 ?',
    options: [
      'Une double ingestion d’oiseaux',
      'Une panne électrique totale',
      'Un incendie en soute',
      'Une rupture de commande de vol',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Un vol de bernaches a éteint les deux CFM56 de l'A320 peu après le décollage de LaGuardia. Chesley Sullenberger s'est posé sur le fleuve : 155 survivants, et un cas d'école sur la gestion du temps disponible.",
  },
  {
    id: 'moteur-heure-conso-a320',
    theme: 'motorisation',
    prompt: 'Un A320 consomme en croisière, en ordre de grandeur…',
    options: [
      'environ 2,5 tonnes de carburant par heure',
      'environ 10 tonnes par heure',
      'environ 300 kg par heure',
      'environ 25 tonnes par heure',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Ordre de grandeur à retenir : quelques tonnes/heure sur monocouloir, une dizaine sur gros-porteur. Rapporté au passager, cela donne environ 3 litres aux 100 km — le chiffre que les compagnies aiment citer.",
  },
  {
    id: 'moteur-helice-pas-variable',
    theme: 'motorisation',
    prompt: 'À quoi sert une hélice à pas variable ?',
    options: [
      'À garder un bon rendement à toutes les vitesses',
      'À augmenter le diamètre de l’hélice en vol',
      'À inverser le sens de rotation en descente',
      'À réduire le bruit au parking',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Comme une boîte de vitesses : petit pas pour arracher au décollage, grand pas en croisière. En panne moteur on met l'hélice « en drapeau » pour annuler sa traînée.",
  },
  {
    id: 'moteur-drapeau',
    theme: 'motorisation',
    prompt: 'Mettre une hélice « en drapeau » consiste à…',
    options: [
      'aligner les pales avec le vent relatif pour annuler leur traînée',
      'les faire tourner au régime maximal',
      'les bloquer mécaniquement en position verticale',
      'inverser leur pas pour freiner',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Une hélice arrêtée mais en travers du vent freine énormément et déséquilibre un bimoteur. En drapeau, elle ne présente plus que la tranche : c’est le premier geste après une panne moteur.',
  },
  {
    id: 'moteur-turbopropulseur-vs-turboreacteur',
    theme: 'motorisation',
    prompt: 'Un turbopropulseur se distingue d’un turboréacteur parce que…',
    options: [
      "l'essentiel de l'énergie sert à entraîner une hélice",
      'il ne comporte pas de chambre de combustion',
      'il fonctionne sans compresseur',
      'il brûle de l’essence et non du kérosène',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Les deux partagent le même cœur : compresseur, combustion, turbine. Le turbopropulseur détend simplement les gaz beaucoup plus loin pour entraîner l'hélice, au lieu de les éjecter.",
  },
  {
    id: 'moteur-quadrireacteur-declin',
    theme: 'motorisation',
    prompt: 'Pourquoi les quadriréacteurs ont-ils disparu des lignes commerciales ?',
    options: [
      'Les biréacteurs certifiés ETOPS consomment et coûtent bien moins cher',
      'Ils étaient interdits de survol de l’Atlantique',
      'Aucun motoriste ne les produisait plus',
      'Ils ne pouvaient pas atteindre les altitudes de croisière modernes',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Deux gros moteurs sont plus économiques que quatre petits, à entretenir comme à faire voler. Air France a retiré ses A380 en 2020 et ses A340 avant eux ; le 747 a quitté la flotte en 2016.",
  },
  {
    id: 'moteur-b737-transavia',
    theme: 'motorisation',
    prompt: 'De quels avions est composée la flotte de Transavia France historiquement ?',
    options: [
      'De Boeing 737-800',
      'D’Airbus A320',
      'D’ATR 72',
      'D’Embraer 190',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Transavia, filiale low-cost du groupe, a longtemps volé exclusivement en Boeing 737-800. Elle a depuis engagé sa transition vers l'Airbus A320neo — le groupe unifiant ses flottes monocouloirs.",
    asked: '2019',
  },
  {
    id: 'moteur-poussee-unite',
    theme: 'motorisation',
    prompt: 'En quelle unité exprime-t-on couramment la poussée d’un réacteur ?',
    options: ['En livres (lbf) ou en kilonewtons', 'En chevaux', 'En kilowatts', 'En bars'],
    correct: 0,
    difficulty: 2,
    explain:
      'Un CFM56 délivre de l’ordre de 25 000 lbf, un GE90-115B environ 115 000 lbf — d’où son nom. La puissance en chevaux ne s’emploie que pour les moteurs à hélice.',
  },
  {
    id: 'moteur-bleed-air',
    theme: 'motorisation',
    prompt: 'À quoi sert l’air prélevé sur les compresseurs (bleed air) ?',
    options: [
      'À pressuriser la cabine et dégivrer les bords d’attaque',
      'À alimenter les commandes de vol',
      'À refroidir les freins',
      'À produire l’électricité de bord',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Chaud et sous pression, il alimente la climatisation, la pressurisation et l'antigivrage. Le Boeing 787 a rompu avec cette architecture en électrifiant presque tout : c'est le « more electric aircraft ».",
  },
  {
    id: 'moteur-ratio-dilution',
    theme: 'motorisation',
    prompt: 'Qu’appelle-t-on taux de dilution (bypass ratio) ?',
    options: [
      'Le rapport entre le débit d’air froid et le débit d’air chaud',
      'Le rapport carburant/air dans la chambre',
      'Le rapport entre la poussée et le poids du moteur',
      'La proportion de biocarburant dans le kérosène',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Il est passé d'environ 1 sur les premiers turbofans à plus de 10 aujourd'hui. Plus il est élevé, plus le moteur est économe et silencieux — mais plus la nacelle est encombrante.",
  },
  {
    id: 'moteur-postcombustion',
    theme: 'motorisation',
    prompt: 'La postcombustion (réchauffe) équipe principalement…',
    options: [
      'les avions de combat et le Concorde',
      'tous les avions de ligne modernes',
      'les turbopropulseurs régionaux',
      'les hélicoptères lourds',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "On réinjecte du carburant dans la tuyère : la poussée bondit, la consommation aussi. Le Concorde l'utilisait au décollage et pour passer le mur du son, jamais en croisière supersonique stabilisée.",
  },
  {
    id: 'moteur-saf',
    theme: 'motorisation',
    prompt: 'Que désigne le sigle SAF dans l’aviation d’aujourd’hui ?',
    options: [
      'Sustainable Aviation Fuel, carburant d’aviation durable',
      'Système d’Alerte de Fumée',
      'Safety Assessment Framework',
      'Société Aéronautique Française',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Produit à partir de biomasse ou de déchets, il est mélangé au kérosène fossile sans modifier les moteurs. L'Union européenne impose des taux d'incorporation croissants depuis 2025 : un sujet d'actualité que l'examinateur peut poser.",
  },
];
