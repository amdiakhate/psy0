import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Ne cherche PAS le symétrique : cherche la PAIRE. Deux des trois empilements sont le même objet tourné — dès que tu as identifié cette paire, le troisième est la réponse, sans aucune rotation mentale supplémentaire.',
    'La main d’une figure, en 3 flèches : ① du milieu du plus long bras vers le bout qui porte un cube ; ② du milieu vers ce qui SORT du bras ; ③ du bout vers le cube posé dessus. Pouce sur ①, index sur ②, majeur sur ③ : si ta main DROITE fait le geste, la figure est main droite. Ce sens ne change pas quand on tourne la figure, il s’inverse par symétrie. Deux empilements de même main = la paire ; celui de main opposée = le symétrique.',
    'Trois verdicts (droite / gauche / droite) plutôt que trois images : les mots tiennent en mémoire, les images non. Formule les trois d’affilée, sans revenir en arrière sur une figure déjà jugée.',
    'Utilise un repère d’ancrage stable : le cube « coin » (celui qui touche le plus de voisins) ou l’extrémité du bras le plus long. Compte les voisins autour de cet ancre dans le sens horaire vu du dessus — cet ordre cyclique est conservé par rotation, inversé par symétrie.',
    'Les invariants numériques départagent avant tout raisonnement spatial : nombre de cubes, longueur du plus long bras droit, nombre de cubes ayant exactement 1 voisin (les « bouts »). Ils sont identiques sur les TROIS empilements (miroir compris), donc ils ne prouvent rien — mais s’ils diffèrent, c’est que tu as mal lu la figure : relis avant de conclure.',
    'Vérifie ta réponse par une seule contre-épreuve : prends les deux empilements que tu as déclarés identiques et fais coïncider mentalement leur bras le plus long. Si les décrochages tombent alors du même côté, la paire est bonne — donc le troisième est bien le symétrique.',
  ],
  traps: [
    'Voter pour « celui qui a l’air différent » : la vue la plus dépaysante est presque toujours une simple rotation forte de l’original, pas le miroir. L’étrangeté visuelle ne mesure que l’écart d’orientation, jamais la symétrie — ne réponds jamais à l’impression.',
    'Le faux jumeau : deux empilements presque dans la même orientation, dont l’un est le miroir. Ils se ressemblent tellement qu’on les apparie d’office, et on désigne le troisième (qui est pourtant l’un des identiques). Deux figures qui se ressemblent BEAUCOUP doivent être contrôlées en priorité, pas validées d’office.',
    'Perdre le fil pendant la rotation mentale : tu tournes une figure, tu la compares, tu tournes la deuxième… et tu as oublié l’orientation de la première. D’où la règle : convertis chaque empilement en formule verbale AVANT toute comparaison, puis compare des mots, pas des images.',
    'Se fier à un repère d’ÉCRAN : « en haut », « à droite », la clarté d’une face. Les figures sont basculées d’un angle quelconque — aucun de ces repères ne survit au basculement. Seules les relations internes à la figure (le long du bras, sort du bras, posé au bout) sont fiables.',
  ],
  timing: [
    'Budget 10 s : 4 s pour les trois verdicts de main, 3 s pour apparier, 3 s de marge. Si la contre-épreuve dépasse, valide quand même et passe.',
    'À une dizaine de cubes, ne lis JAMAIS la figure entière : le bras le plus long et son décrochage suffisent à décider dans la grande majorité des items. Lire tout l’empilement coûte 20 s pour 10 s disponibles — c’est le piège de conception de l’épreuve.',
    'Deux empilements de même main trouvés ⇒ réponds immédiatement, ne vérifie pas le troisième. Le contrôle du troisième est du temps dépensé pour une information que tu as déjà.',
  ],
};
