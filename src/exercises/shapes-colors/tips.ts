import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Encode l’arbre AVANT la série, pas pendant : « vide → couleur, rempli → forme ». Cette phrase de quatre mots est la racine ; les valeurs (bleu = N, orange = X…) viennent ensuite. Tant que la racine n’est pas automatique, chaque stimulus coûte une relecture complète.',
    'Ordre de lecture verrouillé : 1) rempli ou vide ? 2) l’attribut de CETTE branche. Toujours dans cet ordre, même quand la couleur saute aux yeux avant le remplissage. Le premier critère est celui qui décide quel second critère existe.',
    'Réduis chaque branche à un couple touche-indice : « vide-bleu → N », « rempli-carré → N », et considère l’autre touche comme le cas par défaut. Une seule chose à reconnaître par branche, la seconde se déduit.',
    'Photographie, ne détaille pas : la forme ne reste que 0,5 s. Prends l’image entière d’un coup (remplissage + attribut pertinent), puis ferme les yeux mentalement et applique l’arbre sur le souvenir — l’écran est déjà vide de toute façon.',
    'Nomme le remplissage à voix intérieure au moment où la forme apparaît (« plein ! », « creux ! »). Cette étiquette verbale survit à l’effacement bien mieux que l’image visuelle.',
    'Après chaque feedback, relâche : le retour « correct / faux » sert à recaler l’arbre, pas à ruminer. Une erreur analysée pendant 2 s en coûte une seconde sur le stimulus suivant.',
    'Ignore activement l’attribut distracteur : dans la branche « rempli → forme », la couleur est du bruit. Se dire « la couleur ne compte pas ici » est un acte d’inhibition à faire, pas une évidence.',
  ],
  traps: [
    'Le changement de branche : le stimulus précédent était vide, celui-ci est rempli — la main reste sur la règle qui vient d’être utilisée et applique le mauvais critère. C’est le tag branch-switch, celui qui concentre les erreurs ; la parade est de re-dire « rempli ! » avant de chercher quoi que ce soit.',
    'La couleur qui appelle une touche apprise : un triangle BLEU rempli, après plusieurs vides bleus valant N, « sonne » N. Mais dans la branche remplie, la couleur ne décide de rien. Familiarité ≠ règle.',
    'La réponse trop tardive : hésiter au-delà de la fenêtre compte comme une faute (timeout), au même prix qu’une erreur. Mieux vaut trancher au feeling à la seconde restante que ne rien donner.',
    'La dérive de fin de série : les 5-6 derniers stimuli se paient quand l’arbre n’est plus rafraîchi. Re-verbalise la racine (« vide → couleur, rempli → forme ») toutes les dix formes environ.',
  ],
  timing: [
    'La fenêtre est de 3 s dont 0,5 s d’affichage : vise une réponse dans la seconde qui suit l’effacement, pendant que l’image mentale est encore nette. Attendre ne la rend jamais plus nette.',
    'Utilise le temps mort de fin de fenêtre pour réamorcer la racine de l’arbre, pas pour revenir sur la réponse donnée — elle est jouée.',
    'Investis les secondes de l’écran de consigne : deux lectures à voix intérieure des deux règles avant de lancer la série valent dix bonnes réponses de plus.',
  ],
};
