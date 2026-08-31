# Cubes 2D/3D — Mode Coach visuel

Date : 31 août 2026  
Statut : conception validée, ajustements du 31 août intégrés

## 1. But

Le mode Coach transforme la correction de Cubes 2D/3D en apprentissage ciblé. Après une réponse, l’utilisateur doit comprendre en moins de 60 secondes la première déduction utile, l’erreur décisive et la méthode la plus courte pour la planche jouée.

Le Coach explique d’abord le patron partiellement vide tel qu’il apparaît dans le jeu. La géométrie complète du cube reste disponible derrière « Comprendre en détail ».

Le gameplay normal ne change pas. Le Coach est actif par défaut en entraînement, désactivable dans les réglages et absent des simulations.

## 2. État actuel vérifié

L’exercice actuel repose sur quatre éléments fiables :

- `cube-model.ts` représente les positions `R`, `L`, `U`, `D`, `F`, `B`, les orientations de symboles et les 24 rotations propres du cube ;
- `generator.ts` crée un cube de référence, lui applique une rotation propre, masque deux à quatre faces et fournit exactement une pièce par trou ;
- `validate()` reconstruit le patron puis appelle `sameCube()` ;
- `fold-model.ts` plie le patron `U / L-F-R-B / D` et vérifie sa fermeture, ses charnières et ses normales.

Les 20 tests Cubes existants passent. La vérification des repères donne les anneaux suivants, vus de l’extérieur et lus haut, droite, bas, gauche :

| Face centrale | Anneau |
|---|---|
| R | U, B, D, F |
| L | U, F, D, B |
| U | B, R, F, L |
| D | F, R, B, L |
| F | U, R, D, L |
| B | U, L, D, R |

Ces anneaux devront être dérivés des repères locaux. Cette table documente le résultat attendu ; elle ne servira pas de table de production.

L’état actuel présente quatre limites :

- une face porte seulement `sym` et `rot`, sans identité physique stable ;
- la validation répond vrai ou faux sans qualifier la cause ;
- Cubes n’a pas de composant `Explain`, donc la correction générique affiche seulement les chaînes donné/attendu ;
- `psy0.events` conserve le seed, le niveau, le verdict et le temps, mais pas le diagnostic ni un instantané durable de la planche.

## 3. Périmètre

Le livrable comprend :

- un moteur géométrique unique ;
- un analyseur de tentative ;
- un solveur pédagogique qui produit un chemin minimal ;
- une correction visuelle en deux niveaux ;
- un mode « Résoudre avec moi » ;
- huit drills ciblés ;
- des statistiques par sous-compétence ;
- un historique rejouable ;
- un mémo visuel ;
- un panneau de debug réservé au développement ;
- des tests géométriques, différentiels et de persistance.

Le livrable ne généralise pas le jeu aux onze patrons possibles d’un cube. Le patron de production reste celui de l’exercice actuel. La section « Patrons à connaître » explique ce patron et ses transformations sous rotation. Le drill « Ce patron forme-t-il un cube ? » est reporté, car le gameplay actuel ne mesure pas cette compétence.

## 4. Ordre de livraison et garde de migration

L’implémentation suit cet ordre :

1. figer le comportement de `sameCube()` par des tests de caractérisation ;
2. créer le nouveau moteur sans modifier `validate()` ;
3. comparer l’ancien et le nouveau moteur sur toutes les réponses possibles d’un grand ensemble de planches générées ;
4. produire un rapport automatisé indiquant le nombre de cas comparés et les divergences ;
5. exiger zéro divergence ;
6. basculer `validate()` vers la nouvelle source de vérité, tout en gardant un test différentiel permanent ;
7. construire l’analyseur et le chemin minimal ;
8. ajouter la persistance et les statistiques ;
9. construire la correction, les animations et les drills.

La couche React ne commence qu’après le rapport « divergence = 0 ».

### Comparaison différentielle

Le comparatif utilise au moins 1 000 planches déterministes, soit 200 seeds par niveau. Pour chaque planche, le test énumère :

- toutes les permutations injectives des pièces dans les trous ;
- toutes les orientations visuellement distinctes de chaque pièce ;
- les réponses partielles et les réemplois illicites de pièces dans une série dédiée ;
- la solution attendue et les 24 rotations propres du cube complet.

Pour chaque réponse complète, le test compare l’ancien `sameCube()` au nouveau moteur. Le rapport distingue trois compteurs :

- divergence d’identité de face ;
- divergence d’orientation de symbole ;
- divergence de verdict global.

Une divergence affiche le seed, le niveau, les trous, la réponse, l’état reconstruit et les deux diagnostics. Les trois compteurs doivent être nuls avant la bascule de `validate()`.

Le test différentiel reste dans la suite Vitest. Si son volume nuit au cycle courant, `npm test` conserve un échantillon déterministe et un script `test:cubes:exhaustive` exécute les 1 000 planches. Le rapport exhaustif doit passer avant la bascule du validateur et avant la livraison.

## 5. Modèle géométrique

### Identité stable

Le symbole ne sert plus d’identité technique. Chaque face reçoit un identifiant stable qui survit aux rotations :

```ts
export type FaceId = string;
export type QuarterTurn = 0 | 1 | 2 | 3;
export type FacePosition = 0 | 1 | 2 | 3 | 4 | 5;
export type FaceEdge = 'top' | 'right' | 'bottom' | 'left';

export interface CubeFace {
  id: FaceId;
  sym: number;
  rot: QuarterTurn;
  originalPosition: FacePosition;
}

export type Cube = readonly [CubeFace, CubeFace, CubeFace, CubeFace, CubeFace, CubeFace];
```

`originalPosition` décrit la place physique de départ dans le patron de référence. Une rotation déplace la face sans modifier `id` ni `originalPosition`.

Les pièces proposées portent `faceId` et `sym`. Le rendu continue d’utiliser `sym`. La correction, le solveur et l’historique utilisent `faceId`.

### Repères

Chaque position possède un repère orthonormé entier :

```ts
export interface FaceFrame {
  normal: Vec3;
  right: Vec3;
  up: Vec3;
}
```

Les opposées viennent de normales inverses. Les voisines viennent des normales `up`, `right`, `-up`, `-right`. L’anneau horaire est calculé dans cet ordre. Les arêtes physiques utilisent les mêmes vecteurs.

Aucune table séparée ne décrit les opposées, les voisines ou les anneaux. Les fonctions publiques les dérivent des repères :

```ts
getOppositePosition(position: FacePosition): FacePosition;
getNeighborAtEdge(position: FacePosition, edge: FaceEdge): FacePosition;
getClockwiseNeighbors(position: FacePosition): readonly FacePosition[];
getSharedEdge(a: FacePosition, b: FacePosition): SharedEdge | null;
rotateEdge(edge: FaceEdge, turn: QuarterTurn): FaceEdge;
```

### Rotations et miroirs

Le moteur conserve les 24 rotations propres actuelles. Une disposition compatible par rotation possède un déterminant `+1`. Une disposition qui conserve les opposées mais inverse un anneau possède un déterminant `-1` et reçoit la qualification `mirror`.

La comparaison d’anneaux accepte les décalages circulaires. Elle refuse l’ordre inversé. Une simple rotation du premier élément ne doit jamais produire un faux miroir.

### Orientation visuelle

Le moteur normalise l’orientation selon la symétrie du symbole existante. Carré, octogone, cercle, trèfle et étoile restent invariants par quart de tour. La croix et les lettres conservent leurs quatre orientations.

L’explication d’une rotation part d’une arête physique et d’un voisin ancre. Elle ne compare pas seulement deux nombres `rot`.

## 6. Validation et analyse

Après le rapport différentiel à zéro, `validate()` délègue au moteur géométrique. `sameCube()` reste couvert par le test différentiel pendant la migration.

L’analyseur expose :

```ts
export type CubeErrorCause =
  | 'WRONG_OPPOSITE'
  | 'WRONG_ADJACENCY'
  | 'MIRROR_ORDER'
  | 'WRONG_ROTATION_90'
  | 'WRONG_ROTATION_180'
  | 'SWAPPED_OPPOSITE_PAIR'
  | 'CORRECT_FACE_WRONG_ORIENTATION'
  | 'FACE_CORRECT_BY_ELIMINATION';

export interface ReasoningPath {
  minimalSteps: ReasoningStep[];
  decisiveStepIndex: number;
  alternativeValidSteps?: ReasoningStep[];
}

export interface CubeAttemptAnalysis {
  isCorrect: boolean;
  correctFaces: FaceDiagnostic[];
  incorrectFaces: FaceDiagnostic[];
  oppositePairs: OppositePairDiagnostic[];
  adjacencyErrors: AdjacencyDiagnostic[];
  circularOrderErrors: CircularOrderDiagnostic[];
  orientationErrors: OrientationDiagnostic[];
  mirrorDetected: boolean;
  reasoningPath: ReasoningPath;
}
```

L’API de production est :

```ts
analyzeCubeAttempt(question: CubesQuestion, answer: CubesAnswer): CubeAttemptAnalysis;
```

Le diagnostic distingue trois cas par face : mauvaise identité, bonne identité avec mauvaise orientation, face entièrement correcte. Une erreur d’identité peut recevoir plusieurs indices géométriques, mais une seule cause principale, choisie selon l’ordre pédagogique du chemin minimal.

## 7. Solveur pédagogique et chemin minimal

Le solveur travaille sur le patron cible partiellement vide, les pièces disponibles et les relations dérivées du patron de référence. Il n’expose pas d’emblée toute la géométrie.

### Ordre de raisonnement

1. Construire les candidats de chaque trou parmi les pièces restantes.
2. Chercher un trou dont l’opposée est visible.
3. Placer la face opposée correspondante.
4. Propager l’élimination des pièces utilisées.
5. Détecter l’instant où deux candidats restent indiscernables par les opposées.
6. Choisir une face centrale et comparer son anneau aux voisins visibles du patron cible.
7. Rejeter l’ordre inversé ou la disposition miroir.
8. Orienter les symboles après le placement de toutes les identités.

Le solveur cherche les séquences valides les plus courtes dans ce petit espace d’états. Le coût d’une étape vaut un pour une déduction visible. Les étapes d’orientation viennent après les placements. En cas d’égalité, le solveur préfère : opposée visible, élimination, anneau, orientation.

`decisiveStepIndex` désigne la première étape qui rend la solution unique. `alternativeValidSteps` contient un autre chemin de même longueur lorsqu’il existe, sans alourdir l’affichage principal.

### Étapes possibles

```ts
export type ReasoningStep =
  | OppositeDeductionStep
  | EliminationStep
  | TwoCandidatesStep
  | RingComparisonStep
  | MirrorRejectionStep
  | OrientationAnchorStep;
```

Chaque étape nomme les faces, les positions, les voisins visibles et la conclusion. Le texte React est produit à partir de ces données ; le domaine ne renvoie pas de JSX.

### Affichage

La correction montre d’abord `minimalSteps`. Si deux déductions suffisent, elle n’affiche que ces deux déductions. Le bouton « Comprendre en détail » ouvre les opposées, les anneaux, la détection du miroir et les arêtes physiques.

## 8. Diagnostic des erreurs

### Opposée incorrecte

Le Coach indique la face visible opposée au trou, retrouve son opposée dans la référence et anime cette face vers le trou.

### Deux candidats

Le Coach affiche le moment précis où les opposées cessent de distinguer les deux pièces. Deux mini-diagrammes comparent les candidats. Les anneaux sont affichés avec quatre positions numérotées et des flèches circulaires.

### Miroir

Le moteur signale un miroir seulement si les opposées sont conservées et si l’ordre circulaire est inversé. Le Coach affiche « MIROIR DÉTECTÉ ». Une animation montre qu’une rotation décale l’anneau sans l’inverser.

### Orientation

Le Coach choisit un voisin ancre déjà placé. Il colore l’arête physique commune dans la référence, la retrouve dans la cible puis calcule la rotation signée : aucune, 90° horaire, 90° antihoraire ou 180°.

Une face de symétrie visuelle 4 ne génère jamais d’erreur d’orientation.

Dans la correction courte, chaque erreur d’orientation possède un bouton « Pourquoi cette face tourne ? ». Il ouvre directement l’animation de l’arête physique et du voisin ancre, sans ouvrir les autres sections de géométrie détaillée.

## 9. Correction React

Le module Cubes branche `Explain: CubeCoachCorrection` et `visualCorrectionOnly: true`.

La correction comporte :

1. un résumé : verdict, règle manquée, méthode rapide et nombre de déductions ;
2. le chemin minimal, ouvert par défaut ;
3. un bouton « Voir la correction détaillée » ou « Comprendre en détail » ;
4. les étapes complètes : opposées, déductions, anneau ou miroir si nécessaire, orientations ;
5. la possibilité de cliquer chaque face incorrecte pour lire son diagnostic.

Une bonne réponse peut afficher la méthode rapide si le réglage générique arrête la session après toutes les réponses.

Le réglage `cubeCoachEnabled` vaut `true` par défaut. S’il vaut `false`, la correction revient au rendu normal de la planche avec solution. La simulation ignore toujours le Coach et n’affiche aucune correction pendant les questions.

## 10. Visuels et animations

Les composants réutilisent `NetSvg`, `Glyph`, `FoldingNet`, `FoldPlayer`, les couleurs existantes et la dépendance Three.js déjà installée.

Les nouveaux visuels SVG couvrent :

- paires opposées reliées et colorées ;
- glissement d’une face déduite vers un trou ;
- anneau de voisins autour d’une face ;
- comparaison de deux candidats ;
- anneau inversé ;
- arête physique colorée ;
- rotation isolée d’un symbole.

Chaque animation dure entre 300 et 800 ms par mouvement, propose Rejouer et peut être passée. `prefers-reduced-motion` désactive la lecture automatique et conserve les états finaux ainsi que les contrôles manuels.

La vue 3D reste optionnelle. Elle réutilise `@react-three/fiber`, `@react-three/drei` et `three`. Aucun paquet supplémentaire n’est ajouté.

## 11. Mode « Résoudre avec moi »

Ce mode vit sur la route Cubes et n’est jamais appelé par une simulation. Il suit cinq écrans :

1. sélectionner les trois paires opposées ;
2. choisir une face immédiatement déductible ;
3. choisir entre les deux candidats restants lorsqu’un tel cas existe ;
4. vérifier l’anneau ;
5. orienter les symboles concernés.

Chaque étape valide immédiatement la compétence ciblée. Le mode ne dévoile pas les étapes suivantes avant la réponse. La tentative guidée ne compte pas comme réussite d’un exercice complet.

## 12. Drills

La route Cubes propose huit drills :

1. Opposées ;
2. Adjacence ;
3. Anneaux ;
4. Miroir ;
5. Rotation ;
6. Exercice complet ;
7. Deux faces restantes ;
8. Face correcte, orientation fausse.

### Deux faces restantes

Le générateur produit un patron où les déductions par opposées ont placé toutes les autres faces. Les deux trous restants sont opposés dans la topologie cible : leurs opposées sont donc elles-mêmes inconnues. Les deux pièces restantes forment une paire opposée et seules les relations d’anneau avec les faces visibles les départagent.

Le générateur vérifie que :

- les opposées seules laissent exactement deux solutions candidates ;
- une comparaison d’anneau rend la solution unique ;
- les deux candidats ne diffèrent pas seulement par un symbole visuellement invariant ;
- le cas n’est pas résolu plus tôt par élimination triviale.

Le corpus alterne deux familles : ambiguïté sur la face centrale du patron et ambiguïté sur une autre case. Les tests imposent la présence des deux familles sur un balayage déterministe afin de ne pas enseigner un raccourci lié à une position unique.

### Face correcte, orientation fausse

Toutes les identités sont déjà placées. Un à trois symboles orientables sont remis à zéro ou tournés. L’utilisateur ne modifie que leur orientation. Le drill répartit les solutions entre aucune rotation, 90° horaire, 90° antihoraire et 180°, sans demander l’orientation d’une forme visuellement symétrique.

### Génération ciblée

`forceTag` accepte les identifiants de drills afin que le moteur de session actuel puisse lancer un bloc ciblé. Les générateurs de drills purs restent testables sans React.

## 13. Sous-compétences et statistiques

Les statistiques distinguent au minimum :

```ts
export type CubeSkill =
  | 'opposites'
  | 'adjacency'
  | 'deductive-placement'
  | 'two-candidates-ring'
  | 'mirror'
  | 'rotation-90'
  | 'rotation-180'
  | 'full-puzzle';
```

Une tentative de drill produit un verdict direct pour sa compétence. Une planche complète produit `full-puzzle` et des observations de sous-compétences seulement lorsque le diagnostic permet de les mesurer. Une réussite globale ne donne pas artificiellement 100 % à toutes les sous-compétences.

Après cinq planches complètes ou cinq tentatives mesurables d’une compétence sur la journée, le dashboard affiche le point faible dominant et un bouton de drill. Une compétence à 95 % ne reçoit pas de recommandation si une autre possède assez de données et un taux inférieur.

Les statistiques utilisent une fenêtre récente de 30 observations par compétence et affichent l’effectif. Sous cinq observations, le libellé « échantillon faible » remplace tout verdict de faiblesse.

## 14. Persistance et historique

Une clé dédiée évite de surcharger `psy0.events` :

```ts
export interface CubeCoachStorageV1 {
  schemaVersion: 1;
  attempts: CubeAttemptRecord[];
}

export interface CubeAttemptRecord {
  id: string;
  answeredAt: string;
  sessionId?: string;
  mode: 'full' | 'guided' | 'drill';
  drillType?: CubeDrillType;
  seed: number;
  level: number;
  durationMs: number;
  correct: boolean;
  question: CubesQuestionSnapshot;
  answer: CubesAnswer | null;
  solution: CubesAnswer;
  errorCauses: CubeErrorCause[];
  skills: CubeSkillResult[];
}
```

La clé est `psy0.cubes-coach`. Le lecteur valide la version et les champs indispensables. Un état absent ou corrompu revient à un historique vide sans casser le jeu. Les erreurs d’écriture sont signalées sans annuler le verdict de la planche.

L’instantané conserve les identités, symboles, orientations, trous, pièces et solution afin qu’une ancienne correction reste rejouable après une évolution du générateur.

Le journal générique `psy0.events` continue d’alimenter les scores globaux. Un point d’extension facultatif du module d’exercice permet à SessionRunner de transmettre le résultat complet à Cubes sans ajouter de dépendance Cubes au moteur générique.

L’historique Cubes affiche les planches, le temps, les causes et « Revoir la correction ». Il ne parse jamais `given` ou `expected` depuis les chaînes du journal générique.

## 15. Dashboard et routes

La route `/cubes` devient l’entrée du Coach. Elle contient :

- le mémo « Opposées, placements certains, deux choix : anneau, miroir, orientation » ;
- les huit statistiques ;
- le point faible du jour ;
- les boutons « Résoudre avec moi », drills et exercice complet ;
- l’accès à l’historique ;
- la fiche « Pourquoi la lettre tourne ? » ;
- la section limitée « Patron actuel à connaître ».

La route `/cubes/history` affiche l’historique. Un lien vers `/cubes` apparaît dans la carte Cubes de l’entraînement libre, la leçon et la page d’astuces. La navigation principale ne reçoit pas une nouvelle entrée globale.

## 16. Debug développement

Sous `import.meta.env.DEV`, le Coach propose « Debug cube ». Le panneau affiche :

- identifiants et positions physiques ;
- opposées ;
- voisins et anneaux ;
- repères locaux ;
- arêtes partagées ;
- rotation choisie pour le patron cible ;
- classement propre ou miroir ;
- candidats du solveur à chaque étape.

Le code de production élimine le bouton par branche statique Vite. Aucun réglage local ne peut le réactiver en production.

## 17. Accessibilité et ergonomie

Les boutons et faces interactives ont un nom accessible et un état de focus visible. Les anneaux utilisent couleurs, numéros et texte ; la couleur ne porte jamais seule le verdict. Le clavier permet de parcourir les étapes, rejouer une animation et sélectionner les réponses de drills.

Sur mobile, les comparaisons passent d’un affichage côte à côte à une pile. Les SVG gardent un `viewBox` et une largeur fluide. Le jeu complet reste optimisé pour desktop, sans rendre les corrections inutilisables au toucher.

## 18. Tests

### Géométrie

Les fixtures A/B/C/D/E/F utilisent le patron :

```text
    E
A B C D
    F
```

Les tests couvrent :

- les trois paires opposées ;
- chaque face comme centre ;
- les six anneaux dérivés des repères ;
- l’invariance des anneaux par décalage circulaire ;
- l’inversion des anneaux par miroir ;
- les 24 rotations propres ;
- les rotations de chaque arête à 0°, 90°, 180° et 270° ;
- les symétries visuelles des symboles ;
- les placements complets et partiels ;
- les réponses non bijectives ;
- l’unicité des solutions.

### Analyse et raisonnement

Les tests construisent des tentatives produisant chacune des causes d’erreur. Ils vérifient le `decisiveStepIndex`, l’ordre placement puis orientation et l’absence d’étapes inutiles lorsque les opposées suffisent.

Trois fixtures lisibles verrouillent :

- une planche résolue uniquement par opposées ;
- une planche à deux candidats départagés par anneau ;
- une planche aux bonnes identités avec rotations de 90° et 180°.

### Drills

Chaque générateur produit une solution unique. Le drill « Deux faces restantes » prouve qu’il reste exactement deux candidats avant l’anneau et un seul après. Le drill d’orientation ne choisit que des symboles orientables.

### Persistance et statistiques

Les tests couvrent un navigateur neuf, un état corrompu, la version 1, l’ajout de tentatives, la fenêtre de 30 observations, le seuil de cinq et le calcul du point faible.

### Interface

Les tests purs couvrent les modèles d’étapes et d’animation. Une vérification manuelle finale contrôle desktop, mobile, clavier, toucher, mouvement réduit, mode Coach désactivé et simulation sans Coach.

## 19. Critères d’acceptation

Le livrable est accepté si :

- le rapport différentiel affiche zéro divergence avant la bascule de `validate()` ;
- validation, diagnostic et animations lisent la même géométrie ;
- une planche simple n’affiche aucune étape superflue ;
- le Coach identifie le passage exact à deux candidats ;
- les orientations s’expliquent par une arête physique et un voisin ancre ;
- les huit drills produisent des cas valides et uniques ;
- les huit sous-compétences sont persistées et mesurées sans gonfler les taux ;
- une correction historique reste rejouable ;
- le Coach est actif par défaut, désactivable et absent des simulations ;
- le debug ne figure pas dans la production ;
- `npm run typecheck`, `npm test` et `npm run build` passent.

## 20. Fichiers prévus

### Créations

```text
src/exercises/cubes/domain/types.ts
src/exercises/cubes/domain/cubeGeometry.ts
src/exercises/cubes/domain/cubeAnalysis.ts
src/exercises/cubes/domain/reasoningPath.ts
src/exercises/cubes/domain/cubeDrills.ts
src/exercises/cubes/domain/cubeGeometry.test.ts
src/exercises/cubes/domain/cubeGeometry.differential.test.ts
src/exercises/cubes/domain/cubeAnalysis.test.ts
src/exercises/cubes/domain/reasoningPath.test.ts
src/exercises/cubes/domain/cubeDrills.test.ts
src/exercises/cubes/domain/fixtures.ts
src/exercises/cubes/coach/CubeCoachCorrection.tsx
src/exercises/cubes/coach/CubeCoachVisuals.tsx
src/exercises/cubes/coach/CubeReasoningSteps.tsx
src/exercises/cubes/coach/CubeDetailedGeometry.tsx
src/exercises/cubes/coach/CubeRotationExplanation.tsx
src/exercises/cubes/coach/CubeDebugPanel.tsx
src/exercises/cubes/progress/cubeCoachStorage.ts
src/exercises/cubes/progress/cubeCoachStorage.test.ts
src/exercises/cubes/progress/cubeCoachStats.ts
src/exercises/cubes/progress/cubeCoachStats.test.ts
src/exercises/cubes/pages/CubesCoachPage.tsx
src/exercises/cubes/pages/CubesHistoryPage.tsx
```

### Modifications

```text
src/exercises/cubes/cube-model.ts
src/exercises/cubes/generator.ts
src/exercises/cubes/generator.test.ts
src/exercises/cubes/CubesExercise.tsx
src/exercises/cubes/CubeSvg.tsx
src/exercises/cubes/FoldingNet.tsx
src/exercises/cubes/index.ts
src/exercises/cubes/lesson.tsx
src/core/types.ts
src/core/prefs.ts
src/app/SessionRunner.tsx
src/pages/Settings.tsx
src/pages/Train.tsx
src/pages/Learn.tsx
src/pages/Tips.tsx
src/main.tsx
package.json
```

`package.json` reçoit seulement le script différentiel exhaustif. Aucune dépendance n’est ajoutée.
