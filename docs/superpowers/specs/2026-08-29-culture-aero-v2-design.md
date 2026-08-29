# Culture Aéro V2 — Design

## Objectif

Remplacer le module Culture aéronautique existant par un outil local d’apprentissage actif pour les présélections PSY0 Cadets Air France. La V2 doit indiquer immédiatement quoi réviser, proposer des sessions de 10 à 30 minutes et rester entièrement séparée des scores, classes et sessions psychotechniques.

## Périmètre et sources

La source prioritaire est `Culture_Aero_PSY0_Air_France_2026.docx`, version du 29 août 2026. Ses 80 questions, corrigés, fiches et données Air France doivent devenir des objets structurés. La banque existante peut fournir un corpus secondaire lorsqu’une question reste incontestable, expliquée et correctement sourcée ; elle n’impose aucune compatibilité de modèle ou de progression.

Les données temporelles doivent porter `isTimeSensitive: true`, une date ISO `verifiedAt` et une source explicite. Les données Air France chiffrées du document sont vérifiées au `2026-08-29`. Une information absente des sources n’est pas complétée par supposition.

## Architecture

La V2 reste dans `src/culture/`, mais remplace le modèle et les pages actuels. Le domaine pur regroupe types, validation, réponses, répétition espacée, statistiques et sélection. Les données vivent hors des composants, réparties par catégorie et par fiche. Les générateurs de calculs et de caps produisent des exercices éphémères qui utilisent le même rendu de session sans être ajoutés à la banque persistante.

Les pages sont accessibles sous `/culture` :

- `/culture` : dashboard et recommandation du jour ;
- `/culture/quiz` : configuration du quiz rapide ;
- `/culture/review` : session guidée par répétition espacée ;
- `/culture/errors` : erreurs persistantes et relance ciblée ;
- `/culture/simulation` : mini-test de 20 questions sans feedback intermédiaire ;
- `/culture/lessons` : fiches courtes ;
- `/culture/favorites` : questions et fiches favorites ;
- `/culture/express` : sessions 10, 20 ou 30 minutes et essentiels uniquement ;
- `/culture/drills` : calculs aéro et caps.

Le shell principal ne reçoit qu’une entrée de navigation et des routes. Aucun fichier du registre des exercices, du coach psychotechnique, des stanines ou des sessions PSY0 ne dépend de Culture.

## Modèle de contenu

Une question possède un identifiant stable, une catégorie principale, une ou plusieurs catégories, des tags, un type de réponse, son contenu, la réponse, les réponses acceptées, une explication, une difficulté de 1 à 3, un indicateur `highYield`, les métadonnées temporelles et, lorsque pertinent, un piège et un mémo.

Les douze catégories sont : Air France, aérodynamique, navigation, météorologie, instruments, aérodromes, réglementation, formation pilote, calcul mental aéronautique, géographie, aviation commerciale et culture aéronautique générale.

Une fiche possède un identifiant, une catégorie, un titre, trois à six points à retenir, un exemple facultatif, un piège facultatif, un mémo facultatif, des tags, les identifiants de questions liées et les mêmes métadonnées de source. Une fiche doit rester lisible sur un à trois écrans mobiles.

## Progression et persistance

La V2 utilise `psy0.culture-v2`. Le document stocké porte une version de schéma et contient :

- la progression par question ;
- les favoris questions et fiches ;
- un historique compact des réponses et sessions ;
- la date du dernier entraînement ;
- les jours actifs pour la série ;
- la préférence « dernière ligne droite ».

L’ancienne clé `psy0.culture` est laissée intacte mais ignorée. Il n’existe aucune migration fonctionnelle de l’ancien module. Les migrations V2 commencent à la version 1 et doivent accepter un stockage absent, invalide ou d’une future version sans faire planter l’application.

La progression conserve les compteurs vus/justes/faux, la série courante, l’état `new | learning | review | mastered`, la dernière vue, la prochaine échéance, la confiance et la dernière erreur. Une question ratée reste dans « Mes erreurs » jusqu’à ce qu’elle ait été réussie plusieurs fois ou marquée comprise explicitement.

## Répétition espacée et sélection

La mise à jour suit une logique simple :

- faux : `learning`, nouvelle échéance proche et réinsertion une fois dans la session ;
- vrai mais deviné : `review`, échéance à un jour ;
- vrai et su : progression vers `review` puis `mastered`, avec délais croissants ;
- à revoir : `learning`, échéance immédiate ;
- maîtrisé : contrôle occasionnel, sans répétition excessive.

La sélection pondère dans cet ordre : erreurs récentes, questions dues, catégories faibles, questions nouvelles, puis une faible proportion de maîtrisées. Le mode dernière ligne droite renforce erreurs, faiblesses et `highYield`, tout en réduisant les contrôles de questions maîtrisées.

## Parcours

Le quiz rapide propose 5, 10 ou 20 questions et les filtres toutes catégories, catégorie unique, points faibles, erreurs, jamais vues et pièges. Après validation, il montre immédiatement la bonne réponse, l’explication, le piège et le mémo, puis demande « J’avais deviné », « Je savais » ou « À revoir ».

La simulation sélectionne 20 questions de façon équilibrée entre catégories, ne montre aucune correction pendant l’épreuve, puis affiche score global, répartition par catégorie et toutes les corrections. Elle ne montre ni classe ni stanine.

La révision express convertit 10, 20 et 30 minutes en lots respectifs de 10, 20 et 30 questions. « Essentiels uniquement » restreint d’abord aux questions `highYield`, puis complète avec des erreurs personnelles si le lot serait trop petit.

« Mes erreurs » agrège les erreurs par catégorie, permet plusieurs tris, relance tout ou une catégorie et permet de marquer une question comprise. Les favoris rassemblent fiches et questions sous le libellé « À revoir ».

Les drills calculs couvrent distance, temps et vitesse avec des nombres mentalement divisibles et une méthode courte. Les caps couvrent rotation avec passage par 360°, différence angulaire, opposé, cardinal et QFU approximatif. Ils n’autorisent pas de calculatrice.

## Statistiques et recommandation

Le dashboard calcule taux global, questions vues, maîtrisées, erreurs actives, dues, série, dernier entraînement et activité sur sept jours. La performance par catégorie est basée sur les réponses récentes lorsqu’elles existent, sinon sur l’historique complet. Les trois taux les plus faibles deviennent les points faibles.

La recommandation du jour est une session prête à lancer. En mode dernière ligne droite, elle présente les volumes erreurs/navigation/Air France/instruments et une estimation en minutes. L’interface doit toujours répondre à « qu’est-ce que je dois réviser maintenant ? » avant d’exposer des statistiques secondaires.

## Interface

La direction visuelle est utilitaire et adulte : continuité du thème zinc, accent sky, vert pour juste/maîtrisé, rouge pour erreur et ambre pour à revoir. Les cartes, boutons, tableaux et typographies reprennent les conventions existantes ; aucun second design system n’est introduit.

Le dashboard utilise une hiérarchie dense mais calme : recommandation dominante, indicateurs compacts, points faibles, actions, progression par catégorie. Les schémas sont des composants SVG locaux et responsives pour QFU/piste, PAPI, Pitot-statique, forces, fronts, triangle vitesse-distance-temps et rose des caps.

Les QCM acceptent 1–4, Entrée pour valider une sélection et Espace pour continuer. Les contrôles restent de vrais boutons et champs avec libellés accessibles, focus visible et fonctionnement tactile. Les animations respectent `prefers-reduced-motion`.

## Validation et tests

La validation de banque échoue sur : identifiants dupliqués, catégorie inconnue, explication vide, mauvais nombre de choix, choix dupliqués, réponse absente, donnée temporelle sans date ou source, fiche liée à une question inconnue et réponse numérique invalide.

Les tests couvrent au minimum : progression, échéances, sélection priorisée, répétition espacée, scoring par catégorie, réponses numériques, générateurs distance/temps/vitesse, générateurs de caps, persistance et migration V2, statistiques, simulation équilibrée et validation de banque.

La livraison exige `npm run typecheck`, `npm run test` et `npm run build` verts, plus une vérification manuelle de `/culture` en desktop et mobile. Le commit final est poussé sur la branche courante.
