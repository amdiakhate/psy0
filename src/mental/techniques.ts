import { pick, randInt } from '../core/rng';
import type { Rng } from '../core/rng';

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

export type TechniqueFamily = 'Fondations' | 'Multiplication' | 'Proportions' | 'Vérification';

export const FAMILY_ORDER: TechniqueFamily[] = [
  'Fondations',
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
  generate(rng: Rng): MentalItem;
}

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

/* ------------------------------------------------------------- Fondations */

const complements: Technique = {
  id: 'complements',
  name: 'Compléments à 10 et 100',
  family: 'Fondations',
  rule: 'Pour aller à 100 : les dizaines se complètent à 9, les unités à 10.',
  why:
    'Parce que 100 = 90 + 10. On ne « pose » donc jamais la soustraction : on lit deux compléments élémentaires, l’un après l’autre, de gauche à droite.',
  steps: [
    'Regarde le chiffre des dizaines : combien pour aller à 9 ?',
    'Regarde le chiffre des unités : combien pour aller à 10 ?',
    'Colle les deux. Cas particulier : si le nombre finit par 0, les dizaines vont à 10 et les unités restent à 0.',
  ],
  when:
    'Dès qu’un nombre rond apparaît quelque part — 100, 1000, une dizaine. C’est la brique de toutes les autres techniques : arrondir-compenser et soustraire par la distance en dépendent entièrement.',
  psy0:
    'Aucun calcul de la grille ne se vérifie vite si les compléments hésitent. C’est le seul point du programme qui doit être un réflexe pur, sans aucune réflexion.',
  targetMs: 2500,
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
    const walkthrough =
      u === 0
        ? [
            `${n} finit par 0 : les unités restent à 0.`,
            `Les dizaines vont directement à 10 : ${d} + ${10 - d} = 10.`,
            `→ ${100 - n}`,
          ]
        : [
            `Dizaines à 9 : ${d} + ${9 - d} = 9.`,
            `Unités à 10 : ${u} + ${10 - u} = 10.`,
            `On colle : ${9 - d} puis ${10 - u} → ${100 - n}`,
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
  targetMs: 3500,
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
  targetMs: 4000,
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
  targetMs: 4000,
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
  targetMs: 4000,
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
  targetMs: 4000,
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
  targetMs: 4500,
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
  targetMs: 6000,
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
  targetMs: 5000,
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
  targetMs: 4000,
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
  targetMs: 6000,
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
  targetMs: 4500,
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
  targetMs: 5000,
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
  targetMs: 5000,
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
  targetMs: 5000,
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
  targetMs: 5000,
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
  targetMs: 8000,
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
  targetMs: 6000,
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
  targetMs: 7000,
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
