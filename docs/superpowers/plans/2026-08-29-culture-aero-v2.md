# Culture Aéro V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer Culture aéronautique par une V2 locale complète fondée sur le document 2026 et orientée apprentissage actif.

**Architecture:** Le domaine Culture reste isolé dans `src/culture`, avec données, logique pure, persistance, générateurs, composants et pages séparés. Les routes `/culture/*` exposent les parcours, et `psy0.culture-v2` conserve uniquement l’état V2.

**Tech Stack:** React 19, React Router 7, TypeScript strict, Tailwind CSS 4, Vitest, localStorage, SVG local.

**Spec:** `docs/superpowers/specs/2026-08-29-culture-aero-v2-design.md`

## Global Constraints

- Aucun backend ou accès réseau au runtime.
- Aucune dépendance Culture vers les scores, classes Pilotest ou sessions psychotechniques.
- Aucune donnée temporelle sans `verifiedAt` et `source`.
- Aucun `any` et TypeScript strict.
- Les 80 questions du document 2026 doivent être représentées dans la banque finale.
- L’ancienne clé `psy0.culture` reste intacte et n’est pas migrée.

---

### Task 1: Domaine et validation de banque

**Files:**
- Replace: `src/culture/types.ts`
- Replace: `src/culture/bank.ts`
- Replace: `src/culture/bank.test.ts`
- Create: `src/culture/data/categories.ts`
- Create: `src/culture/validation.ts`

**Interfaces:**
- Produces: `CultureQuestion`, `CultureLesson`, `CultureCategory`, `CULTURE_CATEGORIES`, `QUESTIONS`, `LESSONS`, `validateCultureBank()`.

- [ ] Écrire les tests qui refusent les identifiants dupliqués, les réponses QCM absentes, les explications vides et les données temporelles incomplètes.
- [ ] Exécuter `npm test -- src/culture/bank.test.ts` et constater l’échec sur les nouveaux exports.
- [ ] Définir les types stricts et les douze catégories.
- [ ] Implémenter `validateCultureBank(questions, lessons)` avec des erreurs portant l’identifiant fautif.
- [ ] Exécuter le test ciblé et vérifier son succès.

### Task 2: Banque 2026 et fiches

**Files:**
- Create: `src/culture/data/questions/*.ts`
- Create: `src/culture/data/lessons/*.ts`
- Modify: `src/culture/bank.ts`
- Modify: `src/culture/bank.test.ts`

**Interfaces:**
- Consumes: les types et la validation de Task 1.
- Produces: une banque indexable par identifiant/catégorie/tag et des fiches liées.

- [ ] Transformer les 80 questions du document en questions typées avec explication, difficulté, tags et `highYield`.
- [ ] Marquer toutes les données Air France 2026 avec `isTimeSensitive`, `verifiedAt: '2026-08-29'` et la source du document.
- [ ] Ajouter des QCM issus du corpus existant uniquement lorsque la réponse et l’explication restent incontestables ; dédupliquer les notions déjà couvertes.
- [ ] Créer les mini-fiches QFU, caps, vent, vitesse-distance-temps, forces, commandes, Pitot-statique, PAPI/VASIS, QNH/QFE, fronts, nuages, licences, espaces, Air France, SkyTeam, histoire et géographie.
- [ ] Lier chaque fiche à cinq questions au maximum quand le corpus le permet.
- [ ] Exécuter la validation de banque et consigner dans les tests les nombres exacts de questions et fiches obtenus.

### Task 3: Stockage V2 et répétition espacée

**Files:**
- Replace: `src/culture/progress.ts`
- Replace: `src/culture/progress.test.ts`
- Create: `src/culture/storage.ts`
- Create: `src/culture/storage.test.ts`

**Interfaces:**
- Produces: `CultureStore`, `loadCultureStore()`, `saveCultureStore()`, `reviewQuestion()`, `isQuestionDue()`.

- [ ] Écrire les tests du stockage absent/invalide, de la version 1, des favoris et de l’indépendance vis-à-vis de `psy0.culture`.
- [ ] Écrire les tests des verdicts `wrong`, `guessed`, `known`, `review` et du retour occasionnel des maîtrisées.
- [ ] Implémenter le schéma `psy0.culture-v2` versionné et sa normalisation.
- [ ] Implémenter les transitions de maîtrise, compteurs, échéances et confiance.
- [ ] Exécuter `npm test -- src/culture/progress.test.ts src/culture/storage.test.ts`.

### Task 4: Réponses, sélection, scoring et statistiques

**Files:**
- Replace: `src/culture/quiz.ts`
- Replace: `src/culture/quiz.test.ts`
- Create: `src/culture/answers.ts`
- Create: `src/culture/answers.test.ts`
- Create: `src/culture/selection.ts`
- Create: `src/culture/selection.test.ts`
- Create: `src/culture/statistics.ts`
- Create: `src/culture/statistics.test.ts`

**Interfaces:**
- Produces: `checkAnswer()`, `selectReviewQuestions()`, `selectBalancedSimulation()`, `scoreByCategory()`, `getCultureDashboardStats()`.

- [ ] Tester accents, casse, virgule décimale et réponses numériques acceptées.
- [ ] Tester l’ordre erreurs récentes, dues, catégories faibles, nouvelles, maîtrisées.
- [ ] Tester la distribution équilibrée d’une simulation de 20 questions.
- [ ] Tester taux global, trois faiblesses, questions dues, série et historique sept jours.
- [ ] Implémenter les fonctions pures et exécuter leurs tests ciblés.

### Task 5: Générateurs calculs et caps

**Files:**
- Create: `src/culture/generators/flightMath.ts`
- Create: `src/culture/generators/flightMath.test.ts`
- Create: `src/culture/generators/headings.ts`
- Create: `src/culture/generators/headings.test.ts`

**Interfaces:**
- Produces: `generateFlightMathQuestion(rng)`, `generateHeadingQuestion(rng)` et des items avec méthode détaillée.

- [ ] Tester que les résultats distance/temps/vitesse sont entiers et mentalement calculables.
- [ ] Tester les fractions de 5, 10, 15, 20, 30 et 45 minutes.
- [ ] Tester passage par 360°, virage le plus court, cap opposé, cardinal et QFU.
- [ ] Implémenter des générateurs déterministes par RNG injecté.
- [ ] Exécuter les tests ciblés sur plusieurs centaines de graines.

### Task 6: Session d’apprentissage et simulation

**Files:**
- Replace: `src/culture/CultureQuiz.tsx`
- Create: `src/culture/components/CultureSession.tsx`
- Create: `src/culture/components/CultureCorrection.tsx`
- Create: `src/culture/components/CultureDebrief.tsx`

**Interfaces:**
- Consumes: banque, réponses, stockage, progression, scoring.
- Produces: un runner commun aux quiz, révisions, express et simulation.

- [ ] Implémenter sélection QCM 1–4, réponses texte/numériques et validation par Entrée.
- [ ] Implémenter feedback immédiat en apprentissage et différé en simulation.
- [ ] Ajouter « J’avais deviné », « Je savais », « À revoir » et réinsertion d’une erreur dans la session.
- [ ] Ajouter favoris, piège, mémo et badge de vérification temporelle.
- [ ] Ajouter Espace pour continuer, focus visible et annonces accessibles.

### Task 7: Dashboard, erreurs, fiches, favoris et express

**Files:**
- Replace: `src/pages/Culture.tsx`
- Create: `src/culture/pages/CultureDashboard.tsx`
- Create: `src/culture/pages/CultureQuizPage.tsx`
- Create: `src/culture/pages/CultureErrorsPage.tsx`
- Create: `src/culture/pages/CultureSimulationPage.tsx`
- Create: `src/culture/pages/CultureLessonsPage.tsx`
- Create: `src/culture/pages/CultureFavoritesPage.tsx`
- Create: `src/culture/pages/CultureExpressPage.tsx`
- Create: `src/culture/pages/CultureDrillsPage.tsx`

**Interfaces:**
- Consumes: toutes les fonctions du domaine et le runner de Task 6.
- Produces: tous les parcours navigables de la V2.

- [ ] Construire le dashboard avec recommandation, indicateurs, trois faiblesses et progression par catégorie.
- [ ] Construire les configurations quiz rapide et révision express 10/20/30 minutes.
- [ ] Construire erreurs avec tris, agrégats, relance ciblée et « marquer comprise ».
- [ ] Construire fiches filtrables avec favoris et lancement de cinq questions liées.
- [ ] Construire favoris « À revoir », simulation et drills.
- [ ] Ajouter le mode dernière ligne droite persisté et son programme du jour.

### Task 8: Schémas locaux et finition responsive

**Files:**
- Create: `src/culture/components/CultureDiagrams.tsx`
- Create: `src/culture/components/CultureLayout.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: schémas SVG accessibles et navigation secondaire Culture.

- [ ] Créer les schémas QFU, PAPI, Pitot-statique, forces, fronts, triangle VDT et rose des caps.
- [ ] Associer les schémas seulement aux fiches concernées.
- [ ] Vérifier les largeurs 375 px, 768 px et desktop, les thèmes clair/sombre et `prefers-reduced-motion`.

### Task 9: Routage et isolation

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/app/App.tsx`
- Remove: anciens fichiers Culture devenus inutilisés.

**Interfaces:**
- Produces: routes `/culture/*` et entrée principale « Culture Aéro ».

- [ ] Brancher toutes les routes V2.
- [ ] Vérifier qu’aucun import Culture n’entre dans `src/exercises`, `src/coach`, `src/analysis` ou les sessions PSY0.
- [ ] Supprimer le code Culture V1 remplacé après confirmation qu’il n’est plus importé.

### Task 10: Audit et livraison

**Files:**
- Modify: `README.md` si nécessaire pour documenter l’accès.

**Interfaces:**
- Produces: une branche vérifiée, commitée et poussée.

- [ ] Exécuter `npm run typecheck` et corriger toutes les erreurs.
- [ ] Exécuter `npm run test` et corriger tous les échecs.
- [ ] Exécuter `npm run build` et corriger tous les échecs.
- [ ] Lancer l’application et vérifier dashboard, quiz, erreur, simulation, fiche, favoris, express et drills en desktop/mobile.
- [ ] Auditer chaque exigence de la spécification contre les fichiers et résultats actuels.
- [ ] Committer les fichiers Culture V2 et pousser la branche courante sur `origin`.
