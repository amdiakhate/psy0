import type { CultureEntry } from '../types';

/**
 * Météorologie.
 *
 * Deux règles couvrent la moitié du thème et méritent d'être sues à la lettre :
 * la nomenclature des nuages (cirro- = haut, alto- = moyen, rien = bas ;
 * -nimbus = qui précipite) et l'atmosphère standard (15 °C et 1013,25 hPa au
 * niveau de la mer, −2 °C par 1 000 ft). Les annales 2018 et 2019 en tirent
 * plusieurs questions chacune.
 */
export const meteo: CultureEntry[] = [
  {
    id: 'meteo-isa-sol',
    theme: 'meteo',
    prompt: 'En atmosphère standard (ISA), quelles sont les conditions au niveau de la mer ?',
    options: [
      '15 °C et 1013,25 hPa',
      '0 °C et 1000 hPa',
      '20 °C et 1013,25 hPa',
      '15 °C et 1000 hPa',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "C'est la convention qui rend les performances comparables d'un avion à l'autre. Tout écart s'exprime en « ISA +10 » ou « ISA −5 », et pèse directement sur les distances de décollage.",
  },
  {
    id: 'meteo-gradient-thermique',
    theme: 'meteo',
    prompt: 'Quel est le gradient thermique standard dans la troposphère ?',
    options: [
      'Environ −2 °C par 1 000 ft',
      'Environ −6 °C par 1 000 ft',
      'Environ −2 °C par 1 000 m',
      'Environ −1 °C par 1 000 ft',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Soit −6,5 °C par 1 000 m, la même chose exprimée autrement. C’est ce chiffre qui permet de calculer de tête la température standard à n’importe quel niveau.',
  },
  {
    id: 'meteo-isa-20000',
    theme: 'meteo',
    prompt: 'En atmosphère standard, quelle est la température à 20 000 ft ?',
    options: ['−25 °C', '−15 °C', '−40 °C', '−5 °C'],
    correct: 0,
    difficulty: 3,
    explain: '15 − (20 × 2) = −25 °C. La règle des −2 °C par 1 000 ft se calcule de tête en trois secondes.',
    asked: '2018',
  },
  {
    id: 'meteo-isa-15000',
    theme: 'meteo',
    prompt: 'En atmosphère standard, quelle est la température à 15 000 ft ?',
    options: ['−15 °C', '−5 °C', '−25 °C', '0 °C'],
    correct: 0,
    difficulty: 3,
    explain: '15 − (15 × 2) = −15 °C. Retenir aussi le repère du zéro : il tombe vers 7 500 ft en atmosphère standard.',
    asked: '2019',
  },
  {
    id: 'meteo-isa-5000',
    theme: 'meteo',
    prompt: 'En atmosphère standard, quelle est la température à 5 000 ft ?',
    options: ['5 °C', '−5 °C', '10 °C', '0 °C'],
    correct: 0,
    difficulty: 2,
    explain:
      '15 − (5 × 2) = 5 °C. Le repère utile qui va avec : le zéro degré standard tombe vers 7 500 ft, soit à peu près 2 300 m — l’altitude au-dessus de laquelle le givrage devient possible par temps standard.',
    asked: '2019',
  },
  {
    id: 'meteo-tropopause',
    theme: 'meteo',
    prompt: 'Qu’est-ce que la tropopause ?',
    options: [
      'La frontière entre troposphère et stratosphère, où la température cesse de décroître',
      'La couche où se forme l’ozone',
      "L'altitude maximale certifiée des avions de ligne",
      'La limite supérieure de la stratosphère',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Elle se situe vers 11 km aux latitudes moyennes, plus haut à l'équateur, beaucoup plus bas aux pôles. Les avions de ligne volent juste en dessous : air froid, peu dense, et pas de convection.",
    asked: '2018',
  },
  {
    id: 'meteo-ou-volent-avions',
    theme: 'meteo',
    prompt: 'Où volent les avions de ligne en croisière ?',
    options: [
      'Dans la troposphère, juste sous la tropopause',
      'Dans la stratosphère, bien au-dessus de la tropopause',
      'Dans la mésosphère',
      'Exactement à la tropopause en toutes latitudes',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Seul le Concorde s'installait franchement dans la stratosphère, à plus de 50 000 ft. Aux pôles, où la tropopause descend bas, un avion de ligne peut toutefois s'y trouver.",
    asked: '2018',
  },
  {
    id: 'meteo-fl-croisiere',
    theme: 'meteo',
    prompt: 'À quel niveau de vol croise généralement un avion de ligne ?',
    options: ['Entre le FL 350 et le FL 430', 'Entre le FL 100 et le FL 200', 'Au FL 600', 'Entre le FL 200 et le FL 250'],
    correct: 0,
    difficulty: 2,
    explain:
      'Soit 35 000 à 43 000 ft, entre 11 et 13 km. Plus haut on monte, moins on consomme — mais l’enveloppe de vitesse se resserre et la masse du jour limite le plafond atteignable.',
    asked: '2018',
  },
  {
    id: 'meteo-cumulonimbus',
    theme: 'meteo',
    prompt: 'Quel nuage est le plus dangereux pour l’aviation ?',
    options: ['Le cumulonimbus', 'Le stratus', 'Le cirrus', 'L’altocumulus'],
    correct: 0,
    difficulty: 1,
    explain:
      "Orage, grêle, givrage, cisaillements, courants verticaux violents : il concentre tous les dangers. Il ne se traverse pas, il se contourne — au radar, de préférence par le vent arrière.",
    asked: '2018',
  },
  {
    id: 'meteo-nuage-le-plus-haut',
    theme: 'meteo',
    prompt: 'Lequel de ces nuages se trouve le plus haut ?',
    options: ['Le cirrostratus', 'L’altocumulus', 'Le stratus', 'Le stratocumulus'],
    correct: 0,
    difficulty: 3,
    explain:
      'La nomenclature encode l’étage : « cirro- » pour l’étage supérieur, « alto- » pour le moyen, aucun préfixe pour le bas. Seul le cumulonimbus traverse les trois d’un coup.',
    asked: '2018',
  },
  {
    id: 'meteo-stratus-temps',
    theme: 'meteo',
    prompt: 'À quel temps s’attendre en présence de stratus ?',
    options: [
      'Plafond bas, brume ou brouillard, peu de vent',
      'Orages et grêle',
      'Ciel dégagé et grand vent',
      'Averses de neige et fort cisaillement',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "C'est le nuage en couche, souvent un brouillard qui s'est décollé du sol. Il se dissipe quand le soleil réchauffe ou que le vent brasse ; en attendant, il ferme les terrains.",
    asked: '2019',
  },
  {
    id: 'meteo-cumulus-beau-temps',
    theme: 'meteo',
    prompt: 'Les petits cumulus blancs d’une belle journée signalent…',
    options: [
      'de la convection thermique diurne, en général sans danger',
      'l’arrivée imminente d’un front froid',
      'une inversion de température au sol',
      'un risque de givrage sévère',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Ce sont les bulles d'air chaud qui condensent en montant : les vélivoles les cherchent. Ils se dissipent en fin de journée, sauf s'ils continuent de croître — auquel cas l'orage n'est pas loin.",
    asked: '2019',
  },
  {
    id: 'meteo-nimbo-signification',
    theme: 'meteo',
    prompt: 'Que signifie la racine « nimbus » dans le nom d’un nuage ?',
    options: [
      'Qu’il donne des précipitations',
      'Qu’il est de l’étage supérieur',
      'Qu’il est en forme de couche',
      'Qu’il est de nature glacée',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'D’où nimbostratus, la couche grise qui pleut sans discontinuer, et cumulonimbus, l’enclume orageuse. « Stratus » veut dire en couche, « cumulus » en tas, « cirrus » en filaments.',
  },
  {
    id: 'meteo-depression-sens-nord',
    theme: 'meteo',
    prompt: 'Dans l’hémisphère nord, dans quel sens tourne le vent autour d’une dépression ?',
    options: [
      'Dans le sens inverse des aiguilles d’une montre',
      'Dans le sens des aiguilles d’une montre',
      'Toujours d’ouest en est en ligne droite',
      'Cela dépend de la saison',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "La force de Coriolis dévie l'air vers la droite dans l'hémisphère nord : il s'enroule en spirale rentrante et antihoraire. Anticyclone : l'inverse exact. Dans l'hémisphère sud, tout s'inverse.",
    asked: '2018',
  },
  {
    id: 'meteo-anticyclone-sens-nord',
    theme: 'meteo',
    prompt: 'Dans l’hémisphère nord, dans quel sens tourne un anticyclone ?',
    options: [
      'Dans le sens des aiguilles d’une montre',
      'Dans le sens inverse des aiguilles d’une montre',
      'Il ne tourne pas',
      'Dans le sens des aiguilles seulement en hiver',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Air descendant qui diverge, dévié vers la droite : la rotation est horaire. D'où le temps calme et sec, mais aussi les inversions qui piègent la pollution.",
    asked: '2019',
  },
  {
    id: 'meteo-qnh-1036',
    theme: 'meteo',
    prompt: 'Le QNH est de 1036 hPa. Dans quelle situation est-on ?',
    options: [
      'Dans un anticyclone marqué',
      'Dans une dépression creuse',
      'Dans un marais barométrique',
      'Dans un front chaud',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Au-dessus de 1013 hPa on est en hautes pressions, en dessous en basses. 1036 est franchement anticyclonique ; une tempête d'hiver descend sous 980.",
    asked: '2019',
  },
  {
    id: 'meteo-hectopascal',
    theme: 'meteo',
    prompt: 'Quelle grandeur s’exprime en hectopascals ?',
    options: ['La pression', 'La température', 'La vitesse du vent', "L'humidité relative"],
    correct: 0,
    difficulty: 1,
    explain:
      '1013,25 hPa vaut environ 1 bar, ou 29,92 pouces de mercure — l’unité utilisée en Amérique du Nord, à connaître pour ne pas s’y perdre.',
    asked: '2019',
  },
  {
    id: 'meteo-point-de-rosee',
    theme: 'meteo',
    prompt: 'Que se passe-t-il quand la température rejoint le point de rosée ?',
    options: [
      "L'air est saturé : brouillard, stratus ou rosée apparaissent",
      "L'air s'assèche brutalement",
      'Le vent tourne au nord',
      'La pression chute',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "L'écart entre les deux (le spread) mesure la marge avant condensation. Un spread qui se referme en fin de nuit annonce le brouillard du petit matin.",
    asked: '2019',
  },
  {
    id: 'meteo-givrage-conditions',
    theme: 'meteo',
    prompt: 'Le givrage en vol est le plus à craindre…',
    options: [
      'entre 0 et −15 °C, dans un nuage contenant de l’eau surfondue',
      'par temps clair et très froid, sous −40 °C',
      'uniquement au sol avant le décollage',
      'dans les cirrus, faits de cristaux de glace',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Il faut de l'eau LIQUIDE à température négative : elle gèle à l'impact. Les cirrus, déjà cristallisés, ne givrent pas — les gouttelettes surfondues des cumulus, si.",
  },
  {
    id: 'meteo-inversion',
    theme: 'meteo',
    prompt: 'Qu’est-ce qu’une inversion de température ?',
    options: [
      'Une tranche où la température augmente avec l’altitude',
      'Un renversement saisonnier des vents dominants',
      'Une chute brutale de température au passage d’un front',
      'Une erreur de la sonde extérieure',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Elle bloque le brassage vertical : la pollution stagne, le brouillard persiste, et les couches se stratifient. C'est la situation des matins d'hiver clairs et froids sur Paris.",
    asked: '2019',
  },
  {
    id: 'meteo-heure-plus-fraiche',
    theme: 'meteo',
    prompt: 'À quel moment de la journée l’air est-il le plus frais ?',
    options: [
      'Peu après le lever du soleil',
      'À minuit',
      'Juste avant le coucher du soleil',
      'Au zénith',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le sol continue de rayonner sa chaleur toute la nuit ; le minimum tombe donc quand le soleil commence tout juste à compenser. C'est aussi le créneau du brouillard.",
    asked: '2019',
  },
  {
    id: 'meteo-jetstream',
    theme: 'meteo',
    prompt: 'Qu’est-ce qu’un jet-stream ?',
    options: [
      'Un courant de vent très fort au voisinage de la tropopause',
      'Le sillage turbulent d’un réacteur',
      'Un courant marin qui influence le climat',
      'Une traînée de condensation persistante',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Un ruban d'air pouvant dépasser 200 kt, d'ouest en est aux latitudes moyennes. Les compagnies le chassent vers l'est et le fuient vers l'ouest — d'où l'asymétrie des temps de vol transatlantiques.",
    asked: '2018',
  },
  {
    id: 'meteo-transat-plus-rapide',
    theme: 'meteo',
    prompt: 'Quel trajet est le plus rapide en avion de ligne ?',
    options: [
      'New York → Paris',
      'Paris → New York',
      'Les deux durent exactement le même temps',
      'Cela dépend uniquement du modèle d’avion',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le jet-stream souffle d'ouest en est : vent arrière vers l'Europe, vent de face vers l'Amérique. L'écart atteint couramment une heure sur un vol transatlantique.",
    asked: '2019',
  },
  {
    id: 'meteo-front-froid',
    theme: 'meteo',
    prompt: 'Le passage d’un front froid s’accompagne typiquement…',
    options: [
      'd’averses brutales, d’une saute de vent et d’un rafraîchissement',
      'd’une pluie continue sur plusieurs heures',
      'd’un ciel clair et d’un vent faible',
      'd’une hausse régulière de la pression sans nuages',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'air froid, plus dense, s'enfonce sous l'air chaud et le soulève violemment : cumulonimbus, grains, courte durée. Le front chaud, lui, glisse en pente douce et donne des nuages en couche et de la pluie continue.",
  },
  {
    id: 'meteo-metar',
    theme: 'meteo',
    prompt: 'Qu’est-ce qu’un METAR ?',
    options: [
      'Un message d’observation météorologique d’aérodrome',
      'Une prévision à 24 heures',
      'Un avertissement de cisaillement de vent',
      'Un bulletin de vent en altitude',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Il décrit le temps OBSERVÉ, en général toutes les demi-heures. La prévision d’aérodrome, elle, s’appelle TAF, et le message d’observation spéciale en cas de dégradation brutale, SPECI.',
  },
  {
    id: 'meteo-taf',
    theme: 'meteo',
    prompt: 'Un TAF est…',
    options: [
      'une prévision météorologique d’aérodrome',
      'une observation instantanée',
      'un relevé des vents en altitude',
      'un avis de cendres volcaniques',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Terminal Aerodrome Forecast, généralement valable 9, 24 ou 30 heures. C’est lui qui décide s’il faut emporter du carburant de dégagement.',
  },
  {
    id: 'meteo-cisaillement',
    theme: 'meteo',
    prompt: 'Qu’est-ce qu’un cisaillement de vent (wind shear) ?',
    options: [
      'Une variation brutale de direction ou de force du vent sur une courte distance',
      'Un vent constant supérieur à 40 kt',
      'Un tourbillon de bout d’aile',
      'Une inversion de température au sol',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "En approche, il fait varier la vitesse indiquée sans prévenir. Sa forme extrême, la microrafale sous orage, a détruit plusieurs avions de ligne — d'où les détecteurs embarqués et les radars au sol.",
  },
  {
    id: 'meteo-microburst',
    theme: 'meteo',
    prompt: 'Une microrafale (microburst) est…',
    options: [
      'un courant descendant violent qui s’étale au sol sous un orage',
      'une rafale de vent latéral en bord de mer',
      'un tourbillon persistant derrière un gros porteur',
      'un vent catabatique de vallée',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'avion rencontre d'abord un vent de face qui le fait monter, puis un vent arrière qui l'effondre. Le piège est de corriger la première partie : on n'a plus rien pour encaisser la seconde.",
  },
  {
    id: 'meteo-brouillard-rayonnement',
    theme: 'meteo',
    prompt: 'Comment se forme un brouillard de rayonnement ?',
    options: [
      'Par refroidissement nocturne du sol sous ciel clair et vent faible',
      'Par arrivée d’air chaud et humide sur une surface froide',
      'Par soulèvement de l’air le long d’un relief',
      'Par évaporation d’une pluie chaude',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Le sol rayonne, l'air à son contact atteint le point de rosée. Il faut du calme : trop de vent brasse et empêche la formation, pas assez et il ne se forme qu'une rosée.",
  },
  {
    id: 'meteo-vent-provenance',
    theme: 'meteo',
    prompt: 'Un vent annoncé « du 270 » vient…',
    options: ["de l'ouest", "de l'est", 'du sud', 'du nord'],
    correct: 0,
    difficulty: 2,
    explain:
      "En aéronautique, le vent est toujours nommé par sa PROVENANCE. 270 = ouest. Attention : les caps, eux, désignent une direction vers laquelle on va — d'où les inversions classiques dans les questions de vent effectif.",
  },
  {
    id: 'meteo-turbulence-claire',
    theme: 'meteo',
    prompt: 'Qu’est-ce que la turbulence en air clair (CAT) ?',
    options: [
      'Une turbulence sans nuage, souvent près des jet-streams',
      'Une turbulence provoquée par le relief',
      'La turbulence de sillage d’un autre avion',
      'La turbulence thermique de basse couche',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Invisible au radar météo, qui ne voit que les précipitations : elle surprend. C'est la principale cause de blessures de passagers non attachés en croisière.",
  },
  {
    id: 'meteo-cendres-volcaniques',
    theme: 'meteo',
    prompt: 'Pourquoi les cendres volcaniques sont-elles dangereuses pour les réacteurs ?',
    options: [
      'Elles fondent dans la chambre et se figent sur les turbines, provoquant l’extinction',
      'Elles bouchent les filtres à carburant',
      'Elles rendent le kérosène conducteur',
      'Elles augmentent la traînée de l’avion',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Le vol British Airways 9 a perdu ses quatre moteurs au-dessus de Java en 1982. L'éruption de l'Eyjafjöll a paralysé le ciel européen en avril 2010 pour la même raison.",
  },
  {
    id: 'meteo-alizes',
    theme: 'meteo',
    prompt: 'Les alizés soufflent…',
    options: [
      "d'est en ouest dans les régions tropicales",
      "d'ouest en est aux latitudes moyennes",
      'du pôle vers l’équateur en ligne droite',
      "uniquement en été dans l'hémisphère nord",
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Ils convergent vers l'équateur en étant déviés vers l'ouest par Coriolis. Ce sont eux qui ont porté les caravelles, et eux encore qui rendaient l'Aéropostale possible sur l'Atlantique sud.",
  },
  {
    id: 'meteo-zcit',
    theme: 'meteo',
    prompt: 'Que désigne le « pot au noir » redouté des pilotes de l’Aéropostale ?',
    options: [
      'La zone de convergence intertropicale, orageuse en permanence',
      'Une zone de haute pression au large du Maroc',
      'Le brouillard côtier du golfe de Gascogne',
      'Une région dépourvue de vent près des pôles',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Là où les alizés des deux hémisphères se rencontrent, l'air monte et s'organise en une barrière d'orages. C'est cette zone que Mermoz franchissait sur l'Atlantique sud — et c'est là que l'AF447 a disparu.",
  },
];
