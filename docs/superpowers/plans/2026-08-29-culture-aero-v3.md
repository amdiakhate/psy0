# Culture Aéro V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer une banque Culture Aéro locale de 380 questions et 60 fiches, structurée en 180 questions CORE et 200 EXTENDED, avec sélection J-5 et statistiques séparées.

**Architecture:** Les contenus sont répartis par domaine dans des modules TypeScript statiques. Des helpers éditoriaux construisent les objets sans générer de variantes ; le validateur contrôle les volumes et la qualité. Le moteur de sélection reçoit un chemin dédié à la dernière ligne droite et les statistiques exposent deux résumés de couverture.

**Tech Stack:** React, Vite, TypeScript strict, Vitest, Tailwind CSS, stockage local existant.

**Spec:** `docs/superpowers/specs/2026-08-29-culture-aero-v3-design.md`

## Global Constraints

- La banque statique contient exactement 380 questions : 180 CORE et 200 EXTENDED.
- Les calculs dynamiques ne sont pas comptés dans ces 380 questions.
- Toutes les connaissances factuelles sont des QCM à quatre choix crédibles.
- `numeric` reste réservé aux vrais calculs.
- Les données temporelles conservent `source` et `verifiedAt`.
- Le module fonctionne sans réseau au runtime et sans nouvelle dépendance lourde.
- Les exercices psychotechniques et leurs scores ne sont pas modifiés.

---

### Task 1: Infrastructure éditoriale et quotas

**Files:**
- Create: `src/culture/data/sources.ts`
- Create: `src/culture/data/questions/helpers.ts`
- Create: `src/culture/data/questions/manifest.ts`
- Modify: `src/culture/types.ts`
- Modify: `src/culture/validation.ts`
- Test: `src/culture/bank.test.ts`

**Interfaces:**
- Produces: `cultureChoice(data): CultureQuestion`, `CULTURE_BANK_TARGETS`, `CultureDomain`, `validateCultureBank()` avec contrôles V3.
- Consumes: les types `CultureQuestion`, `CultureCategory` et `CultureLesson` existants.

- [ ] **Step 1: Écrire les tests de quotas et d'invariants V3**

Ajouter des attentes pour 380 questions, 180 `highYield`, 200 non `highYield`, 60 fiches, quatre choix pour tous les faits et sources complètes pour les données temporelles.

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `npm test -- src/culture/bank.test.ts`
Expected: FAIL sur les volumes V2 de 80 questions et 22 fiches.

- [ ] **Step 3: Ajouter le registre de sources, le helper QCM et le manifeste**

Le helper accepte explicitement identifiant, domaine, catégories, réponse et trois distracteurs ; il n'invente ni ne mélange les choix. Le manifeste fixe les neuf quotas de la spec.

- [ ] **Step 4: Étendre la validation**

Contrôler volumes, quotas, choix, questions numériques, dates/sources, nombre de faits et 5 à 10 questions liées par fiche.

- [ ] **Step 5: Exécuter les tests ciblés**

Run: `npm test -- src/culture/bank.test.ts`
Expected: les nouveaux invariants compilent ; les volumes restent rouges jusqu'aux tâches de contenu.

### Task 2: Banque CORE

**Files:**
- Create: `src/culture/data/questions/airFrance.ts`
- Create: `src/culture/data/questions/navigation.ts`
- Create: `src/culture/data/questions/weather.ts`
- Create: `src/culture/data/questions/aerodynamics.ts`
- Create: `src/culture/data/questions/instruments.ts`
- Create: `src/culture/data/questions/aerodromes.ts`
- Create: `src/culture/data/questions/regulationsTraining.ts`
- Create: `src/culture/data/questions/geography.ts`
- Create: `src/culture/data/questions/historyCommercial.ts`
- Create: `src/culture/data/questions/index.ts`
- Modify: `src/culture/data/questions/document2026.ts`
- Modify: `src/culture/bank.ts`
- Test: `src/culture/bank.test.ts`

**Interfaces:**
- Produces: neuf tableaux de questions et `allCultureQuestions: CultureQuestion[]`.
- Consumes: `cultureChoice`, sources et quotas de Task 1.

- [ ] **Step 1: Classer les 80 questions existantes par domaine et niveau**

Conserver les identifiants factuels `doc26-03` à `doc26-80`; les deux calculs du document sont couverts par les générateurs hors banque. Affecter le CORE aux notions prioritaires.

- [ ] **Step 2: Ajouter les questions CORE manquantes**

Atteindre les quotas CORE 28/30/25/22/18/14/18/14/11 avec des angles distincts par notion et quatre distracteurs crédibles.

- [ ] **Step 3: Brancher l'index de banque**

Remplacer l'import unique du document par l'agrégat modulaire sans changer l'API publique `QUESTIONS`.

- [ ] **Step 4: Exécuter le test de décompte CORE**

Run: `npm test -- src/culture/bank.test.ts`
Expected: 180 CORE et conservation des 78 questions factuelles du document.

### Task 3: Banque EXTENDED

**Files:**
- Modify: les neuf modules de questions créés dans Task 2
- Test: `src/culture/bank.test.ts`

**Interfaces:**
- Produces: 200 questions `highYield: false`, pour un total de 380.
- Consumes: helpers, sources et modules CORE des Tasks 1 et 2.

- [ ] **Step 1: Compléter Air France et aviation commerciale**

Atteindre 50 questions de domaine en couvrant chronologie, familles de flotte, réseau, Transavia, SkyTeam et organisation, avec dates de vérification sur les faits changeants.

- [ ] **Step 2: Compléter navigation, météo, aérodynamique et instruments**

Atteindre respectivement 55, 50, 45 et 35 questions par des définitions, mécanismes, conséquences et applications distinctes.

- [ ] **Step 3: Compléter aérodromes, réglementation, géographie et histoire**

Atteindre respectivement 30, 40, 45 et 30 questions, sans trivia hors niveau BIA/PSY0.

- [ ] **Step 4: Exécuter la validation de banque**

Run: `npm test -- src/culture/bank.test.ts`
Expected: 380 questions, quotas de domaine exacts, 180 CORE et 200 EXTENDED.

### Task 4: Soixante mini-fiches

**Files:**
- Create: `src/culture/data/lessons/helpers.ts`
- Create: neuf modules `src/culture/data/lessons/<domain>.ts`
- Create: `src/culture/data/lessons/index.ts`
- Modify: `src/culture/bank.ts`
- Test: `src/culture/bank.test.ts`

**Interfaces:**
- Produces: `allCultureLessons: CultureLesson[]` contenant 60 fiches.
- Consumes: identifiants stables de la banque des Tasks 2 et 3.

- [ ] **Step 1: Répartir les 22 fiches existantes**

Conserver les sujets utiles et leurs schémas, puis déplacer les objets dans les modules de domaine.

- [ ] **Step 2: Ajouter 38 fiches ciblées**

Chaque fiche contient 3 à 8 faits, un mémo/piège pertinent et 5 à 10 identifiants de questions existants.

- [ ] **Step 3: Brancher l'index et supprimer l'ancien agrégat**

Conserver l'API publique `LESSONS` et les fonctions `lessonById` et `lessonsByCategory`.

- [ ] **Step 4: Exécuter les tests de liens**

Run: `npm test -- src/culture/bank.test.ts`
Expected: 60 fiches, tous les liens résolus et toutes les cardinalités valides.

### Task 5: Sélection stricte dernière ligne droite

**Files:**
- Modify: `src/culture/selection.ts`
- Test: `src/culture/selection.test.ts`

**Interfaces:**
- Produces: `selectFinalStretchQuestions(questions, store, count, now, rng)`.
- Consumes: `hasActiveError`, `isQuestionDue`, `weakestCategories` et `highYield`.

- [ ] **Step 1: Écrire un test avec une question dans chacun des six compartiments**

Le résultat attendu place erreur, CORE nouveau, CORE faible, CORE dû, CORE maîtrisé puis EXTENDED, indépendamment de l'ordre initial.

- [ ] **Step 2: Vérifier l'échec du test**

Run: `npm test -- src/culture/selection.test.ts`
Expected: FAIL car le moteur V2 additionne des poids.

- [ ] **Step 3: Implémenter les compartiments exclusifs**

Attribuer chaque question au premier compartiment admissible, mélanger dans chaque compartiment et concaténer jusqu'au nombre demandé.

- [ ] **Step 4: Brancher le chemin depuis `selectReviewQuestions`**

Lorsque `finalStretch` est actif, déléguer au nouveau sélecteur ; conserver le moteur courant ailleurs.

- [ ] **Step 5: Exécuter les tests de sélection**

Run: `npm test -- src/culture/selection.test.ts`
Expected: PASS pour les priorités V3 et les filtres existants.

### Task 6: Statistiques CORE/EXTENDED et dashboard

**Files:**
- Modify: `src/culture/statistics.ts`
- Modify: `src/culture/pages/CultureDashboard.tsx`
- Test: `src/culture/statistics.test.ts`

**Interfaces:**
- Produces: `core` et `extended` de type `CultureTierStats` dans `CultureDashboardStats`.
- Consumes: banque complète, tentatives et progression locale.

- [ ] **Step 1: Écrire les tests des deux résumés**

Vérifier total, vues, couverture, réussite et maîtrisées avec un échantillon CORE/EXTENDED.

- [ ] **Step 2: Vérifier l'échec du test**

Run: `npm test -- src/culture/statistics.test.ts`
Expected: FAIL car `core` et `extended` n'existent pas.

- [ ] **Step 3: Implémenter `CultureTierStats`**

Calculer la réussite depuis les tentatives dont l'identifiant appartient au niveau et la couverture depuis les questions vues.

- [ ] **Step 4: Adapter le bandeau principal**

Afficher CORE et EXTENDED vus/total, couverture CORE et réussite CORE dans les composants existants, sans nouveau design system.

- [ ] **Step 5: Exécuter les tests de statistiques**

Run: `npm test -- src/culture/statistics.test.ts`
Expected: PASS.

### Task 7: Commande de validation et vérification globale

**Files:**
- Create: `scripts/validate-culture-bank.ts`
- Modify: `package.json`
- Modify: `src/culture/bank.test.ts`

**Interfaces:**
- Produces: commande `npm run validate:culture` avec code de sortie non nul sur erreur.
- Consumes: `QUESTIONS`, `LESSONS`, `validateCultureBank` et le manifeste de quotas.

- [ ] **Step 1: Ajouter le point d'entrée exécutable**

Le script affiche les totaux CORE/EXTENDED, fiches et domaines, puis les erreurs avant de positionner le code de sortie.

- [ ] **Step 2: Ajouter la commande package**

Utiliser le moteur TypeScript déjà présent dans les dépendances du projet ; ne pas ajouter de package lourd.

- [ ] **Step 3: Exécuter la validation éditoriale**

Run: `npm run validate:culture`
Expected: PASS avec 380 questions, 180 CORE, 200 EXTENDED et 60 fiches.

- [ ] **Step 4: Exécuter toute la chaîne**

Run: `npm run typecheck && npm run test && npm run build`
Expected: typecheck réussi, tous les tests réussis, build Vite réussi ; seul l'avertissement historique de taille de chunk peut subsister.

- [ ] **Step 5: Vérifier le diff final**

Run: `git diff --check && git status --short`
Expected: aucune erreur d'espacement et seulement les fichiers Culture V3/plan attendus.
