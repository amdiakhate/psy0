import type { CultureEntry } from '../types';

/**
 * Aérodynamique et mécanique du vol — le thème le plus rentable de l'épreuve.
 *
 * Les annales 2018 et 2019 en sont pleines, et pour une bonne raison : ces
 * réponses se RAISONNENT. Qui a compris que le décrochage est une affaire
 * d'incidence répond juste même sur une question jamais vue, alors qu'un
 * chiffre de flotte appris par cœur ne sert qu'une fois.
 */
export const aerodynamique: CultureEntry[] = [
  {
    id: 'aero-decrochage-incidence',
    theme: 'aerodynamique',
    prompt: 'Un avion décroche toujours à la même…',
    options: ['incidence', 'vitesse', 'assiette', 'pente'],
    correct: 0,
    difficulty: 2,
    explain:
      "Le décrochage survient quand l'écoulement se décolle de l'extrados, ce qui dépend de l'angle entre l'aile et le vent relatif — l'incidence. La vitesse de décrochage, elle, change avec la masse, le facteur de charge et la configuration : c'est une conséquence, pas la cause.",
    asked: '2018',
  },
  {
    id: 'aero-assiette-pente-incidence',
    theme: 'aerodynamique',
    prompt: "Quelle relation lie l'assiette, la pente et l'incidence ?",
    options: [
      'assiette = pente + incidence',
      'incidence = assiette + pente',
      'pente = assiette + incidence',
      'assiette = pente − incidence',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "L'assiette est l'angle de l'axe de l'avion avec l'horizon, la pente celui de sa trajectoire avec l'horizon, l'incidence celui entre l'axe de l'avion et le vent relatif. L'avion « regarde » donc plus haut qu'il ne va : assiette = pente + incidence.",
    asked: '2018',
  },
  {
    id: 'aero-portance-equilibre',
    theme: 'aerodynamique',
    prompt: 'En vol rectiligne stabilisé, la portance équilibre…',
    options: ['le poids', 'la traînée', 'la traction', 'le facteur de charge'],
    correct: 0,
    difficulty: 1,
    explain:
      'Les quatre forces s’équilibrent deux à deux : portance contre poids (vertical), traction contre traînée (horizontal).',
    asked: '2019',
  },
  {
    id: 'aero-extrados-depression',
    theme: 'aerodynamique',
    prompt: 'Sur une aile en vol, où règne la dépression ?',
    options: [
      "Sur l'extrados (dessus)",
      "Sur l'intrados (dessous)",
      'Sur les deux faces également',
      'Au bord de fuite uniquement',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "L'air accélère au-dessus de l'aile, donc sa pression y chute : l'extrados aspire l'avion vers le haut. L'intrados est en légère surpression et le pousse. L'essentiel de la portance vient de l'extrados.",
    asked: '2019',
  },
  {
    id: 'aero-spoilers',
    theme: 'aerodynamique',
    prompt: 'À quoi servent les spoilers (aérofreins) ?',
    options: [
      'À détruire de la portance et augmenter la traînée',
      'À augmenter la portance à basse vitesse',
      'À compenser le lacet inverse',
      'À réduire la traînée en croisière',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Ils cassent l'écoulement sur l'extrados. En descente ils augmentent la pente sans accélérer, à l'atterrissage ils plaquent l'avion au sol pour que les freins mordent, et sortis d'un seul côté ils aident au roulis.",
    asked: '2018',
  },
  {
    id: 'aero-slats',
    theme: 'aerodynamique',
    prompt: "Que font les becs de bord d'attaque (slats) ?",
    options: [
      "Ils augmentent l'incidence maximale, donc abaissent la vitesse de décrochage",
      'Ils augmentent fortement la traînée pour freiner',
      "Ils déplacent le centre de gravité vers l'avant",
      'Ils annulent le lacet inverse en virage',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le bec recolle l'écoulement sur l'extrados et repousse le décrochage vers une incidence plus élevée. Contrairement aux volets, il augmente très peu la traînée — d'où sa sortie dès le décollage.",
    asked: '2018',
  },
  {
    id: 'aero-volets-role',
    theme: 'aerodynamique',
    prompt: 'À quoi servent les volets hypersustentateurs ?',
    options: [
      'À abaisser la vitesse de décrochage pour voler plus lentement',
      'À augmenter la vitesse maximale en croisière',
      'À stabiliser l’avion en lacet',
      'À refroidir les freins après l’atterrissage',
    ],
    correct: 0,
    difficulty: 1,
    explain:
      "Ils augmentent la courbure et parfois la surface de l'aile : à masse égale, l'avion vole plus lentement sans décrocher. Le prix à payer est une traînée nettement plus forte.",
    asked: '2018',
  },
  {
    id: 'aero-volets-decollage-atterrissage',
    theme: 'aerodynamique',
    prompt: 'Les volets sont-ils plus sortis au décollage ou à l’atterrissage ?',
    options: [
      'À l’atterrissage (≈ 40°) qu’au décollage (≈ 10°)',
      'Au décollage, pour arracher l’avion du sol',
      'Autant dans les deux cas',
      'Ils ne sont jamais sortis au décollage',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Au décollage on cherche un compromis : assez de portance, pas trop de traînée, parce qu'il faut accélérer et monter. À l'atterrissage on veut freiner : la traînée devient un avantage, on sort tout.",
    asked: '2019',
  },
  {
    id: 'aero-ailerons-droite',
    theme: 'aerodynamique',
    prompt: 'On braque le manche à droite. Que font les ailerons ?',
    options: [
      'L’aileron droit monte, le gauche descend',
      'L’aileron droit descend, le gauche monte',
      'Les deux montent',
      'Les deux descendent',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "L'aileron qui monte détruit de la portance de son côté : l'aile droite s'affaisse, l'avion s'incline à droite. Les ailerons travaillent toujours en opposition.",
    asked: '2018',
  },
  {
    id: 'aero-profondeur-piquer',
    theme: 'aerodynamique',
    prompt: 'On pousse le manche vers l’avant. Que fait la gouverne de profondeur ?',
    options: [
      'Elle se braque vers le bas, la queue monte et le nez pique',
      'Elle se braque vers le haut, la queue monte et le nez pique',
      'Elle se braque vers le bas, le nez se cabre',
      'Elle reste neutre, seul le trim agit',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Braquée vers le bas, la profondeur crée une portance vers le haut à l'arrière : la queue monte, donc le nez descend. Le manche commande la queue, et la queue commande le nez — toujours en sens inverse.",
    asked: '2018',
  },
  {
    id: 'aero-palonnier-droit',
    theme: 'aerodynamique',
    prompt: 'On appuie sur le palonnier droit. Que se passe-t-il ?',
    options: [
      'La gouverne de direction pivote à droite et le nez part à droite',
      'La gouverne de direction pivote à gauche et le nez part à droite',
      'L’avion s’incline à droite sans changer de cap',
      'Rien : le palonnier ne sert qu’au sol',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le palonnier agit sur l'axe de lacet via la dérive. En vol il sert surtout à garder la bille centrée, pas à tourner : un virage se fait à l'inclinaison, le pied ne fait qu'accompagner.",
    asked: '2018',
  },
  {
    id: 'aero-lacet-inverse',
    theme: 'aerodynamique',
    prompt: 'Qu’est-ce que le lacet inverse ?',
    options: [
      'Le nez part du côté opposé au virage, à cause de la traînée de l’aileron baissé',
      'Le nez part du côté du virage plus vite que prévu',
      'Une oscillation en lacet amortie par le yaw damper',
      'La tendance de l’avion à revenir en ligne droite',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'aileron baissé porte plus, donc traîne plus. Le côté extérieur au virage freine davantage et tire le nez à contresens. C'est pour cela qu'on met du pied à l'entrée de virage.",
    asked: '2018',
  },
  {
    id: 'aero-facteur-de-charge',
    theme: 'aerodynamique',
    prompt: 'On tire sur le manche. Que fait le facteur de charge ?',
    options: ['Il augmente', 'Il diminue', 'Il reste à 1', 'Il devient négatif'],
    correct: 0,
    difficulty: 2,
    explain:
      "Le facteur de charge est le rapport portance/poids, le fameux « nombre de G ». Cabrer ou virer demande plus de portance : les G montent et on est plaqué au siège. Pousser les fait chuter, jusqu'à la sensation de flotter.",
    asked: '2019',
  },
  {
    id: 'aero-virage-vitesse-decrochage',
    theme: 'aerodynamique',
    prompt: 'En virage à forte inclinaison, la vitesse de décrochage…',
    options: [
      'augmente, car le facteur de charge augmente',
      'diminue, car la portance augmente',
      'ne change pas, elle ne dépend que de la masse',
      'devient nulle au-delà de 60° d’inclinaison',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'La vitesse de décrochage croît comme la racine du facteur de charge. À 60° d’inclinaison, n = 2 et elle est multipliée par environ 1,41 — d’où les virages serrés à basse vitesse, cause classique d’accident.',
  },
  {
    id: 'aero-buffeting',
    theme: 'aerodynamique',
    prompt: 'Qu’est-ce que le buffeting ?',
    options: [
      'Un tremblement dû à un écoulement décollé, souvent annonciateur du décrochage',
      'Une vibration du train à l’atterrissage',
      'Le battement des volets en sortie',
      'Une oscillation en lacet propre aux flèches',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "L'air décollé de l'aile frappe l'empennage en tourbillons : l'avion tremble. C'est un avertisseur naturel de décrochage, doublé sur avion de ligne par le stick shaker.",
    asked: '2018',
  },
  {
    id: 'aero-centrage-avant',
    theme: 'aerodynamique',
    prompt: 'Quel est l’effet d’un centrage très avant ?',
    options: [
      'L’avion est plus stable mais consomme plus',
      'L’avion est plus nerveux et consomme moins',
      'La vitesse de décrochage diminue',
      'Le centrage n’a aucun effet sur la consommation',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Centre de gravité en avant, l'empennage doit appuyer davantage vers le bas pour équilibrer : cette déportance coûte de la traînée, donc du carburant. Centrage arrière = avion vif, moins gourmand, mais moins stable.",
    asked: '2019',
  },
  {
    id: 'aero-trim',
    theme: 'aerodynamique',
    prompt: 'À quoi sert le compensateur (trim) de profondeur ?',
    options: [
      'À annuler l’effort à tenir sur le manche pour une assiette donnée',
      'À augmenter le braquage maximal de la profondeur',
      'À bloquer les gouvernes au parking',
      'À corriger le lacet inverse en virage',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      'Le trim déplace la position d’équilibre de la gouverne : l’avion tient son assiette tout seul. Un avion mal trimé fatigue le pilote et masque les évolutions de vitesse.',
  },
  {
    id: 'aero-dutch-roll',
    theme: 'aerodynamique',
    prompt: 'Quel système combat le roulis hollandais (dutch roll) sur avion de ligne ?',
    options: ['Le yaw damper', 'Le stick shaker', 'Le mach trim', 'Le ground spoiler'],
    correct: 0,
    difficulty: 4,
    explain:
      'Le roulis hollandais est une oscillation couplée roulis-lacet, favorisée par la flèche de l’aile. L’amortisseur de lacet agit en permanence sur la dérive pour l’étouffer.',
  },
  {
    id: 'aero-effet-de-sol',
    theme: 'aerodynamique',
    prompt: 'Qu’est-ce que l’effet de sol ?',
    options: [
      'Près du sol, la traînée induite chute et l’avion « flotte »',
      'Le sol renvoie de la chaleur qui dégrade la portance',
      'Le vent tourne toujours près du sol',
      'Les freins sont moins efficaces sur piste chaude',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "À moins d'une envergure du sol, les tourbillons marginaux sont bridés : la traînée induite s'effondre. L'avion porte mieux pour moins d'effort — c'est ce qui rend l'arrondi délicat.",
  },
  {
    id: 'aero-trainee-induite',
    theme: 'aerodynamique',
    prompt: 'La traînée induite est maximale…',
    options: [
      'à basse vitesse et forte incidence',
      'à grande vitesse en croisière',
      'au point fixe, moteurs plein régime',
      'quand les aérofreins sont sortis',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Elle est le prix de la portance : plus l'aile travaille fort (donc lentement, à forte incidence), plus les tourbillons de bout d'aile sont violents. La traînée de forme, elle, croît avec le carré de la vitesse — d'où la courbe en U et la vitesse de finesse maximale au creux.",
  },
  {
    id: 'aero-winglets',
    theme: 'aerodynamique',
    prompt: 'À quoi servent les winglets (sharklets) en bout d’aile ?',
    options: [
      'À réduire les tourbillons marginaux, donc la traînée induite',
      'À augmenter la surface alaire au décollage',
      'À loger les feux de navigation',
      'À stabiliser l’avion en lacet comme une dérive',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "L'air passe de l'intrados en surpression vers l'extrados en dépression en contournant le bout d'aile : cela crée un tourbillon coûteux. Le winglet gêne ce contournement et fait gagner quelques pourcents de carburant.",
  },
  {
    id: 'aero-turbulence-de-sillage',
    theme: 'aerodynamique',
    prompt: 'La turbulence de sillage d’un gros porteur est la plus forte quand celui-ci est…',
    options: [
      'lourd, lent et lisse (volets rentrés)',
      'léger, rapide et volets sortis',
      'au roulage, moteurs au ralenti',
      'en descente aérofreins sortis',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Moyen mnémotechnique : « heavy, slow, clean ». Une aile lourde et lente travaille à forte incidence, donc génère des tourbillons puissants — d’où les minima de séparation derrière un A380 ou un B777.',
  },
  {
    id: 'aero-mach-critique',
    theme: 'aerodynamique',
    prompt: 'Qu’appelle-t-on nombre de Mach critique ?',
    options: [
      'Le Mach de vol où l’écoulement atteint localement Mach 1 sur l’aile',
      'Le Mach maximal certifié de l’avion',
      'Le Mach au-delà duquel le machmètre est inutilisable',
      'Le Mach de décrochage à haute altitude',
    ],
    correct: 0,
    difficulty: 5,
    explain:
      "L'air accélère sur l'extrados : bien avant que l'avion n'atteigne Mach 1, une zone supersonique y apparaît, avec onde de choc, traînée d'onde et tremblement. La flèche de l'aile sert précisément à repousser ce seuil.",
  },
  {
    id: 'aero-fleche-aile',
    theme: 'aerodynamique',
    prompt: 'Pourquoi les avions de ligne ont-ils une aile en flèche ?',
    options: [
      'Pour retarder les effets de compressibilité et voler plus vite',
      'Pour augmenter la portance au décollage',
      'Pour loger davantage de carburant',
      'Pour réduire le bruit en cabine',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Seule la composante de vitesse perpendiculaire au bord d'attaque compte pour la compressibilité : incliner l'aile la réduit. On gagne en Mach, on perd en portance à basse vitesse — d'où l'artillerie de becs et volets.",
  },
  {
    id: 'aero-vitesse-v1',
    theme: 'aerodynamique',
    prompt: 'Que représente la vitesse V1 au décollage ?',
    options: [
      'La vitesse de décision : au-delà, on ne s’arrête plus',
      'La vitesse à laquelle on tire sur le manche',
      'La vitesse de sécurité au décollage sur un moteur',
      'La vitesse maximale volets sortis',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Avant V1, la piste restante permet encore de s'arrêter. Après, elle ne le permet plus : on décolle, panne ou pas. Vr est la vitesse de rotation, V2 la vitesse de sécurité au décollage.",
    asked: '2019',
  },
  {
    id: 'aero-vr-v2',
    theme: 'aerodynamique',
    prompt: 'Dans quel ordre se succèdent les vitesses au décollage ?',
    options: ['V1, puis Vr, puis V2', 'V2, puis V1, puis Vr', 'Vr, puis V1, puis V2', 'V1, puis V2, puis Vr'],
    correct: 0,
    difficulty: 3,
    explain:
      'Décision (V1), rotation (Vr), sécurité au décollage (V2). Sur A320, ordres de grandeur : environ 120, 140 puis 150 kt selon masse, température et piste.',
    asked: '2019',
  },
  {
    id: 'aero-vso-vne',
    theme: 'aerodynamique',
    prompt: 'Sur un anémomètre, que marque le début de l’arc blanc ?',
    options: [
      'La vitesse de décrochage volets sortis (Vso)',
      'La vitesse de décrochage volets rentrés (Vs1)',
      'La vitesse à ne jamais dépasser (Vne)',
      'La vitesse de manœuvre (Va)',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "L'arc blanc est la plage d'utilisation des volets : il commence à Vso et finit à Vfe. L'arc vert commence à Vs1, le trait rouge marque Vne.",
  },
  {
    id: 'aero-vent-arriere-decollage',
    theme: 'aerodynamique',
    prompt: 'Quel vent est le plus pénalisant au décollage ?',
    options: ['Le vent arrière', 'Le vent de face', 'Le vent de travers', 'Aucun, le vent est neutre'],
    correct: 0,
    difficulty: 1,
    explain:
      "Le vent arrière allonge la distance de roulage, dégrade la pente de montée et ruine le freinage en cas d'arrêt-décollage. Le vent de face fait exactement l'inverse : c'est le plus favorable.",
    asked: '2019',
  },
  {
    id: 'aero-pression-perfs',
    theme: 'aerodynamique',
    prompt: 'Quel est l’effet d’une pression atmosphérique élevée sur les performances au décollage ?',
    options: [
      'Elles s’améliorent : l’air est plus dense',
      'Elles se dégradent : l’air est plus lourd à déplacer',
      'Aucun effet, seule la température compte',
      'Elles s’améliorent seulement sur avion à hélice',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Plus d'air par mètre cube : plus de portance à vitesse égale et plus de débit dans les réacteurs. Inversement, un aérodrome chaud et haut (altitude-densité forte) allonge dramatiquement les distances.",
    asked: '2018',
  },
  {
    id: 'aero-altitude-densite',
    theme: 'aerodynamique',
    prompt: 'Qu’est-ce que l’altitude-densité ?',
    options: [
      "L'altitude à laquelle l'air standard aurait la densité de l'air du jour",
      "L'altitude lue à l'altimètre calé au QNH",
      "L'altitude maximale certifiée de l'avion",
      "L'altitude de la tropopause du jour",
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "C'est la grandeur qui décide vraiment des performances. Un terrain à 1 000 m par 35 °C se comporte comme un terrain à 3 000 m en atmosphère standard : moteurs mous, hélices inefficaces, distances qui explosent.",
  },
  {
    id: 'aero-hypersustentation-vitesse',
    theme: 'aerodynamique',
    prompt: 'À masse constante, sortir les volets permet de…',
    options: [
      'voler plus lentement sans décrocher',
      'voler plus vite en croisière',
      'monter plus haut',
      'réduire la consommation',
    ],
    correct: 0,
    difficulty: 1,
    explain:
      'Volets sortis, le coefficient de portance maximal grimpe : la même masse tient en l’air à vitesse plus faible. C’est tout l’intérêt en approche, où l’on veut se poser lentement sur une piste finie.',
  },
  {
    id: 'aero-vrille',
    theme: 'aerodynamique',
    prompt: 'Une vrille est…',
    options: [
      'un décrochage dissymétrique auto-entretenu',
      'un virage à plus de 60° d’inclinaison',
      'une descente rapide en spirale à incidence faible',
      'une oscillation en lacet due à la flèche',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Une aile décroche avant l’autre : l’avion part en autorotation, très cabré, à vitesse faible et fort taux de chute. La sortie passe par la réduction de l’incidence, pas par le manche tiré.',
  },
  {
    id: 'aero-stall-warning',
    theme: 'aerodynamique',
    prompt: 'Quelle action sort un avion d’un décrochage ?',
    options: [
      "Rendre la main pour réduire l'incidence",
      'Tirer sur le manche pour reprendre de la hauteur',
      'Sortir les aérofreins',
      'Mettre du pied du côté de l’aile basse',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Le décrochage est une affaire d'incidence : il faut la faire redescendre, donc pousser, quitte à perdre de la hauteur. Tirer, réflexe naturel, aggrave tout — c'est le scénario du vol AF447.",
  },
  {
    id: 'aero-portance-formule',
    theme: 'aerodynamique',
    prompt: 'Si la vitesse double, la portance (à incidence constante) est multipliée par…',
    options: ['4', '2', '8', '1,41'],
    correct: 0,
    difficulty: 3,
    explain:
      'La portance varie comme le carré de la vitesse (½ρSV²Cz). Doubler la vitesse la quadruple — et c’est aussi pourquoi la traînée explose en haute vitesse.',
  },
  {
    id: 'aero-finesse',
    theme: 'aerodynamique',
    prompt: 'Que désigne la finesse d’un planeur ou d’un avion ?',
    options: [
      'Le rapport portance/traînée, soit la distance parcourue par unité de hauteur perdue',
      'Le rapport masse/surface alaire',
      "L'épaisseur relative du profil d'aile",
      'Le rapport poussée/poids au décollage',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      'Une finesse de 17 signifie 17 km parcourus pour 1 km perdu, moteur coupé. C’est la grandeur qui décide du plané après une panne — et un A320 en tire environ 17, un planeur moderne plus de 50.',
  },
  {
    id: 'aero-vitesse-plafond',
    theme: 'aerodynamique',
    prompt: 'Qu’appelle-t-on « coffin corner » à haute altitude ?',
    options: [
      'Le point où la vitesse de décrochage rejoint la limite de Mach',
      'Le coin de la cabine réservé à l’équipage de renfort',
      'La zone où le pilote automatique se déconnecte',
      'Le plafond au-delà duquel la pressurisation lâche',
    ],
    correct: 0,
    difficulty: 5,
    explain:
      "En montant, la vitesse vraie de décrochage augmente pendant que la vitesse limite en Mach diminue. Les deux se rejoignent : l'enveloppe se referme, et il n'y a plus de vitesse sûre.",
  },
  {
    id: 'aero-dieder',
    theme: 'aerodynamique',
    prompt: 'À quoi sert le dièdre (ailes relevées vers l’extrémité) ?',
    options: [
      'À rendre l’avion stable en roulis',
      'À augmenter la portance au décollage',
      'À réduire la traînée en croisière',
      'À loger le train principal',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Si l'avion s'incline, l'aile basse voit une incidence plus forte et porte davantage : elle se relève d'elle-même. C'est de la stabilité gratuite, sans intervention du pilote.",
  },
  {
    id: 'aero-fly-by-wire',
    theme: 'aerodynamique',
    prompt: 'Que désigne le « fly-by-wire » ?',
    options: [
      'Des commandes de vol électriques passant par des calculateurs',
      'Un pilote automatique de croisière',
      'Un système de transmission radio des paramètres au sol',
      'Le câblage mécanique classique par câbles et poulies',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Le manche envoie un ordre électrique ; les calculateurs le traduisent en braquages, en respectant des protections d'enveloppe. L'A320 fut le premier avion de ligne civil à en être équipé, en 1988.",
  },
  {
    id: 'aero-gouvernes-energie',
    theme: 'aerodynamique',
    prompt: 'Quelle énergie actionne les gouvernes d’un avion de ligne moderne ?',
    options: [
      "L'hydraulique (avec relais électriques sur les derniers modèles)",
      'La force musculaire du pilote seule',
      'Un système pneumatique prélevé sur les réacteurs',
      'Des vérins à ressort',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Les efforts aérodynamiques sont bien trop grands pour un bras humain. L'hydraulique fournit la puissance ; les commandes électriques ne transportent que l'ordre.",
    asked: '2019',
  },
  {
    id: 'aero-reverse-role',
    theme: 'aerodynamique',
    prompt: 'À quel moment utilise-t-on les inverseurs de poussée (reverses) ?',
    options: [
      "Après le toucher des roues, pour freiner",
      'En finale, pour descendre plus vite',
      'Au décollage, pour arracher l’avion',
      'En croisière, pour ajuster la vitesse',
    ],
    correct: 0,
    difficulty: 1,
    explain:
      "Ils redirigent le flux vers l'avant et soulagent les freins, surtout sur piste contaminée. Leur usage en vol est interdit — un déploiement intempestif en croisière a détruit le vol Lauda Air 004 en 1991.",
    asked: '2018',
  },
  {
    id: 'aero-bille-symetrie',
    theme: 'aerodynamique',
    prompt: 'Comment contrôle-t-on la symétrie du vol ?',
    options: [
      'En gardant la bille centrée, à l’aide du palonnier',
      'En gardant l’horizon artificiel horizontal',
      'En surveillant le variomètre',
      'En comparant les deux anémomètres',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "La bille signale le dérapage : décalée, elle indique que l'avion vole en crabe, ce qui coûte de la traînée et peut mener à la vrille en virage lent. Sur avion de ligne, le yaw damper s'en charge en permanence.",
    asked: '2019',
  },
  {
    id: 'aero-cap-virage-gauche',
    theme: 'aerodynamique',
    prompt: 'On vire à gauche. Les caps affichés…',
    options: ['diminuent', 'augmentent', 'restent constants', 'passent par 360 systématiquement'],
    correct: 0,
    difficulty: 1,
    explain:
      'Les caps se comptent dans le sens des aiguilles d’une montre à partir du nord : 000 au nord, 090 à l’est, 180 au sud, 270 à l’ouest. Tourner à gauche, c’est remonter la graduation à l’envers.',
    asked: '2019',
  },
  {
    id: 'aero-vitesse-croisiere-a320',
    theme: 'aerodynamique',
    prompt: 'Quelle est la vitesse de croisière typique d’un A320 ?',
    options: ['Environ Mach 0,78', 'Environ Mach 0,55', 'Environ Mach 0,95', 'Environ Mach 1,2'],
    correct: 0,
    difficulty: 2,
    explain:
      'Soit à peu près 830 km/h de vitesse vraie en croisière. Un long-courrier moderne vole un peu plus vite, autour de Mach 0,85 ; seul le Concorde dépassait Mach 1 en ligne.',
    asked: '2018',
  },
];
