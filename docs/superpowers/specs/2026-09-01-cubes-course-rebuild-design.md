# Reconstruction Cubes 2D/3D — cours puis Coach

Date : 1er septembre 2026

## Objectif

Remplacer l’ancienne leçon Cubes par une formation interactive autonome destinée à une personne qui ne visualise pas encore le pliage d’un patron. Le cours précède l’entraînement réel. Le Coach intervient ensuite pour analyser une tentative, sans porter à lui seul tout l’enseignement.

La reconstruction conserve le moteur géométrique vérifié, le générateur des planches réelles et les composants de correction utiles. Elle remplace le hub, l’ancienne leçon générique et les démonstrations pédagogiques qui ne forment pas un parcours.

## Principes non négociables

- Une relation spatiale est montrée avant d’être formulée.
- Les chapitres 1 à 7 utilisent le patron neutre `E / A-B-C-D / F` et six couleurs stables.
- L’identité technique d’une face ne dépend jamais de son symbole ou de sa position à l’écran.
- Les opposées, voisinages, anneaux, rotations et exemples proviennent de `cubeGeometry` et `cube-model`.
- Le cours n’affiche aucun conseil chronométrique avant le chapitre 10.
- Les résultats guidés ne sont pas mélangés aux performances des planches réelles.
- Le Coach affiche d’abord la première erreur utile, pas une encyclopédie de la géométrie.
- Toutes les animations ont lecture/pause, retour ou replay, et un état lisible avec réduction des mouvements.

## Routes

- `/cubes` : hub et prochaine action recommandée.
- `/cubes/learn` : cours complet.
- `/cubes/learn/:chapterId` : accès direct à un chapitre autorisé.
- `/cubes/train` : préparation et lancement d’une série réelle.
- `/cubes/drills` : catalogue des drills.
- `/cubes/drills/:type` : lecteur d’un drill.
- `/cubes/history` : historique et corrections rejouables.
- `/cubes/history?filter=errors` : vue « Mes erreurs » du même historique, sans dupliquer les données.
- `/cubes/progress` : progression pédagogique et performances réelles séparées.
- `/learn/cubes` : redirection de compatibilité vers `/cubes/learn`.

Les anciennes routes `/cubes/drill/:type` et `/cubes/guided` redirigent respectivement vers le nouveau catalogue/lecteur et vers le chapitre 9.

## Architecture

```text
src/exercises/cubes/
  domain/                 moteur et analyse géométriques conservés
  course/
    courseModel.ts        chapitres, prérequis, seuils, notions introduites
    courseFixtures.ts     patron A–F et exemples dérivés du moteur
    courseDrills.ts       mini-exercices déterministes et validation
    courseProgress.ts     stockage versionné et calcul de déverrouillage
    CubesCoursePage.tsx   shell du cours et sommaire
    ChapterRenderer.tsx   contenu d’un chapitre
    visuals/              primitives SVG/3D pédagogiques
  coach/                  diagnostic après une planche réelle
  drills/                 drills autonomes
  pages/
    CubesHubPage.tsx
    CubesTrainPage.tsx
    CubesDrillsPage.tsx
    CubesHistoryPage.tsx
    CubesProgressPage.tsx
```

`cubeGeometry.ts` reste la source des relations. `fold-model.ts` reste la source des positions intermédiaires du pliage. Les composants ne possèdent aucune table concurrente d’opposées ou d’anneaux.

## Patron pédagogique

Le patron de référence est :

```text
    E
A B C D
    F
```

Pour respecter les relations demandées `A↔C`, `B↔D`, `E↔F`, les identités sont affectées aux positions géométriques du moteur, puis rendues dans cette disposition. Les couleurs sont fixes : A rouge, B bleu, C vert, D jaune, E violet, F orange.

Le mapping pédagogique exact est `A→L`, `B→F`, `C→R`, `D→B`, `E→U`, `F→D` dans les coordonnées du moteur. Il est déclaré une seule fois dans `courseFixtures.ts`, vérifié contre `cubeGeometry`, puis consommé par tous les visuels et mini-exercices.

Les glyphes réels n’apparaissent qu’au chapitre 8. Avant cela, les faces affichent uniquement lettre neutre et couleur.

## Parcours en dix chapitres

Chaque chapitre possède : objectifs, notions prérequises, scènes visuelles, démonstration contrôlable, 2 à 5 mini-exercices et seuil de validation. Une mauvaise réponse explique la règle et reste dans le cours ; elle ne crée pas une tentative d’entraînement réel.

1. **Comprendre le patron** — patron et cube côte à côte, pliage face par face, identité stable, cube manipulable à la souris et au clavier. 3 mini-exercices : suivre une face, retrouver sa couleur, identifier la face arrière. Seuil : 100 % sur la dernière série.
2. **Faces opposées** — animation des trois rencontres face à face. 5 mini-exercices : opposée directe et trou opposé. Seuil : 100 %.
3. **Faces adjacentes** — arêtes partagées sur patron et cube. 4 mini-exercices : quatre voisines, intrus opposé, vrai/faux. Seuil : 90 %.
4. **Ceinture** — fermeture A-B-C-D et relation cachée D-A. 3 mini-exercices : voisins dans la ceinture et chaîne circulaire. Seuil : 90 %.
5. **Changer de face centrale** — redépliages calculés avec A, B, C, D, E puis F au centre. 3 mini-exercices : suivre une identité et compléter un redépliage. Seuil : 80 %.
6. **Anneau des voisins** — ordre haut-droite-bas-gauche, décalage circulaire autorisé. 4 mini-exercices : quatrième voisin et ordre valide. Seuil : 80 %.
7. **Rotation ou miroir** — comparaison d’un anneau décalé et inversé, exploration interactive et exhaustive des 24 rotations. 4 mini-exercices : même cube ou miroir. Seuil : 80 %.
8. **Orientation des symboles** — flèche, bord physique rouge, voisin ancre, puis lettres asymétriques et formes invariantes. 5 mini-exercices : rotation 0/90/180/270 et orientation indifférente. Seuil : 80 %.
9. **Résoudre le vrai exercice** — gameplay sans chrono, méthode en six étapes et trois exemples révélés progressivement : opposées seules, deux candidats/anneau, orientations multiples. 5 validations : trois décisions intermédiaires puis deux planches complètes non chronométrées. Seuil : 80 %.
10. **Méthode chrono PSY0** — routine cible 0–10, 10–30, 30–45, 45–55, 55–60 secondes, explicitement présentée comme objectif d’entraînement. 3 validations : ordonner les fenêtres, choisir l’action suivante et réussir une simulation guidée de 60 secondes. Le bilan reste lisible sans condition.

Le parcours livre donc 39 validations pédagogiques distinctes. Elles peuvent être régénérées à partir de fixtures sûres, mais leur nombre, leur compétence et leur niveau restent déterministes.

Un chapitre devient accessible lorsque le précédent est validé. Les chapitres terminés restent librement accessibles. Le chapitre courant est repris au dernier écran incomplet.

## Évaluation finale

Le cours est terminé si les résultats pédagogiques récents atteignent :

- opposées ≥ 90 % ;
- adjacence ≥ 90 % ;
- ceinture ≥ 90 % ;
- anneaux ≥ 80 % ;
- miroir ≥ 80 % ;
- orientation ≥ 80 % ;
- chapitres 1 à 10 validés.

Une compétence insuffisante produit un lien direct vers son chapitre et son drill. Le statut « cours terminé » ne dépend pas du score des planches réelles.

## Progression et stockage

Une clé dédiée versionnée stocke : chapitre courant, écrans terminés, validations, tentatives de mini-drills et évaluation finale. Les tentatives de cours ont leur propre type et ne rejoignent jamais `CubeAttemptRecord`.

Le schéma initial est `psy0:cubes:course:v1`. Une migration tolérante initialise un profil neuf et conserve les champs reconnus si une version future remplace la clé. Les erreurs du cours sont pédagogiques et n’alimentent ni l’historique réel ni les statistiques de simulation.

Le stockage Coach existant conserve uniquement : planches complètes, drills autonomes et historique. Les anciennes données lisibles restent disponibles. Une donnée corrompue est ignorée sans faire planter le hub.

## Entraînement réel et indices

`/cubes/train` lance des séries de 5 ou 10 planches. Le composant réel reçoit un bouton « Besoin d’un indice » avec quatre niveaux :

1. rappeler la famille de règle sans nommer de face ;
2. indiquer le trou et sa face opposée visible ;
3. poser la question de transfert vers la référence ;
4. surligner la face correcte.

Les niveaux sont séquentiels. Le nombre d’indices est associé à la tentative par graine/session, puis effacé après enregistrement.

Le compteur transite par un registre runtime local au module Cubes, indexé par identifiant stable de planche. L’enregistrement final copie `hintsUsed` dans `CubeAttemptRecord`; aucune variable globale ni donnée d’un autre exercice n’est utilisée.

Après une bonne réponse, la correction affiche seulement temps, chemin minimal et astuce éventuelle. Le temps de réponse est fourni au composant d’explication via un champ optionnel du contrat de session, sans dupliquer un chronomètre dans le Coach. Après une erreur, elle affiche la première erreur, une animation courte, « Pourquoi cette face tourne ? » si nécessaire et un lien vers le chapitre associé. La géométrie exhaustive reste disponible derrière « Comprendre en détail ».

## Visuels et interaction

Les primitives nécessaires sont : patron neutre coloré, pliage synchronisé, cube manipulable, arête partagée, ceinture, redépliage par face centrale, anneau numéroté, explorateur des 24 rotations, miroir comparatif, face à flèche avec bord physique, exemple progressif et patron réel.

Desktop est prioritaire ; le sommaire devient horizontal déroulant sur mobile. Les contrôles restent accessibles au clavier. Les animations ne bouclent pas sans contrôle et respectent `prefers-reduced-motion`.

## Tests et preuves de livraison

- Tests unitaires des chapitres, prérequis, seuils et migration du stockage.
- Tests géométriques de chaque fixture et exemple.
- Tests garantissant que toute notion demandée a été introduite dans un chapitre antérieur ou courant.
- Tests des mini-drills sur un grand ensemble de graines.
- Test que toute animation finale appartient à l’orbite du cube de référence.
- Différentiel géométrique existant toujours à zéro divergence.
- Tests des indices et de leur comptage.
- Tests de séparation entre progression du cours et performances réelles.
- Typecheck, suite complète, build et contrôle navigateur.
- Dix captures desktop, une par chapitre, plus contrôles mobile des chapitres 1, 5, 8 et 9.

## Suppression et migration

L’ancienne leçon et ses scènes seront supprimées après remplacement de leurs usages. Les briques Coach ne seront pas supprimées : elles seront limitées à la correction des planches réelles. Le hub actuel sera remplacé, `CubesGuidedSolve` sera absorbé par le chapitre 9, et les drills/historique seront déplacés vers les routes définitives.

La livraison n’est considérée terminée que si les dix chapitres sont navigables, possèdent leurs mini-exercices, produisent les seuils attendus et si les captures montrent une explication visuelle réelle sur chacun.
