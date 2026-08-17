import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Comprends ce qui est testé : les boîtes sont VIDES et SANS ÉTIQUETTE. Reconnaître le champ lexical d’un mot est trivial ; ce qu’on mesure, c’est ta mémoire de l’attribution « thème → boîte » que TU as créée.',
    'Au premier mot d’un thème, tu es libre : n’hésite pas une seconde, c’est correct quoi qu’il arrive. Toute l’économie de temps est là — la seule chose qui compte, c’est de mémoriser ton choix dans l’instant.',
    'Choisis tes boîtes dans l’ORDRE, de gauche à droite : premier thème vu → boîte 1, deuxième thème vu → boîte 2, etc. Tu remplaces un effort de mémoire pure par une règle : « ordre d’apparition = ordre des boîtes ».',
    'Ancre chaque attribution par une image au moment où tu la crées : « boîte 3 = la cuisine ». Une seconde d’encodage volontaire au premier mot te fait gagner cinq rappels plus tard.',
    'Sers-toi de l’affichage : chaque boîte montre les mots qu’elle contient déjà. Sur un doute, ne cherche pas dans ta tête — scanne les boîtes et repère celle qui contient un mot du même champ.',
    'Nomme le thème avant de chercher la boîte, jamais l’inverse. « épagneul → races de chiens → boîte 2 » : deux étapes courtes valent mieux qu’un balayage des boîtes au hasard.',
    'Aux niveaux à 6 boîtes, regroupe mentalement par paires (1-2, 3-4, 5-6) : retrouver « la paire du milieu » puis trancher entre deux est plus rapide et plus sûr que de fouiller six cases.',
  ],
  traps: [
    'Hésiter sur le PREMIER mot d’un thème : on cherche « la bonne boîte » alors qu’il n’y en a pas encore. On perd deux secondes et le mot suivant tombe déjà. Toute boîte libre est bonne — prends la suivante dans l’ordre et avance.',
    'Le rappel lointain : un thème qui n’est pas revenu depuis 5 mots ou plus. C’est là que se concentrent les erreurs, parce que la trace mémorielle a été écrasée par les thèmes intermédiaires. Dès qu’un thème « disparaît », relance-toi son image mentale.',
    'La confusion de deux thèmes voisins attribués coup sur coup : si tu poses deux thèmes proches dans deux boîtes adjacentes, tu inverseras. Écarte-les volontairement (boîte 1 et boîte 4).',
    'Chercher le champ lexical au lieu de la boîte : le mot est toujours limpide (« épagneul », « hypoténuse »). Si tu réfléchis au sens du mot plus d’une demi-seconde, tu es en train de perdre du temps sur la mauvaise question.',
  ],
  timing: [
    'Une série dure environ une minute et il y en a 5. Le rythme est imposé : le mot disparaît au bout d’une seconde, la réponse doit partir dans la foulée.',
    'Répartis ton effort : investis du temps sur les PREMIERS mots (l’encodage des attributions) — c’est le seul moment où le temps passé rapporte. Ensuite, tout doit être réflexe.',
    'Une erreur passée est finie : ne la rejoue pas mentalement pendant que le mot suivant s’affiche. Une erreur ruminée en coûte deux ou trois de plus.',
    'Sans réponse dans le délai, le mot compte comme faux : mieux vaut une boîte plausible tout de suite qu’une hésitation qui expire.',
  ],
};
