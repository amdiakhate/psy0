import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'TU NE PILOTES PAS, TU RÉGULES. On ne clique jamais sur un avion : on ferme une VOIE — une ligne, pour une couleur — avec le bouton de couleur à son extrémité. C’est définitif : plus aucun avion de cette couleur n’arrivera par là de toute la série.',
    'LE SCORE EST UN BUDGET. Chaque voie fermée coûte 1 point sur 100, le bouton global en coûte 5. Zéro accident en fermant six voies vaut moins qu’un accident évité en n’en fermant qu’une. La question n’est jamais « comment survivre » mais « à quel prix ».',
    'LE BOUTON GLOBAL VAUT CINQ FERMETURES. Il ferme les six voies d’un groupe d’un coup. Il est donc perdant tant que quatre suffisent, et gagnant seulement quand il en faudrait six. Dans le doute, il est perdant.',
    'LIS LES COMPTEURS, PAS LE TRAFIC. Deux chiffres par groupe, affichés à l’extérieur : total (max 4) et bleus (max 2). « 2/2 » veut dire que le prochain bleu qui entre dans la bande déclenche l’accident. Le plateau ne sert qu’à savoir QUELLE voie fermer.',
    'FERME AVANT, PAS PENDANT. Un avion déjà dans la bande grise la traverse quoi qu’il arrive : fermer sa voie à cet instant ne le fait pas disparaître. Quand le compteur affiche la limite, la décision aurait dû être prise trois secondes plus tôt.',
    'LES BLEUS D’ABORD. Leur plafond (2) est deux fois plus serré que le total (4) : c’est presque toujours par eux que la série casse. Une file de bleus rapprochés sur un même groupe est l’alerte numéro un.',
    'REGARDE LES CHEVRONS. Un double chevron va deux fois plus vite : il entre dans la bande bien avant un simple parti en même temps. Compter les avions ne suffit pas, il faut lire les temps d’arrivée.',
    'UNE VOIE HORS BANDE EST GRATUITE À LAISSER OUVERTE. La bande grise ne couvre pas forcément les six lignes. Un avion sur une ligne non couverte ne comptera jamais — fermer sa voie, c’est payer pour rien.',
  ],
  traps: [
    'Dégainer le bouton global par réflexe : cinq points partis d’un coup, souvent là où une seule fermeture bien choisie tenait la série. C’est l’erreur qui fait passer une passation de la classe 7 à la classe 5.',
    'Fermer une voie quand le compteur est déjà au maximum : trop tard, les avions engagés poursuivent. On paie la fermeture ET l’accident.',
    'Fermer « par sécurité » : un avion qui traverse la bande en quatre pas libère sa place tout seul. Compte les sorties imminentes avant de dépenser un point.',
    'L’effet tunnel sur un groupe : pendant que tu regardes celui du haut, celui du bas se remplit. Un accident dans un groupe ne gèle QUE ce groupe — l’autre continue, et peut casser à son tour.',
    'Croire qu’on peut finir à 100 %. Les séries forcent des fermetures : la note parfaite n’existe pas, et la chercher fait prendre des risques absurdes.',
  ],
  timing: [
    'Boucle de scan ~2 s : compteurs du haut → arrivées imminentes du haut → compteurs du bas → arrivées imminentes du bas. La régularité du balayage EST la performance.',
    'Décide en moins d’une seconde. Le critère doit être automatique : quelle voie apporte le prochain avion de trop, et est-il encore hors de la bande ?',
    'Dix séries dans une passation, de plus en plus denses. Ne crame pas ta lucidité sur les trois premières : c’est en fin de passation que le trafic force la main, et que se joue la classe.',
  ],
};
