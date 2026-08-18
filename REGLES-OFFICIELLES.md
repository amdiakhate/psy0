# Règles officielles des 16 tests PSY0 cadets

Source : pages de règles Pilotest (`pilotest.com/fr/tests/<slug>`), relevées le 16/08/2026,
**complétées le 17/08/2026 par des captures de l'interface de jeu réelle**.

> ⚠️ Le texte d'une règle ne décrit PAS l'interface. Les Billes ont été implémentées
> en saisie libre avec des billes interchangeables alors que Pilotest propose un QCM 2-9
> et des billes numérotées : rien de tout cela n'était dans le texte. **Pour toute
> question d'interface — mode de réponse, éléments affichés, boutons — se fier à une
> capture de l'exercice, jamais au seul énoncé.**
**Toute implémentation ou modification d'un exercice doit être vérifiée contre ce fichier.**
Statut au 17/08 : les 16 exercices sont conformes, vérifiés en jeu, et disposent chacun d'une leçon (mode apprentissage).

| # | Exercice | slug | Règle officielle (résumé fidèle) | Timing officiel | Statut |
|---|----------|------|----------------------------------|-----------------|--------|
| 1 | Un mot sur deux | `un_mot_sur_deux` | Mots de **deux thématiques** en désordre. Depuis le mot marqué **START**, cliquer alternativement un mot de chaque thématique, en respectant **l'ordre alphabétique dans chaque thématique**. Erreur → on recommence la série. | 10 séries, le plus vite possible | ✅ |
| 2 | Pair ou impair | `pair_ou_impair` | Nombres en désordre. Depuis **START**, cliquer alternativement **un pair puis un impair**, en respectant l'**ordre croissant dans chaque catégorie**. Erreur → on recommence. | 10 séries | ✅ |
| 3 | M2 Back numérique | `m2back_numerique` | Un chiffre affiché **1 s**, puis boutons **Oui / Non pendant 3 s**. Répondre Oui si le chiffre est le même que **2 coups avant**. N = 2 fixe. | séries de **42 chiffres** | ✅ |
| 4 | Formes et couleurs | `formes` | **Deux règles** données au début, en cascade : selon le **remplissage** (vide/rempli) puis la **couleur** ou la **forme** → appuyer sur **N** ou **X**. Ex. : Règle 1, si VIDE : N si BLEUE, X si ORANGE. Règle 2, si REMPLIE : N si CARRÉE, X si TRIANGULAIRE. | 30 formes, une toutes les 3 s, affichée **0,5 s** | ✅ |
| 5 | Airways | `airways` | Triangles = avions ; **bleus vers la gauche, violets vers la droite**. Les **boutons de couleur déroutent** les avions de cette couleur sur les lignes concernées. **Dérouter le moins d'avions possible.** Par groupe de 6 lignes : jamais plus de **4 avions** ni plus de **2 bleus** dans la **zone grise**. Sinon accident. Compteurs à l'extérieur du groupe. | **10 séries** | ✅ |
| 6 | Psychomoteur | `psychomot0` | **Trois tâches simultanées de même importance**, 5 min. ① **Poursuite** : maintenir ENFONCÉE la flèche du sens de déplacement du cercle ; un **chevron « > » vert** confirme. Changements de direction irréguliers (2-6 s), 4 directions. ② **Formes** : une forme dans le cercle, une autre dans un **encart fixe en pointillés à GAUCHE de l'écran** (séparé du cercle : la comparaison doit coûter un déplacement du regard). Identiques → **Espace**. ③ **Calculs** : un **BANDEAU HORIZONTAL de 4 calculs** affichés simultanément, défilant de droite à gauche à **vitesse variable d'une vague à l'autre**. **Un seul est entouré** (cadre orange) à la fois, le cadre passant au suivant. Entouré et FAUX → **F**. Format : **égalités à deux membres** avec opérations mixtes et négatifs (« 10×3 = 120/4 », « -27+15 = 2-14 », « 8×13 = 1+103 »), divisions entières, **~50 % de faux**. **Clavier physique obligatoire.** | **5 minutes** | ✅ |
| 7 | Empilements | `empilements` | **Trois empilements de cubes**, d'une **DIZAINE de cubes** chacun, **rouges sur fond gris clair**, chacun **basculé d'un angle quelconque** (aucune figure n'est posée droite). Deux sont identiques **à une rotation près** ; le troisième a **en plus subi une symétrie**. Désigner **celui qui a subi la symétrie**, en cliquant la figure ou en tapant 1, 2, 3. | 20 questions, **10 s** chacune | ✅ |
| 8 | Objets 3D | `objets3d` | Une **scène d'objets posés dans le désert**. Déterminer **depuis lequel des 8 points de vue** disposés en cercle la scène a été vue (chaque point de vue regarde vers le **centre**). | 20 questions, **10 s** | ✅ |
| 9 | Billes | `billes` | Billes **NUMÉROTÉES** (toutes distinctes, jamais interchangeables) empilées dans **trois tubes en U** ; **départ** en haut, **arrivée** en bas. Compter le **nombre MINIMUM de déplacements**. Une bille se prend **sur le dessus** d'un tube et se pose **sur le dessus** d'un autre. Capacités **3, 2, 3**. **Réponse par QCM : huit boutons de 2 à 9.** Aucune capacité n'est écrite sous les tubes. | 20 questions, **40 s** | ✅ |
| 10 | Formes glissées - II | `formes_glissees2` | **Règles de superposition** : marine + marine = marine ; marine + gris = gris ; gris + gris = marine. **3 à 4 formes** en bas à glisser sur la grille centrale pour **reproduire la figure de gauche**. L'ordre de dépose n'a pas d'importance, seule compte la position. | — | ✅ |
| 11 | Cubes 2D/3D | `cubes_psy0` | Un **patron de cube déplié** à gauche ; un **patron à faces manquantes** à droite. **Glisser-déposer** les faces proposées pour reconstituer le cube de gauche. Les faces sont proposées **à l'endroit** et se tournent d'un **quart de tour au clic**, avant ou après la pose. **Aucun retournement en miroir.** **Autant de pièces que de trous** — pas de leurre. Deux familles de symboles : **lettres** (les 4 orientations se distinguent) et **formes** (carré, octogone, cercle, trèfle, étoile : invariantes par quart de tour, leur orientation ne compte pas ; seule la croix en garde une). | 10 questions, **60 s** (4 questions au test AF 2020) | ✅ |
| 12 | Grilles de calculs | `grille_calculs` | Une **grille de 9 calculs**, dont **0 à 4 sont faux**. **Cliquer les cases fausses**, puis **Valider**. | 10 grilles, **45 s** | ✅ |
| 13 | Séries logiques | `series_psy0_af` | Séries de **4 ou 5 items** à compléter par **QCM à 4 choix**. Trouver la loi. **Mauvaise réponse = −1/3 point**, et un bouton **« Je ne sais pas… »** permet de s'abstenir pour 0 — sans lui, la stratégie d'abstention est inapplicable. **Cinq formats** : nombres, lettres (isolées ou en groupes de 2), figures, **mots** (propriété commune : longueur, initiale, finale) et **énigmes en prose** (« Emma a 51 ans » : E=5, A=1). | 15 questions, **30 s** | ✅ |
| 14 | Boîtes à mots | `boxes` | **Boîtes vides de 4 à 6 cases**. Un mot apparaît brièvement au centre → le classer **par champ lexical**. **Au premier mot d'un thème, on choisit librement la boîte** ; ensuite il faut rester cohérent. | **5 séries**, minimum d'erreurs | ✅ |
| 15 | Mots en étoile | `mots_en_etoile` | Liste de **9 mots de 7 lettres**. En **sélectionner 6** et les placer sur une **étoile** de sorte que les **cases communes à deux mots** portent une seule et même lettre. Plusieurs solutions possibles. | 10 questions, **50 s** | ✅ |
| 16 | Anglais | `english` | **30 QCM**, réponse à l'automatisme plus qu'à la réflexion. Distingue bilingues et bons non-bilingues. | **7 min 30** pour 30 questions (15 s/question) | ✅ |

## Séries logiques — où vit la loi (relevé du 18/08/2026)

Le piège de conception n'est pas la difficulté des lois mais l'endroit où on les
cherche. Cinq emplacements, relevés sur les captures :

1. **entre les termes** — écarts, rapports, somme des deux précédents ;
2. **une position sur deux** — deux suites entrelacées ;
3. **DANS le terme** — `RK-BU-OH` (2ᵉ = 1ʳᵉ − 7), `54845` (palindrome),
   `U21` (le nombre est le rang), `67212` (6/72/12 car 6×12 = 72) ;
4. **par colonne** — `ZT-GK-NB` : +7 d'un côté, −9 de l'autre ;
5. **hors des mathématiques** — `F2-M3-A4-M5` : les mois. Aucun calcul n'y mène.

Les cas 3 à 5 ne viennent pas à l'esprit et rendent la série apparemment
insoluble, alors qu'ils sont les plus faciles une fois identifiés. Une version
antérieure ne générait et n'enseignait que les cas 1 et 2.

Deux formats dépassent la « suite » : les **séries de mots**, dont la propriété
est formelle et jamais sémantique (`lit - cou - été - gaz` → trois lettres), et
les **énigmes en prose**, où un nombre se déduit des lettres d'un prénom.

## Cubes 2D/3D — la page de règles contredit l'écran (relevé du 18/08/2026)

La page de règles écrit « les faces peuvent être **retournées** […] cliquez
dessus ». L'écran de jeu, lui, affiche : « Cliquez sur une pièce pour la faire
**tourner d'un quart de tour** ». Un quart de tour ne peut pas désigner un
miroir : c'est l'écran qui fait foi, et « retourner » y est employé au sens
courant de « faire pivoter ».

Une implémentation antérieure avait suivi l'énoncé : les pièces arrivaient
**déjà dans la bonne orientation** et la seule interaction était un miroir. Cela
retirait au candidat le geste central de l'épreuve — PRODUIRE l'orientation — et
lui faisait juger une chiralité qui n'existe pas. La leçon enseignait une étape
« retournement » sans objet.

Les captures montrent aussi **autant de pièces que de trous** (4/4, 3/3, 3/3).
L'absence de leurre n'est pas un détail : elle rend le raisonnement par
élimination légitime, puisque toutes les pièces doivent servir.

## Psychomoteur — précisions de calibration (relevé du 18/08/2026)

**Le bandeau de 4 calculs est LA divergence à ne pas réintroduire.** Afficher un
calcul isolé supprime la possibilité de **lire les suivants à l'avance**, qui est
précisément la compétence mesurée. Le défilement doit rester borné : si les
calculs quittent l'écran avant d'être entourés, il n'y a plus rien à anticiper.

**Deux pièges complémentaires sur les faux**, à garder tous les deux :
- `unites-fausses` — le chiffre des unités diffère : comparer les unités suffit ;
- `unites-ok` — l'écart est un multiple de 10, les unités CONCORDENT : le
  raccourci ne voit rien, il faut calculer.

N'entraîner que le premier installerait un réflexe faux ; que le second, de la lenteur.

**Barème stanine officiel, volontairement écrasé** — d'où l'affichage du
pourcentage à côté de la classe, la classe seule masquant des écarts décisifs :

| % | 57 | 69 | 79 | 85 | 90 | 93 | 95 | 96 |
|---|----|----|----|----|----|----|----|----|
| classe | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |

## Empilements — précisions de calibration (relevé du 18/08/2026, sur capture de jeu)

Trois écarts relevés sur capture, tous corrigés :

1. **TAILLE** — quatre à sept cubes contre une **dizaine** chez Pilotest. C'est
   l'écart décisif : un tétracube se retient comme une image, à dix cubes il
   faut réellement tourner la figure dans sa tête. L'exercice mesurait autre
   chose que l'épreuve.
2. **BASCULEMENT** — les figures étaient toutes rendues dans la même
   projection isométrique, donc bien droites et alignées sur la même grille.
   Elles se comparaient alors contour à contour, sans rotation mentale. Chez
   Pilotest chaque empilement est incliné d'un angle quelconque, et c'est ce qui
   force le travail réel.
3. **PALETTE** — cubes gris anthracite contre **rouge vif sur flancs presque
   noirs** chez Pilotest. Un contraste faible entre les trois familles de faces
   rend le relief ambigu, or lire le relief EST la tâche.

Écart mineur également corrigé : la réponse se donnait par un bouton
« Empilement N » doublant la pastille numérotée sous chaque figure — un
aller-retour du regard de trop sur une épreuve à 10 s la question.

**Les figures ne sont plus écrites à la main mais tirées de la graine de l'item**
(croissance par accrétion, puis filtre chiralité + vraie tridimensionnalité).
Un catalogue court finit par s'apprendre : on reconnaît les figures au lieu de
les tourner.

**Garde-fou à ne jamais retirer** : la génération vérifie que les trois DESSINS
réellement affichés diffèrent d'au moins 8 % de leurs pixels. Des cubes en
cachent d'autres à la projection, si bien que deux orientations très éloignées —
voire un empilement et son miroir — peuvent se dessiner presque pareil. L'item
serait alors indécidable, et le candidat chercherait une différence inexistante.

## Vérifier le projet (piège à éviter)

`npx tsc --noEmit` **ne vérifie RIEN** dans ce projet : le `tsconfig.json` racine est un fichier
solution (`"files": []` + références), donc la commande sort en 0 sans rien analyser. La vraie
vérification est :

```bash
npm run verify
```

(soit `tsc -b --force` puis `vitest run`). Ne jamais conclure « ça compile » sur autre chose.

## Notes transverses

- Notation en **classes Stanine 1-9** ; viser la classe 7 sur chaque test.
- Airways a été **remanié le 17/12/2019** pour tenir compte de la **stratégie** (nombre d'avions déroutés), pas seulement de la survie. Un candidat rapporte un **demi-point** pour une série sauvée avec la grosse croix (3 avions déroutés au lieu d'un).
- Air France modifie légèrement le programme d'une session à l'autre : en janvier 2020, 85 % des tests étaient identiques à ceux de 2019 ; les **formes glissées** et les **cubes à plier-déplier** ont été ajoutés cette année-là.
- Les candidats **PRO** passent les mêmes tests, sans l'anglais ni la culture générale aéronautique.

## Adaptations assumées dans cette application

Certaines interactions du test original reposent sur le **glisser-déposer** à la souris. Quand c'est le cas,
l'app peut proposer une interaction équivalente au clavier/clic **à condition de préserver exactement la
mécanique cognitive** (mêmes contraintes, même raisonnement, même piège). Toute adaptation doit être
documentée ici et signalée dans la page d'astuces de l'exercice.
