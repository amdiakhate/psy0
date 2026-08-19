import { pick, randInt } from '../core/rng';
import type { Rng } from '../core/rng';
import type { Diagram } from './diagrams';

/**
 * Atelier de calcul mental — techniques nommées, drillées séparément.
 *
 * Ce n'est PAS un dix-septième test Pilotest : rien ici n'entre dans le
 * registre des 16 exercices, ni dans les rotations, ni dans la stanine. C'est
 * l'entraînement de FOND dont dépendent deux épreuves : les Grilles de calculs
 * (9 calculs en 45 s, impossible sans raccourcis) et le Psychomoteur (repérer
 * un calcul faux tout en poursuivant le cercle).
 *
 * Chaque technique porte sa règle, son POURQUOI — une règle sans justification
 * ne survit pas au stress — et un générateur d'items où elle est le chemin
 * rapide. Le pas-à-pas est recalculé sur les nombres tirés : on ne relit pas un
 * exemple figé, on revoit la technique appliquée à ce qu'on vient de rater.
 */

export type TechniqueFamily = 'Fondations' | 'Alphabet' | 'Multiplication' | 'Proportions' | 'Vérification';

export const FAMILY_ORDER: TechniqueFamily[] = [
  'Fondations',
  'Alphabet',
  'Multiplication',
  'Proportions',
  'Vérification',
];

/**
 * Deux formes d'item, et deux seulement :
 * - `value`   : on donne le résultat au clavier (chiffres puis Entrée) ;
 * - `verdict` : on juge une affirmation — J si elle est juste, F si elle est
 *               fausse. Même geste qu'aux Grilles de calculs et au Psychomoteur.
 */
export type MentalItem =
  | { kind: 'value'; prompt: string; answer: number; walkthrough: string[] }
  /** Réponse = une LETTRE. Les conversions alphabétiques se drillent dans les deux sens. */
  | { kind: 'letter'; prompt: string; answer: string; walkthrough: string[] }
  | { kind: 'verdict'; prompt: string; wrong: boolean; walkthrough: string[] };

export interface Technique {
  id: string;
  name: string;
  family: TechniqueFamily;
  /** La règle en une ligne, mémorisable telle quelle. */
  rule: string;
  /** Pourquoi ça marche. Sans ça, la règle s'oublie dès que le chrono serre. */
  why: string;
  /** La procédure à automatiser. */
  steps: string[];
  /** Quand l'appliquer — et quand ne pas essayer. */
  when: string;
  /** Ce que ça rapporte au PSY0, concrètement. */
  psy0: string;
  /** Temps cible par item. Au-delà, la technique est comprise mais pas automatisée. */
  targetMs: number;
  /** Le schéma qui rend la règle évidente. Sans lui, « les dizaines se complètent à 9 » n'est qu'une incantation. */
  diagram?: Diagram;
  /** Mode de réponse : il décide de la part incompressible du temps cible. */
  answerInput: 'typed' | 'keyed';
  generate(rng: Rng): MentalItem;
}

/* --------------------------------------------------------- temps cibles */

/**
 * Une cible n'est pas un temps de calcul : c'est un temps de BOUT EN BOUT.
 *
 * Elle doit couvrir la lecture de l'énoncé, la réflexion, la frappe et la
 * validation. Une version antérieure posait 2,5 s sur les compléments — or lire
 * « Complément de 83 à 100 », taper deux chiffres et appuyer sur Entrée consomme
 * déjà l'essentiel de ce budget. Il ne restait presque rien pour penser.
 *
 * Le défaut ne se limitait pas à un chiffre trop serré. La maîtrise se juge en
 * comparant le temps médian à cette cible : sous le plancher physique, elle ne
 * distingue plus rien, et TOUTE technique reste « en cours » indéfiniment, y
 * compris parfaitement acquise. Un seuil inatteignable ne mesure pas, il décourage.
 *
 * Le modèle est donc explicite : plancher d'entrée-sortie + réflexion. Et les
 * temps de réflexion visent un adulte entraîné ORDINAIRE, pas un calculateur.
 *
 * CALAGE SUR LA LITTÉRATURE, pour que ces nombres ne soient pas au jugé. La
 * tâche d'« alphabet arithmetic » (vérifier C + 2 = E) a été mesurée sur DOUZE
 * sessions quotidiennes — soit précisément l'horizon de deux semaines visé ici :
 *
 *   · temps moyen de résolution, toutes sessions : 2023 ms (écart-type 1056) ;
 *   · pente de 536 ms par cran en session 1, tombée à 180 ms par cran en
 *     session 12. C'est l'apprentissage lui-même, chiffré.
 *
 *   Shams, Chevrier & Barrouillet, « Scrutinizing patterns of solution times in
 *   alphabet-arithmetic tasks », Cognition (2020) — réplication de Logan &
 *   Klapp (1991), J. Exp. Psychol. LMC.
 *
 * Deux corrections s'imposent avant de reprendre ces chiffres. L'expérience est
 * une VÉRIFICATION à une touche sur un jeu restreint de lettres ; ici on PRODUIT
 * la réponse au clavier, sur les vingt-six lettres et des pas variés. La
 * production et la frappe ajoutent de l'ordre de 0,8 à 1,2 s, et un jeu ouvert
 * empêche la mémorisation qui accélère les dernières sessions du laboratoire.
 *
 * Les cibles retenues sont donc franchement au-dessus des temps de session 12,
 * et atteignables en une quinzaine de jours de drill régulier — pas au premier
 * essai, et c'est voulu : une cible atteinte d'emblée ne mesure rien.
 */

/** Lire un énoncé court, taper la réponse, valider. Incompressible. */
const READ_AND_TYPE_MS = 1600;
/** Idem, mais la réponse tient en une touche (J ou F) : la frappe s'efface presque. */
const READ_AND_PRESS_MS = 900;

/** Cible d'une technique dont la réponse se tape. */
const typed = (thinkMs: number) => READ_AND_TYPE_MS + thinkMs;
/** Cible d'une technique qui se répond d'une touche. */
const keyed = (thinkMs: number) => READ_AND_PRESS_MS + thinkMs;

/** Exposés pour que les tests puissent vérifier qu'aucune cible ne passe sous le plancher. */
export const IO_FLOOR = { typed: READ_AND_TYPE_MS, keyed: READ_AND_PRESS_MS };

/* ------------------------------------------------------------------ outils */

/** Somme des chiffres, une passe. */
export function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((s, c) => s + Number(c), 0);
}

/** Racine numérique : on somme les chiffres jusqu'à n'en avoir qu'un. */
export function digitRoot(n: number): number {
  let v = Math.abs(n);
  while (v >= 10) v = digitSum(v);
  return v;
}

/** Espace fine avant les milliers : « 14 976 » se lit, « 14976 » se déchiffre. */
export function fr(n: number): string {
  return n.toLocaleString('fr-FR').replace(/ | /g, ' ');
}

/* --------------------------------------------------------------- Alphabet */

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/** Jalons à connaître sans compter. Le reste se déduit du plus proche. */
const LANDMARKS: Array<[string, number]> = [
  ['A', 1],
  ['E', 5],
  ['J', 10],
  ['O', 15],
  ['T', 20],
  ['Z', 26],
];

/** Le jalon le plus proche d'un rang, et l'écart signé qui l'en sépare. */
function nearestLandmark(rank: number): { letter: string; at: number; delta: number } {
  let best = LANDMARKS[0];
  for (const l of LANDMARKS) if (Math.abs(l[1] - rank) < Math.abs(best[1] - rank)) best = l;
  return { letter: best[0], at: best[1], delta: rank - best[1] };
}

const letterAt = (rank: number) => ALPHA[(((rank - 1) % 26) + 26) % 26];

const alphaLandmarks: Technique = {
  id: 'alpha-landmarks',
  name: 'Rang d’une lettre',
  family: 'Alphabet',
  rule: 'Six jalons suffisent : A=1, E=5, J=10, O=15, T=20, Z=26. Tout le reste se déduit du plus proche.',
  why:
    'Compter depuis A coûte cinq secondes par lettre, et une série de lettres en demande quatre ou cinq — la conversion mange à elle seule le temps de la question. Avec six jalons espacés de cinq, aucune lettre n’est à plus de deux crans de l’un d’eux : R c’est O plus trois, donc 18. Deux crans à parcourir, jamais dix-sept.',
  steps: [
    'Apprends les six jalons comme une comptine : A-1, E-5, J-10, O-15, T-20, Z-26.',
    'Pour une lettre quelconque, trouve le jalon le plus proche.',
    'Compte les crans qui t’en séparent, en avant ou en arrière. R → O + 3 → 18. C → E − 2 → 3.',
  ],
  when:
    'Sur toute série de lettres, toute énigme où un nombre se lit sur un prénom, et chaque fois qu’un décalage alphabétique est en jeu. C’est la brique des trois autres techniques de cette famille.',
  psy0:
    'Les Séries logiques posent des lettres isolées, des groupes de deux, et des énigmes où le rang EST la réponse. Sans jalons, chacune de ces questions commence par cinq secondes perdues.',
  targetMs: typed(1600),
  answerInput: 'typed',
  diagram: {
    kind: 'face',
    rows: [
      { label: 'les six jalons', left: 'A-1 · E-5 · J-10', right: 'O-15 · T-20 · Z-26' },
      { label: 'R ?', left: 'le plus proche est O (15)', right: 'O + 3 → 18', verdict: 'ok' },
      { label: 'C ?', left: 'le plus proche est E (5)', right: 'E − 2 → 3', verdict: 'ok' },
      { label: 'W ?', left: 'le plus proche est Z (26)', right: 'Z − 3 → 23', verdict: 'ok' },
    ],
    caption:
      'Les jalons sont espacés de cinq : aucune lettre n’est donc à plus de deux ou trois crans de l’un d’eux. On ne compte jamais depuis A — on part du repère le plus proche, dans le sens qui arrange.',
  },
  generate(rng) {
    const rank = randInt(rng, 1, 26);
    const letter = letterAt(rank);
    const { letter: near, at, delta } = nearestLandmark(rank);
    return {
      kind: 'value',
      prompt: `Rang de la lettre ${letter}`,
      answer: rank,
      walkthrough:
        delta === 0
          ? [`${letter} est un jalon : ${rank}. Rien à compter.`]
              .concat([`Les six à savoir : A-1, E-5, J-10, O-15, T-20, Z-26.`])
          : [
              `Le jalon le plus proche de ${letter}, c’est ${near} = ${at}.`,
              `${letter} est ${Math.abs(delta)} cran${Math.abs(delta) > 1 ? 's' : ''} ${delta > 0 ? 'après' : 'avant'} ${near}.`,
              `Donc ${at} ${delta > 0 ? '+' : '−'} ${Math.abs(delta)} = ${rank}.`,
            ],
    };
  },
};

const alphaFromRank: Technique = {
  id: 'alpha-from-rank',
  name: 'Lettre d’un rang',
  family: 'Alphabet',
  rule: 'Même geste dans l’autre sens : pars du jalon le plus proche du NOMBRE, puis compte les crans.',
  why:
    'Une série de lettres se résout en rangs, mais la réponse attendue est une lettre : il faut savoir revenir. Sans le retour, on convertit à l’aller, on calcule, et on bloque au moment de répondre — le travail est fait et le point perdu.',
  steps: [
    'Repère le jalon dont le NOMBRE est le plus proche : 18 → 20, c’est T.',
    'Compte les crans en arrière ou en avant : 18 = 20 − 2, donc deux lettres avant T.',
    'Descends : T, S, R. Le rang 18 est R.',
  ],
  when:
    'À chaque fois qu’une série de lettres se termine — c’est le dernier geste avant de répondre. Aussi pour vérifier une option du QCM sans refaire tout le raisonnement.',
  psy0:
    'Les QCM des Séries logiques proposent des lettres, jamais des rangs. Convertir vite dans ce sens-là, c’est transformer un raisonnement juste en point marqué.',
  targetMs: typed(1900),
  answerInput: 'typed',
  diagram: {
    kind: 'face',
    rows: [
      { label: 'rang 18 ?', left: 'jalon le plus proche : T = 20', right: '18 = 20 − 2' },
      { label: 'on descend', left: 'T (20), S (19), R (18)', right: 'R', verdict: 'ok' },
      { label: 'rang 12 ?', left: 'jalon le plus proche : J = 10', right: '12 = 10 + 2' },
      { label: 'on monte', left: 'J (10), K (11), L (12)', right: 'L', verdict: 'ok' },
    ],
    caption:
      'Le retour rang → lettre demande exactement le même geste que l’aller. C’est lui qu’on néglige, et c’est lui qui bloque au moment de cocher une réponse pourtant trouvée.',
  },
  generate(rng) {
    const rank = randInt(rng, 1, 26);
    const { letter: near, at, delta } = nearestLandmark(rank);
    return {
      kind: 'letter',
      prompt: `La lettre de rang ${rank}`,
      answer: letterAt(rank),
      walkthrough:
        delta === 0
          ? [`${rank} est un jalon : c’est ${near}.`, 'A-1, E-5, J-10, O-15, T-20, Z-26.']
          : [
              `Le jalon le plus proche de ${rank}, c’est ${near} = ${at}.`,
              `${rank} = ${at} ${delta > 0 ? '+' : '−'} ${Math.abs(delta)}, donc ${Math.abs(delta)} lettre${Math.abs(delta) > 1 ? 's' : ''} ${delta > 0 ? 'après' : 'avant'} ${near}.`,
              `→ ${letterAt(rank)}`,
            ],
    };
  },
};

const alphaMirror: Technique = {
  id: 'alpha-mirror',
  name: 'Le miroir de l’alphabet',
  family: 'Alphabet',
  rule: 'Deux lettres symétriques ont des rangs qui totalisent 27. A↔Z, B↔Y, C↔X…',
  why:
    'Parce qu’il y a 26 lettres : la n-ième depuis le début est la (27−n)-ième depuis la fin. Le savoir évite de reparcourir l’alphabet à l’envers, ce que personne ne fait de façon fiable sous chrono — et l’ordre « contralphabétique » revient souvent dans les énoncés.',
  steps: [
    'Convertis la lettre en rang : D = 4.',
    'Retire ce rang de 27 : 27 − 4 = 23.',
    'Reviens à la lettre : 23 → W. Donc le miroir de D est W.',
  ],
  when:
    'Dès qu’un énoncé parle d’ordre inverse ou « contralphabétique », et pour vérifier une symétrie dans une série. Le couple M↔N au centre est le repère : ce sont les rangs 13 et 14.',
  psy0:
    'Certaines séries se lisent à l’envers de l’alphabet. Reparcourir Z, Y, X à la main coûte le temps de la question ; la soustraction à 27 coûte une seconde.',
  targetMs: typed(2600),
  answerInput: 'typed',
  diagram: {
    kind: 'face',
    rows: [
      { label: 'les extrêmes', left: 'A (1) ↔ Z (26)', right: '1 + 26 = 27', verdict: 'ok' },
      { label: 'le centre', left: 'M (13) ↔ N (14)', right: '13 + 14 = 27', verdict: 'ok' },
      { label: 'D ?', left: '27 − 4 = 23', right: 'W', verdict: 'ok' },
    ],
    caption:
      'Il y a 26 lettres, donc la n-ième depuis le début est la (27−n)-ième depuis la fin. Le couple M↔N marque le milieu : c’est le repère qui évite de se tromper de sens.',
  },
  generate(rng) {
    const rank = randInt(rng, 1, 26);
    const letter = letterAt(rank);
    const mirror = 27 - rank;
    return {
      kind: 'letter',
      prompt: `Le miroir de ${letter} dans l’alphabet`,
      answer: letterAt(mirror),
      walkthrough: [
        `${letter} a le rang ${rank}.`,
        `Miroir : 27 − ${rank} = ${mirror}.`,
        `Le rang ${mirror}, c’est ${letterAt(mirror)}.`,
      ],
    };
  },
};

const alphaShift: Technique = {
  id: 'alpha-shift',
  name: 'Décaler en bouclant',
  family: 'Alphabet',
  rule: 'Au-delà de Z on retranche 26 ; en dessous de A on ajoute 26. Un pas ne « dépasse » jamais.',
  why:
    'C’est là que se perdent la plupart des points sur les séries de lettres. U + 7 fait 28, et 28 n’existe pas : on retranche 26 et on obtient 2, donc B. Le candidat qui croit le pas impossible abandonne une série parfaitement régulière.',
  steps: [
    'Convertis en rang, applique le pas : U = 21, plus 7 = 28.',
    'Si le résultat dépasse 26, retranche 26 : 28 − 26 = 2.',
    'S’il tombe à zéro ou en dessous, ajoute 26 : B − 5 donnerait −3, donc 23, soit W.',
    'Reviens à la lettre : 2 → B.',
  ],
  when:
    'Sur toute série de lettres à pas constant, et particulièrement dès qu’un terme approche des extrémités de l’alphabet — c’est là que la boucle se déclenche.',
  psy0:
    'Un pas qui semble impossible est presque toujours un passage par la boucle. Reconnaître ça évite d’abandonner une série qu’on avait résolue.',
  targetMs: typed(3000),
  answerInput: 'typed',
  diagram: {
    kind: 'bonds',
    from: 21,
    to: 28,
    stops: [
      { at: 26, note: '+5 → Z' },
      { at: 28, note: '+2 au-delà' },
    ],
    caption:
      'U (21) avancée de 7 atteint 28 : on dépasse Z de deux crans, donc on repart de A et on avance de 2 → B. L’alphabet est un anneau, pas une règle graduée.',
  },
  generate(rng) {
    // On force le bouclage la moitié du temps : c'est le seul cas qui pose problème.
    const wrap = rng() < 0.6;
    const step = pick(rng, [3, 5, 7, 9, -3, -5, -7]);
    const rank = wrap
      ? step > 0
        ? randInt(rng, 27 - step, 26)
        : randInt(rng, 1, -step)
      : randInt(rng, Math.max(1, 1 - step), Math.min(26, 26 - step));
    const letter = letterAt(rank);
    const raw = rank + step;
    const final = ((raw - 1) % 26 + 26) % 26 + 1;
    return {
      kind: 'letter',
      prompt: `${letter} ${step > 0 ? 'avancée' : 'reculée'} de ${Math.abs(step)}`,
      answer: letterAt(final),
      walkthrough: [
        `${letter} a le rang ${rank}.`,
        `${rank} ${step > 0 ? '+' : '−'} ${Math.abs(step)} = ${raw}.`,
        raw > 26
          ? `${raw} dépasse 26 : on retranche 26 → ${final}.`
          : raw < 1
            ? `${raw} tombe sous 1 : on ajoute 26 → ${final}.`
            : `${raw} tient dans l’alphabet, rien à corriger.`,
        `→ ${letterAt(final)}`,
      ],
    };
  },
};

/* ------------------------------------------------------------- Fondations */

const complements: Technique = {
  id: 'complements',
  name: 'Compléments à 10 et 100',
  family: 'Fondations',
  rule: 'Combien manque-t-il pour atteindre le nombre rond ? Monte d’abord à la dizaine, puis jusqu’à 100.',
  why:
    'Aller de 83 à 100 en une fois demande une soustraction. En DEUX bonds, il n’y a plus rien à calculer : de 83 on monte à 90, ce qui coûte 7 — un simple complément à 10 —, puis de 90 à 100, ce qui coûte 10. Total 17. Les deux bonds sont des faits qu’on connaît déjà, pas des opérations.',
  steps: [
    'Premier bond : du nombre à la dizaine juste au-dessus. De 83 à 90, il faut 7 (parce que 3 + 7 = 10).',
    'Second bond : de cette dizaine à 100. De 90 à 100, il faut 10.',
    'Additionne les deux bonds : 7 + 10 = 17. Voilà le complément de 83 à 100.',
    'Raccourci une fois le geste acquis : les DIZAINES se complètent à 9 et les UNITÉS à 10. Pour 83 : 8 va à 9 (donc 1), 3 va à 10 (donc 7), et on colle — 17. C’est le même calcul, écrit plus court.',
  ],
  when:
    'Dès qu’un nombre rond apparaît quelque part — 100, 1000, une dizaine. C’est la brique de toutes les autres techniques : arrondir-compenser et soustraire par la distance en dépendent entièrement.',
  psy0:
    'Aucun calcul de la grille ne se vérifie vite si les compléments hésitent. C’est le seul point du programme qui doit être un réflexe pur, sans aucune réflexion.',
  targetMs: typed(1400),
  answerInput: 'typed',
  diagram: {
    kind: 'bonds',
    from: 83,
    to: 100,
    stops: [
      { at: 90, note: '+7' },
      { at: 100, note: '+10' },
    ],
    caption:
      'Complément de 83 à 100 : deux bonds, 7 puis 10, donc 17. Le raccourci « dizaines à 9, unités à 10 » dit exactement la même chose — 8→9 donne 1, 3→10 donne 7, et 17 se lit d’un coup.',
  },
  generate(rng) {
    const to = pick(rng, [100, 100, 100, 1000]);
    if (to === 1000) {
      const n = randInt(rng, 111, 989);
      const c = Math.floor(n / 100);
      const d = Math.floor(n / 10) % 10;
      const u = n % 10;
      const walkthrough =
        u === 0
          ? [
              `${n} finit par 0 : les unités restent à 0.`,
              `Centaines à 9 : ${c} + ${9 - c} = 9. Dizaines à 10 : ${d} + ${10 - d} = 10.`,
              `→ ${fr(1000 - n)}`,
            ]
          : [
              `Centaines à 9 : ${c} + ${9 - c} = 9.`,
              `Dizaines à 9 : ${d} + ${9 - d} = 9.`,
              `Unités à 10 : ${u} + ${10 - u} = 10.`,
              `→ ${fr(1000 - n)}`,
            ];
      return { kind: 'value', prompt: `Complément de ${fr(n)} à 1 000`, answer: 1000 - n, walkthrough };
    }
    const n = randInt(rng, 11, 98);
    const d = Math.floor(n / 10);
    const u = n % 10;
    // Le pas-à-pas suit la MÉTHODE ENSEIGNÉE — les deux bonds — puis rappelle le
    // raccourci. Montrer le seul raccourci laissait l'élève devant une règle
    // sortie de nulle part, ce qui est précisément ce qui bloquait.
    const walkthrough =
      u === 0
        ? [
            `${n} finit déjà par 0 : un seul bond suffit.`,
            `De ${n} à 100 : ${100 - n}.`,
          ]
        : [
            `Premier bond, jusqu'à la dizaine : de ${n} à ${n - u + 10}, il faut ${10 - u}.`,
            `Second bond, jusqu'à 100 : de ${n - u + 10} à 100, il faut ${90 - (n - u)}.`,
            `Total : ${10 - u} + ${90 - (n - u)} = ${100 - n}.`,
            `Raccourci : dizaines à 9 (${d} + ${9 - d}), unités à 10 (${u} + ${10 - u}) → ${100 - n}. Même calcul, écrit plus court.`,
          ];
    return { kind: 'value', prompt: `Complément de ${n} à 100`, answer: 100 - n, walkthrough };
  },
};

const addLeft: Technique = {
  id: 'add-left',
  name: 'Additionner par la gauche',
  family: 'Fondations',
  rule: 'Additionne les dizaines d’abord, les unités ensuite. Jamais l’inverse.',
  why:
    'L’addition posée démarre par la droite parce que le papier a besoin des retenues. De tête, c’est l’inverse : commencer par la gauche donne tout de suite le bon ordre de grandeur, et il n’y a plus rien à retenir — un seul nombre vit dans ta tête et s’écrase à chaque étape.',
  steps: [
    'Garde le premier nombre entier.',
    'Ajoute les dizaines du second : 47 + 30 = 77.',
    'Ajoute les unités du second : 77 + 8 = 85.',
  ],
  when:
    'Toute addition à deux ou trois chiffres. Si le second nombre est proche d’une dizaine (finit par 8 ou 9), préfère arrondir-compenser : c’est plus court.',
  psy0:
    'C’est la posture par défaut de toute la grille. Poser mentalement une addition en colonnes coûte trois fois le temps et fabrique les erreurs de retenue que le test glisse exprès.',
  targetMs: typed(2200),
  answerInput: 'typed',
  diagram: {
    kind: 'bonds',
    from: 47,
    to: 85,
    stops: [
      { at: 77, note: '+30' },
      { at: 85, note: '+8' },
    ],
    caption:
      '47 + 38 : les dizaines d’abord (+30), les unités ensuite (+8). Un seul nombre vit dans ta tête à chaque instant, et il n’y a aucune retenue à mémoriser.',
  },
  generate(rng) {
    const a = randInt(rng, 24, 89);
    const b = randInt(rng, 23, 78);
    const bd = Math.floor(b / 10) * 10;
    const bu = b % 10;
    return {
      kind: 'value',
      prompt: `${a} + ${b}`,
      answer: a + b,
      walkthrough: [
        `Les dizaines d’abord : ${a} + ${bd} = ${a + bd}.`,
        `Puis les unités : ${a + bd} + ${bu} = ${a + b}.`,
        'Un seul nombre en tête à chaque instant, aucune retenue à mémoriser.',
      ],
    };
  },
};

const roundCompensate: Technique = {
  id: 'round-compensate',
  name: 'Arrondir et compenser',
  family: 'Fondations',
  rule: 'Remplace le nombre par la dizaine voisine, puis corrige l’écart — en sens inverse si tu soustrais.',
  why:
    'Ajouter 40 est gratuit, ajouter 39 ne l’est pas. On paie donc un petit ajustement de 1 ou 2 pour supprimer entièrement la retenue. Le piège est le sens de la correction : sur une soustraction, retirer trop oblige à REDONNER.',
  steps: [
    'Repère la dizaine la plus proche et l’écart (1, 2 ou 3).',
    'Fais l’opération avec le nombre rond.',
    'Corrige : addition → tu as trop ajouté, tu retires. Soustraction → tu as trop retiré, tu rajoutes.',
  ],
  when:
    'Dès qu’un nombre finit par 7, 8 ou 9 — ou par 1, 2, 3 en arrondissant vers le bas. Inutile pour 44 ou 45 : l’écart devient aussi coûteux que le calcul.',
  psy0:
    'Les grilles regorgent de « 47 + 39 » et « 68 − 29 ». Chacun se règle en une seconde par cette voie, contre cinq en posant.',
  targetMs: typed(2400),
  answerInput: 'typed',
  diagram: {
    kind: 'bonds',
    from: 47,
    to: 86,
    stops: [
      { at: 87, note: '+40' },
      { at: 86, note: '−1' },
    ],
    caption:
      '47 + 39 : on ajoute 40 (gratuit), on dépasse d’un, on le retire. Sur une SOUSTRACTION la correction s’inverse — on a trop retiré, donc on redonne.',
  },
  generate(rng) {
    const round = randInt(rng, 2, 7) * 10;
    const gap = randInt(rng, 1, 3);
    const b = round - gap;
    if (rng() < 0.5) {
      const a = randInt(rng, 26, 89);
      return {
        kind: 'value',
        prompt: `${a} + ${b}`,
        answer: a + b,
        walkthrough: [
          `${b}, c’est ${round} − ${gap}.`,
          `${a} + ${round} = ${a + round}.`,
          `On a ajouté ${gap} de trop : ${a + round} − ${gap} = ${a + b}.`,
        ],
      };
    }
    const a = randInt(rng, round + 12, round + 60);
    return {
      kind: 'value',
      prompt: `${a} − ${b}`,
      answer: a - b,
      walkthrough: [
        `${b}, c’est ${round} − ${gap}.`,
        `${a} − ${round} = ${a - round}.`,
        `On a retiré ${gap} de trop, donc on le REDONNE : ${a - round} + ${gap} = ${a - b}.`,
      ],
    };
  },
};

const subDistance: Technique = {
  id: 'sub-distance',
  name: 'Soustraire par la distance',
  family: 'Fondations',
  rule: 'Ne retire pas : remonte du petit vers le grand, en passant par la dizaine ronde.',
  why:
    'Une soustraction est une distance. En la parcourant vers le haut, il n’y a plus de retenue du tout — donc plus d’erreur de retenue. Or c’est exactement l’erreur que le test place le plus souvent (63 − 27 = 44 au lieu de 36).',
  steps: [
    'Du petit nombre, monte à la dizaine juste au-dessus.',
    'De cette dizaine, monte jusqu’au grand nombre.',
    'Additionne les deux bonds.',
  ],
  when:
    'Chaque fois que le chiffre des unités du second est plus grand que celui du premier — c’est-à-dire chaque fois qu’une retenue menace.',
  psy0:
    'C’est la technique la plus rentable de tout l’atelier : elle supprime la faute la plus fréquente des Grilles, et celle qu’on commet en la VÉRIFIANT trop vite.',
  targetMs: typed(2600),
  answerInput: 'typed',
  diagram: {
    kind: 'bonds',
    from: 27,
    to: 63,
    stops: [
      { at: 30, note: '+3' },
      { at: 63, note: '+33' },
    ],
    caption:
      '63 − 27 : ne retire pas, REMONTE. De 27 à 30 il y a 3, de 30 à 63 il y a 33 : la distance vaut 36. Aucune retenue, donc aucune erreur de retenue.',
  },
  generate(rng) {
    const aU = randInt(rng, 0, 4);
    const bU = randInt(rng, aU + 1, 9);
    const aT = randInt(rng, 4, 9);
    const bT = randInt(rng, 1, aT - 1);
    const a = aT * 10 + aU;
    const b = bT * 10 + bU;
    const up = (Math.floor(b / 10) + 1) * 10;
    return {
      kind: 'value',
      prompt: `${a} − ${b}`,
      answer: a - b,
      walkthrough: [
        `Ne pose pas : mesure la distance de ${b} à ${a}.`,
        `De ${b} à ${up} : ${up - b}.`,
        `De ${up} à ${a} : ${a - up}.`,
        `Total : ${up - b} + ${a - up} = ${a - b}. Zéro retenue, donc zéro erreur de retenue.`,
      ],
    };
  },
};

/* --------------------------------------------------------- Multiplication */

const mul11: Technique = {
  id: 'mul-11',
  name: 'Multiplier par 11',
  family: 'Multiplication',
  rule: 'Écarte les deux chiffres et glisse leur somme au milieu.',
  why:
    '34 × 11 = 34 × 10 + 34 : les dizaines se décalent d’un rang et retombent sur les unités. Le chiffre du milieu est donc mécaniquement la somme des deux — et s’il dépasse 9, il déborde sur les centaines.',
  steps: [
    'Sépare les chiffres : 34 → 3 _ 4.',
    'Au milieu, leur somme : 3 + 4 = 7 → 374.',
    'Si la somme dépasse 9, garde son unité au milieu et ajoute 1 devant : 78 → 7 _ 8, 7+8 = 15 → 858.',
  ],
  when: 'Tout nombre à deux chiffres multiplié par 11. Fonctionne aussi pour 110, 1100.',
  psy0:
    'Le ×11 apparaît dans les grilles et dans les calculs du Psychomoteur. Sans la technique, on le pose ; avec elle, on le lit.',
  targetMs: typed(2400),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '34 × 11',
    parts: [
      { label: 'le 3 reste à gauche', value: '3' },
      { label: '3 + 4 au milieu', value: '7' },
      { label: 'le 4 reste à droite', value: '4' },
    ],
    total: '374',
    caption:
      '×11 écarte les deux chiffres et glisse leur somme au milieu. Si cette somme dépasse 9, elle déborde : 78 × 11 donne 7 | 15 | 8, donc 858.',
  },
  generate(rng) {
    const n = randInt(rng, 13, 89);
    const d = Math.floor(n / 10);
    const u = n % 10;
    const s = d + u;
    const walkthrough =
      s < 10
        ? [`On écarte les chiffres : ${d} _ ${u}.`, `Au milieu, leur somme : ${d} + ${u} = ${s}.`, `→ ${fr(n * 11)}`]
        : [
            `On écarte les chiffres : ${d} _ ${u}.`,
            `Somme : ${d} + ${u} = ${s} — deux chiffres, donc RETENUE.`,
            `On garde ${s % 10} au milieu et on ajoute 1 devant : ${d} + 1 = ${d + 1}.`,
            `→ ${fr(n * 11)}`,
          ];
    return { kind: 'value', prompt: `${n} × 11`, answer: n * 11, walkthrough };
  },
};

const mulRounds: Technique = {
  id: 'mul-5-25-50',
  name: 'Multiplier par 5, 25, 50',
  family: 'Multiplication',
  rule: '×5 = ×10 ÷ 2 · ×50 = ×100 ÷ 2 · ×25 = ×100 ÷ 4.',
  why:
    '5, 25 et 50 sont des fractions de puissances de 10 : 5 = 10/2, 25 = 100/4. Multiplier par une puissance de 10 ne coûte rien (on décale), et diviser par 2 ou 4 est presque gratuit. On échange donc une multiplication contre un décalage.',
  steps: [
    'Décale d’abord : ×10 ou ×100. Un ou deux zéros, aucune réflexion.',
    'Puis divise : par 2 pour 5 et 50, par 4 pour 25.',
    'Dans cet ordre — diviser avant décaler fabrique des virgules inutiles.',
  ],
  when: 'Dès qu’un facteur vaut 5, 25, 50, 500… Vaut aussi pour ÷5, qui est ×2 puis ÷10.',
  psy0: 'Les pourcentages du test tombent tous sur ces nombres : 25 % = ÷4, 50 % = ÷2. Une seule technique couvre les deux familles.',
  targetMs: typed(2600),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '48 × 25',
    parts: [
      { label: 'on décale : ×100', value: '4 800' },
      { label: 'puis ÷4', value: '÷ 4' },
    ],
    total: '1 200',
    caption:
      '25 = 100 ÷ 4. On échange une multiplication difficile contre un décalage suivi d’une division facile. Décale TOUJOURS en premier : diviser d’abord fabrique des virgules inutiles.',
  },
  generate(rng) {
    const mode = pick(rng, [5, 25, 50]);
    if (mode === 5) {
      const n = randInt(rng, 14, 98);
      return {
        kind: 'value',
        prompt: `${n} × 5`,
        answer: n * 5,
        walkthrough: [`×5, c’est ×10 puis ÷2.`, `${n} × 10 = ${fr(n * 10)}.`, `÷2 → ${fr(n * 5)}`],
      };
    }
    if (mode === 50) {
      const n = randInt(rng, 12, 48);
      return {
        kind: 'value',
        prompt: `${n} × 50`,
        answer: n * 50,
        walkthrough: [`×50, c’est ×100 puis ÷2.`, `${n} × 100 = ${fr(n * 100)}.`, `÷2 → ${fr(n * 50)}`],
      };
    }
    const n = randInt(rng, 12, 44);
    return {
      kind: 'value',
      prompt: `${n} × 25`,
      answer: n * 25,
      walkthrough: [
        `×25, c’est ×100 puis ÷4.`,
        `${n} × 100 = ${fr(n * 100)}.`,
        `÷4 = deux moitiés : ${fr(n * 50)} puis ${fr(n * 25)}.`,
      ],
    };
  },
};

const mulNines: Technique = {
  id: 'mul-9-99',
  name: 'Multiplier par 9 et 99',
  family: 'Multiplication',
  rule: '×9 = ×10 moins une fois · ×99 = ×100 moins une fois.',
  why:
    '9 = 10 − 1. La distributivité donne n×9 = n×10 − n : on remplace une table difficile par un décalage et une soustraction. Même chose pour 99, 999, ou 98 (= ×100 − deux fois).',
  steps: ['Multiplie par la puissance de 10 juste au-dessus.', 'Retire le nombre une fois (deux fois pour 98 ou 8).'],
  when:
    'Pour 9, 19, 29, 99… et symétriquement pour 8 (×10 − deux fois). Au-delà de trois soustractions, la technique perd son avantage.',
  psy0: 'La table de 9 est celle où l’on hésite le plus. La supprimer, c’est supprimer l’hésitation.',
  targetMs: typed(3000),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '37 × 9',
    parts: [
      { label: '37 × 10', value: '370' },
      { label: 'on retire 37', value: '− 37' },
    ],
    total: '333',
    caption:
      '9 = 10 − 1. La table de 9 est celle où l’on hésite le plus : la supprimer, c’est supprimer l’hésitation. Même geste pour 99 (×100 − une fois) et pour 8 (×10 − deux fois).',
  },
  generate(rng) {
    const m = pick(rng, [9, 9, 99]);
    const n = m === 9 ? randInt(rng, 13, 89) : randInt(rng, 12, 48);
    return {
      kind: 'value',
      prompt: `${n} × ${m}`,
      answer: n * m,
      walkthrough: [
        `${m} = ${m + 1} − 1.`,
        `${n} × ${m + 1} = ${fr(n * (m + 1))}.`,
        `On retire ${n} une fois : ${fr(n * (m + 1))} − ${n} = ${fr(n * m)}.`,
      ],
    };
  },
};

const doubleHalve: Technique = {
  id: 'double-halve',
  name: 'Doubler et diviser par deux',
  family: 'Multiplication',
  rule: 'Divise un facteur par 2 et double l’autre : le produit ne bouge pas.',
  why:
    'Le produit est invariant parce qu’on multiplie puis divise par le même 2. On s’en sert pour faire GLISSER la difficulté : 16 × 35 devient 8 × 70, puis 4 × 140 — jusqu’à ce qu’un des deux facteurs devienne trivial.',
  steps: [
    'Repère le facteur pair.',
    'Divise-le par 2, double l’autre. Répète.',
    'Arrête-toi quand un facteur vaut 1, 2, 4 ou une dizaine ronde.',
  ],
  when:
    'Quand un facteur est un multiple de 4 et l’autre finit par 5 : le doublement le rend rond. À l’inverse, sur deux nombres impairs, la technique n’a aucune prise.',
  psy0:
    'Elle transforme les multiplications à deux chiffres — les plus coûteuses de la grille — en calculs de tête ordinaires.',
  targetMs: typed(4000),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '16 × 35',
    parts: [
      { label: 'moitié × double', value: '8 × 70' },
      { label: 'encore', value: '4 × 140' },
    ],
    total: '560',
    caption:
      'Diviser un facteur par 2 et doubler l’autre ne change pas le produit. On s’en sert pour faire GLISSER la difficulté jusqu’à ce qu’un des deux facteurs devienne trivial.',
  },
  generate(rng) {
    const a = pick(rng, [12, 16, 24, 28, 32, 36, 48]);
    const b = pick(rng, [15, 25, 35, 45, 55]);
    const walkthrough = [`Le produit ne change pas si on divise l’un par 2 et double l’autre.`];
    let x = a;
    let y = b;
    for (let i = 0; i < 2 && x % 2 === 0; i++) {
      x /= 2;
      y *= 2;
      walkthrough.push(`${x} × ${y}`);
    }
    walkthrough.push(`Là c’est immédiat : ${x} × ${y} = ${fr(a * b)}.`);
    return { kind: 'value', prompt: `${a} × ${b}`, answer: a * b, walkthrough };
  },
};

const distribute: Technique = {
  id: 'distribute',
  name: 'Découper le grand facteur',
  family: 'Multiplication',
  rule: 'Coupe en dizaines + unités, multiplie chaque morceau, rassemble.',
  why:
    'C’est la distributivité : 23 × 7 = (20 + 3) × 7 = 140 + 21. Deux multiplications faciles remplacent une difficile, et l’ordre de grandeur est connu dès le premier morceau.',
  steps: ['Coupe : 23 → 20 + 3.', '20 × 7 = 140.', '3 × 7 = 21.', 'Additionne : 161.'],
  when:
    'La technique par défaut d’un « deux chiffres × un chiffre » quand aucune autre ne s’applique. Coupe aussi en 25 + 3 ou 50 − 2 si ça tombe mieux.',
  psy0: 'C’est le filet de sécurité : elle marche toujours, même quand aucune astuce ne colle.',
  targetMs: typed(3400),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '23 × 7',
    parts: [
      { label: '20 × 7', value: '140' },
      { label: '3 × 7', value: '21' },
    ],
    total: '161',
    caption:
      'Deux multiplications faciles remplacent une difficile, et l’ordre de grandeur est connu dès le premier morceau. C’est le filet de sécurité : elle marche toujours.',
  },
  generate(rng) {
    const b = randInt(rng, 3, 9);
    const d = randInt(rng, 1, 4) * 10;
    const u = randInt(rng, 2, 9);
    const a = d + u;
    return {
      kind: 'value',
      prompt: `${a} × ${b}`,
      answer: a * b,
      walkthrough: [
        `On coupe ${a} en ${d} + ${u}.`,
        `${d} × ${b} = ${fr(d * b)}.`,
        `${u} × ${b} = ${u * b}.`,
        `On rassemble : ${fr(d * b)} + ${u * b} = ${fr(a * b)}.`,
      ],
    };
  },
};

const square5: Technique = {
  id: 'square-5',
  name: 'Carrés des nombres en 5',
  family: 'Multiplication',
  rule: 'Le chiffre des dizaines fois son suivant, puis 25 collé derrière.',
  why:
    '(10d + 5)² = 100·d(d+1) + 25. Les 25 finaux sont donc structurels, jamais un hasard — et le début est un simple produit de deux entiers consécutifs.',
  steps: ['Prends le chiffre des dizaines, multiplie-le par le suivant : 3 × 4 = 12.', 'Colle 25 : 35² = 1225.'],
  when: 'Tout nombre finissant par 5, élevé au carré : 15, 25, 35… et aussi 105, 115.',
  psy0: 'Un résultat qui finit par 5 et n’est pas suivi de 25 est faux d’office : c’est un test d’une demi-seconde.',
  targetMs: typed(2400),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '35 × 35',
    parts: [
      { label: '3 × son suivant, 4', value: '12' },
      { label: 'toujours', value: '25' },
    ],
    total: '1 225',
    caption:
      'Les 25 finaux sont structurels, jamais un hasard : (10d + 5)² vaut 100 × d(d+1) + 25. Un résultat qui finit par 5 sans être suivi de 25 est donc faux d’office.',
  },
  generate(rng) {
    const d = randInt(rng, 2, 9);
    const n = d * 10 + 5;
    return {
      kind: 'value',
      prompt: `${n} × ${n}`,
      answer: n * n,
      walkthrough: [
        'Le nombre finit par 5 : le résultat finit TOUJOURS par 25.',
        `Devant : les dizaines fois leur suivant, ${d} × ${d + 1} = ${d * (d + 1)}.`,
        `→ ${d * (d + 1)} puis 25 = ${fr(n * n)}`,
      ],
    };
  },
};

const diffSquares: Technique = {
  id: 'diff-squares',
  name: 'Produits autour d’un rond',
  family: 'Multiplication',
  rule: 'Deux nombres à égale distance d’un rond : le rond au carré, moins l’écart au carré.',
  why:
    '(c − d)(c + d) = c² − d². Si les deux facteurs encadrent symétriquement un nombre rond, le produit se lit d’un coup : 48 × 52 = 50² − 2² = 2 496.',
  steps: ['Trouve le milieu : 48 et 52 encadrent 50.', 'Le milieu au carré : 2500.', 'Moins l’écart au carré : 2500 − 4 = 2496.'],
  when:
    'Seulement si les deux facteurs sont SYMÉTRIQUES autour d’un rond. 47 × 52 ne s’y prête pas — chercher à forcer coûte plus que découper.',
  psy0: 'Le cas se présente peu, mais quand il tombe il fait gagner dix secondes pleines sur une grille serrée.',
  targetMs: typed(4200),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '48 × 52',
    parts: [
      { label: 'le milieu au carré', value: '2 500' },
      { label: 'moins l’écart au carré', value: '− 4' },
    ],
    total: '2 496',
    caption:
      '48 et 52 sont tous deux à 2 de 50 : (50−2)(50+2) = 50² − 2². N’essaie pas de forcer si les facteurs ne sont pas SYMÉTRIQUES autour d’un rond — découper coûte alors moins cher.',
  },
  generate(rng) {
    const c = pick(rng, [20, 30, 40, 50, 60, 70, 80]);
    const d = randInt(rng, 1, 3);
    return {
      kind: 'value',
      prompt: `${c - d} × ${c + d}`,
      answer: (c - d) * (c + d),
      walkthrough: [
        `${c - d} et ${c + d} sont tous deux à ${d} de ${c}.`,
        `Donc le produit vaut ${c}² − ${d}².`,
        `${fr(c * c)} − ${d * d} = ${fr(c * c - d * d)}.`,
      ],
    };
  },
};

/* ------------------------------------------------------------- Proportions */

const percent10: Technique = {
  id: 'percent-10',
  name: 'Pourcentages par 10 %',
  family: 'Proportions',
  rule: 'Calcule 10 % (décale la virgule), puis compose tout le reste à partir de là.',
  why:
    '10 % est le seul pourcentage gratuit : c’est une division par 10. Tous les autres s’en déduisent par doublement, moitié ou addition — on ne fait donc jamais la multiplication du pourcentage.',
  steps: ['10 % = le nombre divisé par 10.', '5 % = la moitié de 10 %. 20 % = le double. 30 % = trois fois.', 'Compose : 35 % = 30 % + 5 %.'],
  when: 'Tous les pourcentages. Si le pourcentage est 25, 50 ou 75, passe plutôt par les fractions : ÷4, ÷2, ÷4×3.',
  psy0: 'Les grilles mélangent pourcentages et fractions sur la même ligne. Une seule voie de calcul pour les deux évite de changer de méthode en cours de grille.',
  targetMs: typed(3000),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '35 % de 240',
    parts: [
      { label: '10 % (on décale)', value: '24' },
      { label: '30 % = 3 fois', value: '72' },
      { label: '5 % = la moitié de 10 %', value: '12' },
    ],
    total: '84',
    caption:
      '10 % est le seul pourcentage gratuit : c’est une division par 10. Tous les autres s’en déduisent par doublement, moitié ou addition — on ne fait donc jamais la multiplication.',
  },
  generate(rng) {
    const p = pick(rng, [5, 15, 20, 30, 40, 60, 70, 80, 90]);
    if (p === 5 || p === 15) {
      const base = randInt(rng, 4, 30) * 20;
      const ten = base / 10;
      const five = base / 20;
      const answer = (p * base) / 100;
      return {
        kind: 'value',
        prompt: `${p} % de ${fr(base)}`,
        answer,
        walkthrough:
          p === 5
            ? [`10 % de ${fr(base)} = ${fr(ten)}.`, `5 % en est la moitié : ${fr(five)}.`]
            : [`10 % de ${fr(base)} = ${fr(ten)}.`, `5 % = la moitié : ${fr(five)}.`, `15 % = 10 % + 5 % = ${fr(ten)} + ${fr(five)} = ${fr(answer)}.`],
      };
    }
    const base = randInt(rng, 4, 60) * 10;
    const ten = base / 10;
    const answer = (p * base) / 100;
    return {
      kind: 'value',
      prompt: `${p} % de ${fr(base)}`,
      answer,
      walkthrough: [
        `10 % de ${fr(base)} = ${fr(ten)} (on décale d’un rang).`,
        `${p} % = ${p / 10} × 10 % = ${p / 10} × ${fr(ten)} = ${fr(answer)}.`,
      ],
    };
  },
};

const percentSwap: Technique = {
  id: 'percent-swap',
  name: 'Retourner le pourcentage',
  family: 'Proportions',
  rule: '« a % de b » vaut exactement « b % de a ». Prends le sens le plus facile.',
  why:
    'Les deux valent a×b/100 : c’est la même multiplication, seule la lecture change. 16 % de 25 fait peur ; 25 % de 16, c’est le quart de 16, donc 4.',
  steps: ['Écris mentalement les deux lectures.', 'Garde celle dont le pourcentage est 25, 50, 10 ou 20.', 'Calcule celle-là.'],
  when:
    'Quand l’un des deux nombres est un pourcentage confortable (10, 20, 25, 50). Sinon le retournement ne simplifie rien.',
  psy0: 'C’est le raccourci que les correcteurs attendent : il transforme une ligne « impossible en 5 s » en une lecture immédiate.',
  targetMs: typed(3200),
  answerInput: 'typed',
  diagram: {
    kind: 'face',
    rows: [
      { label: 'ce qui est écrit', left: '16 % de 25', right: 'ça fait peur' },
      { label: 'la même chose', left: '25 % de 16', right: 'le quart de 16', verdict: 'ok' },
      { label: 'donc', left: '16 ÷ 4', right: '4', verdict: 'ok' },
    ],
    caption:
      'Les deux valent a × b ÷ 100 : c’est la même multiplication, seule la lecture change. Retourne dès que l’un des deux nombres est un pourcentage confortable — 10, 20, 25, 50.',
  },
  generate(rng) {
    const base = pick(rng, [20, 25, 50]);
    const p =
      base === 25 ? pick(rng, [8, 12, 16, 24, 36, 44]) : base === 50 ? pick(rng, [14, 18, 22, 26, 34, 46]) : pick(rng, [15, 25, 35, 45, 65]);
    const answer = (p * base) / 100;
    const easy = base === 25 ? `le quart de ${p}` : base === 50 ? `la moitié de ${p}` : `le cinquième de ${p}`;
    return {
      kind: 'value',
      prompt: `${p} % de ${base}`,
      answer,
      walkthrough: [
        `« ${p} % de ${base} » = « ${base} % de ${p} » : même produit, lecture plus simple.`,
        `${base} % de ${p}, c’est ${easy} = ${fr(answer)}.`,
      ],
    };
  },
};

const fractions: Technique = {
  id: 'fractions',
  name: 'Fractions usuelles',
  family: 'Proportions',
  rule: 'Calcule d’abord UNE part, multiplie ensuite par le numérateur.',
  why:
    '3/8 de 240 n’est pas « 3 × 240 ÷ 8 » dans cet ordre : diviser d’abord garde les nombres petits. Une part vaut 30, trois parts valent 90 — sans jamais dépasser trois chiffres.',
  steps: ['Divise par le dénominateur : 240 ÷ 8 = 30.', 'Multiplie par le numérateur : 3 × 30 = 90.', 'Pour ÷4 et ÷8, enchaîne des moitiés : 240 → 120 → 60 → 30.'],
  when:
    'Toute fraction d’un nombre. Si la division ne tombe pas juste, inverse l’ordre : multiplie d’abord, divise ensuite.',
  psy0: 'Les fractions et les pourcentages occupent la même famille de cases dans les grilles. Les traiter par « une part d’abord » unifie les deux.',
  targetMs: typed(3200),
  answerInput: 'typed',
  diagram: {
    kind: 'decoupe',
    source: '3/8 de 240',
    parts: [
      { label: 'une part : 240 ÷ 8', value: '30' },
      { label: 'trois parts', value: '× 3' },
    ],
    total: '90',
    caption:
      'Divise D’ABORD, multiplie ensuite : les nombres restent petits tout du long. Pour ÷8, enchaîne trois moitiés — 240 → 120 → 60 → 30.',
  },
  generate(rng) {
    const options: Array<[number, number, string]> = [
      [1, 4, '1/4'],
      [3, 4, '3/4'],
      [1, 3, '1/3'],
      [2, 3, '2/3'],
      [3, 8, '3/8'],
      [5, 8, '5/8'],
      [5, 6, '5/6'],
    ];
    const [num, den, label] = pick(rng, options);
    const base = randInt(rng, 4, 30) * den;
    const part = base / den;
    const walkthrough = [`Une part : ${fr(base)} ÷ ${den} = ${fr(part)}.`];
    if (den === 8) walkthrough.push(`(÷8 = trois moitiés : ${fr(base)} → ${fr(base / 2)} → ${fr(base / 4)} → ${fr(part)}.)`);
    if (den === 4) walkthrough.push(`(÷4 = deux moitiés : ${fr(base)} → ${fr(base / 2)} → ${fr(part)}.)`);
    walkthrough.push(
      num === 1 ? `${label}, c’est cette part : ${fr(part)}.` : `${label}, c’est ${num} parts : ${num} × ${fr(part)} = ${fr(num * part)}.`,
    );
    return { kind: 'value', prompt: `${label} de ${fr(base)}`, answer: num * part, walkthrough };
  },
};

const divideChain: Technique = {
  id: 'div-chain',
  name: 'Diviser en cascade',
  family: 'Proportions',
  rule: 'Casse le diviseur en petits facteurs et divise successivement.',
  why:
    'Diviser par 8 d’un coup demande de chercher un quotient ; diviser trois fois par 2 ne demande rien. Comme 8 = 2×2×2 et 12 = 4×3, la cascade remplace une recherche par des gestes réflexes.',
  steps: ['Décompose : 8 = 2×2×2, 6 = 2×3, 12 = 4×3.', 'Divise étape par étape.', 'Commence par le facteur qui tombe le plus rond.'],
  when: 'Diviseur composé (4, 6, 8, 12, 16). Pour un diviseur premier (7, 11, 13), il n’y a pas de cascade : passe par la multiplication inverse.',
  psy0: 'Les divisions des grilles tombent toujours juste — la cascade les rend mécaniques au lieu de tâtonnantes.',
  targetMs: typed(3200),
  answerInput: 'typed',
  diagram: {
    kind: 'bonds',
    from: 0,
    to: 3,
    stops: [
      { at: 1, note: '÷2 → 96' },
      { at: 2, note: '÷2 → 48' },
      { at: 3, note: '÷2 → 24' },
    ],
    caption:
      '192 ÷ 8 : diviser par 8 d’un coup demande de chercher un quotient ; trois moitiés successives ne demandent rien. 8 = 2×2×2, 6 = 2×3, 12 = 4×3.',
  },
  generate(rng) {
    const b = pick(rng, [4, 6, 8, 12]);
    const q = randInt(rng, 12, 40);
    const n = b * q;
    const walkthrough: string[] = [];
    if (b === 4) walkthrough.push(`4 = 2 × 2 : deux moitiés.`, `${fr(n)} → ${fr(n / 2)} → ${fr(q)}.`);
    else if (b === 8) walkthrough.push(`8 = 2 × 2 × 2 : trois moitiés.`, `${fr(n)} → ${fr(n / 2)} → ${fr(n / 4)} → ${fr(q)}.`);
    else if (b === 6) walkthrough.push(`6 = 2 × 3 : une moitié puis un tiers.`, `${fr(n)} → ${fr(n / 2)} → ${fr(q)}.`);
    else walkthrough.push(`12 = 4 × 3 : deux moitiés puis un tiers.`, `${fr(n)} → ${fr(n / 2)} → ${fr(n / 4)} → ${fr(q)}.`);
    return { kind: 'value', prompt: `${fr(n)} ÷ ${b}`, answer: q, walkthrough };
  },
};

/* ------------------------------------------------------------ Vérification */

const unitsCheck: Technique = {
  id: 'units-check',
  name: 'Contrôle par les unités',
  family: 'Vérification',
  rule: 'Ne recalcule pas : calcule le seul chiffre des unités et compare.',
  why:
    'Le chiffre des unités d’un résultat ne dépend QUE des unités des opérandes — aucune retenue ne remonte vers lui. Une opération à trois chiffres se contrôle donc par une opération à un chiffre.',
  steps: [
    'Addition/soustraction : opère sur les unités seules.',
    'Multiplication : multiplie les unités, garde le dernier chiffre.',
    'Compare au résultat proposé. Ça ne colle pas → faux, sans appel.',
  ],
  when:
    'Première passe systématique sur une grille. Attention : le contrôle ne PROUVE rien quand il passe — il ne fait qu’éliminer.',
  psy0:
    'C’est la passe 1 des Grilles de calculs : elle attrape la moitié des erreurs en dix secondes, et c’est aussi le premier réflexe sur les calculs du Psychomoteur.',
  targetMs: keyed(2500),
  answerInput: 'keyed',
  diagram: {
    kind: 'face',
    rows: [
      { label: 'le calcul', left: '47 × 6', right: '= 292 ?' },
      { label: 'unités seules', left: '7 × 6 = 42', right: 'doit finir par 2', verdict: 'ok' },
      { label: 'or on lit', left: '292', right: 'finit par 2 → rien à dire' },
      { label: 'autre cas', left: '47 × 6 = 285', right: 'finit par 5 → FAUX', verdict: 'ko' },
    ],
    caption:
      'Le chiffre des unités d’un résultat ne dépend QUE des unités des opérandes : aucune retenue ne remonte jusqu’à lui. Une opération à trois chiffres se contrôle donc par une opération à un chiffre.',
  },
  generate(rng) {
    const wrong = rng() < 0.5;
    const mul = rng() < 0.6;
    const a = randInt(rng, 23, 89);
    const b = mul ? randInt(rng, 3, 9) : randInt(rng, 24, 88);
    const truth = mul ? a * b : a + b;
    const shown = wrong ? truth + pick(rng, [1, 2, 3, -1, -2, -3]) : truth;
    const au = a % 10;
    const bu = b % 10;
    const expected = mul ? (au * bu) % 10 : (au + bu) % 10;
    const walkthrough = mul
      ? [
          `Unités : ${au} × ${bu} = ${au * bu}, donc le résultat DOIT finir par ${expected}.`,
          `Proposé : ${fr(shown)}, qui finit par ${Math.abs(shown) % 10}.`,
          wrong ? `Ça ne colle pas → faux. Vrai résultat : ${fr(truth)}.` : `Ça colle → rien à redire par cette voie.`,
        ]
      : [
          `Unités : ${au} + ${bu} = ${au + bu}, donc le résultat DOIT finir par ${expected}.`,
          `Proposé : ${fr(shown)}, qui finit par ${Math.abs(shown) % 10}.`,
          wrong ? `Ça ne colle pas → faux. Vrai résultat : ${fr(truth)}.` : `Ça colle → rien à redire par cette voie.`,
        ];
    return { kind: 'verdict', prompt: `${a} ${mul ? '×' : '+'} ${b} = ${fr(shown)}`, wrong, walkthrough };
  },
};

const castOutNines: Technique = {
  id: 'cast-out-nines',
  name: 'Preuve par 9',
  family: 'Vérification',
  rule: 'Réduis chaque nombre à un seul chiffre en sommant ses chiffres. La relation doit se conserver.',
  why:
    'Somme des chiffres et nombre ont le même reste modulo 9, parce que 10 ≡ 1 (mod 9). Le calcul « en petit » doit donc reproduire le calcul « en grand ». Un écart de 10, 20 ou 100 — invisible aux unités — devient visible ici.',
  steps: ['Réduis chaque opérande : 47 → 11 → 2 ; 6 → 6.', 'Applique la même opération : 2 × 6 = 12 → 3.', 'Réduis le résultat proposé et compare.'],
  when:
    'Deuxième passe, sur ce que les unités ont laissé passer. Comme le contrôle des unités, elle ÉLIMINE mais ne valide pas : deux erreurs peuvent se compenser.',
  psy0:
    'Les faux du test sont plausibles — souvent à ±10 ou deux chiffres inversés. Les unités ne les voient pas ; la preuve par 9 les voit tous les deux.',
  targetMs: keyed(5000),
  answerInput: 'keyed',
  diagram: {
    kind: 'face',
    rows: [
      { label: '47 se réduit à', left: '4 + 7 = 11 → 1 + 1', right: '2' },
      { label: '6 se réduit à', left: '6', right: '6' },
      { label: 'donc le produit', left: '2 × 6 = 12 → 1 + 2', right: '3' },
      { label: 'on propose 292', left: '2 + 9 + 2 = 13 → 4', right: '4 ≠ 3 → FAUX', verdict: 'ko' },
    ],
    caption:
      'Somme des chiffres et nombre ont le même reste modulo 9, parce que 10 ≡ 1. Un écart de 10 ou 20 — invisible aux unités — devient visible ici.',
  },
  generate(rng) {
    const wrong = rng() < 0.5;
    const a = randInt(rng, 24, 89);
    const b = randInt(rng, 4, 9);
    const truth = a * b;
    // Le faux est décalé d'un multiple de 10 : les UNITÉS concordent, donc la
    // première passe ne peut rien voir. C'est précisément le cas que la preuve
    // par 9 existe pour attraper.
    const shown = wrong ? truth + pick(rng, [10, 20, 30, -10, -20]) : truth;
    const ra = digitRoot(a);
    const rb = digitRoot(b);
    const rp = digitRoot(ra * rb);
    const rs = digitRoot(shown);
    return {
      kind: 'verdict',
      prompt: `${a} × ${b} = ${fr(shown)}`,
      wrong,
      walkthrough: [
        `Les unités concordent : cette passe-là ne sert à rien ici.`,
        `${a} → ${digitSum(a)} → ${ra} ; ${b} → ${rb}.`,
        `${ra} × ${rb} = ${ra * rb} → ${rp}.`,
        `Résultat proposé : ${fr(shown)} → ${rs}.`,
        wrong ? `${rp} ≠ ${rs} → faux. Vrai résultat : ${fr(truth)}.` : `${rp} = ${rs} → cohérent.`,
      ],
    };
  },
};

const magnitude: Technique = {
  id: 'magnitude',
  name: 'Ordre de grandeur',
  family: 'Vérification',
  rule: 'Arrondis les deux facteurs et compte les zéros avant de regarder les chiffres.',
  why:
    'Une erreur d’un facteur 10 ne se voit ni aux unités ni à la preuve par 9 : les deux contrôles portent sur les chiffres, pas sur la taille. Seul l’ordre de grandeur l’attrape — et c’est un coup d’œil, pas un calcul.',
  steps: ['Arrondis : 312 × 48 ≈ 300 × 50.', 'Compte : 3 × 5 = 15, et quatre zéros → environ 15 000.', 'Compare le NOMBRE DE CHIFFRES du résultat proposé.'],
  when:
    'Tout premier regard sur un gros produit ou une grande division. Inutile sur les faux plausibles à ±10, où l’ordre de grandeur est correct par construction.',
  psy0:
    'C’est la passe 2 des Grilles. Trois contrôles complémentaires — unités, ordre de grandeur, preuve par 9 — ne se recouvrent pas : chacun attrape ce que les autres laissent.',
  targetMs: keyed(3500),
  answerInput: 'keyed',
  diagram: {
    kind: 'face',
    rows: [
      { label: 'on arrondit', left: '312 × 48', right: '≈ 300 × 50' },
      { label: 'soit', left: '3 × 5 et 4 zéros', right: '≈ 15 000, 5 chiffres' },
      { label: 'on propose', left: '1 497', right: '4 chiffres → FAUX', verdict: 'ko' },
    ],
    caption:
      'Une erreur d’un facteur 10 ne se voit ni aux unités ni à la preuve par 9 : les deux portent sur les chiffres, pas sur la taille. Seul l’ordre de grandeur l’attrape.',
  },
  generate(rng) {
    const wrong = rng() < 0.5;
    const a = randInt(rng, 180, 780);
    const b = randInt(rng, 24, 88);
    const truth = a * b;
    const shown = wrong ? (rng() < 0.5 ? Math.floor(truth / 10) : truth * 10) : truth;
    const ra = Math.round(a / 100) * 100;
    const rb = Math.round(b / 10) * 10;
    return {
      kind: 'verdict',
      prompt: `${fr(a)} × ${b} = ${fr(shown)}`,
      wrong,
      walkthrough: [
        `On arrondit : ${fr(a)} × ${b} ≈ ${fr(ra)} × ${rb} = ${fr(ra * rb)}.`,
        `Donc le résultat a ${String(ra * rb).length} chiffres environ.`,
        `Proposé : ${fr(shown)} — ${String(Math.abs(shown)).length} chiffres.`,
        wrong ? `Écart d’un rang entier → faux. Vrai résultat : ${fr(truth)}.` : `Bon ordre de grandeur.`,
      ],
    };
  },
};

const divisibility: Technique = {
  id: 'divisibility',
  name: 'Règles de divisibilité',
  family: 'Vérification',
  rule: 'Par 3 et 9 : la somme des chiffres. Par 4 : les deux derniers. Par 11 : la somme alternée.',
  why:
    'Toutes ces règles viennent du reste des puissances de 10 : 10 ≡ 1 (mod 9), 100 ≡ 0 (mod 4), 10 ≡ −1 (mod 11). Ce ne sont donc pas des recettes à retenir séparément, mais trois lectures du même principe.',
  steps: ['÷3 ou ÷9 : somme les chiffres, recommence si besoin.', '÷4 : regarde uniquement les deux derniers chiffres.', '÷11 : alterne + et − sur les chiffres ; le résultat doit être 0 ou un multiple de 11.'],
  when:
    'Pour trancher une division sans la faire, et pour simplifier une fraction avant de calculer. Sur une grille, c’est souvent plus rapide que de poser la division.',
  psy0: 'Un quotient proposé est faux dès que la divisibilité ne passe pas — pas besoin d’aller plus loin.',
  targetMs: keyed(4200),
  answerInput: 'keyed',
  diagram: {
    kind: 'face',
    rows: [
      { label: 'par 3 ou par 9', left: '1 458 → 1+4+5+8 = 18', right: '18 est un multiple de 9', verdict: 'ok' },
      { label: 'par 4', left: '1 458 → les deux derniers : 58', right: '58 n’est pas multiple de 4', verdict: 'ko' },
      { label: 'par 11', left: '1 458 → 1 − 4 + 5 − 8', right: '−6, non', verdict: 'ko' },
    ],
    caption:
      'Ces règles ne sont pas trois recettes à retenir : elles viennent du reste des puissances de 10. 10 ≡ 1 (mod 9), 100 ≡ 0 (mod 4), 10 ≡ −1 (mod 11).',
  },
  generate(rng) {
    const d = pick(rng, [3, 4, 9, 11]);
    const divisible = rng() < 0.5;
    const base = randInt(rng, 12, 90) * d;
    const n = divisible ? base : base + pick(rng, [1, 2, d - 1]);
    const ok = n % d === 0;
    const walkthrough: string[] = [];
    if (d === 3 || d === 9) {
      const s = digitSum(n);
      walkthrough.push(
        `Somme des chiffres de ${fr(n)} : ${String(n).split('').join(' + ')} = ${s}.`,
        `${s} ${s % d === 0 ? 'est' : 'n’est pas'} un multiple de ${d}.`,
      );
    } else if (d === 4) {
      const last = n % 100;
      walkthrough.push(
        `Seuls les deux derniers chiffres comptent : ${String(last).padStart(2, '0')}.`,
        `${last} ${last % 4 === 0 ? 'est' : 'n’est pas'} un multiple de 4.`,
      );
    } else {
      const digits = String(n).split('').map(Number);
      const alt = digits.reduce((s, c, i) => s + (i % 2 === 0 ? c : -c), 0);
      walkthrough.push(
        `Somme alternée de ${fr(n)} : ${digits.map((c, i) => (i === 0 ? `${c}` : `${i % 2 === 0 ? '+' : '−'} ${c}`)).join(' ')} = ${alt}.`,
        `${alt} ${alt % 11 === 0 ? 'est' : 'n’est pas'} un multiple de 11.`,
      );
    }
    walkthrough.push(ok ? `→ divisible.` : `→ non divisible (${fr(n)} = ${d} × ${Math.floor(n / d)} + ${n % d}).`);
    return { kind: 'verdict', prompt: `${fr(n)} est divisible par ${d}`, wrong: !ok, walkthrough };
  },
};

/* -------------------------------------------------------------- catalogue */

export const TECHNIQUES: Technique[] = [
  complements,
  alphaLandmarks,
  alphaFromRank,
  alphaMirror,
  alphaShift,
  addLeft,
  roundCompensate,
  subDistance,
  mul11,
  mulRounds,
  mulNines,
  doubleHalve,
  distribute,
  square5,
  diffSquares,
  percent10,
  percentSwap,
  fractions,
  divideChain,
  unitsCheck,
  castOutNines,
  magnitude,
  divisibility,
];

export const TECHNIQUE_IDS: string[] = TECHNIQUES.map((t) => t.id);

export function techniqueById(id: string): Technique | null {
  return TECHNIQUES.find((t) => t.id === id) ?? null;
}

export function techniquesOf(family: TechniqueFamily): Technique[] {
  return TECHNIQUES.filter((t) => t.family === family);
}
