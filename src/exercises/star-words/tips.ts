import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Ne lis JAMAIS les mots en entier. Sur les 7 lettres, seules deux comptent : la 3e et la 5e (les cases communes de l’étoile). Balaie les 9 mots une seule fois en notant ce couple — par exemple SERRURE → (R, U). Tout l’exercice se joue sur ces 9 couples.',
    'Attaque par la lettre la plus RARE de ces couples (un U, un B, un F…). Une lettre qui n’apparaît qu’une fois en 3e position et une fois en 5e position ne laisse aucun choix : ces deux mots sont posés, et deux emplacements voisins sont bloqués d’un coup.',
    'Propage ensuite autour du cycle A-D-C-F-B-E-A : chaque emplacement n’a que deux voisins, jamais plus. Une fois deux mots posés, tu ne cherches plus « un mot qui va » mais « un mot dont la 3e lettre vaut X » — c’est une recherche à un seul critère, donc rapide.',
    'Utilise les lettres imposées pour éliminer : si la case commune vaut R, tous les mots dont la 3e lettre n’est pas R sont hors-jeu pour cet emplacement. En moyenne il n’en reste qu’un ou deux — la contrainte fait le travail à ta place.',
    'Garde les 3 mots restants comme test de cohérence : si à la fin il te reste trois mots dont les couples n’ont RIEN à voir avec les lettres imposées, c’est bon signe. S’il t’en reste un qui collait parfaitement, tu t’es probablement trompé d’emplacement quelque part.',
    'Vérifie visuellement, pas mentalement : les cases communes sont bleues et affichent la lettre dès que le mot est posé. Un conflit apparaît en rouge avec les deux lettres qui s’affrontent — tu n’as jamais besoin de recompter, l’étoile te le dit.',
    'Ne cherche pas LA solution : la consigne officielle dit qu’une autre configuration correcte vaut aussi le point. Dès que les 6 cases communes sont cohérentes, valide et passe — ne perds pas 10 s à te demander si « c’était bien celle-là ».',
  ],
  traps: [
    'Lire les mots comme du vocabulaire. Le sens, la sonorité, la famille de mots ne servent à RIEN ici : deux mots aussi proches que TERRINE et SARDINE ont le même couple (R, I) et sont interchangeables. Ce n’est pas un exercice de vocabulaire, c’est un exercice de contraintes.',
    'Compter les lettres à partir de 1 en oubliant que la case commune est la 3e ET la 5e. Beaucoup se trompent d’une position (2e/4e) et construisent une solution entièrement fausse mais cohérente dans leur tête. Vérifie ton repère sur le premier mot posé.',
    'Poser les mots au hasard « pour voir ». Chaque mot posé au mauvais endroit doit être retiré, et le temps file : 50 s, c’est court. On ne pose un mot que lorsqu’une case commune l’impose.',
    'S’acharner sur un emplacement bloqué. Si aucun mot ne convient, ce n’est pas cet emplacement le problème — c’est un mot posé plus tôt. Retire le dernier mot posé, pas celui que tu cherches.',
  ],
  timing: [
    'Budget officiel : 50 s pour 10 questions. Découpe-les : 10 s pour relever les 9 couples (3e, 5e lettre), 25 s pour propager depuis la lettre la plus rare, 15 s de marge.',
    'Si à 35 s tu n’as que deux mots posés, change de stratégie : place les mots dont le couple est UNIQUE (aucun autre mot ne partage ces deux lettres) — ils n’ont qu’un emplacement possible.',
    'Une étoile incomplète ne rapporte rien : mieux vaut valider une configuration complète bâtie vite qu’une demi-étoile parfaite. Et comme toute solution correcte compte, la première trouvée est la bonne.',
  ],
  examples: [
    {
      title: 'Partir de la lettre la plus rare',
      seed: 7,
      level: 3,
      walkthrough: [
        'Relève le couple (3e, 5e lettre) des 9 mots : TERRINE (R,I) · NOURRIR (U,R) · INTERNE (T,R) · PEINTRE (I,T) · FERMIER (R,I) · SERRURE (R,U) · SARDINE (R,I) · ORIGINE (I,I) · VOISINE (I,I). Tu n’as plus besoin des mots, seulement de ces couples.',
        'Cherche la lettre la plus rare : le U. Un seul mot l’a en 3e lettre (NOURRIR) et un seul en 5e (SERRURE). La case commune C/F est donc forcément un U : pose NOURRIR en C et SERRURE en F, sans hésiter.',
        'Propage autour du cycle A-D-C-F-B-E-A : C finit par R en 5e → D doit commencer sa 3e lettre par R → FERMIER ; F a R en 3e → B doit avoir R en 5e → INTERNE ; puis PEINTRE en E (T en 5e de B) et ORIGINE en A. Les 6 cases sont cohérentes : valide. VOISINE aurait tout aussi bien fait l’affaire à la place d’ORIGINE — les deux valent le point.',
      ],
    },
    {
      title: 'Distracteurs faciles : trois mots qui ne collent nulle part',
      seed: 5,
      level: 1,
      walkthrough: [
        'Couples (3e, 5e) : TOURNER (U,N) · DIRIGER (R,G) · NATUREL (T,R) · BORDURE (R,U) · RENTRER (N,R) · LIGOTER (G,T) · GLISSER (I,S) · SEMELLE (M,L) · POIREAU (I,E).',
        'Aux niveaux faciles, trois mots n’accrochent aucune lettre imposée : ici GLISSER, SEMELLE et POIREAU n’ont ni U, ni R, ni N, ni G, ni T aux bonnes positions. Écarte-les d’emblée — il ne reste que 6 mots pour 6 emplacements.',
        'Une fois les intrus écartés, le placement est mécanique : le U relie TOURNER (3e lettre) et BORDURE (5e lettre) sur la case A/D, le R relie NATUREL et BORDURE sur la case C/D… Suis le cycle et l’étoile se referme toute seule.',
      ],
    },
  ],
};
