import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'La parité se lit sur le DERNIER chiffre, jamais sur le nombre entier : 9237 est impair parce qu’il finit par 7, point. C’est ce coup d’œil qui rend le tri initial instantané.',
    'Balaye la grille une seule fois et fabrique deux files : les pairs et les impairs, chacune triée par ordre croissant. Ensuite tu ne relis plus la grille, tu dépiles alternativement le sommet de chaque file.',
    'Repère le START et sa parité : il compte comme le PREMIER nombre de sa file et ne se clique pas. Ton premier clic est donc toujours dans l’autre parité.',
    'Compare par LONGUEUR d’abord, par chiffres ensuite : 96 < 291 < 2152 sans le moindre calcul. Ne compare chiffre à chiffre que des nombres de même longueur.',
    'Sur deux nombres de même parité très proches (470 / 472), lis les unités : elles seules décident. C’est le seul endroit où la comparaison mérite une demi-seconde de plus.',
    'Anticipe pendant que la main clique : dès que tu valides un nombre, ton œil doit déjà être sur le suivant de l’AUTRE file. La lenteur vient des allers-retours du regard, pas de la décision.',
    'Utilise les étiquettes clavier (1…9 puis A…E) quand la grille est dense : la main reste immobile et tu économises le trajet de la souris à chaque coup.',
  ],
  traps: [
    'Cliquer le START : c’est le point de départ, déjà acquis. Ton premier clic est de la parité opposée.',
    'Oublier l’alternance quand deux nombres de la même parité se suivent visuellement dans la grille : la disposition est un leurre, seule la file compte.',
    'Sauter un nombre parce qu’un plus gros saute aux yeux : l’ordre est croissant STRICT dans chaque catégorie — il faut le suivant immédiat, pas un nombre plus loin.',
    'Les valeurs voisines de même parité (tag close-values, 470 puis 472) et les longueurs mélangées (tag mixed-digits, 16 à côté de 2152) : le cerveau compare la largeur du nombre à l’écran plutôt que sa valeur. Lis les chiffres, pas la taille.',
  ],
  timing: [
    'Budget : 5 à 8 s de tri initial (deux files triées), puis un clic toutes les 1 à 1,5 s. Le tri n’est pas du temps perdu, c’est ce qui rend la suite mécanique.',
    'Toute erreur renvoie au START : un clic hésitant coûte bien plus cher qu’une demi-seconde de vérification. En cas de doute, relis la file concernée avant de cliquer.',
    'Après une reprise, refais le premier tiers de la chaîne lentement — tu la connais déjà. C’est la précipitation post-erreur qui déclenche la deuxième reprise.',
  ],
  examples: [
    {
      title: 'La mécanique de base : deux files croissantes qu’on dépile en alternance',
      seed: 4,
      level: 1,
      walkthrough: [
        'Tri initial : pairs = 36, 52, 60, 82 ; impairs = 41, 57, 75, 87. Le START, 36, est pair : il compte comme premier nombre de sa file et ne se clique pas.',
        'Premier clic obligatoirement chez les impairs, sur le plus petit : 41. Puis retour chez les pairs sur celui qui suit 36 : 52.',
        'La suite se dépile sans relire la grille : 57, 60, 75, 82, 87. Ici les deux files s’imbriquent parfaitement, mais ne compte jamais là-dessus : c’est l’alternance qui commande, pas l’ordre global.',
      ],
    },
    {
      title: 'Valeurs proches : 470 puis 472, deux coups d’écart',
      seed: 9,
      level: 3,
      forceTag: 'close-values',
      walkthrough: [
        'Pairs = 234, 360, 470, 472, 696 ; impairs = 425, 549, 607, 765, 803. Le START 425 est impair, donc premier clic chez les pairs : 234.',
        'On alterne : 549, 360, 607, puis 470. Attention, 470 et 472 ne diffèrent que par les unités — c’est 470 qui passe en premier, 472 attend deux coups.',
        'Fin de série : 765, 472, 803, 696. Le réflexe qui sauve ici, c’est d’avoir noté DÈS LE TRI que 470 et 472 se suivent : le piège est désamorcé avant même d’y arriver.',
      ],
    },
    {
      title: 'Longueurs mélangées : 2 chiffres et 4 chiffres dans la même grille',
      seed: 2,
      level: 5,
      forceTag: 'mixed-digits',
      walkthrough: [
        'Pairs = 14, 16, 728, 804, 830, 916, 2152 ; impairs = 13, 291, 357, 409, 507, 531, 9237. Compare par longueur : 14 < 16 < 728, et 916 < 2152 sans hésiter.',
        'Le START 13 est impair → premier clic chez les pairs : 14. Puis 291, puis 16 : deux petits pairs se suivent dans leur file, il ne faut surtout pas en sauter un.',
        'On termine par les gros : 531, 916, 9237, 2152. Le dernier impair 9237 vient AVANT le dernier pair 2152 dans la chaîne — l’ordre croissant vaut à l’intérieur de chaque file, jamais entre les deux.',
      ],
    },
  ],
};
