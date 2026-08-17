# PSY0 Trainer — Roadmap & contexte complet

> Document de passation. Il contient tout ce qu'il faut savoir pour reprendre le projet
> sans historique de conversation : le but, l'état réel du code, les décisions prises,
> les pièges rencontrés, et ce qui reste à faire.
>
> **Dernière mise à jour : 17 août 2026 (J-17 avant le test), après le passage en Phase 2.**

---

## 1. Le contexte

L'utilisateur passe le **test PSY0 des présélections pilotes cadets Air France le 3 septembre 2026**.
Il s'entraîne quotidiennement sur [Pilotest](https://pilotest.com) (le site de référence, payant, que
la quasi-totalité des candidats utilise) et voulait sa **propre plateforme locale** reprenant les
16 mêmes exercices, avec en plus :

- un **moteur d'analyse de ses patterns d'erreurs** (par sous-type d'erreur, pas juste un score global) ;
- un **coach adaptatif** qui compose ses sessions à partir de ses faiblesses ;
- un **mode apprentissage** expliquant, exercice par exercice, quoi faire et pourquoi.

Objectif déclaré : **1 à 2 h d'entraînement par jour** jusqu'au jour J, et « ace un maximum de choses ».

### Jalons de son protocole personnel

| Date | Ce qui change |
|------|---------------|
| jusqu'au 17/08 | sessions guidées de 30 min |
| 18/08 → 29/08 | sessions guidées de 60 min (montée en charge) |
| samedis 22/08 et 29/08 | mini-simulation de 45 min (8 exercices) |
| dimanche 23/08 | repos |
| 30/08 → 01/09 | simulation complète d'abord, drills ensuite |
| **02/09** | **repos total** — l'app se verrouille (override caché) |
| **03/09** | **jour du test** |

---

## 2. La règle d'or du projet (à ne jamais enfreindre)

> **Ne JAMAIS inventer la mécanique d'un exercice. Toujours vérifier la règle officielle d'abord.**

Historique : les 16 exercices ont d'abord été implémentés depuis leurs seuls intitulés. Résultat :
**11 sur 16 étaient faux** — pas approximatifs, faux (mécanique entièrement différente). L'utilisateur
l'a découvert en comparant avec Pilotest et a dit, à juste titre : *« arrête d'inventer des jeux, fais
des recherches avant d'en coder un »*.

Les règles officielles ont ensuite été relevées sur les pages publiques `pilotest.com/fr/tests/<slug>`
(accessibles sans compte) et consignées dans **[`REGLES-OFFICIELLES.md`](./REGLES-OFFICIELLES.md)**,
qui fait autorité. Toute implémentation ou modification d'un exercice doit être vérifiée contre ce fichier.

### Le second piège : la vérification qui ne vérifie rien

`tsc --noEmit` **ne teste absolument rien** dans ce projet : le `tsconfig.json` racine est un fichier
solution (`"files": []` + `references`), donc la commande sort en 0 sans rien analyser. Des erreurs de
type sont passées inaperçues pendant des heures à cause de ça.

```bash
npm run verify   # = tsc -b --force  puis  vitest run   ← LA seule vérification valable
```

Ne jamais conclure « ça compile » sur autre chose.

---

## 3. État actuel — ce qui est fait

**Tout le périmètre fonctionnel initial est livré et vérifié.**
Dernière exécution de `npm run verify` : **typecheck sans erreur, 288 tests verts sur 24 fichiers.**
`npm run build` passe également (1323 modules) — utile car `tsc` seul ne détecte pas
tout ce que le bundler refuse.

### 3.1 Stack et conventions

- **Vite + React 18 + TypeScript strict + Tailwind v4**, dark mode, responsive laptop/mobile.
- **100 % local** : persistance `localStorage` (clés préfixées `psy0.`), export/import JSON, aucun backend.
- **three.js / @react-three/fiber / drei** pour les démos 3D interactives (cube manipulable, désert).
- **recharts** pour le radar et les graphiques, **react-router-dom**, **vitest** pour les tests.
- Tout se joue **au clavier** ; l'item suivant est pré-généré pour une latence nulle entre les items.
- UI intégralement en **français**, accents et typographie soignés.

### 3.2 Architecture

```
src/
├── core/          types.ts (contrats), rng.ts (mulberry32 seedé), eventlog.ts,
│                  storage.ts, session.ts (difficulté adaptative), config.ts (jalons),
│                  prefs.ts (P1/P2/P3 + classes Pilotest), logs.ts (log de session)
├── exercises/     16 dossiers + index.ts (registre) — voir §3.3
├── analysis/      scores.ts, errorTaxonomy.ts, fatigue.ts, timeOfDay.ts,
│                  plateau.ts, trends.ts
├── coach/         composer.ts (câblage) + composer-logic.ts (50/30/20, PUR et testé),
│                  daily.ts + daily-logic.ts (session du jour, logique PURE et testée),
│                  suspended.ts (séance coupée en deux), debriefing.ts, simulation.ts
├── app/           App.tsx (shell), SessionRunner.tsx (moteur de session),
│                  SessionContext.tsx, SessionLogScreen.tsx
├── pages/         Today, Dashboard, Train, Guided, Simulation, Sprint, Learn, Tips, Settings
├── components/    Choices, NumberInput, ExercisePicker, Sparkline
└── hooks/         useKeys (écoute clavier globale sans re-abonnement)
```

**Contrat central — `ExerciseModule`** (dans `core/types.ts`) : chaque exercice expose
`id`, `name`, `description`, `families`, `levels`, `defaultItemSeconds`, `timed`
(`'per-item'` | `'continuous'`), `generate(seed, level, forceTag?)` **pur et déterministe**,
`validate`, `tips`, `lesson`, `Component`, et optionnellement `TipsIllustration`.
Le moteur de session est **agnostique** : il ne connaît que ce contrat.

**Structure d'un exercice** : `config.ts` (niveaux) · `generator.ts` (pur) · `validator.ts` ·
`tips.ts` (astuces) · `lesson.tsx` (mode apprentissage) · `<Nom>Exercise.tsx` (UI) ·
`index.ts` (module) · `generator.test.ts` · parfois `model.ts` / `data.ts` / composants de rendu.

### 3.3 Les 16 exercices — tous conformes aux règles officielles

| # | Exercice | Mécanique réelle (résumé) | Tests |
|---|----------|---------------------------|-------|
| 1 | Un mot sur deux | Grille de 2 thématiques ; depuis START, chaîne alternée en **ordre alphabétique** dans chaque thématique | 13 |
| 2 | Pair ou impair | Idem mais **parité + ordre croissant** | 10 |
| 3 | M2 Back | Chiffre 1 s → boutons **Oui/Non** 3 s ; N=2 fixe ; **42 chiffres** ; lures N±1 forcés | 10 |
| 4 | Formes et couleurs | **2 règles en cascade** (remplissage → couleur ou forme) → touche **N/X** ; stimulus **0,5 s** | 17 |
| 5 | Airways | Gestion de flux ; petite croix = 1 avion, **grosse croix = tous** ; max 4 avions / 2 bleus en zone grise | 9 |
| 6 | Psychomoteur | **3 tâches simultanées** : flèche maintenue (« > » vert), Espace si formes identiques, F si calcul faux ; 5 min | 10 |
| 7 | Empilements | **3 empilements de cubes** : désigner celui qui a subi la **symétrie** | 20 |
| 8 | Objets 3D | Scène du désert : retrouver lequel des **8 points de vue** | 20 |
| 9 | Billes | 3 tubes en U (capacités **3/2/3**) : compter le **minimum de déplacements** | 11 |
| 10 | Formes glissées II | Superposition = **XOR** (marine/gris) ; poser 3-4 formes pour reproduire la cible | 12 |
| 11 | Cubes 2D/3D | Patron complet + **patron à trous** à compléter (faces parfois à **retourner**) | 11 |
| 12 | Grilles de calculs | **9 calculs, 0 à 4 faux** : cliquer les faux, valider | 8 |
| 13 | Séries logiques | 4-5 items, **QCM 4 choix**, nombres/lettres/figures, **pénalité −1/3** | 10 |
| 14 | Boîtes à mots | Boîtes **vides sans étiquette** ; 1er mot d'un thème = choix libre, puis mémoire de l'attribution | 13 |
| 15 | Mots en étoile | 9 mots de 7 lettres, en placer **6** sur l'étoile ; cases communes cohérentes | 9 |
| 16 | Anglais | **30 QCM en 7 min 30** ; grammaire, vocabulaire courant et aviation, compréhension | 8 |

**Invariants garantis par les tests** (le plus important du projet) :
- déterminisme : même seed → item identique ;
- **unicité de la réponse** vérifiée par recalcul indépendant (jamais en faisant confiance au générateur) ;
- Billes : minimum recalculé par **BFS** ; la génération choisit l'arrivée à une distance connue, donc la réponse est le minimum **par construction** ;
- Cubes : aucun distracteur n'est une rotation valide du cube correct (énumération des 24 rotations) ; pièces dédoublonnées sur (symbole, orientation) ;
- Empilements : polycubes **chiraux** uniquement, et exclusion de ceux dont le miroir se **dessine identiquement** en isométrie ;
- Objets 3D : les 8 points de vue produisent 8 signatures visuelles **deux à deux distinctes** ;
- Airways : chaque série est **gagnable** (une stratégie de référence évite tout accident) et sans déroutage l'accident survient bien ;
- Formes glissées : la cible est construite **en posant** les formes, donc une solution existe toujours.

### 3.4 Moteur d'analyse

Event log append-only (`psy0.events`) : un event par item avec exercice, niveau, seed, **tags de
sous-type**, temps de réponse, correct/incorrect, position et minute dans la session.

- **`errorTaxonomy`** — taux d'erreur par (exercice, tag), avec effectif minimal avant de conclure ;
- **`speedAccuracy`** (dans `scores`) — verdict « ralentis » / « accélère » ;
- **`fatigue`** — précision par tranche de 5 min, détection du décrochage ;
- **`timeOfDay`** — matin / après-midi / soir ;
- **`plateau`** — régression linéaire sur les 5+ dernières sessions ;
- **`trends`** — tendances 7/14/30 jours, agrégats par famille (radar).

### 3.5 Coach et modes

- **Session du jour** (`/`, écran d'accueil) : un seul bouton. La composition dépend de la date
  (Europe/Paris) et du moment (matin < 12 h). Logique **pure et testée** dans `daily-logic.ts`
  (21 tests) : phases, rotation P1→P2→P3 persistée, mini-simulations, repos, verrouillage du 02/09.
  À partir du 18/08, la session du matin offre le choix **60 ou 90 min** (le 2 h a été retiré du
  matin : il contredit le protocole de la phase 2). Structure sur 60 min, dans
  `coach/morning-logic.ts` (pur, 14 tests) :
  **5 min échauffement · 24 min de priorité en 3 passes de 8 min · 21 min de rotation · 5 min
  Psychomoteur · 5 min de log** — priorité et rotation **entrelacées**, jamais deux blocs du même
  exercice à la suite. Sur 90 min, mêmes proportions (8/15 du temps utile à la priorité) avec une
  seconde priorité et un second groupe de rotation.
- **Sessions guidées** 30 / 60 / 90 / 120 min : 50 % sur les 3 exercices les plus faibles (drills
  ciblés sur le sous-type d'erreur), 30 % milieu, 20 % maintien, Psychomoteur ≥ 10 min.
  Trois règles verrouillées par les tests (`composer-logic.test.ts`) : **aucun bloc au-delà de
  8 min** hors Psychomoteur (au-delà on découpe et on répartit), **jamais deux blocs consécutifs
  du même exercice**, et les faiblesses **réparties dans toute la séance** au lieu d'être groupées
  au début. Une séance de 2 h fait 18 blocs de 6 à 7 min, Psychomoteur au centre.
- **Coupure de mi-parcours** (formats ≥ 90 min) : à ~50 % de la séance, un écran propose de
  continuer ou de **couper et reprendre plus tard**. Les blocs restants sont mis de côté
  (`psy0.suspended`) et reproposés depuis l'accueil, **le jour même uniquement**. Une séance
  coupée n'avance **pas** la rotation quotidienne et ne déclenche pas le log : c'est la seconde
  moitié qui le fait.
- **Simulation PSY0** complète (16 exercices, rapport par famille) et **mini-simulation** (8 exercices).
- **Psychomoteur quotidien** (ex-« Sprint 5 min ») : réservé au Psychomoteur, avec compteur vers le
  cap de 12 min. Le format 5 min n'a de sens que pour lui — c'est sa durée officielle.
- **Entraînement libre** : retiré de la navigation à partir du 18/08, accessible depuis Réglages.
  En période cadrée, choisir soi-même son exercice revient presque toujours à éviter celui qui fait mal.
- **Bilan Phase 1 → Phase 2** (`/bilan`, écran unique) : met face à face niveau local, classe
  Pilotest et état de découverte pour les 16 exercices, et recueille en une passe les 16 classes
  officielles et les 3 priorités. À validation, les priorités sont **verrouillées jusqu'au 25/08**
  (déverrouillables avec confirmation) et l'écran disparaît de l'accueil. Si des classes manquent
  après le 18/08, un bandeau non bloquant le rappelle.
- **Garde-fou anti-clone** (`analysis/pilotestGap.ts`, 12 tests) : badge *local surestime /
  cohérent / local sous-estime* par exercice, à partir du niveau local projeté sur l'échelle
  Stanine 1-9. Bannière « plafond local atteint » sur la page d'un exercice au niveau maximum —
  au-delà, l'app ne mesure plus rien, il faut aller vérifier sur Pilotest.
- **Log de fin de session matin** (obligatoire) : ressenti en 1 chip, % d'erreurs auto, note 140 car.
  L'export texte (un clic) est groupé par **rôle de bloc** et prêt à coller dans une conversation
  de suivi — priorité (avec passes et sous-types d'erreurs dominants), rotation, échauffement,
  Psychomoteur consommé sur le cap, et la priorité + rotation de **demain**. Rendu pur et testé
  dans `core/logs.ts` (9 tests).
- **Garde-fous** : cap dur **12 min de Psychomoteur par jour** (tous modes confondus), bandeau
  sommeil après 22 h 30, verrou du 02/09 avec override volontairement pénible (taper `jesaiscequejefais`).

### 3.6 Mode apprentissage — les 16 leçons

Route `/learn`. Chaque leçon = 5 à 7 **arrêts sur image** commentés : *ce qu'on voit* / *ce qu'on fait* /
*pourquoi* / *le piège*. Navigation aux flèches. Les scènes sont figées (aucun timer, aucun état de jeu)
et réutilisent les composants de rendu réels des exercices.

Les pages **Astuces** (`/tips`) contiennent en plus, par exercice : méthode complète, 3-4 pièges,
gestion du temps, **exemples illustrés** (vrais items générés depuis un seed fixé, avec réponse et
raisonnement dépliables) et, pour les exercices spatiaux, des **démos 3D manipulables**.

---

## 4. Ce qui reste à faire

### 4.1 Priorité haute — utilisable dès maintenant, à affiner

1. ~~**Caler le planning quotidien 1-2 h**~~ — **fait le 17/08.** Le plafond de 8 min n'était
   appliqué qu'aux blocs « milieu » et « forces » : une séance de 2 h produisait **3 blocs de
   18 min** sur les exercices les plus faibles, puis 54 min consécutives sur ces trois mêmes
   exercices. Les modes `guided90`/`guided120` n'existaient pas non plus (tout était enregistré
   `guided60`, l'analyse de fatigue ne pouvait pas les distinguer). Logique extraite dans
   `composer-logic.ts`, corrigée, et couverte par 24 tests. La session du matin propose le choix
   60/90/120 avec coupure possible à mi-parcours.
   **Tranché le 17/08** : le bloc « priorité du jour » de 25 min d'un tenant est remplacé par
   **3 passes de 8 min entrelacées avec la rotation**. Le plafond de 8 min n'a plus aucune
   exception, hors Psychomoteur dont la durée EST le format.
2. **Saisir les priorités P1/P2/P3 et les 16 classes Pilotest** — désormais en une passe sur
   l'écran **Bilan Phase 1** (`/bilan`), proposé depuis l'accueil tant qu'il n'est pas validé.
   Sans elles, le coach retombe sur « l'exercice le plus faible », et le format 90 min prend le
   2ᵉ exercice le plus faible comme priorité suivante.
3. **Première vraie session matin** : la composition 60 min structurée (5 min échauffement →
   25 min priorité → 20 min rotation → 5 min Psychomoteur → log) n'a jamais tourné en conditions
   réelles, seulement en test. À observer le lendemain matin.
4. **Écran de coupure à mi-parcours : rendu non observé en jeu.** Sa logique de déclenchement et
   sa persistance sont testées, mais l'écran n'apparaît qu'après ~45 min de jeu réel. Une bascule
   **Réglages → Avancé → « Simuler 45 min écoulées »** le déclenche dès le premier bloc pour le
   valider. **À décocher avant le 20/08**, sinon toute séance de 1 h 30 proposera de couper au
   bout de 5 minutes.

### 4.2 Priorité moyenne

5. **Calibration des niveaux** : les fourchettes de difficulté ont été posées a priori (sauf Billes,
   mesurées). Après quelques jours de données réelles, vérifier que la difficulté adaptative
   converge vers un niveau stable et ajuster les `config.ts` si un exercice sature ou écrase.
6. **Barème exact des séries Airways** : on sait qu'il existe des demi-points liés à la stratégie
   (nombre d'avions déroutés) mais pas la formule ; l'app utilise « réussi si ≤ référence ».
   À affiner si l'utilisateur observe le détail sur Pilotest.
7. **Vérification visuelle exhaustive** : tous les exercices ont été lancés et joués au moins une
   fois, mais les niveaux élevés (4-5) de certains exercices n'ont pas été joués longuement.

### 4.3 Priorité basse / différé

8. **Compaction de l'event log** au-delà de 50 000 events — délibérément reportée : le volume ne
   sera pas atteint avant le 3 septembre.
9. **Tests de composants React** : seuls les générateurs et la logique pure sont testés (242 tests).
   Les composants d'UI sont vérifiés manuellement dans le navigateur.
10. **Avertissements oxlint** `react(only-export-components)` sur les fichiers qui exportent un
    composant et une constante — cosmétique, sans impact.

---

## 4.4 Écarts assumés (documentés, à ne pas « corriger » par erreur)

1. **Mots en étoile — les pointes ne sont pas partagées.** Sur l'hexagramme, seuls les
   **6 croisements des deux triangles** (cases d'indice 2 et 4 de chaque segment) portent une lettre
   commune ; les 6 pointes extérieures donnent à chaque mot sa propre case. Ce n'est pas un oubli :
   avec les pointes partagées (12 contraintes), un solveur exhaustif sur 480 mots français de 7 lettres
   trouve **0 solution sur 300 seeds** — l'exercice serait ingénérable. Avec les 6 croisements :
   2000/2000 seeds résolus. Si l'utilisateur constate que Pilotest partage aussi les pointes, il
   faudra un dictionnaire nettement plus large avant d'y toucher.
2. **Interactions au clavier/clic là où le test utilise le glisser-déposer** (Cubes, Formes glissées,
   Mots en étoile). La **mécanique cognitive est identique** (mêmes contraintes, même raisonnement,
   mêmes pièges) ; seul le geste diffère. Choix fait pour la vitesse d'entraînement et la fiabilité.
3. **Niveaux de Mots en étoile** : « facile » signifie *distracteurs éliminables à vue*, et non
   « 8 des 9 mots compatibles » (non constructible sans dénaturer l'item).

## 5. Pièges rencontrés (à ne pas refaire)

| Piège | Ce qui s'est passé | La parade |
|-------|--------------------|-----------|
| Inventer une mécanique | 11 exercices sur 16 étaient faux | Lire `REGLES-OFFICIELLES.md`, et la page Pilotest si besoin |
| `tsc --noEmit` | Ne vérifiait rien, 6 erreurs invisibles | `npm run verify` |
| Timers non nettoyés | Un `setTimeout` d'une séquence Airways coupait la suivante après 2 s | Toujours `clearTimeout` dans le cleanup du `useEffect` |
| `setTick(t => t)` | React ignore un état identique → l'UI ne se rafraîchissait pas | `useReducer` pour forcer un rendu |
| Distracteurs interchangeables | Deux pièces identiques (Cubes) rendaient la solution non unique | Dédoublonner les distracteurs sur leur clé sémantique |
| Contraintes de capacité | 8 billes dans 3 tubes de capacité totale 8 = puzzle bloqué | **Mesurer** l'espace atteignable avant de fixer les niveaux |
| Timeout des tests | 5 s par défaut, insuffisant pour les invariants sur 150 seeds | `testTimeout: 60_000` dans `vite.config.ts` ; garder les balayages raisonnables |
| Agent qui délègue | Un sous-agent a re-délégué et n'a rien produit | Exiger explicitement « écris-le toi-même » |
| Règle appliquée à moitié | Le plafond de 8 min par bloc n'était posé que sur 2 des 3 tiers du composer — les blocs les plus longs y échappaient | Une règle énoncée en commentaire doit être **factorisée** et **testée**, pas répétée à la main dans chaque branche |
| Fichier de logique sans test | `composer.ts` était le seul module du coach non testé ; c'est exactement là que les écarts se sont accumulés | Toute logique de composition va dans un `*-logic.ts` **pur**, testé en recalculant l'invariant |
| Cache mémoire + `beforeunload` | L'event log flushait son cache au déchargement de la page : **l'import d'une sauvegarde et la réinitialisation étaient tous deux annulés** au rechargement qui suit, sans le moindre message d'erreur | `discardCache()` après tout écrit direct dans le storage (`eventlog.test.ts`) |
| `tsc` ne voit pas tout | Un doublon d'identifiant de module passe le typecheck et casse au chargement | `npm run build` en complément de `npm run verify` avant de conclure |

---

## 6. Commandes

```bash
npm run dev        # serveur de développement (port 5173 par défaut)
npm run verify     # typecheck RÉEL + tous les tests  ← avant de dire que ça marche
npm run typecheck  # tsc -b --force
npm test           # vitest run
npm run lint       # oxlint
```

Le fichier `.claude/launch.json` (à la racine du dépôt parent) permet de lancer le serveur sur le
port 5199 pour la vérification navigateur.

---

## 7. Fichiers de référence

- **[`REGLES-OFFICIELLES.md`](./REGLES-OFFICIELLES.md)** — les 16 règles officielles, le tableau de
  conformité et le piège du typecheck. **Fait autorité sur toute question de mécanique.**
- **[`README.md`](./README.md)** — lancement, structure, comment ajouter un exercice.
- `src/core/types.ts` — tous les contrats (`ExerciseModule`, `Item`, `Tips`, `Lesson`, `ItemEvent`…).
- `src/exercises/marbles/` — l'exemple le plus propre : modèle pur séparé, générateur déterministe,
  invariant recalculé par BFS dans les tests, leçon complète.

---

## 8. Cadrage à rappeler à l'utilisateur

Cette plateforme est un outil de **drill ciblé et de travail cognitif de fond**. Les timings, barèmes
et UI exacts de Pilotest resteront différents. **Pilotest reste la référence de calibration** : la
progression « officielle » se mesure là-bas, pas ici, pour éviter de sur-optimiser sur son propre clone.
