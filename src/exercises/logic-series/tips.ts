import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'AVANT TOUT, le barème : +1 pour une bonne réponse, −1/3 pour une mauvaise, 0 si tu ne réponds pas. Répondre au hasard entre 4 options rapporte en moyenne (1/4 × 1) − (3/4 × 1/3) = 0. C’est nul, littéralement : le hasard ne fait pas monter ton score, il ne fait que le rendre bruyant. On ne répond que si on a une raison.',
    'Identifie d’abord le FORMAT : nombres, lettres, ou figures. Les trois se traitent différemment, et perdre 5 s à hésiter coûte plus cher que d’appliquer directement la bonne grille de lecture.',
    'NOMBRES — hiérarchie de tests, dans cet ordre : 1) différences constantes (+k) ; 2) différences qui évoluent régulièrement (+3, +4, +5…) ; 3) quotients (×k) ; 4) alternance de deux pas (+6, −9, +6, −9) ; 5) deux suites ENTRELACÉES (une position sur deux) ; 6) carrés, cubes, type Fibonacci (chaque terme = somme des deux précédents). Descends la liste sans sauter d’étape.',
    'LETTRES — convertis en rangs alphabétiques et calcule l’écart, exactement comme pour des nombres : « N … U » = +7 crans. Repères à connaître par cœur : A=1, E=5, J=10, O=15, T=20, Z=26 ; à partir de ces jalons, tout rang se retrouve en moins de 2 s. Attention, l’alphabet peut boucler : après Z on repart à A.',
    'FIGURES — passe en revue les attributs UN PAR UN : forme, nombre d’éléments, taille, rotation, remplissage. Chacun a son propre cycle (souvent 3 pour le nombre/la taille/la rotation, 2 pour le remplissage). Construis ta prédiction attribut par attribut AVANT de regarder les options.',
    'Une série de 4 items donne 3 écarts, une série de 5 en donne 4 : ta règle doit expliquer TOUS les écarts, pas les deux premiers. Sur les séries courtes (4 items), sois d’autant plus méfiant — c’est là que deux règles cohabitent le plus souvent.',
    'Contrôle final : ne cherche pas l’option « qui ressemble », calcule ta réponse PUIS cherche-la dans la liste. Si elle n’y est pas, ta règle est fausse — et c’est une information précieuse, pas une raison de prendre la plus proche.',
  ],
  traps: [
    'Répondre au hasard quand le temps presse. Avec −1/3, trois mauvaises réponses annulent une bonne. Passer coûte 0 : sur une série que tu ne comprends pas, l’abstention est le choix mathématiquement correct. Ne réponds que si tu as éliminé au moins deux options pour une VRAIE raison.',
    'Conclure sur les deux premiers termes : plusieurs règles coïncident souvent sur un début de suite (1, 2, 4… peut être ×2 comme +1, +2, +3). Ta règle doit expliquer tous les termes affichés.',
    'Rater l’entrelacement en s’acharnant sur les différences globales : si les écarts n’ont aucun motif après 10 s, le test « une position sur deux » est presque toujours la réponse — en nombres COMME en lettres.',
    'En lettres, oublier le bouclage de l’alphabet : U +7 ne donne pas « rien », il donne B. Et en figures, l’attribut invisible — la rotation d’une forme symétrique, un remplissage discret — d’où la revue systématique des cinq attributs.',
  ],
  timing: [
    'Budget officiel : 15 questions, 30 s chacune. Vise 20 s et garde 10 s de marge : la hiérarchie de tests coûte 3-5 s par test, tu as donc le temps d’en faire quatre avant de décider.',
    'Règle des 25 s : si à 25 s tu n’as pas identifié la règle, éliminer une ou deux options ne suffit pas à rendre la réponse rentable — passe. Une question sautée coûte 0, une erreur coûte 1/3.',
    'Les repères doivent être automatiques : carrés 1 4 9 16 25 36 49 64 81 100 ; cubes 1 8 27 64 125 ; jalons alphabétiques A=1 E=5 J=10 O=15 T=20 Z=26. Relis-les avant chaque session jusqu’à ne plus avoir à les calculer.',
  ],
  examples: [
    {
      title: 'Lettres : compter les crans, comme des nombres',
      seed: 4,
      level: 2,
      forceTag: 'letters',
      walkthrough: [
        'Convertis en rangs : F = 6, K = 11, P = 16, U = 21. Ne cherche aucun sens aux lettres — ce sont des nombres déguisés.',
        'Les écarts sont constants : +5, +5, +5. La règle est donc « avancer de 5 crans dans l’alphabet » (c’est exactement l’exemple officiel Pilotest, avec 7 au lieu de 5).',
        '21 + 5 = 26 → Z. Vérifie que Z figure bien parmi les options, puis valide. Si le résultat avait dépassé 26, il aurait fallu reboucler : 27 → A.',
      ],
    },
    {
      title: 'Nombres : quand la suite zigzague, calcule les écarts',
      seed: 1,
      level: 3,
      forceTag: 'numeric',
      walkthrough: [
        'Écris les écarts entre termes consécutifs : 50→56 (+6), 56→47 (−9), 47→53 (+6), 53→44 (−9).',
        'Le motif saute aux yeux : alternance +6 / −9. Le prochain pas est donc +6. Réflexe à ancrer : une suite qui monte puis descend crie l’alternance ou l’entrelacement.',
        '44 + 6 = 50. Cherche 50 dans les options — et méfie-toi du distracteur 44 (recopie du dernier terme) et de 35 (le pas −9 appliqué au mauvais moment).',
      ],
    },
    {
      title: 'Figures : un attribut à la fois, prédiction avant options',
      seed: 5,
      level: 3,
      forceTag: 'figural',
      walkthrough: [
        'Passe les attributs en revue : la forme ne change pas (triangle), la taille ne change pas (grande), le remplissage ne change pas (vide). Restent le NOMBRE et la ROTATION.',
        'Le nombre cycle 1, 2, 3, 1… et la rotation 0°, 45°, 90°, 0°… Repère le rang de la case manquante et déduis chaque attribut séparément : ici 2 triangles, inclinés à 45°, vides et grands.',
        'Ce n’est qu’ENSUITE que tu regardes les options : chaque distracteur ne diffère que par un seul attribut (1 au lieu de 2, plein au lieu de vide, 0° au lieu de 45°). Coche celle qui satisfait les quatre attributs, pas celle qui « ressemble ».',
      ],
    },
  ],
};
