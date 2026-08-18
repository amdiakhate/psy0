import type { ReactNode } from 'react';
import type { Lesson } from '../../core/types';
import { GREY, MARINE } from './config';
import { generate } from './generator';
import { buildGrid, greyCount } from './model';
import { DropAnimation } from './DropAnimation';
import type { Cell, Grid, Placement } from './model';

/**
 * Leçon « Formes glissées - II » : un item réel, résolu forme par forme.
 *
 * Item : seed 9, niveau 3, chevauchement imposé. Grille 6×6, 3 formes.
 *
 *   F1 (2×3, 4 gris)  ###/..#   → posée en (4,2)
 *   F2 (2×3, 5 gris)  ###/.##   → posée en (1,4)
 *   F3 (3×2, 5 gris)  ##/##/#.  → posée en (1,3)
 *
 * Parité : 4 + 5 + 5 = 14 cases grises posées, une seule case doublement
 * couverte (ligne 1, colonne 4, par F2 et F3) → 14 − 2 = 12 cases grises dans
 * la cible. Cette case est MARINE alors que ses deux voisines sont grises :
 * c'est le piège du chevauchement, en plein milieu du motif.
 */
const ITEM = generate(9, 3, 'overlap');
const Q = ITEM.question;
const SHAPES = Q.shapes;
const SOLUTION = Q.solution;

const byId = (id: number): Placement => SOLUTION.find((p) => p.shapeId === id)!;

/** Grille partielle : seules les formes listées sont posées. */
const partial = (ids: number[]): Grid => buildGrid(Q.size, SHAPES, ids.map(byId));

/** La case doublement couverte, en coordonnées 0-based. */
const OVERLAP_CELL = { row: 0, col: 3 };

const GREY_TOTAL = SHAPES.reduce(
  (n, s) => n + s.cells.reduce((m, row) => m + row.reduce<number>((k, v) => k + v, 0), 0),
  0,
);
const GREY_TARGET = greyCount(Q.target);

function Board({
  grid,
  cell = 26,
  mark,
  box,
}: {
  grid: Grid;
  cell?: number;
  /** Case entourée en rouge (le chevauchement). */
  mark?: { row: number; col: number };
  /** Boîte englobante d'une forme posée, soulignée en bleu. */
  box?: { row: number; col: number; h: number; w: number };
}) {
  return (
    <div
      className="grid gap-[2px] rounded-md bg-zinc-800 p-[2px]"
      style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, ${cell}px)` }}
    >
      {grid.map((row, r) =>
        row.map((v: Cell, c) => {
          const inBox =
            box !== undefined &&
            r >= box.row &&
            r < box.row + box.h &&
            c >= box.col &&
            c < box.col + box.w;
          const marked = mark !== undefined && mark.row === r && mark.col === c;
          return (
            <div
              key={`${r}-${c}`}
              style={{ width: cell, height: cell, background: v === 1 ? GREY : MARINE }}
              className={`rounded-[3px] ${marked ? 'outline outline-2 outline-red-500' : inBox ? 'outline outline-2 outline-sky-400' : ''}`}
            />
          );
        }),
      )}
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      {children}
    </div>
  );
}

function Chip({ v }: { v: Cell }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-[3px] align-middle"
      style={{ background: v === 1 ? GREY : MARINE }}
    />
  );
}

function Rules() {
  const line = (a: Cell, b: Cell, out: Cell, txt: string) => (
    <li className="flex items-center gap-1.5">
      <Chip v={a} /> <span className="text-zinc-600">+</span> <Chip v={b} />{' '}
      <span className="text-zinc-600">=</span> <Chip v={out} />
      <span className="ml-2 font-mono text-xs text-zinc-500">{txt}</span>
    </li>
  );
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Superposition</p>
      <ul className="mt-2 space-y-1.5">
        {line(0, 0, 0, '0 ⊕ 0 = 0')}
        {line(0, 1, 1, '0 ⊕ 1 = 1')}
        {line(1, 1, 0, '1 ⊕ 1 = 0')}
      </ul>
    </div>
  );
}

function ShapesRow({ highlight }: { highlight?: number[] }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-4">
      {SHAPES.map((s, i) => (
        <div
          key={s.id}
          className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-2 ${
            highlight?.includes(i) ? 'border-sky-500 bg-sky-950/40' : 'border-zinc-700 bg-zinc-900'
          }`}
        >
          <span className="font-mono text-xs text-zinc-400">F{i + 1}</span>
          <Board grid={s.cells} cell={20} />
          <span className="text-[11px] text-zinc-500">
            {s.cells.flat().reduce<number>((a, b) => a + b, 0)} cases grises
          </span>
        </div>
      ))}
    </div>
  );
}

function SlidingScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'drop') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <DropAnimation size={Q.size} shapes={SHAPES} solution={SOLUTION} />
        <Labelled label="Figure à reproduire">
          <Board grid={Q.target} mark={OVERLAP_CELL} />
        </Labelled>
      </div>
    );
  }
  if (scene === 'rules') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Rules />
        <Labelled label="Figure à reproduire">
          <Board grid={Q.target} />
        </Labelled>
      </div>
    );
  }
  if (scene === 'shapes') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Labelled label="Figure à reproduire">
          <Board grid={Q.target} />
        </Labelled>
        <ShapesRow />
      </div>
    );
  }
  if (scene === 'anchor') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <Labelled label="Figure à reproduire — l'ancre du bas">
          <Board
            grid={Q.target}
            box={{ row: byId(0).row, col: byId(0).col, h: SHAPES[0].h, w: SHAPES[0].w }}
          />
        </Labelled>
        <ShapesRow highlight={[0]} />
      </div>
    );
  }
  if (scene === 'first') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <Labelled label="Grille de jeu — F1 posée">
          <Board grid={partial([0])} />
        </Labelled>
        <Labelled label="Figure à reproduire">
          <Board grid={Q.target} />
        </Labelled>
      </div>
    );
  }
  if (scene === 'overlap') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <Labelled label="Grille de jeu — F1 et F2 posées">
          <Board grid={partial([0, 1])} mark={OVERLAP_CELL} />
        </Labelled>
        <Labelled label="Figure à reproduire">
          <Board grid={Q.target} mark={OVERLAP_CELL} />
        </Labelled>
      </div>
    );
  }
  if (scene === 'done') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <Labelled label="Grille de jeu — les 3 formes posées">
          <Board grid={partial([0, 1, 2])} mark={OVERLAP_CELL} />
        </Labelled>
        <Labelled label="Figure à reproduire">
          <Board grid={Q.target} mark={OVERLAP_CELL} />
        </Labelled>
      </div>
    );
  }
  return (
    <Labelled label="Figure à reproduire">
      <Board grid={Q.target} />
    </Labelled>
  );
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Les premières grilles, tu raisonneras « en peinture » : gris posé sur gris reste gris. C’est faux, et c’est le réflexe le plus tenace de l’exercice — il résiste même quand on connaît la règle. Il ne cède qu’à force de voir des cases s’éteindre, pas à force de relire la table.",
    budget:
      "Environ 45 s. Le contrôle de parité prend 10 s une fois acquis, et c’est lui qui te dit à l’avance combien de recouvrements chercher. Au début, compte 20 s : c’est du temps rentable, il t’évite de tâtonner pendant les 25 qui suivent.",
    fallback: [
      "Tu tâtonnes : retire tout et repars de l’ancre la plus contrainte — un bord, un coin, un bloc isolé de la cible qu’une seule forme peut produire. Repartir proprement coûte moins cher que permuter au hasard.",
      "Une case reste grise alors qu’elle doit être marine : n’enlève jamais de gris. Cherche la forme qui va la RE-basculer en passant dessus.",
      "Une forme « ne rentre nulle part » : ce n’est jamais l’orientation, le test n’autorise que la translation. C’est ta lecture de la cible qui est fausse — reviens à la parité.",
    ],
    recover:
      "Le compte de parité est ton filet : si tu annonçais une case doublement couverte et que tu n’en as posé aucune, tu t’es trompé quelque part, sans avoir à chercher où. Recompte AVANT de déplacer quoi que ce soit.",
    bail:
      "À 30 s, si tu tâtonnes encore, pose ce dont tu es sûr et laisse le reste. Une grille partiellement juste vaut mieux qu’une grille entièrement permutée dans les dernières secondes.",
  },
  title: 'La règle de superposition est un XOR',
  intro: `Trois formes à glisser sur une grille 6×6 pour reproduire la figure de gauche. Toute la difficulté tient dans une seule ligne de la règle : deux cases grises superposées redonnent du MARINE. Cas décortiqué : ${GREY_TOTAL} cases grises posées par les trois formes, ${GREY_TARGET} seulement dans la cible.`,
  Scene: SlidingScene,
  steps: [
    {
      scene: 'drop',
      title: 'Regarde une case basculer',
      observe:
        "Les trois formes se posent l'une après l'autre. Surveille la case entourée de rouge : elle est grise après la première forme, puis la seconde repasse dessus — et elle redevient MARINE.",
      why: "La règle de superposition est un XOR, et c'est ce cas-là qui la résume : gris + gris = marine. L'intuition attend du gris renforcé ; le jeu éteint la case. Le voir arriver une fois vaut mieux que retenir trois lignes de table — et c'est le piège n°1 de l'épreuve.",
      action:
        'Mets pause juste avant l’atterrissage de la deuxième forme et prédis à voix haute quelles cases vont s’éteindre. Puis relâche et vérifie.',
    },
    {
      scene: 'rules',
      title: 'Étape 1 — traduire la règle en une seule opération',
      observe:
        "Les trois règles affichées : marine + marine = marine, marine + gris = gris, gris + gris = marine. La grille de jeu démarre entièrement marine.",
      why: "Pose marine = 0 et gris = 1 : tu obtiens 0⊕0=0, 0⊕1=1, 1⊕1=0, c'est-à-dire le OU EXCLUSIF. Une case finit grise si un nombre IMPAIR de formes y a posé du gris. Toute la suite découle de cette phrase.",
      action:
        "Conséquence immédiate, et c'est écrit dans la consigne officielle : le XOR est commutatif, donc l'ordre de dépose ne change RIEN. Ne perds pas une seconde à chercher par quoi commencer.",
    },
    {
      scene: 'shapes',
      title: 'Étape 2 — le contrôle de parité, avant de poser quoi que ce soit',
      observe: `Les trois formes portent ${SHAPES.map((s) => s.cells.flat().reduce<number>((a, b) => a + b, 0)).join(' + ')} = ${GREY_TOTAL} cases grises. La cible n'en compte que ${GREY_TARGET}.`,
      why: `Chaque case couverte deux fois retire 2 au total. L'écart ${GREY_TOTAL} − ${GREY_TARGET} = ${GREY_TOTAL - GREY_TARGET} te dit qu'il y a exactement UNE case de chevauchement à trouver. Tu sais d'avance ce que tu cherches, au lieu de le découvrir en tâtonnant.`,
      action:
        "Compte les cases grises des formes, compte celles de la cible, fais la différence, divise par 2. 10 secondes, et tu connais le nombre de recouvrements.",
      pitfall:
        "Si tu trouves un écart NUL, aucune forme n'en recouvre une autre : la grille se résout alors bloc par bloc, sans aucune subtilité. Ne cherche pas de piège là où la parité dit qu'il n'y en a pas.",
    },
    {
      scene: 'anchor',
      title: 'Étape 3 — attaquer par les ancres',
      observe:
        "En bas de la cible, un motif isolé : trois cases grises alignées, puis une seule case grise en dessous à droite. C'est exactement le motif de F1, et rien d'autre ne peut le produire.",
      why: "Une ancre est une zone de la cible qu'une seule forme peut expliquer : un bord, un coin, un bloc détaché. Elle cloue une forme sans hypothèse. Commence toujours par là — la forme la plus contrainte élimine le plus de branches.",
      pitfall:
        "Repère le coin haut-gauche de la BOÎTE de la forme, pas sa première case grise. Si le motif commence par une case marine, tu décales toute la forme d'un cran et tout le reste devient faux.",
    },
    {
      scene: 'first',
      title: 'Étape 4 — poser, puis comparer ligne par ligne',
      observe:
        "F1 est posée. La grille de jeu et la cible coïncident maintenant sur tout le bas (lignes 4 à 6) ; le bloc du haut reste entièrement à produire.",
      why: "Après chaque dépose, balaie les deux grilles ligne par ligne : la première ligne qui diffère localise le travail suivant. Tu n'as jamais besoin de tenir toute la grille en tête — la grille de jeu calcule le XOR à ta place.",
      action:
        "Ne cherche pas à tout résoudre mentalement avant de poser. Pose la forme sûre, le problème rétrécit tout seul.",
    },
    {
      scene: 'overlap',
      title: 'Étape 5 — le piège du chevauchement',
      observe:
        "F2 posée en haut à droite. Regarde la case entourée en rouge, ligne 1 colonne 4 : elle est GRISE sur la grille de jeu, mais MARINE sur la cible — alors que ses deux voisines de la même ligne sont grises.",
      why: "Cette case marine n'est pas un trou : c'est une case que DEUX formes vont couvrir. La deuxième dépose la re-bascule en marine. Une case marine cernée de gris, au milieu du motif, est la signature typique d'un double passage.",
      pitfall:
        "Raisonner en peinture — croire qu'un gris posé sur un gris reste gris — est l'erreur qui coûte le plus cher. Et son symétrique : refuser de superposer deux formes parce que « la cible est marine à cet endroit ».",
    },
    {
      scene: 'done',
      title: 'Étape 6 — la forme qui recouvre',
      observe:
        "F3 est posée par-dessus le coin de F2. Elle apporte le gris manquant à gauche, et fait retomber en marine la case entourée. Grille de jeu et cible sont identiques.",
      why: "Quand une case reste grise alors qu'elle doit être marine, la solution n'est jamais d'enlever du gris : c'est qu'une forme doit venir la re-basculer. Cherche celle dont le motif couvre cette case ET les cases grises encore manquantes autour.",
      action:
        "Contrôle de sortie : le compte de parité annonçait 1 case doublement couverte, il y en a exactement 1. Les deux comptes concordent, la grille est juste.",
    },
    {
      scene: 'done',
      title: 'La méthode complète, en 45 secondes',
      observe:
        "Trois formes, une case de chevauchement, aucune rotation : le test n'autorise que la TRANSLATION.",
      why: "Si une forme « ne rentre nulle part », ce n'est jamais l'orientation qui est en cause : c'est ta lecture de la cible. Reviens à la parité et aux ancres plutôt que d'essayer de tourner la pièce.",
      action:
        "Budget 45 s : 10 s de lecture (parité + repérage des ancres), 25 s de dépose, 10 s de vérification ligne par ligne. Si à 30 s tu tâtonnes encore, retire tout et repars de l'ancre la plus contrainte — repartir proprement coûte moins cher que permuter au hasard.",
    },
  ],
};
