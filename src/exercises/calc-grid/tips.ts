import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'TROIS PASSES, jamais une seule. Passe 1 : le chiffre des UNITÉS de chaque résultat (47+38 doit finir par 5). Passe 2 : l’ordre de grandeur (48×6 ≈ 300, pas 3000). Passe 3 : recalcul réel des 2-3 cases encore suspectes. La passe 1 attrape la moitié des erreurs en 10 secondes.',
    'Contrôle des unités par type : addition/soustraction → additionne/soustrais les unités ; multiplication → multiplie les unités ; ×5 finit toujours par 0 ou 5 ; ×2, ×4, ×6, ×8 finissent toujours pair.',
    'Preuve par 9 pour les grosses multiplications : somme les chiffres jusqu’à un seul chiffre, des deux côtés. Si les deux ne concordent pas, le calcul est faux (l’inverse n’est pas garanti, mais c’est un filtre rapide).',
    'Pourcentages et fractions : passe par 10 % (÷10) et compose — 25 % = ÷4, 75 % = ÷4×3, 20 % = ÷5. Astuce commutative : 16 % de 25 = 25 % de 16 = 4.',
    'Chaînes de calcul : de gauche à droite, UN seul nombre en tête qui s’écrase. Aucune priorité d’opérations ici.',
    'Compte tes sélections avant de valider : 0 à 4 erreurs, jamais 5. Si tu en as coché 5, tu as un faux positif — reprends la plus douteuse.',
    'VALIDE toujours, même sans erreur trouvée : au test, une grille non validée perd toutes ses bonnes réponses.',
  ],
  traps: [
    'La grille SANS erreur : elle existe (0 à 4 fautes) et déclenche le doute — on finit par cocher au hasard « pour faire comme les autres ». Si les trois passes sont propres, valide à vide et assume.',
    'Les faux PLAUSIBLES : les erreurs sont à ±1, ±2, ±10, ou avec deux chiffres inversés (150 au lieu de 105). L’ordre de grandeur ne suffit donc jamais à les repérer — il faut les unités.',
    'La soustraction à retenue calculée comme sans retenue (63−27 = 44 au lieu de 36) : c’est l’erreur que le test glisse le plus souvent, et celle que tu commets en la vérifiant trop vite.',
    'Le faux positif : cocher un calcul juste par excès de zèle. Il coûte autant qu’une erreur manquée — ne coche que ce que tu as vraiment invalidé.',
  ],
  timing: [
    '45 s par grille au test : environ 10 s pour la passe des unités, 10 s pour l’ordre de grandeur, 15 s de recalcul ciblé, 5 s de contrôle et validation.',
    'Ne recalcule jamais les 9 calculs en entier : c’est mathématiquement impossible dans le temps imparti, et c’est le piège de conception de l’épreuve.',
    'Les tables de 6 à 9 et les compléments à 10/100 doivent être des réflexes : s’il y a hésitation, drille-les 5 minutes à part, hors exercice.',
  ],
};
