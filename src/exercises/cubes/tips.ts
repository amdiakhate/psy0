import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Le patron de droite est le MÊME cube que celui de gauche, mais déplié dans une autre orientation. Ne compare donc jamais case à case : compare des RELATIONS entre faces.',
    'RÈGLE DES OPPOSÉES (le tri de départ) : sur le patron en croix, deux faces séparées par exactement une case dans la même ligne ou colonne sont OPPOSÉES sur le cube. Sur la barre horizontale L-F-R-B : L↔R et F↔B ; plus U↔D. Identifie les 3 paires d’opposées du patron de référence : elles ne changent JAMAIS, quelle que soit l’orientation.',
    'Utilise les paires pour placer sans plier : si un trou est opposé à une face déjà visible, la pièce qui va dedans est forcément celle qui était opposée à cette même face dans le patron de référence. Une seule pièce peut convenir.',
    'RÈGLE DU COIN 2×2 : deux faces en diagonale dans un carré 2×2 sont ADJACENTES sur le cube, et le symbole tourne d’un quart de tour par « virage » du chemin qui les relie. C’est ce qui détermine l’ORIENTATION de la pièce à poser, pas seulement son identité.',
    'Traite les trous du plus contraint au moins contraint : commence par celui dont la face opposée est déjà visible, ou celui qui touche deux faces connues. Chaque pièce posée contraint les suivantes.',
    'Les pièces arrivent À L’ENDROIT et se tournent d’un quart de tour au clic — avant la pose ou une fois posées. Tu ne reçois donc jamais l’orientation : tu la produis. Décide le sens en lisant l’arête commune avec une face voisine déjà connue, PUIS clique. Tourner au hasard jusqu’à ce que « ça ressemble » coûte quatre essais et ne prouve rien.',
    'Contrôle final avant de valider : reprends les 3 paires d’opposées du patron de référence et vérifie qu’elles sont les mêmes dans ton patron complété. Si une paire diffère, une pièce est mal placée.',
  ],
  traps: [
    'Recopier case par case le patron de gauche : les deux patrons sont dans des orientations différentes, la position d’une face sur la croix n’a rien à voir d’un patron à l’autre. C’est l’erreur qui coûte la question entière.',
    'Poser la bonne pièce dans la mauvaise orientation : c’est LA faute qui coûte le plus, parce qu’on croit la question finie. Le symbole ne prouve rien tant que l’orientation n’est pas contrôlée contre une arête commune avec une face déjà en place.',
    'Croire à un retournement en miroir : il n’y en a pas. Le clic fait tourner d’un quart de tour, donc quatre orientations possibles, jamais huit. Si une pièce ne colle dans aucun des quatre sens, c’est qu’elle ne va pas dans ce trou — change de pièce, pas de géométrie.',
    'Traiter une forme comme une lettre : carré, octogone, cercle, trèfle et étoile sont identiques à eux-mêmes après un quart de tour, leur orientation ne compte donc pas. Chercher « le bon sens » d’un cercle est du temps pur perdu. Seule la croix, au bras du bas plus long, garde une orientation.',
    'Chercher un leurre : il n’y en a pas. Il y a exactement autant de pièces que de trous, donc TOUTES doivent servir. C’est même une arme : quand il ne reste qu’une pièce et qu’un trou, la question est finie — pose-la sans réfléchir et passe au contrôle des paires.',
  ],
  timing: [
    '60 s par question au test : 15 s pour relever les 3 paires d’opposées du patron de référence, 30 s pour placer, 15 s de contrôle final.',
    'Ne plie jamais le cube mentalement en entier : les paires d’opposées et les coins 2×2 répondent sans pliage dans la grande majorité des cas.',
    'Si deux pièces semblent convenir pour un trou, c’est qu’une orientation les départage : compare-les sur l’arête commune avec une face connue, pas sur leur allure générale.',
  ],
};
