# Cubes — apprentissage 3D des anneaux de tête

Date : 2026-09-01

## Objectif

Faire du chapitre 6 un transfert progressif entre le patron de référence et la résolution mentale du vrai exercice. L’utilisateur doit pouvoir reconstruire l’ordre horaire des quatre voisins autour de n’importe quelle face, sans mémoriser une table A–F et sans voir le cube avant de répondre dans le niveau final.

Le patch ne modifie ni `cubeGeometry`, ni le générateur du vrai exercice, ni `validate()`. Toutes les relations affichées et évaluées restent dérivées des repères géométriques existants.

## Principes

- Le patron 2D, le cube 3D et l’anneau aplati représentent le même état.
- Sélectionner une face déclenche une rotation physique du cube qui place sa normale face à la caméra.
- Les positions 1–4 désignent toujours haut, droite, bas, gauche lorsque la face centrale est vue de l’extérieur.
- Un quart de tour autour de la normale conserve la face centrale et décale simultanément les voisins et l’anneau.
- Les anneaux viennent de `getClockwiseNeighbors()` ; aucune table A/B/C/D/E/F n’est créée.
- La 3D disparaît avant réponse au niveau mental et ne revient qu’en correction explicite.
- Les anciens utilisateurs conservent leurs déverrouillages, mais la nouvelle maîtrise reste à acquérir.

## Modèle de scène

Un module pur `course/ringSceneModel.ts` traduit les primitives existantes en état pédagogique :

```ts
interface RingLearningState {
  centerFaceId: CourseFaceId;
  quarterTurn: 0 | 1 | 2 | 3;
  level: 'guided' | 'semi-guided' | 'mental';
  reveal3D: boolean;
}

interface RingScene {
  centerFaceId: CourseFaceId;
  centerPosition: FacePosition;
  oppositeFaceId: CourseFaceId;
  clockwiseNeighbors: readonly [CourseFaceId, CourseFaceId, CourseFaceId, CourseFaceId];
  displayedNeighbors: readonly [CourseFaceId, CourseFaceId, CourseFaceId, CourseFaceId];
  cubeTransform: readonly number[];
}
```

Le module utilise uniquement :

- `COURSE_FACE_TO_POSITION` et `COURSE_POSITION_TO_FACE` ;
- `FACE_FRAMES` ;
- `getClockwiseNeighbors()` et `getOppositePosition()` ;
- `ALL_ROTATIONS` pour contrôler les rotations propres et les miroirs.

### Orientation face caméra

Pour une face choisie, la base locale `[right, up, normal]` fournie par `FACE_FRAMES` est transformée vers la base écran `[+X, +Y, +Z]`. La matrice correspondante est convertie en quaternion dans la couche Three.js. Le groupe représentant le cube interpole son quaternion courant vers ce quaternion cible.

Le quart de tour demandé par l’utilisateur est appliqué autour de l’axe écran `+Z` après recentrage. La même valeur décale `displayedNeighbors`, ce qui garantit la synchronisation cube/anneau.

## Vue 3D

`MentalRingCube3D.tsx` utilise `@react-three/fiber`, `@react-three/drei` et `three`, déjà présents.

Chaque face est un plan indépendant :

- position = normale multipliée par la demi-taille du cube ;
- orientation = repères `right` et `up` de `FACE_FRAMES` ;
- texture = couleur et identité stable A–F ;
- numéro 1–4 ajouté aux voisines selon l’état pédagogique ;
- face opposée rendue atténuée lorsqu’elle est visible en exploration ;
- arêtes activables avec le mécanisme léger existant de Three.js.

La caméra reste fixe. Le cube tourne réellement. `OrbitControls` autorise l’exploration libre ; une commande « Mettre cette face devant moi » réinitialise la caméra puis réapplique la transformation géométrique cible.

Toutes les interpolations respectent `prefers-reduced-motion` : transition immédiate lorsque les animations sont réduites.

## Chapitre 6

`RingCubeWorkshop` devient un orchestrateur composé de :

- `ReferenceRingNet` : patron neutre et face centrale mise en évidence ;
- `MentalRingCube3D` : vraie scène manipulable ;
- `FlattenedRing` : anneau aplati synchronisé ;
- `RingLearningModeSelector` : guidé, semi-guidé, mental ;
- `RingHeadDrill` : ordre complet ;
- `DirectionalNeighborDrill` : haut, droite, bas, gauche ;
- `RingMirrorComparison` : rotation propre contre ordre inversé ;
- `RingOriginSequence` : patron → pliage → cube → recentrage → voisins → anneau.

### Niveaux d’aide

1. Guidé : cube, noms et numéros visibles immédiatement.
2. Semi-guidé : cube visible, noms des voisins masqués jusqu’à la réponse.
3. Mental : seul le patron et la question sont visibles avant réponse. Le cube apparaît uniquement après « Vérifier sur le cube 3D ».

Le niveau proposé progresse selon les tentatives : guidé au départ, semi-guidé après des réponses correctes sur plusieurs faces, mental dès que l’échantillon est suffisant. L’utilisateur peut néanmoins sélectionner manuellement un niveau inférieur pour revoir la mécanique.

## Drills

### Anneau de tête

Une face centrale est tirée parmi A–F. Quatre ordres sont générés à partir de l’anneau réel :

- une rotation circulaire valide ;
- l’ordre miroir ;
- deux permutations plausibles non équivalentes.

Une seule option est compatible avec les rotations circulaires de l’anneau réel. L’ordre de départ varie pour empêcher la mémorisation d’une chaîne fixe.

Après réponse, la correction compare la réponse choisie et l’ordre valide. La 3D recentre la face, numérote les voisins puis joue un quart de tour. En cas de miroir, l’ordre inversé est affiché en rouge et comparé aux 24 rotations propres.

### Voisin directionnel

Une face centrale et une direction parmi haut, droite, bas, gauche sont choisies. La réponse est calculée depuis l’entrée correspondante de `getClockwiseNeighbors()`. La correction révèle le cube recentré et le numéro de la direction.

## Exploration libre

La zone d’exploration permet :

- de cliquer une face ;
- de la placer devant ;
- de tourner librement le cube ;
- d’afficher ou masquer voisins, opposée, numéros, anneau et arêtes.

Les aides d’exploration ne créent pas de tentative et n’influencent pas la maîtrise.

## Progression et migration

Le stockage `cubes-course-v1` conserve sa clé mais passe à `schemaVersion: 2`.

```ts
interface MentalRingAttempt {
  id: string;
  answeredAt: string;
  centerFaceId: CourseFaceId;
  kind: 'right' | 'left' | 'top' | 'bottom' | 'full-ring' | 'mirror';
  correct: boolean;
  cubeVisibleBeforeAnswer: boolean;
  aidLevel: 1 | 2 | 3;
}

interface CubeCourseProgressV2 {
  schemaVersion: 2;
  currentChapterId: string;
  completedScreens: string[];
  attempts: CubeCourseAttempt[];
  historicallyCompletedChapterIds: string[];
  mentalRingAttempts: MentalRingAttempt[];
}
```

### Migration v1 → v2

Avant toute réévaluation avec les nouvelles règles, la migration applique les anciens critères aux tentatives v1. Si l’ancien chapitre 6 était complet, son identifiant est enregistré dans `historicallyCompletedChapterIds`.

Conséquences :

- le chapitre 6 historiquement validé continue de débloquer la suite ;
- les chapitres déjà accessibles ne sont pas reverrouillés ;
- `mentalRingMastery` vaut faux tant que le nouveau drill n’est pas validé ;
- la complétion globale V2 exige `mentalRingMastery`, y compris pour les anciens utilisateurs.

Pour un nouvel utilisateur v2, la complétion normale du chapitre 6 exige les validations pédagogiques existantes et `mentalRingMastery`.

### Critère mentalRingMastery

La fenêtre contient les 20 dernières tentatives du drill mental. Elle doit satisfaire simultanément :

- au moins 12 tentatives ;
- au moins 80 % de réponses correctes ;
- au moins 4 faces centrales différentes ;
- les 5 dernières tentatives ont `cubeVisibleBeforeAnswer === false`.

Une tentative répétée compte, mais la diversité des quatre faces empêche de réussir en répétant un seul cas.

## Statistiques

Les statistiques sont calculées séparément pour :

- voisin haut ;
- voisin droite ;
- voisin bas ;
- voisin gauche ;
- anneau complet ;
- rotation valide contre miroir.

Le chapitre affiche le nombre correct/total et le pourcentage lorsqu’un échantillon existe. La maîtrise globale « Anneau de tête » est distincte de la compétence historique `ring`.

## Accessibilité et interaction

- Les informations couleur possèdent toujours un numéro et un libellé.
- La scène 3D possède une description textuelle synchronisée.
- Tous les contrôles sont des boutons clavier accessibles.
- Le mode mental ne laisse aucun voisin dans le DOM accessible avant révélation.
- Les animations peuvent être interrompues et sont neutralisées avec `prefers-reduced-motion`.
- Sur mobile, les trois zones s’empilent ; la scène garde une hauteur tactile minimale.

## Tests

### Domaine

- chacune des six faces produit une transformation dont la normale aboutit vers la caméra ;
- les positions 1–4 correspondent exactement à `getClockwiseNeighbors()` ;
- les quatre quarts de tour décalent cube et anneau de la même manière ;
- tout distracteur miroir est absent des 24 rotations propres ;
- les options contiennent exactement une classe de rotation valide ;
- aucun mapping manuel des six anneaux n’existe dans le module.

### Progression

- migration d’un chapitre 6 anciennement validé sans perte d’accès ;
- `mentalRingMastery` faux après migration ;
- seuil de 12 tentatives, quatre faces, 80 % et cinq réponses mentales ;
- complétion globale V2 bloquée sans maîtrise ;
- nouvel utilisateur bloqué au chapitre 6 tant que la maîtrise manque.

### Interface

- mode mental sans cube ni noms de voisins avant réponse ;
- correction 3D utilisant l’ordre calculé ;
- sélection A–F transmise à la transformation réelle ;
- rotation de 90° synchronisée avec l’anneau ;
- respect du mode de réduction des animations.

## Validation visuelle

Captures requises :

1. A face caméra avec voisins numérotés ;
2. E face caméra ;
3. cube et anneau avant rotation ;
4. cube et anneau après rotation de 90° ;
5. question mentale sans aide ;
6. correction mentale avec cube révélé ;
7. ordre miroir comparé.

La livraison exige ensuite `typecheck`, la suite complète de tests et le build de production.

## Hors périmètre

- modification de `cubeGeometry` ;
- modification du générateur ou de `validate()` ;
- table principale des six anneaux ;
- nouvelle dépendance 3D ;
- changement du gameplay réel Cubes.
