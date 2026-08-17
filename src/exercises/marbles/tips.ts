import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Compare les tubes DE BAS EN HAUT, pas globalement : une bille au fond qui est déjà à sa place finale ne bougera jamais. Tout le travail se joue au-dessus de la première divergence.',
    'Compte les billes MAL PLACÉES : chacune coûte au minimum un déplacement. Ce compte est ton plancher — la réponse ne peut jamais être inférieure.',
    'Repère les billes « bloquantes » : une bille bien placée mais posée SUR une bille mal placée devra être enlevée puis remise → elle coûte 2 déplacements, pas 0. C’est ce qui fait dépasser le plancher.',
    'Le tube du milieu (capacité 2) est ton seul espace de manœuvre : compte toujours combien de places libres il reste. Beaucoup de solutions optimales consistent à y garer temporairement une bille.',
    'Construis la solution mentalement dans l’ordre : quelle bille dois-je poser en DERNIER ? Remonter depuis l’arrivée est souvent plus rapide que simuler depuis le départ.',
    'Vérifie les capacités à chaque étape imaginée (3 / 2 / 3) : un plan qui déborde d’un tube est invalide, même s’il paraît plus court.',
  ],
  traps: [
    'Oublier les billes bloquantes : on compte 3 billes mal placées, on répond 3, alors qu’une bille bien placée par-dessus impose 2 déplacements de plus. C’est l’erreur numéro un.',
    'Ignorer la capacité du tube du milieu (2 billes) : le plan « je vide tout dans le milieu » est presque toujours illégal.',
    'Croire que deux billes se valent : chaque bille porte un NUMÉRO unique, aucune n’est interchangeable. La bille 2 doit finir exactement où la bille 2 est attendue — se contenter de « une bille de la bonne couleur » fait sous-estimer le compte.',
    'Se contenter du premier plan trouvé : la question demande le MINIMUM. Un plan qui marche n’est pas forcément le plus court — cherche s’il existe un raccourci d’un coup.',
  ],
  timing: [
    'Budget 40 s par question (timing officiel), mais vise 20-25 s : compte le plancher (billes mal placées), ajoute les bloquantes, puis vérifie en simulant une fois.',
    'Si ton plan dépasse 8 déplacements, tu as raté un raccourci : recommence en te demandant quelle bille doit arriver en dernier.',
    'Ne simule jamais deux plans complets : établis le plancher par le comptage, et ne simule que pour le confirmer.',
  ],
};
