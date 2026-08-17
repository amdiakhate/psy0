import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Le dispositif est fixe : le chiffre paraît 1 s, il s’efface, puis « Oui » et « Non » restent 3 s. Tu réponds TOUJOURS, à chaque chiffre — 42 fois par série. Une non-réponse compte comme une erreur, exactement comme un mauvais bouton.',
    'Chunking rythmique : répète la fenêtre glissante en boucle subvocale (« 4-7-2… 7-2-9… ») calée sur le rythme d’apparition. La mémoire utilisée est verbale/auditive, pas visuelle — prononce les chiffres dans ta tête, toujours.',
    'Stratégie de mise à jour (drop-oldest) : à chaque nouveau chiffre, jette explicitement le plus ancien de la fenêtre et ajoute le nouveau. Ne « laisse pas la fenêtre glisser toute seule » — l’acte volontaire de jeter est ce qui empêche le décalage.',
    'N vaut 2, toujours : pense « avant-dernier ». Au moment où un chiffre apparaît, compare-le à l’avant-dernier prononcé, pas à « celui d’il y a deux » (formulation qui force à recompter).',
    'Décide PENDANT la seconde d’affichage, valide pendant la fenêtre de réponse : la comparaison doit être faite quand les boutons paraissent. La fenêtre de 3 s sert à cliquer et à réamorcer la comptine, pas à réfléchir.',
    'Décision sur la POSITION, jamais sur la familiarité : « ce chiffre me dit quelque chose » est le signal du lure, pas du match. Le test intérieur correct : « est-il exactement à 2 coups ? » Si tu ne peux pas répondre oui avec certitude, c’est Non.',
    'Fixe le centre de l’écran en permanence : chercher le chiffre des yeux coûte une partie de la seconde d’affichage, la seule où l’information est disponible.',
  ],
  traps: [
    'Le lure N±1 : répétition à distance 1 ou 3 au lieu de 2 — LE piège, en densité croissante avec le niveau (taux forcé ici comme au test). Ta parade : la règle « familier sans certitude de position = Non ».',
    'Le glissement de fenêtre après un « Oui » : le cerveau garde l’ancien chiffre « vainqueur » et décale toute la suite d’un cran. Après chaque Oui, re-synchronise explicitement ta fenêtre sur les deux derniers chiffres affichés.',
    'L’hésitation qui mange la fenêtre : à 42 chiffres, un doute non tranché en 3 s devient un timeout, c’est-à-dire une faute sèche. Tranche au plus probable plutôt que de laisser filer.',
    'L’effondrement de fin de série : sur 42 chiffres, les dix dernières positions concentrent les erreurs quand le rythme subvocal se relâche. Garde la comptine jusqu’au dernier chiffre, pas jusqu’à « presque la fin ».',
  ],
  timing: [
    'Le rythme est imposé (1 s + 3 s par chiffre, ~3 min par série) : ne clique jamais « en avance au cas où » — un Oui anticipé sur un lure est une double faute (fausse alarme + fenêtre désynchronisée).',
    'Réponds dans la première moitié de la fenêtre de décision : si tu hésites encore en seconde moitié, c’est Non, et prépare le chiffre suivant.',
    'Entre deux séries : une respiration profonde et vide EXPLICITEMENT la fenêtre précédente — les restes de l’ancienne série fabriquent des faux lures dans la nouvelle.',
  ],
};
