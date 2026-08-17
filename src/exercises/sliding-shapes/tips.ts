import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Traduis la règle en une seule opération : marine = 0, gris = 1. « marine+marine=marine, marine+gris=gris, gris+gris=marine » est un OU EXCLUSIF. Une case est grise à la fin si un nombre IMPAIR de formes y a posé du gris.',
    'Conséquence directe, et c’est la règle officielle : l’ordre de dépose ne change rien. Ne perds pas une seconde à chercher « par quoi commencer » — seules comptent les positions finales.',
    'Attaque par les ANCRES : cherche dans la figure à reproduire un coin ou un bord isolé qu’une seule forme peut produire (motif en L, ligne de trois, case grise seule dans son voisinage). Ces cases n’ont qu’une origine possible, elles clouent une forme.',
    'Pose la forme la plus grosse en premier dans ta tête, pas sur l’écran : elle a le moins de positions possibles, donc elle élimine le plus de branches.',
    'Après chaque dépose, compare la grille de jeu et la cible case par case, en balayant ligne par ligne. La première case qui diffère te dit où la forme suivante doit agir.',
    'S’il reste des cases grises à produire et plus de formes libres qui les couvrent, c’est qu’une forme déjà posée est mal placée : retire-la (touche du chiffre) plutôt que de bricoler avec les autres.',
    'Compte la parité pour te contrôler : additionne le nombre de cases grises de toutes les formes, retranche 2 par case recouverte deux fois. Le total doit égaler le nombre de cases grises de la cible.',
  ],
  traps: [
    'Raisonner en « peinture » au lieu de XOR : croire qu’une case grise posée sur une case grise reste grise. Elle redevient MARINE. C’est l’erreur qui coûte le plus cher dès que les formes se chevauchent.',
    'Oublier qu’une case marine de la cible peut être le résultat de DEUX formes superposées. Une zone marine au milieu du damier n’est pas forcément une zone vide : elle peut cacher un double passage.',
    'Se caler sur la case grise en haut à gauche de la forme au lieu du coin de sa boîte : si la première case du motif est marine, tu décales toute la forme d’un cran. Repère la boîte, pas la première case grise.',
    'Vouloir tourner ou retourner une forme : le test n’autorise que la TRANSLATION. Si une forme « ne rentre nulle part », c’est ta lecture de la cible qui est fausse, pas l’orientation.',
  ],
  timing: [
    'Budget 45 s par grille. Découpe : 10 s de lecture de la cible (repérer les ancres), 25 s de dépose, 10 s de vérification ligne par ligne.',
    'Le passage à la question suivante est AUTOMATIQUE dès que la grille est juste : ne perds pas de temps à re-valider, pose et avance.',
    'Si à 30 s tu tâtonnes encore, retire tout et repars de l’ancre la plus contrainte (un coin de la grille). Repartir proprement coûte moins cher que de permuter des formes au hasard.',
    'Sur les grilles 7×7 à 4 formes, ne cherche pas à tout résoudre mentalement avant de poser : pose la forme sûre, la grille de jeu fait le calcul du XOR pour toi et rétrécit le problème.',
  ],
};
