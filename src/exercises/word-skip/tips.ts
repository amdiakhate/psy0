import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'AVANT de cliquer quoi que ce soit, fais le tri : balaye la grille une seule fois et range mentalement chaque mot dans l’une des deux thématiques. Deux paquets, pas dix mots isolés — c’est ce tri initial qui décide de ton chrono.',
    'Repère le START et note à quelle thématique il appartient : il compte comme le PREMIER mot de sa thématique et il ne se clique pas. Ton premier clic est donc toujours dans l’AUTRE thématique.',
    'Ordonne chaque paquet alphabétiquement dans ta tête, en file d’attente. Ensuite tu ne relis plus jamais la grille entière : tu dépiles alternativement le sommet de la file A, puis le sommet de la file B.',
    'Verbalise l’alternance en deux temps (« thème A – thème B – thème A… ») pendant que tu cliques : c’est le rythme qui empêche de cliquer deux mots de suite dans la même thématique quand un mot « saute aux yeux ».',
    'Sur les mots à même initiale, compare lettre à lettre : FRISE avant FRONTON parce que FRI < FRO. Ne te fie jamais à la longueur ni à la place du mot sur l’écran.',
    'Repère à l’avance les deux ou trois derniers mots de chaque file : la fin de série est là où la fatigue fait cliquer au hasard, et une erreur en fin de chaîne coûte toute la série.',
    'Utilise les étiquettes clavier (1…9 puis A…E) quand la grille est dense : la main reste immobile, l’œil ne quitte pas la zone, et tu gagnes le trajet de la souris.',
  ],
  traps: [
    'Cliquer le START : il est déjà acquis, c’est le point de départ, pas une réponse. Ton premier clic appartient à l’autre thématique.',
    'Sauter un mot dans une thématique parce qu’un autre est plus visible : l’ordre alphabétique est strict, il faut le mot IMMÉDIATEMENT suivant de la file, jamais un mot plus loin.',
    'Les initiales identiques dans une même thématique (tag alpha-trap) : sous chrono, le cerveau valide sur la première lettre et clique le mauvais des deux. La 2e et la 3e lettre décident.',
    'Les thématiques proches (tag theme-close : Architecture / Géologie, Physique / Mathématiques…) : le tri de départ devient coûteux. Fais-le une bonne fois au début plutôt que de re-trancher à chaque clic.',
  ],
  timing: [
    'Budget : 5 à 8 s de tri initial silencieux, puis un clic toutes les 1 à 1,5 s. Le tri n’est pas du temps perdu, c’est ce qui rend la suite mécanique.',
    'Toute erreur renvoie au START : à ce prix, un clic hésitant coûte bien plus cher qu’une demi-seconde de vérification. En cas de doute, relis la file concernée avant de cliquer.',
    'Après une reprise, ne repars pas à la même vitesse : refais le premier tiers de la chaîne lentement et délibérément, tu la connais déjà — c’est la précipitation post-erreur qui déclenche la deuxième.',
  ],
  examples: [
    {
      title: 'La mécanique de base : deux files alphabétiques qu’on dépile en alternance',
      seed: 3,
      level: 1,
      forceTag: 'theme-far',
      walkthrough: [
        'Tri initial : Géologie = MAGMA, OBSIDIENNE, QUARTZ, TECTONIQUE ; Musique classique = CLAVECIN, FUGUE, OPUS, STACCATO. Le START, MAGMA, est en Géologie : il compte comme premier mot de sa file et ne se clique pas.',
        'Premier clic obligatoirement en Musique classique, sur le plus petit de sa file : CLAVECIN. Puis retour en Géologie sur le mot qui suit MAGMA : OBSIDIENNE.',
        'La suite se dépile sans relire la grille : FUGUE, QUARTZ, OPUS, TECTONIQUE, STACCATO. Deux files, un sommet chacune, et l’alternance fait le reste.',
      ],
    },
    {
      title: 'Piège d’initiales : FRISE ou FRONTON ?',
      seed: 7,
      level: 5,
      forceTag: 'theme-close',
      walkthrough: [
        'Thématiques proches (Architecture / Géologie) : fais le tri en une passe, sinon tu le referas à chaque clic. START = CORNICHE, en Architecture → premier clic en Géologie, sur BASALTE.',
        'Retour en Architecture après CORNICHE. Deux candidats commencent par F : FRISE et FRONTON. La 3e lettre tranche — FRI < FRO — donc FRISE, et FRONTON attendra son tour deux coups plus tard.',
        'Ensuite tout est mécanique : FAILLE, FRONTON, GRANITE, PIGNON, LAVE, ROTONDE, MAGMA, VOUTE, TECTONIQUE. La série se termine en Géologie parce que le START a « consommé » le premier tour d’Architecture.',
      ],
    },
    {
      title: 'Nombre impair de mots : la thématique du START en a un de plus',
      seed: 11,
      level: 3,
      forceTag: 'alpha-trap',
      walkthrough: [
        '11 mots : Médecine (celle du START, BISTOURI) en compte 6, Informatique 5. La chaîne commence ET finit donc en Médecine — sache-le avant de cliquer, ça évite de chercher un 12e mot inexistant.',
        'Premier clic en Informatique sur FICHIER, puis DIAGNOSTIC (le mot de Médecine qui suit BISTOURI), puis LOGICIEL, puis GREFFE.',
        'Vient le piège : PIXEL et PROCESSEUR partagent leur initiale. PI < PR, donc PIXEL d’abord, ORDONNANCE, PROCESSEUR, SCALPEL, TABLEUR, et VACCIN pour finir.',
      ],
    },
  ],
};
