# Culture Aéro V3 — conception de la banque étendue

## Objectif

Faire évoluer Culture Aéro d'une première banque de 80 questions vers un outil de préparation PSY0 directement exploitable à J-5 : 380 questions éditoriales, 60 mini-fiches, une distinction nette entre connaissances prioritaires et approfondissement, et un moteur de révision qui épuise le noyau utile avant d'introduire le contenu étendu.

Le module reste indépendant des exercices psychotechniques et ne produit ni classe Pilotest ni stanine. Les calculs dynamiques de caps et de vitesse-distance-temps restent hors du décompte de la banque éditoriale.

## Volumétrie contractuelle

La V3 contient exactement 380 questions statiques :

| Domaine éditorial | Catégories techniques | Total | CORE | EXTENDED |
|---|---|---:|---:|---:|
| Air France / Transavia / SkyTeam | `air-france`, `commercial-aviation` | 50 | 28 | 22 |
| Navigation / caps / QFU / vent | `navigation` et questions `aerodromes` à dominante navigation | 55 | 30 | 25 |
| Météorologie | `weather` | 50 | 25 | 25 |
| Aérodynamique / mécanique du vol | `aerodynamics` | 45 | 22 | 23 |
| Instruments | `instruments` | 35 | 18 | 17 |
| Aérodromes / balisage | `aerodromes` hors dominante navigation | 30 | 14 | 16 |
| Réglementation / espaces / licences | `regulations`, `training` | 40 | 18 | 22 |
| Géographie / fuseaux / capitales | `geography` | 45 | 14 | 31 |
| Histoire / aviation commerciale | `general-aviation`, `commercial-aviation` hors Air France | 30 | 11 | 19 |
| **Total** |  | **380** | **180** | **200** |

Les 80 questions du document 2026 font partie de ces 380 questions et conservent leur identifiant `doc26-*`. Les nouvelles questions utilisent des préfixes stables par domaine. La banque contient exactement 60 mini-fiches, chacune reliée à 5 à 10 questions.

## CORE et EXTENDED

`CultureQuestion.highYield` reste la source de vérité afin d'éviter une migration de stockage inutile :

- `highYield: true` signifie CORE ;
- `highYield: false` signifie EXTENDED.

Le CORE couvre les définitions, mécanismes, repères et faits les plus plausibles au niveau BIA/PSY0. L'EXTENDED ajoute de la largeur et des angles conceptuels sans introduire de détails réglementaires professionnels ou de trivia obscur.

Une notion peut produire plusieurs questions uniquement lorsque chacune mesure une compétence différente : définition, mécanisme, conséquence, application, comparaison ou lecture d'un schéma. Une simple reformulation ou un changement de nombre ne constitue pas une nouvelle question éditoriale.

## Modèle éditorial et organisation des fichiers

La banque est découpée par responsabilité :

```text
src/culture/data/
  sources.ts
  questions/
    helpers.ts
    document2026.ts
    airFrance.ts
    navigation.ts
    weather.ts
    aerodynamics.ts
    instruments.ts
    aerodromes.ts
    regulationsTraining.ts
    geography.ts
    historyCommercial.ts
    index.ts
  lessons/
    helpers.ts
    navigation.ts
    weather.ts
    aerodynamics.ts
    instruments.ts
    aerodromes.ts
    regulationsTraining.ts
    airFrance.ts
    geography.ts
    historyCommercial.ts
    index.ts
```

Les fonctions d'aide construisent des objets typés, appliquent les valeurs communes et rendent les QCM plus lisibles. Elles ne génèrent aucun distracteur et ne déclinent aucune question automatiquement.

Le registre `sources.ts` donne un identifiant, un libellé et une référence vérifiable à chaque source. Le champ public `source` de la question conserve un libellé autonome pour l'affichage et l'export. Aucun accès réseau n'est effectué au runtime.

## Sources et exactitude

Le document `Culture_Aero_PSY0_Air_France_2026.docx`, version du 29 août 2026, reste la source prioritaire. Les enrichissements utilisent des sources primaires adaptées au domaine :

- Air France-KLM, Air France, Transavia et SkyTeam pour les compagnies, flottes, réseaux et chronologies ;
- DGAC, SIA/AIP et programme officiel du BIA pour navigation, aérodromes, réglementation et niveau attendu ;
- EASA Easy Access Rules pour licences et règles européennes ;
- Météo-France pour météorologie et phénomènes ;
- documentation officielle Airbus, Boeing et constructeurs pour les caractéristiques d'aéronefs ;
- organismes institutionnels ou pages officielles nationales pour les données géographiques stables.

Une question sans réponse incontestable dans ces sources est omise. Une donnée factuelle ne doit jamais être déduite pour atteindre un quota.

Toute donnée susceptible de changer reçoit `isTimeSensitive: true`, `verifiedAt` au format ISO et `source`. Son explication rappelle la valeur exacte et la date de référence. Les questions temporelles Air France, Transavia et SkyTeam sont regroupées pour faciliter leur révision future.

## Règles de rédaction des questions

Les connaissances factuelles utilisent `single-choice` avec exactement quatre choix distincts. La bonne réponse apparaît dans `choices`. Les trois distracteurs appartiennent au même univers sémantique et restent crédibles.

`numeric` est réservé aux calculs de vitesse, distance, temps, caps, différences angulaires, QFU dérivés et conversions. `short-answer` reste exceptionnel et nécessite le tag explicite `rappel libre`. Les calculs dynamiques existants ne sont pas ajoutés au total de 380.

Chaque question possède :

- un identifiant unique et stable ;
- une ou plusieurs catégories ;
- des tags utiles à la sélection et aux fiches ;
- une explication autonome ;
- une difficulté réaliste ;
- un niveau CORE ou EXTENDED via `highYield` ;
- une source dès qu'elle repose sur une donnée externe ;
- un piège ou un mémo seulement lorsqu'il apporte une aide réelle.

Les questions à support graphique utilisent les schémas SVG/CSS locaux existants ou de nouveaux schémas ajoutés au même composant, sans image distante.

## Mini-fiches

La V3 contient exactement 60 fiches. Chaque fiche comporte entre 3 et 8 faits, un piège classique lorsque pertinent, un mémo court, un exemple ou schéma si utile, et 5 à 10 questions associées.

La couverture comprend au minimum :

- Navigation : QFU, caps réciproques, virage court, vent et piste, unités, dérive et repères cardinaux ;
- Météo : fronts chaud et froid, occlusion, pression, talweg, QNH/QFE, CB, givrage, brouillard, nuages et ISA ;
- Instruments : Pitot, statique, anémomètre, altimètre, variomètre, horizon artificiel, compas et conservateur de cap ;
- Aérodynamique : quatre forces, portance, traînée, incidence, décrochage, commandes, lacet inverse, vortex et facteur de charge ;
- Aérodromes : marquages, balisage, PAPI/VASIS, piste, taxiway, seuil et circuit ;
- Réglementation/formation : classes d'espace, règles de priorité, licences et qualifications ;
- Air France : histoire, organisation, flotte, réseau, hubs, Transavia et SkyTeam ;
- Géographie : capitales, latitudes, continents, fuseaux et grandes régions ;
- Histoire/commerce : pionniers, appareils, Concorde, alliances, motorisations et aviation commerciale.

## Sélection « Dernière ligne droite »

Le moteur n'utilise plus une addition de poids pour ce mode. Il classe les candidats dans six compartiments stricts, puis mélange uniquement à l'intérieur d'un compartiment :

1. erreurs personnelles actives, CORE avant EXTENDED en cas d'égalité ;
2. CORE jamais vu ;
3. CORE appartenant aux catégories faibles ;
4. CORE dû ou en apprentissage ;
5. CORE maîtrisé pour maintien ;
6. EXTENDED restant.

Une question ne peut apparaître que dans le premier compartiment auquel elle est admissible. La sélection remplit la taille demandée compartiment après compartiment. Hors « Dernière ligne droite », les filtres existants et la répétition espacée continuent de fonctionner, avec une préférence générale pour les erreurs et échéances.

La répétition d'une erreur à la fin de la session reste inchangée et n'ajoute la question qu'une seule fois.

## Statistiques et dashboard

Les statistiques calculent séparément, pour CORE et EXTENDED :

- total ;
- nombre de questions vues ;
- couverture, définie par `vues / total` ;
- réussite, calculée sur les tentatives du niveau concerné ;
- nombre de questions maîtrisées.

Le bandeau principal affiche en priorité :

- `CORE : x / 180 vues` ;
- `EXTENDED : x / 200 vues` ;
- `Couverture CORE : xx %` ;
- `Réussite CORE : xx %`.

Les erreurs actives, échéances et priorités du jour restent visibles. La hiérarchie visuelle et les composants du design existant sont conservés ; aucun second design system n'est créé.

## Validation de banque

Un script `npm run validate:culture` charge la banque complète et échoue avec des messages précis. Il vérifie :

- exactement 380 questions, 180 CORE et 200 EXTENDED ;
- exactement 60 fiches ;
- quotas par domaine éditorial ;
- identifiants uniques ;
- catégories valides et catégorie principale présente ;
- quatre choix uniques pour chaque QCM et réponse incluse ;
- absence de `numeric` factuel ;
- explication non vide et suffisamment développée ;
- données temporelles avec date et source ;
- 5 à 10 liens valides par fiche ;
- présence d'au moins 3 et au plus 8 faits par fiche ;
- absence de liens de questions dupliqués dans une même fiche.

Ces règles sont aussi couvertes par Vitest afin que `npm test` protège la banque. Le script sert de contrôle éditorial direct avant un commit.

## Tests et critères d'acceptation

Les tests couvrent :

- volumétrie totale, CORE, EXTENDED, fiches et domaines ;
- sélection stricte des six compartiments de la dernière ligne droite ;
- statistiques séparées CORE/EXTENDED ;
- validation des QCM, sources et questions numériques ;
- conservation des 80 identifiants du document ;
- fonctionnement des réponses, progression et stockage existants ;
- rendu des nouvelles métriques principales du dashboard lorsque le projet dispose du seam de test adapté.

La livraison est acceptée lorsque `npm run validate:culture`, `npm run typecheck`, `npm run test` et `npm run build` réussissent, que la banque contient les volumes contractuels sans données inventées, et que les exercices psychotechniques n'ont subi aucune modification fonctionnelle.
