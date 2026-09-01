# Cubes Mental Ring 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le chapitre 6 en apprentissage progressif et mesurable de la reconstruction mentale des anneaux autour des six faces.

**Architecture:** Un modèle pur dérive scène, rotations, anneaux et distracteurs de `FACE_FRAMES`, `getClockwiseNeighbors()` et `ALL_ROTATIONS`. Une scène React Three Fiber consomme ce modèle, tandis qu’un stockage v2 conserve séparément les tentatives « Anneau de tête » et la validation historique.

**Tech Stack:** React 19, TypeScript strict, React Three Fiber, Drei, Three.js, Vitest, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-09-01-cubes-mental-ring-3d-design.md`

## Global Constraints

- Ne modifier ni `cubeGeometry`, ni le générateur du jeu, ni `validate()`.
- Ne créer aucune table manuelle des six anneaux.
- Ne pas ajouter de dépendance.
- Conserver l’accès existant aux chapitres 7–10 après migration.
- Masquer toute aide 3D avant réponse en mode mental.
- Respecter `prefers-reduced-motion`.

---

### Task 1: Modèle pur de scène et générateurs de drills

**Files:**
- Create: `src/exercises/cubes/course/ringSceneModel.ts`
- Create: `src/exercises/cubes/course/ringSceneModel.test.ts`

**Interfaces:**
- Consumes: `FACE_FRAMES`, `getClockwiseNeighbors`, `getOppositePosition`, `ALL_ROTATIONS`, `COURSE_FACE_TO_POSITION`, `COURSE_POSITION_TO_FACE`.
- Produces: `buildRingScene(faceId, quarterTurn)`, `buildMentalRingQuestion(seed)`, `buildDirectionalRingQuestion(seed)`, `isRingRotation`, `isMirrorOrder`, `RingScene`.

- [ ] Écrire les tests pour les six normales recentrées, les quatre positions, les quarts de tour et les miroirs.
- [ ] Lancer `npm test -- --run src/exercises/cubes/course/ringSceneModel.test.ts` et constater l’échec.
- [ ] Implémenter les matrices 3×3 pures, le décalage circulaire et les générateurs déterministes.
- [ ] Relancer le test ciblé et vérifier qu’il passe.
- [ ] Committer avec `feat(cubes): derive mental ring scenes from geometry`.

### Task 2: Progression v2 et maîtrise mentale

**Files:**
- Modify: `src/exercises/cubes/course/courseProgress.ts`
- Modify: `src/exercises/cubes/course/courseProgress.test.ts`
- Modify: `src/exercises/cubes/course/courseModel.ts`

**Interfaces:**
- Consumes: `MentalRingAttempt` et la logique historique v1.
- Produces: `recordMentalRingAttempt`, `getMentalRingMastery`, `getMentalRingStats`, stockage `schemaVersion: 2`.

- [ ] Écrire les tests de migration, non-régression des accès, fenêtre de 20, seuil 12/80 %, quatre faces et cinq dernières sans aide.
- [ ] Lancer le test ciblé et constater l’échec.
- [ ] Implémenter la migration qui capture la complétion historique avant d’appliquer les critères v2.
- [ ] Adapter `isChapterComplete`, `getChapterStatus` et `getCourseEvaluation` sans reverrouillage.
- [ ] Relancer les tests progression et modèle.
- [ ] Committer avec `feat(cubes): track mental ring mastery`.

### Task 3: Cube 3D pédagogique

**Files:**
- Create: `src/exercises/cubes/course/visuals/MentalRingCube3D.tsx`
- Create: `src/exercises/cubes/course/visuals/MentalRingCube3D.test.tsx`
- Create: `src/exercises/cubes/course/visuals/useReducedMotion.ts`

**Interfaces:**
- Consumes: `RingScene`, `COURSE_CUBE`, `COURSE_FACE_COLORS`.
- Produces: `MentalRingCube3D` avec commandes de recentrage, quart de tour, exploration et couches d’aide.

- [ ] Écrire les tests de rendu accessibles : face centrale, opposée, voisins 1–4 et mode masqué.
- [ ] Lancer le test ciblé et constater l’échec.
- [ ] Construire six plans à partir des frames, textures locales et quaternion cible dérivé de la matrice de scène.
- [ ] Ajouter interpolation `useFrame`, contrôles libres, reset et réduction de mouvement.
- [ ] Relancer les tests ciblés.
- [ ] Committer avec `feat(cubes): add interactive mental ring cube`.

### Task 4: Atelier synchronisé et niveaux d’aide

**Files:**
- Rewrite: `src/exercises/cubes/course/visuals/RingCubeWorkshop.tsx`
- Modify: `src/exercises/cubes/course/visuals/RingCubeWorkshop.test.tsx`
- Modify: `src/exercises/cubes/course/visuals/CourseNet.tsx`

**Interfaces:**
- Consumes: `buildRingScene`, `MentalRingCube3D`.
- Produces: les trois zones synchronisées, niveaux guidé/semi-guidé/mental et commandes d’exploration.

- [ ] Écrire les tests de masquage mental, révélation après réponse et synchronisation du quart de tour.
- [ ] Lancer le test ciblé et constater l’échec.
- [ ] Remplacer le cube éclaté par patron + vraie 3D + anneau.
- [ ] Ajouter modes, couches d’exploration et séquence « d’où vient l’anneau ».
- [ ] Relancer les tests ciblés.
- [ ] Committer avec `feat(cubes): rebuild ring workshop around 3d transfer`.

### Task 5: Drills, correction et statistiques visibles

**Files:**
- Create: `src/exercises/cubes/course/visuals/MentalRingDrill.tsx`
- Create: `src/exercises/cubes/course/visuals/MentalRingDrill.test.tsx`
- Modify: `src/exercises/cubes/course/visuals/RingCubeWorkshop.tsx`
- Modify: `src/exercises/cubes/pages/CubesProgressPage.tsx`

**Interfaces:**
- Consumes: générateurs de Task 1 et persistance de Task 2.
- Produces: drill anneau complet, voisin directionnel, correction 3D et panneau de statistiques.

- [ ] Écrire les tests : quatre choix avec une réponse valide, voisin directionnel exact, absence d’aide avant réponse, correction géométrique.
- [ ] Lancer les tests et constater l’échec.
- [ ] Implémenter les deux drills et enregistrer toutes les tentatives dédiées.
- [ ] Afficher les six statistiques et l’état `mentalRingMastery`.
- [ ] Relancer les tests ciblés.
- [ ] Committer avec `feat(cubes): add mental ring drills and stats`.

### Task 6: Validation visuelle et vérification finale

**Files:**
- Create: `artifacts/cubes-mental-ring-3d/*.png`
- Modify only if a visual regression is proven by browser inspection.

**Interfaces:**
- Consumes: chapitre 6 complet.
- Produces: sept captures demandées et validation finale.

- [ ] Démarrer Vite et ouvrir le chapitre 6 en aperçu.
- [ ] Capturer A face caméra, E face caméra, avant/après quart de tour, question mentale, correction et miroir.
- [ ] Vérifier la console et les comportements clavier/mobile.
- [ ] Lancer `npm run typecheck`, `npm test`, `npm run build`.
- [ ] Corriger toute régression, relancer les trois commandes et vérifier `git diff --check`.
- [ ] Committer les captures et correctifs avec `test(cubes): validate mental ring course visually`.

