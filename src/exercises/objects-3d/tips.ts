import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'Travaille sur le PLAN, pas sur la vue 3D. La vue ne sert qu’à extraire deux informations : l’ordre gauche→droite des objets, et lequel est devant. Tout le raisonnement se fait ensuite sur la carte, où tu contrôles la géométrie.',
    'La règle de l’axe : prends les DEUX objets les plus éloignés l’un de l’autre sur le plan. Ils définissent un axe. Les 8 points de vue se coupent en deux moitiés — ceux qui voient A à gauche de B, et ceux qui voient B à gauche de A. Lis la vue, tu élimines la moitié des points de vue en 2 secondes.',
    'Deuxième découpe avec un troisième objet : reprends la même logique sur une autre paire (par exemple l’objet le plus au centre contre l’un des deux premiers). Deux découpes bien choisies laissent en général 1 ou 2 candidats sur 8.',
    'La profondeur tranche à la fin : sur la vue, l’objet le plus proche est celui qui apparaît le plus BAS et le plus GROS. Sur le plan, c’est celui du côté du rond candidat. Si deux points de vue survivent, ils sont souvent opposés ou voisins — comparer « qui est devant » les sépare toujours.',
    'Astuce du rond opposé : depuis deux points de vue diamétralement opposés, l’ordre gauche→droite est exactement INVERSÉ. Si ton ordre lu correspond à l’inverse de ce que tu attendais pour le rond n, la réponse est le rond n+4.',
    'Ancre-toi sur l’objet le plus reconnaissable (l’antenne, la pyramide) et repère sa position dans l’image : centré, à l’extrême gauche, à l’extrême droite. Un objet centré à l’écran est presque aligné avec l’axe rond↔centre — ça désigne directement deux ronds, celui-ci et son opposé.',
  ],
  traps: [
    'Répondre avec le rond « d’où l’on voit la scène comme sur le dessin » sans vérifier le sens : la moitié des erreurs sont le rond diamétralement OPPOSÉ au bon (l’image est alors la symétrique gauche-droite). Réflexe : vérifie toujours la profondeur, elle sépare un rond de son opposé.',
    'Confondre gauche/droite du PLAN et gauche/droite de la VUE. Sur le plan tu regardes le désert du dessus ; depuis le rond, ta gauche dépend de l’endroit où tu te tiens. Place-toi mentalement SUR le rond, tourné vers le centre, avant de dire « à gauche ».',
    'Se fier à la taille apparente pour trier la profondeur alors que les objets n’ont pas la même taille réelle : une antenne lointaine reste haute, un rocher proche reste petit. Le bon indice de profondeur est la position du PIED de l’objet dans l’image (plus bas = plus près), pas sa hauteur.',
    'Les dispositions quasi régulières (niveaux 4-5) donnent l’illusion que plusieurs ronds conviennent. Ce n’est jamais le cas : un seul point de vue produit l’ordre exact. Si deux ronds te semblent équivalents, c’est qu’il te manque une paire d’objets à comparer, pas que l’item est ambigu.',
  ],
  timing: [
    'Budget 10 s : 3 s pour lire l’ordre gauche→droite sur la vue, 4 s pour la double découpe sur le plan, 3 s de contrôle par la profondeur.',
    'Ne compte jamais les 8 ronds un par un : c’est 30 s garanties. Les deux découpes ramènent mécaniquement à 1-2 candidats, quel que soit le nombre d’objets.',
    'À 3 objets, la première découpe ne laisse que 4 candidats : engage tout de suite la deuxième paire au lieu de scruter l’image plus longtemps. Avec peu d’objets, l’information est dans les relations, jamais dans les détails.',
  ],
};
