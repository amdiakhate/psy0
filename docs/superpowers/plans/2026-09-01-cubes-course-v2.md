# Cubes Course V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer les ateliers 5, 6, 8 et 9 du cours Cubes en explications spatiales animées, synchronisées et interactives, tout en conservant le moteur et le gameplay actuels.

**Architecture:** Les nouvelles scènes restent sous `course/visuals/` et consomment exclusivement les relations produites par le moteur actuel. Un composant partagé `PhysicalEdgeJourney` rend le trajet d'une arête physique dans le cours, le Coach et l'historique. Les planches guidées sont recherchées de façon déterministe dans les sorties du générateur selon leur `ReasoningPath`, sans écrire une seconde géométrie pédagogique.

**Tech Stack:** React 19, TypeScript strict, SVG/CSS, Vitest, Vite, Tailwind CSS existant.

**Spec:** `docs/superpowers/specs/2026-09-01-cubes-course-rebuild-design.md`, complétée par le patch V2 validé dans la conversation du 1er septembre 2026.

## Global Constraints

- Ne pas modifier `src/exercises/cubes/domain/cubeGeometry.ts`, `src/exercises/cubes/fold-model.ts`, `src/exercises/cubes/generator.ts` ni `validate()` sauf nécessité démontrée par un test.
- Ne pas modifier le gameplay réel.
- Toutes les relations de faces, d'arêtes, d'anneaux et de rotations proviennent des fonctions géométriques existantes.
- Les animations durent entre 300 et 800 ms, sont pilotables et respectent `prefers-reduced-motion`.
- La correction courte ne révèle pas toute la solution ; le détail reste derrière « Comprendre en détail ».
- Le patch n'est terminé qu'après production et inspection des cinq captures prioritaires demandées.

---

### Task 1: PhysicalEdgeJourney partagé

**Files:**
- Create: `src/exercises/cubes/course/visuals/PhysicalEdgeJourney.tsx`
- Create: `src/exercises/cubes/course/visuals/PhysicalEdgeJourney.test.tsx`
- Modify: `src/exercises/cubes/course/visuals/PriorityWorkshops.tsx`
- Modify: `src/exercises/cubes/coach/CubeRotationExplanation.tsx`

**Interfaces:**
- Consumes: `FaceEdge`, `QuarterTurn`, `rotateEdge()`, `getSharedEdge()`, `Glyph`.
- Produces: `PhysicalEdgeJourneyProps`, `PhysicalEdgeJourney`, et une vue en trois panneaux réutilisable.

- [ ] **Step 1: Écrire les tests de parcours physique**

Tester par rendu statique que les trois vues, le voisin ancre, l'arête source, l'arête cible et les quatre choix de rotation sont présents, et que `referenceRot` est distinct de l'orientation tentée.

- [ ] **Step 2: Vérifier l'échec ciblé**

Run: `npx vitest run src/exercises/cubes/course/visuals/PhysicalEdgeJourney.test.tsx`
Expected: FAIL car `PhysicalEdgeJourney` n'existe pas.

- [ ] **Step 3: Implémenter le composant**

Créer une API explicite :

```ts
export interface PhysicalEdgeJourneyProps {
  face: { sym: number; referenceRot: QuarterTurn; expectedRot: QuarterTurn };
  anchor: { label: string };
  sourceEdge: FaceEdge;
  targetEdge: FaceEdge;
  originalNet?: ReactNode;
  targetNet?: ReactNode;
  interactive?: boolean;
}
```

Le même groupe SVG contient le symbole et l'arête rouge afin qu'ils tournent ensemble. Le choix utilisateur est validé seulement après clic ; la réponse attendue n'est pas affichée avant la tentative.

- [ ] **Step 4: Remplacer les deux explications locales**

Le chapitre 8 et `CubeRotationExplanation` utilisent le composant partagé. Le Coach lui transmet `referenceRot`, `expectedRot`, `sourceEdge`, `targetEdge` et le voisin ancre issus du diagnostic existant.

- [ ] **Step 5: Lancer les tests ciblés et committer**

Run: `npx vitest run src/exercises/cubes/course/visuals/PhysicalEdgeJourney.test.tsx src/exercises/cubes/course/visuals/priorityScenes.test.tsx`
Expected: PASS.

Commit: `feat(cubes): teach physical edge rotation visually`

### Task 2: Recentrage animé en six étapes

**Files:**
- Create: `src/exercises/cubes/course/visuals/TeachingCubeView.tsx`
- Create: `src/exercises/cubes/course/visuals/RecenterSequence.tsx`
- Create: `src/exercises/cubes/course/visuals/RecenterSequence.test.tsx`
- Modify: `src/exercises/cubes/course/visuals/PriorityWorkshops.tsx`

**Interfaces:**
- Consumes: `COURSE_CUBE`, `COURSE_FACE_TO_POSITION`, `ALL_ROTATIONS`, `applyRotation()`, `foldedFaces()`.
- Produces: une scène six étapes et une vue de cube pédagogique avec surbrillance stable.

- [ ] **Step 1: Tester les six recentrages**

Pour A à F, vérifier qu'une rotation existante amène la face choisie en `POS.F`, que son identité reste inchangée et que l'opposée n'entre jamais dans son anneau.

- [ ] **Step 2: Vérifier l'échec ciblé**

Run: `npx vitest run src/exercises/cubes/course/visuals/RecenterSequence.test.tsx`
Expected: FAIL car le séquenceur n'existe pas.

- [ ] **Step 3: Construire la double vue synchronisée**

Afficher le patron 2D à gauche et le cube à droite. Les six étapes sont : patron initial, face sélectionnée, pliage, cube orienté face choisie devant, redépliage, patron final. Exposer Lecture, Pause, Étape précédente, Étape suivante et Rejouer.

- [ ] **Step 4: Respecter le mouvement réduit**

La lecture automatique est désactivée sous `prefers-reduced-motion`; les contrôles pas à pas restent utilisables.

- [ ] **Step 5: Lancer les tests et committer**

Run: `npx vitest run src/exercises/cubes/course/visuals/RecenterSequence.test.tsx src/exercises/cubes/course/visuals/priorityScenes.test.tsx`
Expected: PASS.

Commit: `feat(cubes): animate face recentering sequence`

### Task 3: Cube et anneau synchronisés

**Files:**
- Create: `src/exercises/cubes/course/visuals/RingCubeWorkshop.tsx`
- Create: `src/exercises/cubes/course/visuals/RingCubeWorkshop.test.tsx`
- Modify: `src/exercises/cubes/course/visuals/PriorityWorkshops.tsx`

**Interfaces:**
- Consumes: `getCourseRing()`, `getCourseOpposite()`, `TeachingCubeView`.
- Produces: vue éclatée numérotée 1–4, anneau synchronisé et comparaison miroir.

- [ ] **Step 1: Tester toutes les faces centrales et les offsets**

Vérifier que chaque anneau contient quatre voisins distincts, que l'offset décale l'ordre sans l'inverser et que la version miroir inverse le sens.

- [ ] **Step 2: Vérifier l'échec ciblé**

Run: `npx vitest run src/exercises/cubes/course/visuals/RingCubeWorkshop.test.tsx`
Expected: FAIL avant l'implémentation.

- [ ] **Step 3: Implémenter les deux vues synchronisées**

Une seule liste `shownRing` alimente les positions 1–4 du cube éclaté et du cercle. « Tourner l'anneau » modifie les deux vues. « Voir l'ordre miroir » affiche valide et inversé côte à côte, avec le lien vers le chapitre 7.

- [ ] **Step 4: Ajouter les états visuels de mini-drill**

Prévoir les prompts visuels voisin droit, quatrième voisin, ordre atteignable et rotation/miroir sans nouvelle logique géométrique.

- [ ] **Step 5: Lancer les tests et committer**

Run: `npx vitest run src/exercises/cubes/course/visuals/RingCubeWorkshop.test.tsx src/exercises/cubes/course/visuals/priorityScenes.test.tsx`
Expected: PASS.

Commit: `feat(cubes): synchronize cube and neighbor ring`

### Task 4: Fixtures guidées et indices du chapitre 9

**Files:**
- Create: `src/exercises/cubes/course/guidedFixtures.ts`
- Create: `src/exercises/cubes/course/guidedFixtures.test.ts`
- Create: `src/exercises/cubes/course/visuals/GuidedRealBoards.tsx`
- Create: `src/exercises/cubes/course/visuals/GuidedRealBoards.test.tsx`
- Modify: `src/exercises/cubes/course/ChapterVisuals.tsx`
- Modify: `src/exercises/cubes/coach/cubeHints.ts`
- Modify: `src/exercises/cubes/coach/cubeHints.test.ts`
- Modify: `src/exercises/cubes/CubesExercise.tsx`
- Modify: `src/exercises/cubes/CubeSvg.tsx`

**Interfaces:**
- Consumes: `generate()`, `buildReasoningPath()`, `CubesExercise`, `NetSvg`.
- Produces: `getGuidedFixture('opposites' | 'two-candidates' | 'orientation')` et métadonnée `highlightReferenceFaceId` au niveau 4.

- [ ] **Step 1: Écrire les tests de recherche de fixtures**

Exiger qu'une graine « opposites » n'ait pas de comparaison d'anneau, qu'une graine « two-candidates » contienne `two-candidates` puis `ring-comparison`, et qu'une graine « orientation » contienne au moins deux `orientation-anchor`. Vérifier le déterminisme.

- [ ] **Step 2: Implémenter la recherche bornée**

Parcourir une plage fixe de graines, générer les vraies questions et retenir la première dont `ReasoningPath.minimalSteps` satisfait le prédicat. Lever une erreur explicite si aucune graine n'est trouvée.

- [ ] **Step 3: Corriger les quatre indices**

Niveau 1 : famille de règle. Niveau 2 : trou. Niveau 3 : face visible. Niveau 4 : texte sans nom de solution plus `highlightReferenceFaceId`. Étendre `NetSvg` pour mettre cette face en évidence sans la déplacer.

- [ ] **Step 4: Construire « Résoudre avec moi »**

Ajouter trois onglets guidés. Chaque action correspond au prochain `ReasoningStep` réel : choix du trou, face opposée, pièce, comparaison d'anneau ou rotation. Le niveau 4 ne remplit jamais une case.

- [ ] **Step 5: Tester et committer**

Run: `npx vitest run src/exercises/cubes/course/guidedFixtures.test.ts src/exercises/cubes/course/visuals/GuidedRealBoards.test.tsx src/exercises/cubes/coach/cubeHints.test.ts`
Expected: PASS.

Commit: `feat(cubes): add guided real-board lessons`

### Task 5: Correction progressive, captures et validation finale

**Files:**
- Modify: `src/exercises/cubes/coach/CubeCoachCorrection.tsx`
- Modify: `src/exercises/cubes/coach/CubeRotationExplanation.tsx`
- Modify: `src/exercises/cubes/pages/CubesHistoryPage.tsx` only if a prop is required for replay.
- Modify: `src/index.css`
- Create: `artifacts/cubes-course-v2/chapter-05-recenter-e.png`
- Create: `artifacts/cubes-course-v2/chapter-06-cube-ring.png`
- Create: `artifacts/cubes-course-v2/chapter-08-physical-edge.png`
- Create: `artifacts/cubes-course-v2/chapter-09-hints-1-4.png`
- Create: `artifacts/cubes-course-v2/correction-wrong-orientation.png`

**Interfaces:**
- Consumes: `CubeAttemptAnalysis`, `PhysicalEdgeJourney`, les composants détaillés existants.
- Produces: correction niveau 1 ciblée et panneau niveau 2 complet.

- [ ] **Step 1: Tester la divulgation progressive**

Le rendu initial incorrect contient la première cause et son action ciblée, mais pas le patron solution. Après « Comprendre en détail », le contenu complet reste disponible. Toute orientation erronée expose immédiatement « Pourquoi cette face tourne ? ».

- [ ] **Step 2: Implémenter la correction minimale**

Prioriser identité/opposée, anneau/miroir, puis orientation. Ne montrer le patron solution et l'analyse exhaustive que dans le détail.

- [ ] **Step 3: Finaliser les transitions CSS**

Ajouter uniquement les animations nécessaires aux scènes, avec `@media (prefers-reduced-motion: reduce)` qui supprime l'auto-animation sans masquer d'état.

- [ ] **Step 4: Exécuter la validation géométrique et applicative**

Run: `npm run test:cubes:exhaustive && npm run typecheck && npm run test && npm run build`
Expected: zéro divergence exhaustive, zéro erreur TypeScript, tous les tests verts, build Vite réussi.

- [ ] **Step 5: Produire et inspecter les captures prioritaires**

Capturer les chapitres 5, 6, 8, les quatre niveaux d'indice d'une même planche et une vraie erreur d'orientation. Inspecter chaque image pour vérifier lisibilité, synchronisation, absence de contenu hors cadre et cohérence des identités de faces.

- [ ] **Step 6: Commit final**

Commit: `feat(cubes): complete visual course v2`

## Self-review

- Couverture : les chapitres 5, 6, 8 et 9, les indices, la correction progressive et les cinq captures ont chacun une tâche explicite.
- Périmètre : aucun fichier moteur protégé n'apparaît dans la liste des fichiers à modifier.
- Source de vérité : toutes les scènes consomment `rotateEdge`, `getSharedEdge`, `getCourseRing`, `ALL_ROTATIONS`, `foldedFaces`, `generate` ou `buildReasoningPath`.
- Divulgation : la solution complète n'est accessible qu'au second niveau de correction.
- Accessibilité : les contrôles restent des boutons nommés ; le mouvement réduit conserve les étapes manuelles.
