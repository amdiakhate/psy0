import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Ne cherche PAS le symétrique : cherche la PAIRE. Deux des trois empilements sont le même objet tourné — dès que tu as identifié cette paire, le troisième est la réponse, sans aucune rotation mentale supplémentaire.',
    'La signature de chiralité, en 3 gestes : 1) repère le plus long bras droit de cubes ; 2) oriente-le mentalement vers toi ; 3) regarde de quel côté part le décrochage (le cube qui sort du bras) — DROITE ou GAUCHE. Cette main est invariante par rotation et s’inverse par symétrie. Deux empilements de même main = la paire ; celui de main opposée = le symétrique.',
    'Décris chaque empilement par une formule courte et comparable plutôt que par son image : « bras de 3, décrochage en haut à droite, puis un cube vers l’avant ». Trois formules, deux identiques : la réponse tombe toute seule.',
    'Utilise un repère d’ancrage stable : le cube « coin » (celui qui touche le plus de voisins) ou l’extrémité du bras le plus long. Compte les voisins autour de cet ancre dans le sens horaire vu du dessus — cet ordre cyclique est conservé par rotation, inversé par symétrie.',
    'Les invariants numériques départagent avant tout raisonnement spatial : nombre de cubes, longueur du plus long bras droit, nombre de cubes ayant exactement 1 voisin (les « bouts »). Ils sont identiques sur les TROIS empilements (miroir compris), donc ils ne prouvent rien — mais s’ils diffèrent, c’est que tu as mal lu la figure : relis avant de conclure.',
    'Vérifie ta réponse par une seule contre-épreuve : prends les deux empilements que tu as déclarés identiques et fais coïncider mentalement leur bras le plus long. Si les décrochages tombent alors du même côté, la paire est bonne — donc le troisième est bien le symétrique.',
  ],
  traps: [
    'Voter pour « celui qui a l’air différent » : la vue la plus dépaysante est presque toujours une simple rotation forte de l’original, pas le miroir. L’étrangeté visuelle ne mesure que l’écart d’orientation, jamais la symétrie — ne réponds jamais à l’impression.',
    'Le faux jumeau : deux empilements presque dans la même orientation, dont l’un est le miroir. Ils se ressemblent tellement qu’on les apparie d’office, et on désigne le troisième (qui est pourtant l’un des identiques). Deux figures qui se ressemblent BEAUCOUP doivent être contrôlées en priorité, pas validées d’office.',
    'Perdre le fil pendant la rotation mentale : tu tournes une figure, tu la compares, tu tournes la deuxième… et tu as oublié l’orientation de la première. D’où la règle : convertis chaque empilement en formule verbale AVANT toute comparaison, puis compare des mots, pas des images.',
    'Confondre profondeur et hauteur en isométrique : un cube « au-dessus » et un cube « derrière » se dessinent presque au même endroit. Suis toujours les arêtes des faces (dessus clair, avant-gauche moyen, avant-droit sombre) pour trancher — la couleur de face donne l’axe.',
  ],
  timing: [
    'Budget 10 s : 4 s pour formuler les trois signatures (main droite / main gauche), 3 s pour apparier, 3 s de contre-épreuve. Si la contre-épreuve dépasse, valide quand même et passe.',
    'Aux tailles 6-7 cubes, ne lis pas tous les cubes : le bras le plus long + son décrochage suffisent à décider dans la grande majorité des items. Lire l’empilement entier coûte 20 s et n’ajoute rien.',
    'Deux empilements de même main trouvés ⇒ réponds immédiatement, ne vérifie pas le troisième. Le contrôle du troisième est du temps dépensé pour une information que tu as déjà.',
  ],
};
