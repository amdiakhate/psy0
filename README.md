# PSY0 Trainer

Plateforme locale d'entraînement au test PSY0 Air France Cadets : les 16 exercices type Pilotest, un moteur d'analyse des patterns d'erreurs et un coach adaptatif qui compose les sessions en fonction des faiblesses mesurées.

## Cadrage

Cet outil sert au **drill ciblé et au travail cognitif de fond** (mémoire de travail, rotation mentale, calcul, multitâche). Les timings, barèmes et interfaces exacts de Pilotest restent différents : **Pilotest est la référence de calibration** — mesure ta progression « officielle » là-bas, pas ici, pour ne pas sur-optimiser sur ton propre clone.

## Lancement

```bash
npm install
npm run dev        # http://localhost:5173 (ou le port affiché)
npm run test       # tests Vitest
npm run typecheck  # vérification TypeScript strict
```

100 % local : les données vivent dans le localStorage du navigateur. **Exporte régulièrement** (Réglages → Exporter) — le fichier JSON réimporte tout à l'identique.

## Structure

```
src/
  core/        types (ExerciseModule, ItemEvent…), PRNG seedé, event log, stockage,
               moteur de session (adaptatif), jalons du plan d'entraînement
  exercises/   1 dossier par exercice : generator.ts (pur, seedé), validator.ts,
               config.ts, tips.ts, <Nom>Exercise.tsx, index.ts, generator.test.ts
               + index.ts racine = registre (EXERCISES)
  analysis/    scores pondérés, taxonomie d'erreurs par tag, fatigue intra-session,
               créneaux horaires, plateaux, tendances/radar/streak
  coach/       composer 50/30/20 (conscient de la phase), briefing/débriefing,
               simulation complète + rapport par famille
  culture/     Culture Aéro V2 : banque 2026, fiches, répétition espacée,
               statistiques, simulation, favoris et drills générés
  app/         shell, SessionRunner (moteur de déroulé agnostique), contexte de session
  pages/       Dashboard, Entraînement libre, Session guidée, Simulation, Sprint,
               Astuces, Réglages
```

## Culture Aéro

L’entrée **Culture Aéro** ouvre un module entièrement séparé des scores et classes Pilotest. Il
importe les 80 questions du document préparatoire 2026, propose 22 fiches courtes, une révision
espacée, des quiz, une simulation, un mode erreurs, des favoris, une révision express et des drills
de calculs aéronautiques et de caps. Sa progression versionnée est stockée dans
`psy0.culture-v2` ; l’ancienne clé Culture n’est ni lue ni migrée.

## Ajouter un exercice

1. Créer `src/exercises/<id>/` avec le contrat `ExerciseModule` (voir `odd-even/` comme référence, `n-back/` pour un exercice en flux continu).
2. Le générateur doit être **pur et déterministe** (`mulberry32(seed)`), tagger chaque item avec ses sous-types (c'est ce qui alimente la taxonomie d'erreurs) et honorer `forceTag` (drills ciblés).
3. Écrire `generator.test.ts` : déterminisme, réponse unique, distracteurs faux, tags, forceTag.
4. L'enregistrer dans `src/exercises/index.ts`. Tout le reste (session, analyse, coach, dashboard) le prend en compte automatiquement.

## Les données

Un `ItemEvent` par item répondu (exercice, niveau, seed, tags, temps de réponse, correct/attendu/donné, position dans la session) → localStorage `psy0.events`, append-only. Toute l'analyse en découle : scores pondérés (précision × vitesse), sous-types faibles (n ≥ 10, taux d'erreur ≥ 1,3× la base), fatigue par tranche de 5 min, matin/soir, plateaux (régression sur 5+ sessions).

## La Session du jour (écran d'accueil)

Zéro décision au lancement : un bouton, la bonne session selon la date (Europe/Paris) et le moment (matin < 12 h, soir après).

- **Découverte (→ 17/08)** : matin 30 min sur les exercices pas encore joués ; soir 15 min de sprint léger sur un exercice déjà vu (jamais le même que la veille).
- **Montée en charge (18 → 29/08)** : matin 60 min structurée — 5 min Grilles (échauffement) → 25 min priorité du jour (rotation stricte P1→P2→P3 persistée, saisies dans Réglages) → 20 min groupe en rotation (G1 Tri, G2 Spatial, G3 Logique, G4 Attention/Mémoire, G5 Verbal/Anglais, en sautant le groupe couvert par la priorité) → 5 min Psychomoteur → log. Soir : drill libre optionnel, skippable sans culpabilisation.
- **Samedis 22 et 29/08** : mini-simulation 45 min (8 exercices). **Dimanche 23/08** : repos. **30/08 → 01/09** : simulation complète d'abord, drills après. **02/09** : verrouillé, repos total (override caché, volontairement pénible).
- **Log de fin de session matin** (obligatoire) : ressenti en 1 chip + % d'erreurs auto + note 140 car. Export texte en un clic (« 13/08 · Cubes · niveau 3 · 22% err · pièges miroirs »).
- **Garde-fous** : cap dur Psychomoteur 12 min/jour (tous modes confondus — apprentissage moteur, doses courtes) ; bandeau sommeil après 22 h 30 ; aucune gamification ajoutée.
- **Classes Pilotest** (Réglages) : saisis ta classe 1-9 par exercice → colonne « vs Pilotest » au dashboard pour repérer où la salle de drill surestime ton niveau réel.

## Le coach

- **Session guidée 30/60 min** : 50 % du temps sur les 3 exercices les plus faibles (dont drills du sous-type d'erreur identifié), 30 % milieu, 20 % maintien, Psychomoteur ≥ 10 min toujours.
- **Phases** : ≤ 17 août → 30 min ; 18-29 août → 60 min ; ≥ 30 août → simulation d'abord, drills ensuite.
- **Briefing** 3 lignes avant, **débriefing** avec UN insight actionnable après.
- **Simulation** : les 16 exercices enchaînés, ordre aléatoire, verdict par famille (acquis ≥ 75 % / à consolider / critique < 55 %).
